// Quét toàn bộ file .xlsx trong RAW_DIR (export hằng ngày Same Day), gộp sheet "data",
// tính các bảng chi tiết THEO TỪNG NGÀY (không gộp cứng thành 1 khoảng), ghi vào
// src/data/dashboard-data.json. Việc lọc theo khoảng ngày (hôm qua/7 ngày/tuần trước/...)
// được tính lại từ dữ liệu theo-ngày này ở src/lib/aggregate.ts, không tính lại từ Excel.
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

function readFiles() {
  if (!fs.existsSync(RAW_DIR)) {
    throw new Error(`Không tìm thấy thư mục dữ liệu gốc: ${RAW_DIR}`);
  }
  return fs
    .readdirSync(RAW_DIR)
    .filter((f) => f.toLowerCase().endsWith(".xlsx") && !f.startsWith("~$"))
    .sort();
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

function main() {
  const files = readFiles();
  if (files.length === 0) {
    console.error("Không có file .xlsx nào trong", RAW_DIR);
    process.exit(1);
  }

  const rows = [];

  for (const fname of files) {
    const m = fname.match(DATE_RE);
    if (!m) continue;
    const [, d, mo, y] = m;
    const reportDate = `${y}-${mo}-${d}`;

    const wb = XLSX.readFile(path.join(RAW_DIR, fname));
    if (!wb.SheetNames.includes("data")) continue;
    const sheet = wb.Sheets["data"];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });

    for (const r of json) {
      const pickup = excelSerialToDate(r["Ngày lấy hàng"]);
      const sign = excelSerialToDate(r["ThƠì gian ký"]);
      const isSigned = !!sign;
      const durationH = isSigned && pickup ? (sign.getTime() - pickup.getTime()) / 3600000 : null;

      rows.push({
        iso_date: reportDate,
        buu_cuc: r["Bưu cục đang thao tác"] ?? null,
        trang_thai: r["Trạng thái hiện tại"] ?? null,
        khu: r["khu"] ?? null,
        nguyen_nhan: r["Nguyên nhân theo YC"] ?? null,
        pickup_hour: pickup ? pickup.getUTCHours() : null,
        sign_hour: sign ? sign.getUTCHours() : null,
        is_signed: isSigned,
        duration_h: durationH,
      });
    }
  }

  console.log(`Đã đọc ${files.length} file, tổng ${rows.length} dòng.`);

  const byDate = groupBy(rows, (r) => r.iso_date);
  const availableDates = Object.keys(byDate).sort();

  // ---- kpi theo ngày (giữ RAW COUNT, không chỉ %, để cộng dồn chính xác khi lọc khoảng ngày) ----
  const kpiDaily = availableDates.map((date) => {
    const g = byDate[date];
    const durs = g.filter((r) => r.is_signed && r.duration_h != null).map((r) => r.duration_h);
    return {
      iso_date: date,
      tong_don: g.length,
      da_ky_nhan: g.filter((r) => r.is_signed).length,
      so_don_co_van_de: g.filter((r) => r.nguyen_nhan).length,
      duration_sum_h: round4(sum(durs)),
      duration_count: durs.length,
    };
  });

  // ---- funnel trạng thái theo ngày ----
  const statusByDay = [];
  for (const date of availableDates) {
    const g = groupBy(
      byDate[date].filter((r) => r.trang_thai),
      (r) => r.trang_thai
    );
    for (const [trang_thai, items] of Object.entries(g)) {
      statusByDay.push({ iso_date: date, trang_thai, so_luong: items.length });
    }
  }

  // ---- nguyên nhân theo ngày ----
  const reasonByDay = [];
  for (const date of availableDates) {
    const g = groupBy(
      byDate[date].filter((r) => r.nguyen_nhan),
      (r) => r.nguyen_nhan
    );
    for (const [nguyen_nhan, items] of Object.entries(g)) {
      reasonByDay.push({ iso_date: date, nguyen_nhan, so_luong: items.length });
    }
  }

  // ---- bưu cục theo ngày ----
  const bcByDay = nodeByDay(availableDates, byDate, "buu_cuc");
  // ---- khu theo ngày ----
  const khuByDay = nodeByDay(availableDates, byDate, "khu");

  // ---- giờ trong ngày, theo ngày ----
  const hourByDay = [];
  for (const date of availableDates) {
    const g = byDate[date];
    const pickupMap = {};
    const signMap = {};
    for (const r of g) {
      if (r.pickup_hour != null) pickupMap[r.pickup_hour] = (pickupMap[r.pickup_hour] || 0) + 1;
      if (r.is_signed && r.sign_hour != null) signMap[r.sign_hour] = (signMap[r.sign_hour] || 0) + 1;
    }
    const hours = new Set([...Object.keys(pickupMap), ...Object.keys(signMap)].map(Number));
    for (const gio of hours) {
      hourByDay.push({ iso_date: date, gio, pickup: pickupMap[gio] || 0, sign: signMap[gio] || 0 });
    }
  }

  const data = {
    generated_at: new Date().toISOString(),
    available_dates: availableDates,
    kpi_daily: kpiDaily,
    status_by_day: statusByDay,
    reason_by_day: reasonByDay,
    bc_by_day: bcByDay,
    khu_by_day: khuByDay,
    hour_by_day: hourByDay,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data), "utf-8");
  console.log("Đã ghi:", OUT_PATH);
  console.log("So ngay:", availableDates.length, availableDates[0], "->", availableDates[availableDates.length - 1]);
}

function nodeByDay(availableDates, byDate, field) {
  const out = [];
  for (const date of availableDates) {
    const g = groupBy(
      byDate[date].filter((r) => r[field]),
      (r) => r[field]
    );
    for (const [key, items] of Object.entries(g)) {
      const durs = items.filter((r) => r.is_signed && r.duration_h != null).map((r) => r.duration_h);
      out.push({
        iso_date: date,
        key,
        tong_don: items.length,
        da_ky_nhan: items.filter((r) => r.is_signed).length,
        issue: items.filter((r) => r.nguyen_nhan).length,
        duration_sum_h: round4(sum(durs)),
        duration_count: durs.length,
      });
    }
  }
  return out;
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}
function round4(v) {
  return Math.round(v * 10000) / 10000;
}

main();
