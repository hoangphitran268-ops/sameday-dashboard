import { getReceivingPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict, localizeReceivingReason } from "@/lib/i18n";
import { UNKNOWN_KHU_KEY } from "@/lib/aggregate";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import ReceivingTrendLine from "@/components/charts/ReceivingTrendLine";
import ReceivingBcTabs from "@/components/ReceivingBcTabs";
import ReceivingSellerTabs from "@/components/ReceivingSellerTabs";
import ReasonBcBreakdown from "@/components/ReasonBcBreakdown";
import SellerReasonBreakdown from "@/components/SellerReasonBreakdown";
import StatTile from "@/components/StatTile";
import EmptyState from "@/components/EmptyState";
import { PackageCheck, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReceivingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const { data, range } = getReceivingPageData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const note = rangeDisplayLabel(range, lang);
  const khuPerfLocalized = data.khu_perf.map((r) => ({
    ...r,
    khu: r.khu === UNKNOWN_KHU_KEY ? t.common.unknownKhu : r.khu,
  }));
  const reasonOverallLocalized = data.reason_overall.map((r) => ({ ...r, nguyen_nhan: localizeReceivingReason(r.nguyen_nhan, lang) }));
  const reasonBcLocalized = data.reason_bc.map((r) => ({ ...r, nguyen_nhan: localizeReceivingReason(r.nguyen_nhan, lang) }));
  const sellerReasonLocalized = data.seller_reason.map((r) => ({ ...r, nguyen_nhan: localizeReceivingReason(r.nguyen_nhan, lang) }));
  function localizeTopReason<T extends { nguyen_nhan_chinh: string | null }>(r: T): T {
    return { ...r, nguyen_nhan_chinh: r.nguyen_nhan_chinh ? localizeReceivingReason(r.nguyen_nhan_chinh, lang) : null };
  }
  const bcWorst15Localized = data.bc_worst15.map(localizeTopReason);
  const bcBest15Localized = data.bc_best15.map(localizeTopReason);
  const sellerWorst15Localized = data.seller_worst15.map(localizeTopReason);
  const sellerBest15Localized = data.seller_best15.map(localizeTopReason);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {t.pages.receiving.pageTitle}
        </h2>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {t.pages.receiving.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label={t.pages.receiving.statTongDon} value={data.meta.tong_don.toLocaleString("vi-VN")} icon={PackageCheck} />
        <StatTile
          label={t.pages.receiving.statThanhCong}
          value={t.pages.receiving.statCountPct(data.meta.thanh_cong.toLocaleString("vi-VN"), data.meta.ty_le_thanh_cong_pct)}
          icon={CheckCircle2}
        />
        <StatTile
          label={t.pages.receiving.statKhongThanhCong}
          value={t.pages.receiving.statCountPct(data.meta.khong_thanh_cong.toLocaleString("vi-VN"), data.meta.ty_le_khong_thanh_cong_pct)}
          icon={AlertCircle}
          critical
        />
        <StatTile
          label={t.pages.receiving.statHuy}
          value={t.pages.receiving.statCountPct(data.meta.huy.toLocaleString("vi-VN"), data.meta.ty_le_huy_pct)}
          icon={XCircle}
          critical
        />
      </div>

      {data.daily.length > 1 && (
        <ChartCard title={t.pages.receiving.trendChartTitle} note={note}>
          <ReceivingTrendLine data={data.daily} lang={lang} />
        </ChartCard>
      )}

      {khuPerfLocalized.length > 0 ? (
        <ChartCard title={t.pages.receiving.khuChartTitle} note={t.pages.receiving.khuChartNote}>
          <HBarChart
            data={khuPerfLocalized as unknown as Record<string, unknown>[]}
            dataKey="ty_le_thanh_cong_pct"
            categoryKey="khu"
            name={t.chartNames.receivingSuccessPct}
            unit="%"
            width={90}
            height={Math.max(160, khuPerfLocalized.length * 26)}
          />
        </ChartCard>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {t.pages.receiving.khuEmptyMsg}
        </p>
      )}

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          {t.pages.receiving.bcSectionTitle}
        </h3>
        {data.bc_worst15.length > 0 ? (
          <ReceivingBcTabs worst={bcWorst15Localized} best={bcBest15Localized} lang={lang} />
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t.pages.receiving.bcEmptyMsg}
          </p>
        )}
      </div>

      {reasonOverallLocalized.length > 0 && (
        <>
          <ChartCard title={t.pages.receiving.reasonChartTitle} note={note}>
            <HBarChart
              data={reasonOverallLocalized as unknown as Record<string, unknown>[]}
              dataKey="so_luong"
              categoryKey="nguyen_nhan"
              name={t.chartNames.quantity}
              width={260}
              color="var(--series-primary)"
            />
          </ChartCard>

          <div
            className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              {t.pages.receiving.reasonBcSectionTitle}
            </h3>
            <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
              {t.pages.receiving.reasonBcSectionDesc}
            </p>
            <ReasonBcBreakdown reasonOverall={reasonOverallLocalized} reasonBc={reasonBcLocalized} lang={lang} />
          </div>
        </>
      )}

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          {t.pages.receiving.sellerSectionTitle}
        </h3>
        {data.seller_worst15.length > 0 ? (
          <ReceivingSellerTabs worst={sellerWorst15Localized} best={sellerBest15Localized} lang={lang} />
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {t.pages.receiving.sellerEmptyMsg}
          </p>
        )}
      </div>

      {reasonOverallLocalized.length > 0 && data.seller_reason.length > 0 && (
        <div
          className="rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {t.pages.receiving.sellerReasonSectionTitle}
          </h3>
          <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
            {t.pages.receiving.sellerReasonSectionDesc}
          </p>
          <SellerReasonBreakdown reasonOverall={reasonOverallLocalized} sellerReason={sellerReasonLocalized} lang={lang} />
        </div>
      )}
    </div>
  );
}
