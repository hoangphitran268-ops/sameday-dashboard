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

export interface RawHourDay {
  iso_date: string;
  gio: number;
  pickup: number;
  sign: number;
}

export interface RawArrivalDay {
  iso_date: string;
  buu_cuc: string;
  khu: string | null;
  gio: number;
  so_luong: number;
}

export interface RawDashboardData {
  generated_at: string;
  available_dates: string[];
  kpi_daily: RawKpiDay[];
  reason_bc_by_day: RawReasonBcDay[];
  bc_by_day: RawNodeDay[];
  khu_by_day: RawNodeDay[];
  hour_by_day: RawHourDay[];
  arrival_by_day: RawArrivalDay[];
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
  hour_trend: HourRow[];
  has_data: boolean;
}

export interface ReasonPageData {
  reason_overall: ReasonRow[];
  reason_bc: ReasonBcRow[];
  khu_options: string[];
  has_data: boolean;
}

export interface HourCountRow {
  gio: number;
  so_luong: number;
}

export interface ArrivalPageData {
  hours: HourCountRow[];
  khu_options: string[];
  bc_options: string[];
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
