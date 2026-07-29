import { getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict } from "@/lib/i18n";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import KpiTrendLine from "@/components/charts/KpiTrendLine";
import DurationBarChart from "@/components/charts/DurationBarChart";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function KpiPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const { data, range } = getDashboardData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  return (
    <div className="space-y-6 w-full">
      <ChartCard
        title={t.pages.overview.kpiChartTitle}
        note={rangeDisplayLabel(range, lang)}
        legend={
          <>
            <LegendItem color="var(--series-primary)" label={t.chartNames.signRatePct} />
            <LegendItem color="var(--series-tertiary)" label={t.chartNames.issueRatePct} />
          </>
        }
      >
        <KpiTrendLine data={data.kpi_daily} lang={lang} />
      </ChartCard>

      <ChartCard title={t.pages.kpi.durationChartTitle} note={t.pages.kpi.durationChartNote}>
        <DurationBarChart data={data.kpi_daily} lang={lang} />
      </ChartCard>

      <ChartCard title={t.pages.kpi.tableTitle}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {t.pages.kpi.tableHeaders.map((h, i) => (
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
                  <td className="py-2 px-3 text-right font-semibold">{d.ty_le_ky_nhan_pct}%</td>
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
