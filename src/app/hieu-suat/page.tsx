import { getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import PerfTable from "@/components/PerfTable";
import BcTabs from "@/components/BcTabs";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function HieuSuatPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { data, range } = getDashboardData(await searchParams);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  const khuSorted = data.khu_perf;

  return (
    <div className="space-y-6 max-w-6xl">
      {khuSorted.length > 0 ? (
        <ChartCard
          title="Hiệu suất theo Khu (tỷ lệ ký nhận %, khu ≥ 1.000 đơn)"
          note="Sắp xếp tăng dần — khu ở đầu danh sách cần chú ý nhất"
        >
          <HBarChart
            data={khuSorted as unknown as Record<string, unknown>[]}
            dataKey="ty_le_ky_nhan_pct"
            categoryKey="khu"
            name="Tỷ lệ ký nhận"
            unit="%"
            width={70}
            height={Math.max(160, khuSorted.length * 26)}
          />
        </ChartCard>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Không có khu nào đạt ngưỡng ≥ 1.000 đơn trong khoảng thời gian này.
        </p>
      )}

      <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Hiệu suất theo Bưu cục (tỷ lệ ký nhận %, bưu cục ≥ 300 đơn)
        </h3>
        {data.bc_worst15.length > 0 ? (
          <BcTabs worst={data.bc_worst15} best={data.bc_best15} />
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Không có bưu cục nào đạt ngưỡng ≥ 300 đơn trong khoảng thời gian này.
          </p>
        )}
      </div>

      {khuSorted.length > 0 && (
        <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Bảng chi tiết theo Khu
          </h3>
          <PerfTable rows={khuSorted} labelKey="khu" />
        </div>
      )}

      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        Đã loại các mã điểm trung chuyển (HUB/TTTC/GW...) không phát sinh ký nhận khỏi 2 bảng xếp hạng trên.
      </p>
    </div>
  );
}
