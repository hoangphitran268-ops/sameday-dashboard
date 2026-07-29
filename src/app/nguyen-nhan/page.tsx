import { getReasonPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict, localizeLabel } from "@/lib/i18n";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import ReasonBcBreakdown from "@/components/ReasonBcBreakdown";
import KhuFilter from "@/components/KhuFilter";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function NguyenNhanPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const { data, range, khu } = getReasonPageData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const reasonOverallLocalized = data.reason_overall.map((r) => ({ ...r, nguyen_nhan: localizeLabel(r.nguyen_nhan, lang) }));
  const khuSuffix = khu ? ` ${t.common.khuLabel} ${khu}` : "";

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-end">
        <KhuFilter options={data.khu_options} />
      </div>

      {data.reason_overall.length > 0 ? (
        <ChartCard
          title={t.pages.nguyenNhan.chartTitle}
          note={`${rangeDisplayLabel(range, lang)}${khu ? ` · ${t.common.khuLabel} ${khu}` : ""}`}
        >
          <HBarChart
            data={reasonOverallLocalized as unknown as Record<string, unknown>[]}
            dataKey="so_luong"
            categoryKey="nguyen_nhan"
            name={t.chartNames.quantity}
            width={260}
            color="var(--series-primary)"
          />
        </ChartCard>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {t.pages.nguyenNhan.emptyMsg(khuSuffix)}
        </p>
      )}

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          {t.pages.nguyenNhan.bcSectionTitle}
        </h3>
        <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
          {t.pages.nguyenNhan.bcSectionDesc}
        </p>
        <ReasonBcBreakdown reasonOverall={data.reason_overall} reasonBc={data.reason_bc} lang={lang} />
      </div>
    </div>
  );
}
