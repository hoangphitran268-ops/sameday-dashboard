import { getArrivalPageData, getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import HourTrendLine from "@/components/charts/HourTrendLine";
import ArrivalHourChart from "@/components/charts/ArrivalHourChart";
import ArrivalFilters from "@/components/ArrivalFilters";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function TheoGioPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { data, range } = getDashboardData(params);
  const { data: arrival, khu: arrivalKhu, bc: arrivalBc } = getArrivalPageData(params);

  if (!data.has_data || data.hour_trend.length === 0) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  const peakPickup = [...data.hour_trend].sort((a, b) => b.so_don_lay_hang - a.so_don_lay_hang)[0];
  const peakSign = [...data.hour_trend].sort((a, b) => b.so_don_ky_nhan - a.so_don_ky_nhan)[0];
  const peakArrival = arrival.hours.length ? [...arrival.hours].sort((a, b) => b.so_luong - a.so_luong)[0] : null;

  const arrivalNoteParts = [rangeDisplayLabel(range)];
  if (arrivalKhu) arrivalNoteParts.push(`Khu ${arrivalKhu}`);
  if (arrivalBc) arrivalNoteParts.push(`Bưu cục ${arrivalBc}`);

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

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Giờ hàng đến bưu cục phát
          </h2>
          <ArrivalFilters khuOptions={arrival.khu_options} bcOptions={arrival.bc_options} />
        </div>

        {arrival.hours.length > 0 ? (
          <>
            {peakArrival && (
              <div
                className="rounded-xl border p-4 mb-4 max-w-xs"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                  Giờ hàng đến cao điểm
                </div>
                <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {peakArrival.gio}h ({peakArrival.so_luong.toLocaleString("vi-VN")} đơn)
                </div>
              </div>
            )}
            <ChartCard title="Số đơn hàng đến bưu cục phát theo giờ" note={arrivalNoteParts.join(" · ")}>
              <ArrivalHourChart data={arrival.hours} />
            </ChartCard>
          </>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Không có dữ liệu giờ hàng đến cho lựa chọn hiện tại — thử chọn khu/bưu cục khác.
          </p>
        )}
      </div>
    </div>
  );
}
