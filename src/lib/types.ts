// ---- Dữ liệu thô, theo từng ngày (lưu trong src/data/dashboard-data.json) ----

export interface RawKpiDay {
  iso_date: string;
  tong_don: number;
  da_ky_nhan: number;
  so_don_co_van_de: number;
  duration_sum_h: number;
  duration_count: number;
}

export interface RawReasonBcDay {
  iso_date: string;
  buu_cuc: string;
  khu: string | null;
  nguyen_nhan: string;
  so_luong: number;
}

export interface RawNodeDay {
  iso_date: string;
  key: string;
  tong_don: number;
  da_ky_nhan: number;
  issue: number;
  duration_sum_h: number;
  duration_count: number;
}

/** Giờ lấy hàng / ký nhận / hàng đến, theo BC cuối + Khu cuối (bưu cục PHÁT cuối cùng của
 * đơn — khác với "Bưu cục đang thao tác"), để lọc theo khu/bưu cục phát trên cùng 1 biểu đồ. */
export interface RawHourDay {
  iso_date: string;
  buu_cuc: string;
  khu: string | null;
  gio: number;
  pickup: number;
  sign: number;
  arrival: number;
}

/** Phạt Khâu Nhận (lũy kế) — nguồn khác, file riêng (không phải export hằng ngày), luôn
 * là snapshot mới nhất khi quét lại. iso_date lấy theo mốc kết thúc khung "13H(N-1)-12H59(N)"
 * trong cột "Phân loại thời gian", cùng quy ước ngày báo cáo N với toàn bộ dashboard. */
export interface RawPenaltyDay {
  iso_date: string;
  tinh_trang: string;
  khu: string | null;
  bc: string;
  so_luong: number;
  tien_phat: number;
}

/** Nhận kiện (lấy hàng) — thư mục riêng "Khâu nhận", quét toàn bộ file (không phải snapshot lũy
 * kế như Phạt). "Ngày N" ở đây theo khung 12h(N-1)->11h59(N) của "Thời gian nhập đơn hàng" (khác
 * khung 13h(N-1)->12h59(N) của Phạt) — xem ghi chú trong scripts/regenerate-data.mjs. */
export interface RawReceivingBcDay {
  iso_date: string;
  bc: string;
  khu: string | null;
  tong_don: number;
  thanh_cong: number;
  huy: number;
}

export interface RawReceivingReasonDay {
  iso_date: string;
  bc: string;
  khu: string | null;
  reason: string;
  so_luong: number;
}

export interface RawReceivingSellerDay {
  iso_date: string;
  seller: string;
  bc: string | null;
  khu: string | null;
  tong_don: number;
  thanh_cong: number;
  huy: number;
}

export interface RawReceivingSellerReasonDay {
  iso_date: string;
  seller: string;
  reason: string;
  so_luong: number;
}

/** Theo Phường/Xã lấy hàng (đơn vị hành chính mới) — dùng cho bản đồ HCM (chỉ quan tâm đơn nhận
 * thành công). */
export interface RawReceivingGeoDay {
  iso_date: string;
  phuong_xa: string;
  tong_don: number;
  thanh_cong: number;
}

export interface RawDashboardData {
  generated_at: string;
  available_dates: string[];
  kpi_daily: RawKpiDay[];
  reason_bc_by_day: RawReasonBcDay[];
  bc_by_day: RawNodeDay[];
  khu_by_day: RawNodeDay[];
  hour_by_day: RawHourDay[];
  penalty_by_day: RawPenaltyDay[];
  receiving_bc_by_day: RawReceivingBcDay[];
  receiving_reason_by_day: RawReceivingReasonDay[];
  receiving_seller_by_day: RawReceivingSellerDay[];
  receiving_seller_reason_by_day: RawReceivingSellerReasonDay[];
  receiving_geo_by_day: RawReceivingGeoDay[];
}

// ---- Dữ liệu đã tổng hợp cho 1 khoảng ngày cụ thể (tính bởi src/lib/aggregate.ts) ----

export interface KpiDailyRow {
  report_date: string;
  tong_don: number;
  ty_le_ky_nhan_pct: number;
  tg_xu_ly_trung_binh_h: number;
  ty_le_van_de_pct: number;
}

export interface WeekdayRow {
  weekday: string;
  so_ngay_mau: number;
  tong_don: number;
  ty_le_ky_nhan_pct: number;
  ty_le_van_de_pct: number;
}

export interface ReasonRow {
  nguyen_nhan: string;
  so_luong: number;
}

export interface ReasonBcRow {
  buu_cuc: string;
  khu: string | null;
  nguyen_nhan: string;
  so_luong: number;
}

