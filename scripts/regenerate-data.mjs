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
const PENALTY_DIR = path.join(RAW_DIR, "PHẠT Khâu Nhận");
const RECEIVING_DIR = path.join(RAW_DIR, "Khâu nhận");
const TRANSIT_DIR = path.join(RAW_DIR, "Trung chuyển - HUB");
const OUT_PATH = path.join(__dirname, "..", "src", "data", "dashboard-data.json");

// Mã "Bưu cục lấy hàng" là điểm pickup riêng (HUB/Pickup...) không xuất hiện trong file "data"
// hằng ngày nên không đối chiếu Khu qua bcKhuMap được. Điền Khu thật vào đây khi biết (điền chuỗi
// dạng "8C区" giống định dạng Khu trong dashboard) — mã còn null sẽ hiện "Không xác định".
const BC_KHU_OVERRIDES = {
  "028P25": "2C区",
  "028P28": "17区",
  "028P22": "7C区",
  "028H04": "8C区",
  "028P06": "6C区",
  "028P61": "6E区",
  "028P62": "6A区",
  "028Z69": "HUB VIP",
  "028P26": "2A区",
};

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
      // "Thời gian quét đến" = mốc hàng được quét ghi nhận ĐÃ ĐẾN bưu cục phát (BC/Khu cuối).
      // Nhiều dòng chưa đến sẽ có giá trị text ("Chưa đến") thay vì ngày giờ -> excelSerialToDate trả về null.
      const arrival = excelSerialToDate(r["Thời gian quét đến"]);

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
        bc_cuoi: r["BC cuối"] ?? null,
        khu_cuoi: r["Khu cuối"] ?? null,
        arrival_hour: arrival ? arrival.getUTCHours() : null,
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

  // ---- nguyên nhân theo ngày, chi tiết theo bưu cục + khu (để lọc theo khu và tìm
  // bưu cục hay chọn nguyên nhân nào nhất — không chỉ tổng số theo nguyên nhân) ----
  const reasonBcByDay = [];
  for (const date of availableDates) {
    const g = groupBy(
      byDate[date].filter((r) => r.nguyen_nhan && r.buu_cuc),
      (r) => JSON.stringify([r.buu_cuc, r.khu ?? null, r.nguyen_nhan])
    );
    for (const [key, items] of Object.entries(g)) {
      const [buu_cuc, khu, nguyen_nhan] = JSON.parse(key);
      reasonBcByDay.push({ iso_date: date, buu_cuc, khu, nguyen_nhan, so_luong: items.length });
    }
  }

  // ---- bưu cục theo ngày ----
  const bcByDay = nodeByDay(availableDates, byDate, "buu_cuc");
  // ---- khu theo ngày ----
  const khuByDay = nodeByDay(availableDates, byDate, "khu");

  // ---- giờ trong ngày, chi tiết theo BC cuối + Khu cuối (bưu cục PHÁT cuối cùng của đơn,
  // khác với "Bưu cục đang thao tác") — gộp cả 3 mốc lấy hàng/ký nhận/hàng đến vào 1 cấu trúc
  // để trang Theo giờ dùng chung 1 bộ lọc Khu/Bưu cục cho cả 3 đường trên cùng 1 biểu đồ ----
  const hourByDay = [];
  for (const date of availableDates) {
    const g = groupBy(
      byDate[date].filter((r) => r.bc_cuoi && (r.pickup_hour != null || r.sign_hour != null || r.arrival_hour != null)),
      (r) => JSON.stringify([r.bc_cuoi, r.khu_cuoi ?? null])
    );
    for (const [key, items] of Object.entries(g)) {
      const [buu_cuc, khu] = JSON.parse(key);
      const hourMap = new Map();
      const bump = (gio, field) => {
        if (gio == null) return;
        const acc = hourMap.get(gio) ?? { pickup: 0, sign: 0, arrival: 0 };
        acc[field] += 1;
        hourMap.set(gio, acc);
      };
      for (const r of items) {
        bump(r.pickup_hour, "pickup");
        if (r.is_signed) bump(r.sign_hour, "sign");
        bump(r.arrival_hour, "arrival");
      }
      for (const [gio, counts] of hourMap.entries()) {
        hourByDay.push({ iso_date: date, buu_cuc, khu, gio, ...counts });
      }
    }
  }

  // ---- Phạt Khâu Nhận (lũy kế) — file riêng, không phải export hằng ngày.
  // Mỗi lần "up" là 1 snapshot TOÀN BỘ lũy kế (không cộng dồn theo file như sameday),
  // nên chỉ đọc đúng 1 file mới nhất (theo thời gian sửa đổi) trong thư mục này. ----
  const penaltyByDay = readPenaltyByDay();

  // ---- Nhận kiện (lấy hàng) — thư mục riêng "Khâu nhận", quét TOÀN BỘ file (khác Phạt: mỗi
  // file ở đây là 1 lô đơn theo khoảng ngày/theo ngày, cộng dồn dần theo Mã vận đơn, không phải
  // snapshot lũy kế) ----
  const bcKhuMap = buildBcKhuMap(rows);
  const receivingRawRows = readReceivingRows();
  const receiving = readReceivingByDay(receivingRawRows, bcKhuMap);

  // ---- Trung chuyển (HUB) — thư mục riêng "Trung chuyển - HUB", file rất nặng (hàng trăm nghìn
  // dòng) nên PHẢI đọc ở chế độ dense (xem readTransitRows) để không bị treo. Đơn được match ngược
  // theo "Mã vận đơn" với Khâu nhận để lấy ngày lấy hàng thành công (dùng rawRows đã đọc ở trên,
  // tránh đọc lại file Khâu nhận lần 2). ----
  const transit = readTransitByDay(receivingRawRows);

  const data = {
    generated_at: new Date().toISOString(),
    available_dates: availableDates,
    kpi_daily: kpiDaily,
    reason_bc_by_day: reasonBcByDay,
    bc_by_day: bcByDay,
    khu_by_day: khuByDay,
    hour_by_day: hourByDay,
    penalty_by_day: penaltyByDay,
    receiving_bc_by_day: receiving.bcByDay,
    receiving_reason_by_day: receiving.reasonByDay,
    receiving_seller_by_day: receiving.sellerByDay,
    receiving_seller_reason_by_day: receiving.sellerReasonByDay,
    receiving_geo_by_day: receiving.geoByDay,
    transit_hub_by_day: transit.hubByDay,
    transit_bc_by_day: transit.bcByDay,
    transit_reason_by_day: transit.reasonByDay,
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

// "13H 7/7/2026 - 12H59 8/7/2026" -> ngày báo cáo N là mốc kết thúc (8/7/2026),
// đúng quy ước 13:00(N-1) -> 12:59(N) đang dùng cho toàn bộ dashboard.
function parseWindowEndDate(s) {
  if (typeof s !== "string") return null;
  const m = s.match(/12H59\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function normalizeKhu(v) {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  return s.endsWith("区") ? s : `${s}区`;
}

function readPenaltyByDay() {
  if (!fs.existsSync(PENALTY_DIR)) return [];
  const files = fs
    .readdirSync(PENALTY_DIR)
    .filter((f) => f.toLowerCase().endsWith(".xlsx") && !f.startsWith("~$"))
    .map((f) => ({ name: f, mtime: fs.statSync(path.join(PENALTY_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length === 0) return [];

  const latest = files[0].name;
  const wb = XLSX.readFile(path.join(PENALTY_DIR, latest), { sheets: ["data"] });
  if (!wb.SheetNames.includes("data")) return [];
  const json = XLSX.utils.sheet_to_json(wb.Sheets["data"], { defval: null, raw: true });

  console.log(`Đã đọc file phạt: ${latest}, tổng ${json.length} dòng.`);

  const rows = json
    .map((r) => ({
      iso_date: parseWindowEndDate(r["Phân loại thời gian"]),
      tinh_trang: r["Tình trạng\r\n状态"] ?? null,
      khu: normalizeKhu(r["Khu\r\n区域"]),
      bc: r["Mã bc chịu trách nhiệm"] ?? null,
      tien_phat: Number(r[" Tiền phạt "]) || 0,
    }))
    .filter((r) => r.iso_date && r.tinh_trang && r.bc);

  const g = groupBy(rows, (r) => JSON.stringify([r.iso_date, r.tinh_trang, r.khu, r.bc]));
  return Object.entries(g).map(([key, items]) => {
    const [iso_date, tinh_trang, khu, bc] = JSON.parse(key);
    return {
      iso_date,
      tinh_trang,
      khu,
      bc,
      so_luong: items.length,
      tien_phat: sum(items.map((r) => r.tien_phat)),
    };
  });
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}
function round4(v) {
  return Math.round(v * 10000) / 10000;
}

// Đối chiếu mã Bưu cục lấy hàng (file Khâu nhận) -> Khu, dựa trên các cặp bc/khu đã gom được từ
// file "data" hằng ngày (buu_cuc/khu và bc_cuoi/khu_cuoi) — phủ được phần lớn mã BC giao hàng
// thường, chỉ thiếu vài điểm pickup riêng (đã liệt kê thủ công ở BC_KHU_OVERRIDES).
function buildBcKhuMap(rows) {
  const map = new Map();
  for (const r of rows) {
    if (r.buu_cuc && r.khu) map.set(r.buu_cuc, r.khu);
    if (r.bc_cuoi && r.khu_cuoi) map.set(r.bc_cuoi, r.khu_cuoi);
  }
  for (const [bc, khu] of Object.entries(BC_KHU_OVERRIDES)) {
    if (khu) map.set(bc, khu);
  }
  return map;
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

// Quy ước ngày N riêng cho Khâu nhận (khác 13H(N-1)-12H59(N) của Phạt): 1 mốc thời gian coi là
// thuộc "ngày N" nếu rơi vào khung 12:00:00 ngày N-1 -> 11:59:59 ngày N.
function noonWindowDay(dt) {
  const totalSec = dt.getUTCHours() * 3600 + dt.getUTCMinutes() * 60 + dt.getUTCSeconds();
  const base = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
  if (totalSec >= 12 * 3600) base.setUTCDate(base.getUTCDate() + 1);
  return base;
}

function readReceivingFiles() {
  if (!fs.existsSync(RECEIVING_DIR)) return [];
  return fs
    .readdirSync(RECEIVING_DIR)
    .filter((f) => f.toLowerCase().endsWith(".xlsx") && !f.startsWith("~$"))
    .sort();
}

/** Đọc toàn bộ file trong thư mục "Khâu nhận" (mỗi file là 1 lô đơn theo khoảng ngày, không phải
 * snapshot lũy kế như Phạt), gộp theo Mã vận đơn để tránh trùng khi các lô sau đè lô trước. */
function readReceivingRows() {
  const files = readReceivingFiles();
  if (files.length === 0) return [];
  const byWaybill = new Map();
  for (const fname of files) {
    const wb = XLSX.readFile(path.join(RECEIVING_DIR, fname));
    const sheetName = wb.SheetNames[0];
    const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null, raw: true });
    for (const r of json) {
      const waybill = r["Mã vận đơn"];
      const entry = excelSerialToDate(r["Thời gian nhập đơn hàng"]);
      if (!waybill || !entry) continue;
      byWaybill.set(waybill, {
        waybill,
        entry,
        pickup: excelSerialToDate(r["Ngày lấy hàng"]),
        status: r["Trạng thái đơn đặt"] ?? null,
        bc: r["Mã Bc lấy hàng"] ?? null,
        seller: r["Tên shop"] ?? null,
        reason: r["Nguyên nhân lấy hàng thất bại"] || null,
        // Cột "Phường xã lấy" phần lớn để trống (~91% rỗng) nên dùng "Quận huyện cũ/ Phường xã
        // mới" làm nguồn Phường/Xã cho bản đồ — cột này phủ 100% dòng, đã là tên Phường/Xã mới
        // sau sáp nhập cho phần lớn đơn (một số ít còn ghi theo Quận/Huyện cũ, không đối chiếu
        // được lên bản đồ Phường nên sẽ bị bỏ qua khi không khớp).
        phuong_xa: r["Quận huyện cũ/ Phường xã mới "] || null,
      });
    }
  }
  console.log(`Đã đọc ${files.length} file Khâu nhận, tổng ${byWaybill.size} đơn (đã gộp theo Mã vận đơn).`);
  return [...byWaybill.values()];
}

/** Xếp mỗi đơn vào ngày N theo "Thời gian nhập đơn hàng" (khung 12h(N-1)->11h59(N)), rồi xác định
 * "thành công trong ngày N" nếu "Ngày lấy hàng" rơi trong khung 12h(N-1)->13h(N) (nới thêm 1 giờ so
 * với khung tạo đơn). "Hủy" = Trạng thái đơn đặt = "Đã hủy". Tổng/thành công/hủy đều tính theo
 * đúng ngày N của đơn đó (cohort theo ngày tạo), không phải theo ngày lấy hàng thực tế. */
function classifyReceivingOrder(r) {
  const dayN = noonWindowDay(r.entry);
  const winStart = new Date(dayN);
  winStart.setUTCDate(winStart.getUTCDate() - 1);
  winStart.setUTCHours(12, 0, 0, 0);
  const winEnd = new Date(dayN);
  winEnd.setUTCHours(13, 0, 0, 0);
  const thanhCong = r.pickup && r.pickup >= winStart && r.pickup <= winEnd ? 1 : 0;
  const huy = r.status === "Đã hủy" ? 1 : 0;
  return { iso_date: toISODate(dayN), thanh_cong: thanhCong, huy };
}

function readReceivingByDay(rawRows, bcKhuMap) {
  if (rawRows.length === 0) {
    return { bcByDay: [], reasonByDay: [], sellerByDay: [], sellerReasonByDay: [], geoByDay: [] };
  }

  const unmatchedBc = new Set();
  const classified = rawRows.map((r) => {
    const khu = r.bc ? bcKhuMap.get(r.bc) ?? null : null;
    if (r.bc && khu == null) unmatchedBc.add(r.bc);
    return { ...r, khu, ...classifyReceivingOrder(r) };
  });
  if (unmatchedBc.size > 0) {
    console.log("Mã Bưu cục lấy hàng CHƯA xác định Khu (điền vào BC_KHU_OVERRIDES):", [...unmatchedBc].sort());
  }

  const bcGroups = groupBy(classified, (r) => JSON.stringify([r.iso_date, r.bc, r.khu]));
  const bcByDay = Object.entries(bcGroups).map(([key, items]) => {
    const [iso_date, bc, khu] = JSON.parse(key);
    return {
      iso_date,
      bc,
      khu,
      tong_don: items.length,
      thanh_cong: sum(items.map((r) => r.thanh_cong)),
      huy: sum(items.map((r) => r.huy)),
    };
  });

  const reasonGroups = groupBy(
    classified.filter((r) => r.reason && r.bc),
    (r) => JSON.stringify([r.iso_date, r.bc, r.khu, r.reason])
  );
  const reasonByDay = Object.entries(reasonGroups).map(([key, items]) => {
    const [iso_date, bc, khu, reason] = JSON.parse(key);
    return { iso_date, bc, khu, reason, so_luong: items.length };
  });

  const sellerGroups = groupBy(
    classified.filter((r) => r.seller),
    (r) => JSON.stringify([r.iso_date, r.seller, r.bc, r.khu])
  );
  const sellerByDay = Object.entries(sellerGroups).map(([key, items]) => {
    const [iso_date, seller, bc, khu] = JSON.parse(key);
    return {
      iso_date,
      seller,
      bc,
      khu,
      tong_don: items.length,
      thanh_cong: sum(items.map((r) => r.thanh_cong)),
      huy: sum(items.map((r) => r.huy)),
    };
  });

  const sellerReasonGroups = groupBy(
    classified.filter((r) => r.reason && r.seller),
    (r) => JSON.stringify([r.iso_date, r.seller, r.reason])
  );
  const sellerReasonByDay = Object.entries(sellerReasonGroups).map(([key, items]) => {
    const [iso_date, seller, reason] = JSON.parse(key);
    return { iso_date, seller, reason, so_luong: items.length };
  });

  // ---- theo Phường/Xã (cho bản đồ HCM) — chỉ cần đơn NHẬN THÀNH CÔNG ----
  const geoGroups = groupBy(
    classified.filter((r) => r.phuong_xa),
    (r) => JSON.stringify([r.iso_date, r.phuong_xa])
  );
  const geoByDay = Object.entries(geoGroups).map(([key, items]) => {
    const [iso_date, phuong_xa] = JSON.parse(key);
    return { iso_date, phuong_xa, tong_don: items.length, thanh_cong: sum(items.map((r) => r.thanh_cong)) };
  });

  return { bcByDay, reasonByDay, sellerByDay, sellerReasonByDay, geoByDay };
}

const NO_SHIFT_REASON = "Chưa gán ca gom hàng";
const LATE_DESPITE_SHIFT_REASON = "Trễ dù đã gán ca";
const GW_REASON = "Không trung chuyển HUB - HUB (về GW)";
const GW_BUCKET_LABEL = "Hàng gửi về GW";

// "Mã TTTC đầu" -> tên HUB lõi hiển thị trên báo cáo. 4 HUB lõi (7/8/11/13) nhận hàng trực tiếp;
// HUB 18 (028H98) không có chặng trung chuyển riêng trong file này nên được tính gộp vào HUB 8
// theo quy ước nghiệp vụ (không phải suy ra từ dữ liệu). Mọi mã khác — gồm cả HUB feeder 5/9/16
// (028H85/028H89/028H96), ĐGP/TTKT/GW hoặc rỗng — đều KHÔNG có chặng HUB-HUB hợp lệ, gộp vào
// "Hàng gửi về GW".
const CORE_HUB_NAME_BY_CODE = {
  "028H87": "(HCM) HUB 7",
  "028H88": "(HCM) HUB 8",
  "028H91": "(HCM) HUB 11",
  "028H93": "(HCM) HUB 13",
};
const FEEDER_TO_HUB8_CODE = "028H98";

function classifyTransitHub(maTTTCDau) {
  if (maTTTCDau === FEEDER_TO_HUB8_CODE) return { hub: CORE_HUB_NAME_BY_CODE["028H88"], isGwBucket: false };
  if (CORE_HUB_NAME_BY_CODE[maTTTCDau]) return { hub: CORE_HUB_NAME_BY_CODE[maTTTCDau], isGwBucket: false };
  return { hub: GW_BUCKET_LABEL, isGwBucket: true };
}

// Đơn hàng SAMEDAY hợp lệ: TTTC đầu gửi hàng đi (Thời gian TTTC đầu gửi hàng) trong khung
// 12:00:00 ngày N-1 -> 13:40:00 ngày N (N = ngày lấy hàng thành công, xem noonWindowDay).
function transitOnTime(dispatch, dayN) {
  if (!dispatch) return false;
  const winStart = new Date(dayN);
  winStart.setUTCDate(winStart.getUTCDate() - 1);
  winStart.setUTCHours(12, 0, 0, 0);
  const winEnd = new Date(dayN);
  winEnd.setUTCHours(13, 40, 0, 0);
  return dispatch >= winStart && dispatch <= winEnd;
}

function readTransitFiles() {
  if (!fs.existsSync(TRANSIT_DIR)) return [];
  return fs
    .readdirSync(TRANSIT_DIR)
    .filter((f) => f.toLowerCase().endsWith(".xlsx") && !f.startsWith("~$"))
    .sort();
}

/** Đọc toàn bộ file trong thư mục "Trung chuyển - HUB" và gộp theo Mã vận đơn. File ở đây RẤT
 * nặng (hàng trăm nghìn dòng, 40+ cột) — phải đọc ở chế độ `dense: true` và bỏ style/formula/HTML,
 * kết hợp header:1 (mảng, không phải object theo tên cột) — nhanh hơn cách đọc thông thường hàng
 * chục lần (thử nghiệm: ~20-25s cho toàn bộ file thay vì treo >10 phút không xong). */
function readTransitRows() {
  const files = readTransitFiles();
  if (files.length === 0) return [];
  const byWaybill = new Map();
  for (const fname of files) {
    const wb = XLSX.readFile(path.join(TRANSIT_DIR, fname), {
      dense: true,
      cellStyles: false,
      cellHTML: false,
      cellFormula: false,
    });
    const sheetName = wb.SheetNames[0];
    const rowsArr = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null, raw: true });
    const header = rowsArr[0];
    const iWaybill = header.indexOf("Mã vận đơn");
    const iMaTTTCDau = header.indexOf("Mã TTTC đầu");
    const iBcGui = header.indexOf("Mã bưu cục gửi");
    const iCa = header.indexOf("Ca gom hàng");
    const iThoiGianGui = header.indexOf("Thời gian TTTC đầu gửi hàng");
    for (let i = 1; i < rowsArr.length; i++) {
      const r = rowsArr[i];
      const waybill = r[iWaybill];
      if (!waybill) continue;
      byWaybill.set(waybill, {
        waybill,
        maTTTCDau: r[iMaTTTCDau] || null,
        bc_gui: r[iBcGui] || null,
        coCa: !!r[iCa],
        dispatch: excelSerialToDate(r[iThoiGianGui]),
      });
    }
  }
  console.log(`Đã đọc ${files.length} file Trung chuyển, tổng ${byWaybill.size} kiện (đã gộp theo Mã vận đơn).`);
  return [...byWaybill.values()];
}

/** Match ngược từng kiện Trung chuyển với ngày lấy hàng thành công bên Khâu nhận (theo Mã vận
 * đơn) để xác định kiện đó thuộc đơn SAMEDAY của ngày N nào — kiện không match được (chưa có/không
 * lấy hàng thành công) bị loại vì không xác định được ngày N. `receivingRawRows` là kết quả
 * readReceivingRows() đã đọc sẵn ở main(), tránh đọc lại file Khâu nhận lần 2. */
function readTransitByDay(receivingRawRows) {
  const pickupMap = new Map();
  for (const r of receivingRawRows) {
    if (r.pickup) pickupMap.set(r.waybill, r.pickup);
  }

  const rawRows = readTransitRows();
  const rows = [];
  for (const r of rawRows) {
    const pickup = pickupMap.get(r.waybill);
    if (!pickup) continue;
    const dayN = noonWindowDay(pickup);
    const iso_date = toISODate(dayN);
    const { hub, isGwBucket } = classifyTransitHub(r.maTTTCDau);
    const onTime = isGwBucket ? false : transitOnTime(r.dispatch, dayN);
    rows.push({ iso_date, hub, bc_gui: r.bc_gui, coCa: r.coCa, onTime, isGwBucket });
  }

  if (rows.length === 0) {
    return { hubByDay: [], bcByDay: [], reasonByDay: [] };
  }

  const hubGroups = groupBy(rows, (r) => JSON.stringify([r.iso_date, r.hub]));
  const hubByDay = Object.entries(hubGroups).map(([key, items]) => {
    const [iso_date, hub] = JSON.parse(key);
    return {
      iso_date,
      hub,
      tong_don: items.length,
      dung_gio: sum(items.map((r) => (r.onTime ? 1 : 0))),
      co_ca: sum(items.map((r) => (r.coCa ? 1 : 0))),
    };
  });

  const bcGroups = groupBy(
    rows.filter((r) => r.bc_gui),
    (r) => JSON.stringify([r.iso_date, r.hub, r.bc_gui])
  );
  const bcByDay = Object.entries(bcGroups).map(([key, items]) => {
    const [iso_date, hub, bc_gui] = JSON.parse(key);
    return { iso_date, hub, bc_gui, tong_don: items.length, dung_gio: sum(items.map((r) => (r.onTime ? 1 : 0))) };
  });

  const reasonGroups = groupBy(
    rows.filter((r) => !r.onTime),
    (r) =>
      JSON.stringify([
        r.iso_date,
        r.hub,
        r.bc_gui ?? null,
        r.isGwBucket ? GW_REASON : r.coCa ? LATE_DESPITE_SHIFT_REASON : NO_SHIFT_REASON,
      ])
  );
  const reasonByDay = Object.entries(reasonGroups).map(([key, items]) => {
    const [iso_date, hub, bc_gui, reason] = JSON.parse(key);
    return { iso_date, hub, bc_gui, reason, so_luong: items.length };
  });

  return { hubByDay, bcByDay, reasonByDay };
}

main();
