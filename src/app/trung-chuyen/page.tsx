import { getTransitPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict, localizeTransitReason } from "@/lib/i18n";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import TransitTrendLine from "@/components/charts/TransitTrendLine";
import TransitPerfTable from "@/components/TransitPerfTable";
import StatTile from "@/components/StatTile";
import EmptyState from "@/components/EmptyState";
import { Truck, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransitPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const { data, range } = getTransitPageData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const note = rangeDisplayLabel(range, lang);
  const reasonOverallLocalized = data.reason_overall.map((r) => ({ ...r, reason: localizeTransitReason(r.reason, lang) }));
  function localizeTopReason<T extends { nguyen_nhan_chinh: string | null }>(r: T): T {
    return { ...r, nguyen_nhan_chinh: r.nguyen_nhan_chinh ? localizeTransitReason(r.nguyen_nhan_chinh, lang) : null };
  }
  const hubPerfLocalized = data.hub_perf.map(localizeTopReason);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {t.pages.transit.pageTitle}
        </h2>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {t.pages.transit.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
        <StatTile label={t.pages.transit.statTongDon} value={data.meta.tong_don.toLocaleString("vi-VN")} icon={Truck} />
        <StatTile
          label={t.pages.transit.statDungGio}
          value={t.pages.transit.statCountPct(data.meta.dung_gio.toLocaleString("vi-VN"), data.meta.ty_le_dung_gio_pct)}
          icon={CheckCircle2}
        />
        <StatTile
          label={t.pages.transit.statTre}
          value={t.pages.transit.statCountPct(data.meta.tre.toLocaleString("vi-VN"), data.meta.ty_le_tre_pct)}
          icon={AlertCircle}
          critical
        />
      </div>

      <p className="text-[12px] italic" style={{ color: "var(--text-muted)" }}>
        {t.pages.transit.rootCauseNote}
      </p>

      {data.daily.length > 1 && (
        <ChartCard title={t.pages.transit.trendChartTitle} note={note}>
          <TransitTrendLine data={data.daily} lang={lang} />
        </ChartCard>
      )}

      {hubPerfLocalized.length > 0 && (
        <ChartCard title={t.pages.transit.hubChartTitle} note={t.pages.transit.hubChartNote}>
          <HBarChart
            data={hubPerfLocalized as unknown as Record<string, unknown>[]}
            dataKey="ty_le_dung_gio_pct"
            categoryKey="hub"
            name={t.chartNames.transitOnTimePct}
            unit="%"
            width={110}
            height={Math.max(160, hubPerfLocalized.length * 30)}
          />
        </ChartCard>
      )}

      {hubPerfLocalized.length > 0 && (
        <div
          className="rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {t.pages.transit.hubTableTitle}
          </h3>
          <TransitPerfTable rows={hubPerfLocalized} lang={lang} />
        </div>
      )}

      {reasonOverallLocalized.length > 0 && (
        <ChartCard title={t.pages.transit.reasonChartTitle} note={note}>
          <HBarChart
            data={reasonOverallLocalized as unknown as Record<string, unknown>[]}
            dataKey="so_luong"
            categoryKey="reason"
            name={t.chartNames.quantity}
            width={200}
            color="var(--series-primary)"
          />
        </ChartCard>
      )}
    </div>
  );
}
