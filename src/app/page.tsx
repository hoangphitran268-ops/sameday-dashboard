import { readDashboardData } from "@/lib/data";
import StatTile from "@/components/StatTile";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import KpiTrendLine from "@/components/charts/KpiTrendLine";
import WeekdayBarChart from "@/components/charts/WeekdayBarChart";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const data = readDashboardData();
  const { meta } = data;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatTile label="Tổng số đơn (21 ngày)" value={meta.tong_don_21_ngay.toLocaleString("vi-VN")} />
        <StatTile label="Tỷ lệ đã ký nhận" value={`${meta.ty_le_ky_nhan_pct}%`} />
        <StatTile label="Tỷ lệ ký nhận CÙNG NGÀY" value={`${meta.ty_le_cung_ngay_pct}%`} />
        <StatTile label="TG xử lý trung bình" value={`${meta.tg_xu_ly_tb_h} giờ`} />
        <StatTile label="Tỷ lệ đơn có vấn đề" value={`${meta.ty_le_van_de_pct}%`} critical />
      </div>

      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--brand-red-tint)", borderColor: "var(--brand-red-light)" }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--brand-red-dark)" }}>
          Phát hiện chính
        </h3>
        <ul className="space-y-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          <li>
            <b style={{ color: "var(--text-primary)" }}>Chủ nhật là điểm nghẽn rõ rệt nhất tuần:</b> tỷ lệ ký nhận
            cùng ngày trung bình chỉ 43,2%, so với 69–84% các ngày còn lại; thời gian xử lý trung bình tăng lên
            ~16,4 giờ.
          </li>
          <li>
            <b style={{ color: "var(--text-primary)" }}>Thứ 2 hồi phục mạnh nhất</b> (83,8% cùng ngày) — đơn tồn
            Chủ nhật được dồn xử lý đầu tuần.
          </li>
          <li>
            <b style={{ color: "var(--text-primary)" }}>~80% đơn có vấn đề đến từ nguyên nhân phía khách hàng</b>{" "}
            (khách hẹn lại, không nghe máy) — không phải lỗi vận hành nội bộ.
          </li>
        </ul>
      </div>

      <ChartCard
        title="Tỷ lệ ký nhận / cùng ngày / có vấn đề theo ngày (%)"
        legend={
          <>
            <LegendItem color="var(--series-primary)" label="Tỷ lệ cùng ngày %" />
            <LegendItem color="var(--series-secondary)" label="Tỷ lệ ký nhận %" />
            <LegendItem color="var(--series-tertiary)" label="Tỷ lệ có vấn đề %" />
          </>
        }
      >
        <KpiTrendLine data={data.kpi_daily} />
      </ChartCard>

      <ChartCard title="Tỷ lệ cùng ngày theo Thứ trong tuần (%)" note="Đỏ đậm = Chủ nhật, thấp nhất tuần">
        <WeekdayBarChart data={data.weekday} />
      </ChartCard>
    </div>
  );
}
