// ---- Dữ liệu thô, theo từng ngày (lưu trong src/data/dashboard-data.json) ----

export interface RawKpiDay {
  iso_date: string;
  tong_don: number;
  da_ky_nhan: number;
  ky_nhan_cung_ngay: number;
  so_don_co_van_de: number;
  duration_sum_h: number;
  duration_count: number;
}

export interface RawStatusDay {
  iso_date: string;
  trang_thai: string;
  so_luong: number;
}

export interface RawReasonDay {
  iso_date: string;
  nguyen_nhan: string;
  so_luong: number;
}

export interface RawNodeDay {
  iso_date: string;
  key: string;
  tong_don: number;
  da_ky_nhan: number;
  same_day: number;
  issue: number;
  duration_sum_h: number;
  duration_count: number;
}

export interface RawHourDay {
  iso_date: string;
  gio: number;
  pickup: number;
  sign: number;
}

export interface RawDashboardData {
  generated_at: string;
  available_dates: string[];
  kpi_daily: RawKpiDay[];
  status_by_day: RawStatusDay[];
  reason_by_day: RawReasonDay[];
  bc_by_day: RawNodeDay[];
  khu_by_day: RawNodeDay[];
  hour_by_day: RawHourDay[];
}

// ---- Dữ liệu đã tổng hợp cho 1 khoảng ngày cụ thể (tính bởi src/lib/aggregate.ts) ----

export interface KpiDailyRow {
  report_date: string;
  tong_don: number;
  ty_le_ky_nhan_pct: number;
  ty_le_cung_ngay_pct: number;
  tg_xu_ly_trung_binh_h: number;
  ty_le_van_de_pct: number;
}

export interface WeekdayRow {
  weekday: string;
  so_ngay_mau: number;
  tong_don: number;
  ty_le_ky_nhan_pct: number;
  ty_le_cung_ngay_pct: number;
  ty_le_van_de_pct: number;
}

export interface StatusRow {
  trang_thai: string;
  so_luong: number;
}

export interface ReasonRow {
  nguyen_nhan: string;
  so_luong: number;
}

export interface NodePerfRow {
  buu_cuc?: string;
  khu?: string;
  tong_don: number;
  da_ky_nhan: number;
  ty_le_ky_nhan_pct: number;
  ty_le_cung_ngay_pct: number;
  tg_xu_ly_tb_h: number | null;
  so_don_van_de: number;
}

export interface HourRow {
  gio: number;
  so_don_lay_hang: number;
  so_don_ky_nhan: number;
}

export interface DashboardMeta {
  tu_ngay: string | null;
  den_ngay: string | null;
  so_ngay: number;
  tong_don_21_ngay: number;
  ty_le_ky_nhan_pct: number;
  ty_le_cung_ngay_pct: number;
  ty_le_van_de_pct: number;
  tg_xu_ly_tb_h: number;
  generated_at?: string;
}

export interface DashboardData {
  meta: DashboardMeta;
  kpi_daily: KpiDailyRow[];
  weekday: WeekdayRow[];
  status_overall: StatusRow[];
  reason_overall: ReasonRow[];
  bc_worst15: NodePerfRow[];
  bc_best15: NodePerfRow[];
  khu_perf: NodePerfRow[];
  hour_trend: HourRow[];
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
