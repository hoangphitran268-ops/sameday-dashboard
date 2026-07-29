import { getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import StatTile from "@/components/StatTile";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import KpiTrendLine from "@/components/charts/KpiTrendLine";
import WeekdayBarChart from "@/components/charts/WeekdayBarChart";
import EmptyState from "@/components/EmptyState";
import { Package, CheckCircle2, Clock3, AlertTriangle, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { data, range } = getDashboardData(await searchParams);
  const { meta } = data;

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  const findings: React.ReactNode[] = [];
  const b = (text: string | number) => (
    <b style={{ color: "var(--text-primary)" }}>{text}</b>
  );

  if (data.weekday.length > 1) {
    const worstDay = [...data.weekday].sort((a, b) => a.ty_le_ky_nhan_pct - b.ty_le_ky_nhan_pct)[0];
    const others = data.weekday.filter((w) => w.weekday !== worstDay.weekday);
    const avgOthers = others.reduce((s, w) => s + w.ty_le_ky_nhan_pct, 0) / others.length;
    const gap = Math.round((avgOthers - worstDay.ty_le_ky_nhan_pct) * 10) / 10;
    if (gap >= 1) {
      findings.push(
        <>
          {b(worstDay.weekday)} có tỷ lệ ký nhận thấp nhất trong khoảng này: {b(`${worstDay.ty_le_ky_nhan_pct}%`)}, thấp
          hơn {gap} điểm % so với trung bình các ngày còn lại.
        </>
      );
    }
  }

  if (data.bc_worst15.length > 0) {
    const worstBc = data.bc_worst15[0];
    findings.push(
      <>
        Bưu cục {b(worstBc.buu_cuc ?? "")} có tỷ lệ ký nhận thấp nhất (≥300 đơn): {b(`${worstBc.ty_le_ky_nhan_pct}%`)} trên{" "}
        {worstBc.tong_don.toLocaleString("vi-VN")} đơn.
      </>
    );
  }

  if (data.kpi_daily.length > 1) {
    const worstIssueDay = [...data.kpi_daily].sort((a, b) => b.ty_le_van_de_pct - a.ty_le_van_de_pct)[0];
    findings.push(
      <>
        Ngày {b(worstIssueDay.report_date)} có tỷ lệ đơn phát sinh vấn đề cao nhất: {b(`${worstIssueDay.ty_le_van_de_pct}%`)}.
      </>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label={`Tổng số đơn (${meta.so_ngay} ngày)`}
          value={meta.tong_don_21_ngay.toLocaleString("vi-VN")}
          icon={Package}
        />
        <StatTile
          label="Tỷ lệ ký nhận (đã xử lý xong trong ngày N)"
          value={`${meta.ty_le_ky_nhan_pct}%`}
          icon={CheckCircle2}
        />
        <StatTile label="TG xử lý trung bình" value={`${meta.tg_xu_ly_tb_h} giờ`} icon={Clock3} />
        <StatTile label="Tỷ lệ đơn có vấn đề" value={`${meta.ty_le_van_de_pct}%`} icon={AlertTriangle} critical />
      </div>

      {findings.length > 0 && (
        <div
          className="relative rounded-2xl border p-5 pl-6 overflow-hidden"
          style={{ background: "var(--brand-red-tint)", borderColor: "var(--brand-red-light)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: "var(--brand-red)" }} />
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--brand-red-dark)" }}>
            <Lightbulb size={16} strokeWidth={2.2} />
            Phát hiện chính · {rangeDisplayLabel(range)}
          </h3>
          <ul className="space-y-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <ChartCard
        title="Tỷ lệ ký nhận / có vấn đề theo ngày (%)"
        legend={
          <>
            <LegendItem color="var(--series-primary)" label="Tỷ lệ ký nhận %" />
            <LegendItem color="var(--series-tertiary)" label="Tỷ lệ có vấn đề %" />
          </>
        }
      >
        <KpiTrendLine data={data.kpi_daily} />
      </ChartCard>

      <ChartCard title="Tỷ lệ ký nhận theo Thứ trong tuần (%)" note="Đỏ đậm = ngày có tỷ lệ ký nhận thấp nhất">
        <WeekdayBarChart data={data.weekday} />
      </ChartCard>
    </div>
  );
}
