import { getReceivingLevelPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict } from "@/lib/i18n";
import ExportableChartCard from "@/components/ExportableChartCard";
import ReceivingLevelComboChart from "@/components/charts/ReceivingLevelComboChart";
import ReceivingLevelFilter from "@/components/ReceivingLevelFilter";
import ReceivingLevelTabs from "@/components/ReceivingLevelTabs";
import StatTile from "@/components/StatTile";
import EmptyState from "@/components/EmptyState";
import { PackageCheck, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReceivingLevelPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const tLevel = t.pages.receivingLevel;
  const { data, range } = getReceivingLevelPageData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const note = rangeDisplayLabel(range, lang);
  const entityLabel = data.chart.level === "hcm" ? tLevel.levelHcm : (data.chart.entity ?? "");
  const chartTitleWithEntity = data.chart.entity || data.chart.level === "hcm" ? `${tLevel.chartTitle} · ${entityLabel}` : tLevel.chartTitle;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {tLevel.pageTitle}
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {tLevel.subtitle}
          </p>
        </div>
        <ReceivingLevelFilter khuOptions={data.khu_options} bcOptions={data.bc_options} />
      </div>

      {data.chart.summary && (
        <div className="grid grid-cols-2 gap-3 max-w-xl">
          <StatTile
            label={tLevel.statAvgLabel}
            value={data.chart.summary.tb_thanh_cong_ngay.toLocaleString("vi-VN")}
            icon={PackageCheck}
          />
          <StatTile label={tLevel.statRateLabel} value={`${data.chart.summary.ty_le_thanh_cong_pct}%`} icon={TrendingUp} />
        </div>
      )}

      {data.chart.daily.length > 0 ? (
        <ExportableChartCard title={chartTitleWithEntity} note={note} filename={`nhan-kien-${data.chart.level}-${data.chart.entity ?? "hcm"}`} lang={lang}>
          <ReceivingLevelComboChart data={data.chart.daily} lang={lang} />
        </ExportableChartCard>
      ) : (
        <div
          className="rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {tLevel.chartEmptyMsg}
          </p>
        </div>
      )}

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          {tLevel.detailTitle}
        </h3>
        <ReceivingLevelTabs hcmRow={data.hcm} khuRows={data.khu_table} bcRows={data.bc_table} lang={lang} />
      </div>
    </div>
  );
}
