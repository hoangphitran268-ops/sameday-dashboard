import { readDashboardData } from "@/lib/data";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import PerfTable from "@/components/PerfTable";
import BcTabs from "@/components/BcTabs";

export const dynamic = "force-dynamic";

export default function HieuSuatPage() {
  const data = readDashboardData();
  const khuSorted = [...data.khu_perf].sort((a, b) => a.ty_le_cung_ngay_pct - b.ty_le_cung_ngay_pct);

  return (
    <div className="space-y-6 max-w-6xl">
      <ChartCard
        title="Hiệu suất theo Khu (tỷ lệ cùng ngày %, khu ≥ 1.000 đơn)"
        note="Sắp xếp tăng dần — khu ở đầu danh sách cần chú ý nhất"
      >
        <HBarChart
          data={khuSorted as unknown as Record<string, unknown>[]}
          dataKey="ty_le_cung_ngay_pct"
          categoryKey="khu"
          name="Tỷ lệ cùng ngày"
          unit="%"
          width={70}
          height={520}
        />
      </ChartCard>

      <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Hiệu suất theo Bưu cục (tỷ lệ cùng ngày %, bưu cục ≥ 300 đơn)
        </h3>
        <BcTabs worst={data.bc_worst15} best={data.bc_best15} />
      </div>

      <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Bảng chi tiết theo Khu
        </h3>
        <PerfTable rows={khuSorted} labelKey="khu" />
      </div>

      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        Đã loại các mã điểm trung chuyển (HUB/TTTC/GW...) không phát sinh ký nhận khỏi 2 bảng xếp hạng trên.
      </p>
    </div>
  );
}
