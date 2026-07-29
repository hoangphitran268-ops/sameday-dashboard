import { getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict, localizeWeekday } from "@/lib/i18n";
import StatTile from "@/components/StatTile";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import KpiTrendLine from "@/components/charts/KpiTrendLine";
import WeekdayBarChart from "@/components/charts/WeekdayBarChart";
import EmptyState from "@/components/EmptyState";
import { Package, CheckCircle2, Clock3, AlertTriangle, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang].pages.overview;
  const { data, range } = getDashboardData(params);
  const { meta } = data;

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
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
      const weekdayLabel = localizeWeekday(worstDay.weekday, lang);
      const pctStr = `${worstDay.ty_le_ky_nhan_pct}%`;
      const template = t.finding1(weekdayLabel, worstDay.ty_le_ky_nhan_pct, gap);
      const [head, mid, tail] = splitTemplate(template, weekdayLabel, pctStr);
      findings.push(
        <>
          {head}
          {b(weekdayLabel)}
          {mid}
          {b(pctStr)}
          {tail}
        </>
      );
    }
  }

  if (data.bc_worst15.length > 0) {
    const worstBc = data.bc_worst15[0];
    const bcName = worstBc.buu_cuc ?? "";
    const pctStr = `${worstBc.ty_le_ky_nhan_pct}%`;
    const totalStr = worstBc.tong_don.toLocaleString("vi-VN");
    const template = t.finding2(bcName, worstBc.ty_le_ky_nhan_pct, totalStr);
    const [head, mid, tail] = splitTemplate(template, bcName, pctStr);
    findings.push(
      <>
        {head}
        {b(bcName)}
        {mid}
        {b(pctStr)}
        {tail}
      </>
    );
  }

  if (data.kpi_daily.length > 1) {
    const worstIssueDay = [...data.kpi_daily].sort((a, b) => b.ty_le_van_de_pct - a.ty_le_van_de_pct)[0];
    const pctStr = `${worstIssueDay.ty_le_van_de_pct}%`;
    const template = t.finding3(worstIssueDay.report_date, worstIssueDay.ty_le_van_de_pct);
    const [head, mid, tail] = splitTemplate(template, worstIssueDay.report_date, pctStr);
    findings.push(
      <>
        {head}
        {b(worstIssueDay.report_date)}
        {mid}
        {b(pctStr)}
        {tail}
      </>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label={t.totalOrders(meta.so_ngay)} value={meta.tong_don_21_ngay.toLocaleString("vi-VN")} icon={Package} />
        <StatTile label={t.signRateLabel} value={`${meta.ty_le_ky_nhan_pct}%`} icon={CheckCircle2} />
        <StatTile label={t.avgDurationLabel} value={t.avgDurationValue(meta.tg_xu_ly_tb_h)} icon={Clock3} />
        <StatTile label={t.issueRateLabel} value={`${meta.ty_le_van_de_pct}%`} icon={AlertTriangle} critical />
      </div>

      {findings.length > 0 && (
        <div
          className="relative rounded-2xl border p-5 pl-6 overflow-hidden"
          style={{ background: "var(--brand-red-tint)", borderColor: "var(--brand-red-light)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: "var(--brand-red)" }} />
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--brand-red-dark)" }}>
            <Lightbulb size={16} strokeWidth={2.2} />
            {t.findingsTitle(rangeDisplayLabel(range, lang))}
          </h3>
          <ul className="space-y-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <ChartCard
        title={t.kpiChartTitle}
        legend={
          <>
            <LegendItem color="var(--series-primary)" label={dict[lang].chartNames.signRatePct} />
            <LegendItem color="var(--series-tertiary)" label={dict[lang].chartNames.issueRatePct} />
          </>
        }
      >
        <KpiTrendLine data={data.kpi_daily} lang={lang} />
      </ChartCard>

      <ChartCard title={t.weekdayChartTitle} note={t.weekdayChartNote}>
        <WeekdayBarChart data={data.weekday} lang={lang} />
      </ChartCard>
    </div>
  );
}

/** Tách chuỗi mẫu đã dịch thành 3 đoạn quanh 2 giá trị động, để có thể bọc <b> quanh đúng phần đó
 * mà không phải viết lại toàn bộ câu JSX riêng cho từng ngôn ngữ. */
function splitTemplate(template: string, first: string, second: string): [string, string, string] {
  const i1 = template.indexOf(first);
  if (i1 === -1) return [template, "", ""];
  const head = template.slice(0, i1);
  const rest = template.slice(i1 + first.length);
  const i2 = rest.indexOf(second);
  if (i2 === -1) return [head, rest, ""];
  const mid = rest.slice(0, i2);
  const tail = rest.slice(i2 + second.length);
  return [head, mid, tail];
}
