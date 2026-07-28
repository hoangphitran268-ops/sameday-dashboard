import { getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import StatTile from "@/components/StatTile";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import KpiTrendLine from "@/components/charts/KpiTrendLine";
import WeekdayBarChart from "@/components/charts/WeekdayBarChart";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function OverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { data, range } = getDashboardData(await searchParams);
  const { meta } = data;

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label={`Tổng số đơn (${meta.so_ngay} ngày)`} value={meta.tong_don_21_ngay.toLocaleString("vi-VN")} />
        <StatTile label="Tỷ lệ ký nhận (đã xử lý xong trong ngày N)" value={`${meta.ty_le_ky_nhan_pct}%`} />
        <StatTile label="TG xử lý trung bình" value={`${meta.tg_xu_ly_tb_h} giờ`} />
        <StatTile label="Tỷ lệ đơn có vấn đề" value={`${meta.ty_le_van_de_pct}%`} critical />
      </div>

      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--brand-red-tint)", borderColor: "var(--brand-red-light)" }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--brand-red-dark)" }}>
          Phát hiện chính · {rangeDisplayLabel(range)}
        </h3>
        <ul className="space-y-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          <li>
            <b style={{ color: "var(--text-primary)" }}>Chủ nhật có tỷ lệ ký nhận thấp hơn các ngày khác</b> — xem
            mức chênh lệch cụ thể ở biểu đồ theo Thứ bên dưới.
          </li>
          <li>
            <b style={{ color: "var(--text-primary)" }}>Khi đơn đã được ký nhận, gần như luôn đúng trong ngày N</b> —
            trễ hạn chủ yếu nằm ở việc đơn CHƯA được xử lý xong (thể hiện qua tỷ lệ ký nhận), không phải ký nhận
            muộn ngày.
          </li>
        </ul>
      </div>

      <ChartCard
        title="Tỷ lệ ký nhận / có vấn đề theo ngày (%)"
        legend={
          <>
            <LegendItem color="var(--series-primary)" label="Tỷ lệ ký nhận %" />
            <LegendItem color="var(--series-tertiary)" label="Tỷ lệ có vấn đề %" />
          </>
        }
      >
        <KpiTrendLine data={data.kpi_daily} />
      </ChartCard>

      <ChartCard title="Tỷ lệ ký nhận theo Thứ trong tuần (%)" note="Đỏ đậm = ngày có tỷ lệ ký nhận thấp nhất">
        <WeekdayBarChart data={data.weekday} />
      </ChartCard>
    </div>
  );
}
