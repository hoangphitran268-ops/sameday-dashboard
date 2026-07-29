import { getDashboardData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict } from "@/lib/i18n";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import PerfTable from "@/components/PerfTable";
import BcTabs from "@/components/BcTabs";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function HieuSuatPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const { data, range } = getDashboardData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const khuSorted = data.khu_perf;

  return (
    <div className="space-y-6 w-full">
      {khuSorted.length > 0 ? (
        <ChartCard title={t.pages.hieuSuat.khuChartTitle} note={t.pages.hieuSuat.khuChartNote}>
          <HBarChart
            data={khuSorted as unknown as Record<string, unknown>[]}
            dataKey="ty_le_ky_nhan_pct"
            categoryKey="khu"
            name={t.chartNames.signRate}
            unit="%"
            width={70}
            height={Math.max(160, khuSorted.length * 26)}
          />
        </ChartCard>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {t.pages.hieuSuat.khuEmptyMsg}
        </p>
      )}

      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          {t.pages.hieuSuat.bcSectionTitle}
        </h3>
        {data.bc_worst15.length > 0 ? (
          <BcTabs worst={data.bc_worst15} best={data.bc_best15} lang={lang} />
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t.pages.hieuSuat.bcEmptyMsg}
          </p>
        )}
      </div>

      {khuSorted.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {t.pages.hieuSuat.khuTableTitle}
          </h3>
          <PerfTable rows={khuSorted} labelKey="khu" lang={lang} />
        </div>
      )}

      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {t.pages.hieuSuat.footerNote}
      </p>
    </div>
  );
}
