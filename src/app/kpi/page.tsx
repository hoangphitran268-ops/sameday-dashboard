import { readDashboardData } from "@/lib/data";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import KpiTrendLine from "@/components/charts/KpiTrendLine";
import DurationBarChart from "@/components/charts/DurationBarChart";

export const dynamic = "force-dynamic";

export default function KpiPage() {
  const data = readDashboardData();

  return (
    <div className="space-y-6 max-w-6xl">
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

      <ChartCard title="Thời gian xử lý trung bình theo ngày (giờ)" note="Đỏ đậm = vượt quá 130% mức trung bình 21 ngày">
        <DurationBarChart data={data.kpi_daily} />
      </ChartCard>

      <ChartCard title="Bảng chi tiết theo ngày">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Ngày", "Tổng đơn", "Tỷ lệ ký nhận %", "Tỷ lệ cùng ngày %", "TG xử lý TB (giờ)", "Tỷ lệ vấn đề %"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-2 px-3 text-[11px] font-semibold uppercase ${i === 0 ? "text-left" : "text-right"}`}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.kpi_daily.map((d) => (
                <tr key={d.report_date} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
                  <td className="py-2 px-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {d.report_date}
                  </td>
                  <td className="py-2 px-3 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {d.tong_don.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2 px-3 text-right">{d.ty_le_ky_nhan_pct}%</td>
                  <td className="py-2 px-3 text-right font-semibold">{d.ty_le_cung_ngay_pct}%</td>
                  <td className="py-2 px-3 text-right">{d.tg_xu_ly_trung_binh_h}</td>
                  <td className="py-2 px-3 text-right">{d.ty_le_van_de_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
