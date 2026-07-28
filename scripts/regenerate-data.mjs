// Quét toàn bộ file .xlsx trong RAW_DIR (export hằng ngày Same Day), gộp sheet "data",
// tính lại các bảng KPI/funnel/nguyên nhân/hiệu suất bưu cục-khu/giờ, ghi vào src/data/dashboard-data.json.
// Chạy: node scripts/regenerate-data.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = process.env.SAMEDAY_RAW_DIR || "D:\\Claude CODE\\data\\raw\\sameday";
const OUT_PATH = path.join(__dirname, "..", "src", "data", "dashboard-data.json");

const DATE_RE = /(\d{2})\.(\d{2})\.(\d{4})/;

// Luôn diễn giải ngày/giờ dưới dạng "naive" (không gắn timezone) rồi so sánh bằng mốc UTC nội bộ —
// tránh việc Date() dùng giờ hệ thống cho chuỗi text nhưng dùng UTC cho serial number của Excel
// (2 cách khác nhau từng gây lệch đúng 7 giờ = offset múi giờ máy chạy script).
function excelSerialToDate(v) {
  if (v instanceof Date) {
    return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate(), v.getHours(), v.getMinutes(), v.getSeconds()));
  }
  if (typeof v === "number") {
    // Excel serial date (1900 date system)
    const utcDays = v - 25569;
    return new Date(utcDays * 86400 * 1000);
  }
  if (typeof v === "string") {
    const m = v.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (m) {
      const [, y, mo, d, h, mi, s] = m.map(Number);
      return new Date(Date.UTC(y, mo - 1, d, h, mi, s));
    }
    const d2 = new Date(v);
    if (!Number.isNaN(d2.getTime())) return d2;
  }
  return null;
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function readFiles() {
  if (!fs.existsSync(RAW_DIR)) {
    throw new Error(`Không tìm thấy thư mục dữ liệu gốc: ${RAW_DIR}`);
  }
  return fs
    .readdirSync(RAW_DIR)
    .filter((f) => f.toLowerCase().endsWith(".xlsx"))
    .sort();
}

