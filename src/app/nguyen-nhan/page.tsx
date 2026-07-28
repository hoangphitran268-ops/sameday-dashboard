import { readDashboardData } from "@/lib/data";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";

export const dynamic = "force-dynamic";

export default function NguyenNhanPage() {
  const data = readDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
      <ChartCard title="Funnel trạng thái hiện tại (số đơn, 21 ngày)">
        <HBarChart
          data={data.status_overall as unknown as Record<string, unknown>[]}
          dataKey="so_luong"
          categoryKey="trang_thai"
          name="Số lượng"
          width={170}
          color="var(--series-primary)"
        />
      </ChartCard>

      <ChartCard title="Nguyên nhân đơn có vấn đề (số đơn, 21 ngày)">
        <HBarChart
          data={data.reason_overall as unknown as Record<string, unknown>[]}
          dataKey="so_luong"
          categoryKey="nguyen_nhan"
          name="Số lượng"
          width={260}
          color="var(--series-tertiary)"
        />
      </ChartCard>

      <div className="rounded-xl border p-5" style={{ background: "var(--brand-red-tint)", borderColor: "var(--brand-red-light)" }}>
        <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          <b style={{ color: "var(--text-primary)" }}>2 nguyên nhân từ phía khách hàng</b> — &ldquo;Khách hẹn lại&rdquo;
          (5.594 đơn) và &ldquo;Khách không nghe máy&rdquo; (4.817 đơn) — chiếm gần 80% tổng số đơn phát sinh vấn đề,
          không phải lỗi vận hành nội bộ của bưu cục.
        </p>
      </div>
    </div>
  );
}
