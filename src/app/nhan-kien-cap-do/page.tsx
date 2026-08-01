import { getReceivingLevelPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict } from "@/lib/i18n";
import ChartCard from "@/components/ChartCard";
import ExportablePage from "@/components/ExportablePage";
import ReceivingLevelComboChart from "@/components/charts/ReceivingLevelComboChart";
import ReceivingLevelFilter from "@/components/ReceivingLevelFilter";
import ReceivingLevelTable from "@/components/ReceivingLevelTable";
import StatTile from "@/components/StatTile";
import EmptyState from "@/components/EmptyState";
import { PackageCheck, CheckCircle2, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReceivingLevelPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const tLevel = t.pages.receivingLevel;
  const tTable = t.receivingLevelTable;
  const { data, range } = getReceivingLevelPageData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const note = rangeDisplayLabel(range, lang);
  const entityLabel = data.chart.level === "hcm" ? tLevel.levelHcm : (data.chart.entity ?? "");
  const chartTitleWithEntity = data.chart.entity || data.chart.level === "hcm" ? `${tLevel.chartTitle} · ${entityLabel}` : tLevel.chartTitle;

  return (
    <ExportablePage filename={`nhan-kien-cap-do-${data.chart.level}-${data.chart.entity ?? "hcm"}`} lang={lang}>
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
        <div className="grid grid-cols-3 gap-3 max-w-2xl">
          <StatTile
            label={tLevel.statTotalLabel}
            value={data.chart.summary.thanh_cong.toLocaleString("vi-VN")}
            icon={CheckCircle2}
          />
          <StatTile
            label={tLevel.statAvgLabel}
            value={data.chart.summary.tb_thanh_cong_ngay.toLocaleString("vi-VN")}
            icon={PackageCheck}
          />
          <StatTile label={tLevel.statRateLabel} value={`${data.chart.summary.ty_le_thanh_cong_pct}%`} icon={TrendingUp} />
        </div>
      )}

      {data.chart.daily.length > 0 ? (
        <ChartCard title={chartTitleWithEntity} note={note}>
          <ReceivingLevelComboChart data={data.chart.daily} lang={lang} />
        </ChartCard>
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

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          {tLevel.detailTitle}
        </h3>
        <div className="space-y-4">
          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              {tLevel.levelHcm}
            </h4>
            {data.hcm ? (
              <ReceivingLevelTable rows={[data.hcm]} showKhu={false} lang={lang} />
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {tTable.empty}
              </p>
            )}
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              {tLevel.levelKhu}
            </h4>
            <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
              {tLevel.khuBoxSubtitle}
            </p>
            {data.khu_table.length > 0 ? (
              <ReceivingLevelTable rows={data.khu_table} showKhu={false} lang={lang} />
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {tLevel.khuEmptyMsg}
              </p>
            )}
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              {tLevel.levelBc}
            </h4>
            <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
              {tLevel.bcBoxSubtitle}
            </p>
            {data.bc_table.length > 0 ? (
              <ReceivingLevelTable rows={data.bc_table} showKhu lang={lang} />
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {tLevel.bcEmptyMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </ExportablePage>
  );
}
