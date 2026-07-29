import { getHourPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import HourFlowChart from "@/components/charts/HourFlowChart";
import HourFilters from "@/components/HourFilters";
import HourBcDetailTable from "@/components/HourBcDetailTable";
import HourBcPivotTable from "@/components/HourBcPivotTable";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const METRIC_TITLE: Record<string, string> = {
  pickup: "Lấy hàng",
  sign: "Ký nhận",
  arrival: "Hàng đến bưu cục phát",
};

export default async function TheoGioPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { data, range, khu, bc } = getHourPageData(params);
  const metricParam = Array.isArray(params.metric) ? params.metric[0] : params.metric;
  const metric = metricParam === "pickup" || metricParam === "sign" || metricParam === "arrival" ? metricParam : null;

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  const noteParts = [rangeDisplayLabel(range)];
  if (khu) noteParts.push(`Khu ${khu}`);
  if (bc) noteParts.push(`Bưu cục ${bc}`);
  const note = noteParts.join(" · ");

  const peakPickup = data.hours.length ? [...data.hours].sort((a, b) => b.pickup - a.pickup)[0] : null;
  const peakSign = data.hours.length ? [...data.hours].sort((a, b) => b.sign - a.sign)[0] : null;
  const peakArrival = data.hours.length ? [...data.hours].sort((a, b) => b.arrival - a.arrival)[0] : null;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="grid grid-cols-3 gap-3 max-w-2xl w-full">
          <PeakTile label="Giờ lấy hàng cao điểm" peak={peakPickup} field="pickup" />
          <PeakTile label="Giờ ký nhận cao điểm" peak={peakSign} field="sign" />
          <PeakTile label="Giờ hàng đến cao điểm" peak={peakArrival} field="arrival" />
        </div>
        <HourFilters khuOptions={data.khu_options} bcOptions={data.bc_options} />
      </div>

      {data.hours.length > 0 ? (
        <>
          <ChartCard
            title="Số đơn theo giờ trong ngày: Lấy hàng · Ký nhận · Hàng đến bưu cục phát"
            note={note}
            legend={
              <>
                <LegendItem color="var(--series-primary)" label="Số đơn lấy hàng" />
                <LegendItem color="var(--series-secondary)" label="Số đơn ký nhận" />
                <LegendItem color="var(--series-tertiary)" label="Số đơn hàng đến bưu cục phát" />
              </>
            }
          >
            <HourFlowChart data={data.hours} />
          </ChartCard>

          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Chi tiết theo bưu cục phát{metric ? ` · ${METRIC_TITLE[metric]}` : ""}
            </h3>
            <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
              {metric
                ? `Đúng theo bộ lọc Khu/Bưu cục ở trên — mỗi bưu cục, mỗi giờ đạt bao nhiêu đơn "${METRIC_TITLE[metric]}".`
                : "Đúng theo bộ lọc Khu/Bưu cục của biểu đồ trên — sắp xếp theo tổng khối lượng giảm dần. Chọn 1 loại (Lấy hàng/Ký nhận/Hàng đến) ở bộ lọc để xem chi tiết theo từng giờ."}
            </p>
            {metric ? (
              <HourBcPivotTable metric={metric} bcDetail={data.bc_detail} bcHour={data.bc_hour} hours={data.hours} />
            ) : (
              <HourBcDetailTable rows={data.bc_detail} />
            )}
          </div>
        </>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Không có dữ liệu cho lựa chọn hiện tại — thử chọn khu/bưu cục khác.
        </p>
      )}
    </div>
  );
}

function PeakTile({
  label,
  peak,
  field,
}: {
  label: string;
  peak: { gio: number; pickup: number; sign: number; arrival: number } | null;
  field: "pickup" | "sign" | "arrival";
}) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {peak ? `${peak.gio}h (${peak[field].toLocaleString("vi-VN")} đơn)` : "—"}
      </div>
    </div>
  );
}
