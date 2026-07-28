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
  tu_ngay: string;
  den_ngay: string;
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
}
