import { getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function NguyenNhanPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { data, range } = getDashboardData(await searchParams);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <ChartCard title="Funnel trạng thái hiện tại (số đơn)" note={rangeDisplayLabel(range)}>
        <HBarChart
          data={data.status_overall as unknown as Record<string, unknown>[]}
          dataKey="so_luong"
          categoryKey="trang_thai"
          name="Số lượng"
          width={170}
          color="var(--series-primary)"
        />
      </ChartCard>

      {data.reason_overall.length > 0 ? (
        <ChartCard title="Nguyên nhân đơn có vấn đề (số đơn)" note={rangeDisplayLabel(range)}>
          <HBarChart
            data={data.reason_overall as unknown as Record<string, unknown>[]}
            dataKey="so_luong"
            categoryKey="nguyen_nhan"
            name="Số lượng"
            width={260}
            color="var(--series-tertiary)"
          />
        </ChartCard>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Không có đơn nào phát sinh vấn đề trong khoảng thời gian này.
        </p>
      )}
    </div>
  );
}
