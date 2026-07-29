import { getHourPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict, type Lang } from "@/lib/i18n";
import ChartCard, { LegendItem } from "@/components/ChartCard";
import HourFlowChart from "@/components/charts/HourFlowChart";
import HourFilters from "@/components/HourFilters";
import HourBcDetailTable from "@/components/HourBcDetailTable";
import HourBcPivotTable from "@/components/HourBcPivotTable";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function TheoGioPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const METRIC_TITLE = t.pages.theoGio.metricTitle;
  const { data, range, khu, bc } = getHourPageData(params);
  const metricParam = Array.isArray(params.metric) ? params.metric[0] : params.metric;
  const metric = metricParam === "pickup" || metricParam === "sign" || metricParam === "arrival" ? metricParam : null;

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const noteParts = [rangeDisplayLabel(range, lang)];
  if (khu) noteParts.push(`${t.common.khuLabel} ${khu}`);
  if (bc) noteParts.push(`${t.common.buuCucLabel} ${bc}`);
  const note = noteParts.join(" · ");

  const peakPickup = data.hours.length ? [...data.hours].sort((a, b) => b.pickup - a.pickup)[0] : null;
  const peakSign = data.hours.length ? [...data.hours].sort((a, b) => b.sign - a.sign)[0] : null;
  const peakArrival = data.hours.length ? [...data.hours].sort((a, b) => b.arrival - a.arrival)[0] : null;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="grid grid-cols-3 gap-3 max-w-2xl w-full">
          <PeakTile label={t.pages.theoGio.peakPickup} peak={peakPickup} field="pickup" lang={lang} />
          <PeakTile label={t.pages.theoGio.peakSign} peak={peakSign} field="sign" lang={lang} />
          <PeakTile label={t.pages.theoGio.peakArrival} peak={peakArrival} field="arrival" lang={lang} />
        </div>
        <HourFilters khuOptions={data.khu_options} bcOptions={data.bc_options} />
      </div>

      {data.hours.length > 0 ? (
        <>
          <ChartCard
            title={t.pages.theoGio.chartTitle}
            note={note}
            legend={
              <>
                <LegendItem color="var(--series-primary)" label={t.chartNames.pickupCount} />
                <LegendItem color="var(--series-secondary)" label={t.chartNames.signCount} />
                <LegendItem color="var(--series-tertiary)" label={t.chartNames.arrivalCount} />
              </>
            }
          >
            <HourFlowChart data={data.hours} lang={lang} />
          </ChartCard>

          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              {t.pages.theoGio.bcDetailTitle(metric ? ` · ${METRIC_TITLE[metric]}` : "")}
            </h3>
            <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
              {metric ? t.pages.theoGio.bcDetailDescWithMetric(METRIC_TITLE[metric]) : t.pages.theoGio.bcDetailDescNoMetric}
            </p>
            {metric ? (
              <HourBcPivotTable metric={metric} bcDetail={data.bc_detail} bcHour={data.bc_hour} hours={data.hours} lang={lang} />
            ) : (
              <HourBcDetailTable rows={data.bc_detail} lang={lang} />
            )}
          </div>
        </>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {t.pages.theoGio.emptyMsg}
        </p>
      )}
    </div>
  );
}

function PeakTile({
  label,
  peak,
  field,
  lang,
}: {
  label: string;
  peak: { gio: number; pickup: number; sign: number; arrival: number } | null;
  field: "pickup" | "sign" | "arrival";
  lang: Lang;
}) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      <div className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {peak ? dict[lang].pages.theoGio.peakValue(peak.gio, peak[field].toLocaleString("vi-VN")) : "—"}
      </div>
    </div>
  );
}
