import { getHubCoveragePageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict } from "@/lib/i18n";
import HubCoverageMap from "@/components/HubCoverageMap";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function HubCoveragePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const { data, range } = getHubCoveragePageData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {t.pages.hubCoverage.pageTitle}
        </h2>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {t.pages.hubCoverage.subtitle}
        </p>
      </div>

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <HubCoverageMap
          hubs={data.hubs}
          khuCoverage={data.khu_coverage}
          sellers={data.sellers}
          bcPhat={data.bc_phat}
          loadingLabel={t.pages.hubCoverage.mapLoading}
          resetLabel={t.pages.hubCoverage.mapReset}
          unassignedLabel={t.pages.hubCoverage.mapUnassigned}
          legendHint={t.pages.hubCoverage.mapLegendHint}
          unitLabel={t.pages.hubCoverage.mapUnit}
          avgUnitLabel={t.pages.hubCoverage.mapAvgUnit}
          khuLabelPrefix={t.pages.hubCoverage.mapKhuPrefix}
          bcPhatLabelPrefix={t.pages.hubCoverage.mapBcPhatPrefix}
          modeNhanLabel={t.pages.hubCoverage.mapModeNhan}
          modePhatLabel={t.pages.hubCoverage.mapModePhat}
          filterKhuLabel={t.pages.hubCoverage.filterKhu}
          filterQuanLabel={t.pages.hubCoverage.filterQuan}
          filterPhuongLabel={t.pages.hubCoverage.filterPhuong}
          filterAllLabel={t.pages.hubCoverage.filterAll}
          filterUnknownLabel={t.pages.hubCoverage.filterUnknown}
          filterResetLabel={t.pages.hubCoverage.filterReset}
          filterQuanUnavailableLabel={t.pages.hubCoverage.filterQuanUnavailable}
        />
      </div>
    </div>
  );
}
