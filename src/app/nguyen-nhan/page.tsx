import { getReasonPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import ReasonBcBreakdown from "@/components/ReasonBcBreakdown";
import KhuFilter from "@/components/KhuFilter";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function NguyenNhanPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { data, range, khu } = getReasonPageData(await searchParams);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-end">
        <KhuFilter options={data.khu_options} />
      </div>

      {data.reason_overall.length > 0 ? (
        <ChartCard
          title="Nguyên nhân đơn có vấn đề (số đơn)"
          note={`${rangeDisplayLabel(range)}${khu ? ` · Khu ${khu}` : ""}`}
        >
          <HBarChart
            data={data.reason_overall as unknown as Record<string, unknown>[]}
            dataKey="so_luong"
            categoryKey="nguyen_nhan"
            name="Số lượng"
            width={260}
            color="var(--series-primary)"
          />
        </ChartCard>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Không có đơn nào phát sinh vấn đề trong khoảng thời gian này{khu ? ` ở khu ${khu}` : ""}.
        </p>
      )}

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Bưu cục thường xuyên ghi nhận nguyên nhân này
        </h3>
        <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
          Chọn 1 nguyên nhân để xem 15 bưu cục ghi nhận nhiều nhất — kèm tỷ lệ nguyên nhân đó chiếm bao nhiêu % trong
          tổng số đơn có vấn đề của chính bưu cục đó.
        </p>
        <ReasonBcBreakdown reasonOverall={data.reason_overall} reasonBc={data.reason_bc} />
      </div>
    </div>
  );
}
