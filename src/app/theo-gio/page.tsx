import { getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import HourTrendLine from "@/components/charts/HourTrendLine";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function TheoGioPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { data, range } = getDashboardData(await searchParams);

  if (!data.has_data || data.hour_trend.length === 0) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  const peakPickup = [...data.hour_trend].sort((a, b) => b.so_don_lay_hang - a.so_don_lay_hang)[0];
  const peakSign = [...data.hour_trend].sort((a, b) => b.so_don_ky_nhan - a.so_don_ky_nhan)[0];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
            Giờ lấy hàng cao điểm
          </div>
          <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {peakPickup.gio}h ({peakPickup.so_don_lay_hang.toLocaleString("vi-VN")} đơn)
          </div>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
            Giờ ký nhận cao điểm
          </div>
          <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {peakSign.gio}h ({peakSign.so_don_ky_nhan.toLocaleString("vi-VN")} đơn)
          </div>
        </div>
      </div>

      <ChartCard
        title="Số đơn theo giờ trong ngày: Lấy hàng vs Ký nhận"
        note={rangeDisplayLabel(range)}
        legend={
          <>
            <LegendItem color="var(--series-primary)" label="Số đơn lấy hàng" />
            <LegendItem color="var(--series-secondary)" label="Số đơn ký nhận" />
          </>
        }
      >
        <HourTrendLine data={data.hour_trend} />
      </ChartCard>
    </div>
  );
}
