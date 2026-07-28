import type { DashboardData, DateRange, RawDashboardData, RawNodeDay } from "./types";

function pct(n: number, d: number): number {
  return d ? Math.round((n / d) * 1000) / 10 : 0;
}
function ddmm(iso: string): string {
  const [, mo, d] = iso.split("-");
  return `${d}/${mo}`;
}
function inRange(iso: string, from: string | null, to: string | null): boolean {
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

const WEEKDAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function isoWeekday(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function aggregateNodeDays(days: RawNodeDay[], minVolume: number, labelKey: "buu_cuc" | "khu") {
  const byKey = new Map<string, { tong_don: number; da_ky_nhan: number; same_day: number; issue: number; dur_sum: number; dur_count: number }>();
  for (const d of days) {
    const acc = byKey.get(d.key) ?? { tong_don: 0, da_ky_nhan: 0, same_day: 0, issue: 0, dur_sum: 0, dur_count: 0 };
    acc.tong_don += d.tong_don;
    acc.da_ky_nhan += d.da_ky_nhan;
    acc.same_day += d.same_day;
    acc.issue += d.issue;
    acc.dur_sum += d.duration_sum_h;
    acc.dur_count += d.duration_count;
    byKey.set(d.key, acc);
  }
  const rows = Array.from(byKey.entries())
    .map(([key, a]) => ({
      [labelKey]: key,
      tong_don: a.tong_don,
      da_ky_nhan: a.da_ky_nhan,
      ty_le_ky_nhan_pct: pct(a.da_ky_nhan, a.tong_don),
      ty_le_cung_ngay_pct: pct(a.same_day, a.da_ky_nhan),
      tg_xu_ly_tb_h: a.dur_count ? Math.round((a.dur_sum / a.dur_count) * 100) / 100 : null,
      so_don_van_de: a.issue,
    }))
    .filter((r) => r.da_ky_nhan > 0 && r.tong_don >= minVolume);
  return rows;
}

/** Tính lại toàn bộ view dashboard từ dữ liệu thô theo-ngày, giới hạn trong [from, to] (bao gồm 2 đầu, null = không giới hạn). */
export function aggregateRange(raw: RawDashboardData, range: DateRange): DashboardData {
  const { from, to } = range;
  const dates = raw.available_dates.filter((d) => inRange(d, from, to));
  const dateSet = new Set(dates);

  const kpiRows = raw.kpi_daily.filter((d) => dateSet.has(d.iso_date));

  const kpi_daily = kpiRows
    .map((d) => ({
      report_date: ddmm(d.iso_date),
      tong_don: d.tong_don,
      ty_le_ky_nhan_pct: pct(d.da_ky_nhan, d.tong_don),
      ty_le_cung_ngay_pct: pct(d.ky_nhan_cung_ngay, d.da_ky_nhan),
      tg_xu_ly_trung_binh_h: d.duration_count ? Math.round((d.duration_sum_h / d.duration_count) * 100) / 100 : 0,
      ty_le_van_de_pct: pct(d.so_don_co_van_de, d.tong_don),
    }));

  // weekday
  const byWeekday = new Map<number, typeof kpiRows>();
  for (const d of kpiRows) {
    const wd = isoWeekday(d.iso_date);
    const arr = byWeekday.get(wd) ?? [];
    arr.push(d);
    byWeekday.set(wd, arr);
  }
  const weekday = WEEKDAY_ORDER.filter((wd) => byWeekday.has(wd)).map((wd) => {
    const g = byWeekday.get(wd)!;
    const total = sum(g.map((r) => r.tong_don));
    const signed = sum(g.map((r) => r.da_ky_nhan));
    const sameDay = sum(g.map((r) => r.ky_nhan_cung_ngay));
    const issue = sum(g.map((r) => r.so_don_co_van_de));
    return {
      weekday: WEEKDAY_NAMES[wd],
      so_ngay_mau: g.length,
      tong_don: total,
      ty_le_ky_nhan_pct: pct(signed, total),
      ty_le_cung_ngay_pct: pct(sameDay, signed),
      ty_le_van_de_pct: pct(issue, total),
    };
  });

  // status funnel
  const statusMap = new Map<string, number>();
  for (const r of raw.status_by_day) {
    if (!dateSet.has(r.iso_date)) continue;
    statusMap.set(r.trang_thai, (statusMap.get(r.trang_thai) ?? 0) + r.so_luong);
  }
  const status_overall = Array.from(statusMap.entries())
    .map(([trang_thai, so_luong]) => ({ trang_thai, so_luong }))
    .sort((a, b) => b.so_luong - a.so_luong);

  // reasons
  const reasonMap = new Map<string, number>();
  for (const r of raw.reason_by_day) {
    if (!dateSet.has(r.iso_date)) continue;
    reasonMap.set(r.nguyen_nhan, (reasonMap.get(r.nguyen_nhan) ?? 0) + r.so_luong);
  }
  const reason_overall = Array.from(reasonMap.entries())
    .map(([nguyen_nhan, so_luong]) => ({ nguyen_nhan, so_luong }))
    .sort((a, b) => b.so_luong - a.so_luong);

  // buu cuc / khu perf
  const bcDays = raw.bc_by_day.filter((d) => dateSet.has(d.iso_date));
  const khuDays = raw.khu_by_day.filter((d) => dateSet.has(d.iso_date));
  const bcAll = aggregateNodeDays(bcDays, 300, "buu_cuc");
  const bc_worst15 = [...bcAll].sort((a, b) => a.ty_le_cung_ngay_pct - b.ty_le_cung_ngay_pct).slice(0, 15);
  const bc_best15 = [...bcAll].sort((a, b) => b.ty_le_cung_ngay_pct - a.ty_le_cung_ngay_pct).slice(0, 15);
  const khu_perf = aggregateNodeDays(khuDays, 1000, "khu").sort((a, b) => a.ty_le_cung_ngay_pct - b.ty_le_cung_ngay_pct);

  // hourly trend
  const hourMap = new Map<number, { pickup: number; sign: number }>();
  for (const r of raw.hour_by_day) {
    if (!dateSet.has(r.iso_date)) continue;
    const acc = hourMap.get(r.gio) ?? { pickup: 0, sign: 0 };
    acc.pickup += r.pickup;
    acc.sign += r.sign;
    hourMap.set(r.gio, acc);
  }
  const hour_trend = Array.from(hourMap.entries())
    .map(([gio, v]) => ({ gio, so_don_lay_hang: v.pickup, so_don_ky_nhan: v.sign }))
    .sort((a, b) => a.gio - b.gio);

  const totalAll = sum(kpiRows.map((r) => r.tong_don));
  const signedAll = sum(kpiRows.map((r) => r.da_ky_nhan));
  const sameDayAll = sum(kpiRows.map((r) => r.ky_nhan_cung_ngay));
  const issueAll = sum(kpiRows.map((r) => r.so_don_co_van_de));
  const durSumAll = sum(kpiRows.map((r) => r.duration_sum_h));
  const durCountAll = sum(kpiRows.map((r) => r.duration_count));

  return {
    meta: {
      tu_ngay: dates[0] ?? null,
      den_ngay: dates[dates.length - 1] ?? null,
      so_ngay: dates.length,
      tong_don_21_ngay: totalAll,
      ty_le_ky_nhan_pct: pct(signedAll, totalAll),
      ty_le_cung_ngay_pct: pct(sameDayAll, signedAll),
      ty_le_van_de_pct: pct(issueAll, totalAll),
      tg_xu_ly_tb_h: durCountAll ? Math.round((durSumAll / durCountAll) * 100) / 100 : 0,
      generated_at: raw.generated_at,
    },
    kpi_daily,
    weekday,
    status_overall,
    reason_overall,
    bc_worst15,
    bc_best15,
    khu_perf,
    hour_trend,
    has_data: totalAll > 0,
  };
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}