export interface NodePerfRow {
  buu_cuc?: string;
  khu?: string;
  tong_don: number;
  da_ky_nhan: number;
  ty_le_ky_nhan_pct: number;
  tg_xu_ly_tb_h: number | null;
  so_don_van_de: number;
}

export interface DashboardMeta {
  tu_ngay: string | null;
  den_ngay: string | null;
  so_ngay: number;
  tong_don_21_ngay: number;
  ty_le_ky_nhan_pct: number;
  ty_le_van_de_pct: number;
  tg_xu_ly_tb_h: number;
  generated_at?: string;
}

export interface DashboardData {
  meta: DashboardMeta;
  kpi_daily: KpiDailyRow[];
  weekday: WeekdayRow[];
  bc_worst15: NodePerfRow[];
  bc_best15: NodePerfRow[];
  khu_perf: NodePerfRow[];
  has_data: boolean;
}

export interface ReasonPageData {
  reason_overall: ReasonRow[];
  reason_bc: ReasonBcRow[];
  khu_options: string[];
  has_data: boolean;
}

export interface HourFlowRow {
  gio: number;
  pickup: number;
  sign: number;
  arrival: number;
}

export interface HourBcDetailRow {
  buu_cuc: string;
  khu: string | null;
  pickup: number;
  sign: number;
  arrival: number;
  tong: number;
}

export interface HourBcHourRow {
  buu_cuc: string;
  khu: string | null;
  gio: number;
  pickup: number;
  sign: number;
  arrival: number;
}

export interface HourPageData {
  hours: HourFlowRow[];
  khu_options: string[];
  bc_options: string[];
  bc_detail: HourBcDetailRow[];
  bc_hour: HourBcHourRow[];
  has_data: boolean;
}

export interface PenaltyTypeRow {
  tinh_trang: string;
  so_luong: number;
  tien_phat: number;
  is_vi_pham: boolean;
}

export interface PenaltyBcRow {
  bc: string;
  khu: string | null;
  tinh_trang: string;
  so_luong: number;
  tien_phat: number;
}

export interface PenaltyDailyRow {
  report_date: string;
  so_don_vi_pham: number;
  tien_phat: number;
}

export interface PenaltyMeta {
  tong_don_ra_soat: number;
  so_don_vi_pham: number;
  ty_le_dung_gio_pct: number;
  tong_tien_phat: number;
}

export interface PenaltyPageData {
  meta: PenaltyMeta;
  tinh_trang_overall: PenaltyTypeRow[];
  penalty_bc: PenaltyBcRow[];
  daily: PenaltyDailyRow[];
  khu_options: string[];
  has_data: boolean;
}

export interface ReceivingMeta {
  tong_don: number;
  thanh_cong: number;
  khong_thanh_cong: number;
  huy: number;
  ty_le_thanh_cong_pct: number;
  ty_le_khong_thanh_cong_pct: number;
  ty_le_huy_pct: number;
}

export interface ReceivingDailyRow {
  report_date: string;
  ty_le_thanh_cong_pct: number;
  ty_le_huy_pct: number;
}

export interface ReceivingPerfRow {
  bc?: string;
  khu?: string;
  tong_don: number;
  thanh_cong: number;
  khong_thanh_cong: number;
  ty_le_thanh_cong_pct: number;
  huy: number;
  nguyen_nhan_chinh: string | null;
}

export interface ReceivingSellerRow {
  seller: string;
  tong_don: number;
  thanh_cong: number;
  khong_thanh_cong: number;
  ty_le_thanh_cong_pct: number;
  huy: number;
  nguyen_nhan_chinh: string | null;
}

export interface ReceivingSellerReasonRow {
  seller: string;
  nguyen_nhan: string;
  so_luong: number;
}

export interface ReceivingGeoRow {
  phuong_xa: string;
  tong_don: number;
  thanh_cong: number;
}

export interface ReceivingPageData {
  meta: ReceivingMeta;
  daily: ReceivingDailyRow[];
  khu_perf: ReceivingPerfRow[];
  bc_worst15: ReceivingPerfRow[];
  bc_best15: ReceivingPerfRow[];
  reason_overall: ReasonRow[];
  reason_bc: ReasonBcRow[];
  seller_worst15: ReceivingSellerRow[];
  seller_best15: ReceivingSellerRow[];
  seller_reason: ReceivingSellerReasonRow[];
  geo: ReceivingGeoRow[];
  geo_phat: ReceivingGeoRow[];
  geo_total: ReceivingGeoRow[];
  has_data: boolean;
}

export type RangePresetKey =
  | "all"
  | "yesterday"
  | "last7"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export interface DateRange {
  from: string | null; // ISO date, inclusive
  to: string | null; // ISO date, inclusive
  preset: RangePresetKey;
  label: string;
}