function main() {
  const files = readFiles();
  if (files.length === 0) {
    console.error("Không có file .xlsx nào trong", RAW_DIR);
    process.exit(1);
  }

  const rows = [];
  const fileSummary = [];

  for (const fname of files) {
    const m = fname.match(DATE_RE);
    if (!m) continue;
    const [, d, mo, y] = m;
    const reportDate = `${y}-${mo}-${d}`;

    const wb = XLSX.readFile(path.join(RAW_DIR, fname));
    if (!wb.SheetNames.includes("data")) continue;
    const sheet = wb.Sheets["data"];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });

    let count = 0;
    for (const r of json) {
      const pickup = excelSerialToDate(r["Ngày lấy hàng"]);
      const sign = excelSerialToDate(r["ThƠì gian ký"]);
      const isSigned = !!sign;
      const isSameDay = isSigned && pickup && toISODate(pickup) === toISODate(sign);
      const durationH = isSigned && pickup ? (sign.getTime() - pickup.getTime()) / 3600000 : null;

      rows.push({
        report_date: reportDate,
        buu_cuc: r["Bưu cục đang thao tác"] ?? null,
        trang_thai: r["Trạng thái hiện tại"] ?? null,
        khu: r["khu"] ?? null,
        nguyen_nhan: r["Nguyên nhân theo YC"] ?? null,
        pickup_hour: pickup ? pickup.getUTCHours() : null,
        sign_hour: sign ? sign.getUTCHours() : null,
        is_signed: isSigned,
        is_same_day: isSameDay,
        duration_h: durationH,
      });
      count++;
    }
    fileSummary.push({ report_date: reportDate, file: fname, rows: count });
  }

  console.log(`Đã đọc ${files.length} file, tổng ${rows.length} dòng.`);

  // ---- A. KPI theo ngày ----
  const byDate = groupBy(rows, (r) => r.report_date);
  const kpiDaily = Object.entries(byDate)
    .map(([date, g]) => {
      const total = g.length;
      const signed = g.filter((r) => r.is_signed).length;
      const sameDay = g.filter((r) => r.is_same_day).length;
      const issue = g.filter((r) => r.nguyen_nhan).length;
      const durs = g.filter((r) => r.is_signed && r.duration_h != null).map((r) => r.duration_h);
      return {
        report_date: formatDDMM(date),
        _iso: date,
        tong_don: total,
        ty_le_ky_nhan_pct: pct(signed, total),
        ty_le_cung_ngay_pct: pct(sameDay, signed),
        tg_xu_ly_trung_binh_h: round2(mean(durs)),
        ty_le_van_de_pct: pct(issue, total),
      };
    })
    .sort((a, b) => (a._iso < b._iso ? -1 : 1))
    .map(({ _iso, ...rest }) => rest);

  // ---- weekday aggregate ----
  const weekdayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const byWeekday = {};
  for (const [date, g] of Object.entries(byDate)) {
    const wd = new Date(date + "T00:00:00Z").getUTCDay();
    byWeekday[wd] = byWeekday[wd] || [];
    byWeekday[wd].push(...g);
  }
  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
  const weekday = weekdayOrder
    .filter((wd) => byWeekday[wd])
    .map((wd) => {
      const g = byWeekday[wd];
      const dates = new Set(g.map((r) => r.report_date));
      const total = g.length;
      const signed = g.filter((r) => r.is_signed).length;
      const sameDay = g.filter((r) => r.is_same_day).length;
      const issue = g.filter((r) => r.nguyen_nhan).length;
      return {
        weekday: weekdayNames[wd],
        so_ngay_mau: dates.size,
        tong_don: total,
        ty_le_ky_nhan_pct: pct(signed, total),
        ty_le_cung_ngay_pct: pct(sameDay, signed),
        ty_le_van_de_pct: pct(issue, total),
      };
    });

  // ---- status funnel ----
  const statusGroups = groupBy(
    rows.filter((r) => r.trang_thai),
    (r) => r.trang_thai
  );
  const statusOverall = Object.entries(statusGroups)
    .map(([trang_thai, g]) => ({ trang_thai, so_luong: g.length }))
    .sort((a, b) => b.so_luong - a.so_luong);

  // ---- reasons ----
  const reasonGroups = groupBy(
    rows.filter((r) => r.nguyen_nhan),
    (r) => r.nguyen_nhan
  );
  const reasonOverall = Object.entries(reasonGroups)
    .map(([nguyen_nhan, g]) => ({ nguyen_nhan, so_luong: g.length }))
    .sort((a, b) => b.so_luong - a.so_luong);

  // ---- buu cuc perf ----
  const bcGroups = groupBy(
    rows.filter((r) => r.buu_cuc),
    (r) => r.buu_cuc
  );
  const bcPerf = Object.entries(bcGroups).map(([buu_cuc, g]) => nodePerf(buu_cuc, g, "buu_cuc"));
  const bcReal = bcPerf.filter((r) => r.da_ky_nhan > 0 && r.tong_don >= 300);
  const bcWorst15 = [...bcReal].sort((a, b) => a.ty_le_cung_ngay_pct - b.ty_le_cung_ngay_pct).slice(0, 15);
  const bcBest15 = [...bcReal].sort((a, b) => b.ty_le_cung_ngay_pct - a.ty_le_cung_ngay_pct).slice(0, 15);

  // ---- khu perf ----
  const khuGroups = groupBy(
    rows.filter((r) => r.khu),
    (r) => r.khu
  );
  const khuPerf = Object.entries(khuGroups)
    .map(([khu, g]) => nodePerf(khu, g, "khu"))
    .filter((r) => r.da_ky_nhan > 0 && r.tong_don >= 1000)
    .sort((a, b) => a.ty_le_cung_ngay_pct - b.ty_le_cung_ngay_pct);

  // ---- hourly trend ----
  const hourMap = {};
  for (const r of rows) {
    if (r.pickup_hour != null) {
      hourMap[r.pickup_hour] = hourMap[r.pickup_hour] || { pickup: 0, sign: 0 };
      hourMap[r.pickup_hour].pickup++;
    }
    if (r.is_signed && r.sign_hour != null) {
      hourMap[r.sign_hour] = hourMap[r.sign_hour] || { pickup: 0, sign: 0 };
      hourMap[r.sign_hour].sign++;
    }
  }
  const hourTrend = Object.entries(hourMap)
    .map(([gio, v]) => ({ gio: Number(gio), so_don_lay_hang: v.pickup, so_don_ky_nhan: v.sign }))
    .sort((a, b) => a.gio - b.gio);

  // ---- meta ----
  const totalAll = rows.length;
  const signedAll = rows.filter((r) => r.is_signed).length;
  const sameDayAll = rows.filter((r) => r.is_same_day).length;
  const issueAll = rows.filter((r) => r.nguyen_nhan).length;
  const allDurs = rows.filter((r) => r.is_signed && r.duration_h != null).map((r) => r.duration_h);
  const isoDates = Object.keys(byDate).sort();

  const data = {
    meta: {
      tu_ngay: isoDates[0],
      den_ngay: isoDates[isoDates.length - 1],
      so_ngay: isoDates.length,
      tong_don_21_ngay: totalAll,
      ty_le_ky_nhan_pct: pct(signedAll, totalAll),
      ty_le_cung_ngay_pct: pct(sameDayAll, signedAll),
      ty_le_van_de_pct: pct(issueAll, totalAll),
      tg_xu_ly_tb_h: round2(mean(allDurs)),
      generated_at: new Date().toISOString(),
    },
    kpi_daily: kpiDaily,
    weekday,
    status_overall: statusOverall,
    reason_overall: reasonOverall,
    bc_worst15: bcWorst15,
    bc_best15: bcBest15,
    khu_perf: khuPerf,
    hour_trend: hourTrend,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log("Đã ghi:", OUT_PATH);
  console.log("So ngay:", data.meta.so_ngay, data.meta.tu_ngay, "->", data.meta.den_ngay);
}

function nodePerf(key, g, keyName) {
  const total = g.length;
  const signed = g.filter((r) => r.is_signed).length;
  const sameDay = g.filter((r) => r.is_same_day).length;
  const durs = g.filter((r) => r.is_signed && r.duration_h != null).map((r) => r.duration_h);
  return {
    [keyName]: key,
    tong_don: total,
    da_ky_nhan: signed,
    ty_le_ky_nhan_pct: pct(signed, total),
    ty_le_cung_ngay_pct: pct(sameDay, signed),
    tg_xu_ly_tb_h: signed ? round2(mean(durs)) : null,
    so_don_van_de: g.filter((r) => r.nguyen_nhan).length,
  };
}

function groupBy(arr, keyFn) {
  const out = {};
  for (const item of arr) {
    const k = keyFn(item);
    out[k] = out[k] || [];
    out[k].push(item);
  }
  return out;
}
function pct(n, d) {
  return d ? Math.round((n / d) * 1000) / 10 : 0;
}
function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
function round2(v) {
  return Math.round(v * 100) / 100;
}
function formatDDMM(iso) {
  const [, mo, d] = iso.split("-");
  return `${d}/${mo}`;
}

main();
