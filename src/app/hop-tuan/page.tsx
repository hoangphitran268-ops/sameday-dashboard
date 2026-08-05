import { getDashboardData, getReceivingPageData, getTransitPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict, localizeWeekday, localizeReceivingReason } from "@/lib/i18n";
import StatTile from "@/components/StatTile";
import BcTabs from "@/components/BcTabs";
import ReceivingBcTabs from "@/components/ReceivingBcTabs";
import EmptyState from "@/components/EmptyState";
import {
  Package,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  PackageCheck,
  AlertCircle,
  XCircle,
  Truck,
  Lightbulb,
  Wrench,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WeeklyMeetingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const wm = t.pages.weeklyMeeting;
  const { data: dashboardData, range } = getDashboardData(params);
  const { data: receivingData } = getReceivingPageData(params);
  const { data: transitData } = getTransitPageData(params);

  if (!dashboardData.has_data && !receivingData.has_data && !transitData.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const note = rangeDisplayLabel(range, lang);

  function localizeTopReason<T extends { nguyen_nhan_chinh: string | null }>(r: T): T {
    return { ...r, nguyen_nhan_chinh: r.nguyen_nhan_chinh ? localizeReceivingReason(r.nguyen_nhan_chinh, lang) : null };
  }
  const rcvBcWorstLocalized = receivingData.bc_worst15.map(localizeTopReason);
  const rcvBcBestLocalized = receivingData.bc_best15.map(localizeTopReason);
  const trWorstHub = transitData.hub_perf[0];

  // ---- Phát hiện chính (nhận kiện + phát hàng) ----
  const insights: string[] = [];

  const rcvWorstBc = receivingData.bc_worst15[0];
  if (rcvWorstBc && rcvWorstBc.ty_le_thanh_cong_pct < 85) {
    insights.push(wm.findingReceivingWorstBc(rcvWorstBc.bc ?? "", rcvWorstBc.ty_le_thanh_cong_pct, rcvWorstBc.tong_don.toLocaleString("vi-VN")));
  }

  const totalReasonCount = receivingData.reason_overall.reduce((s, r) => s + r.so_luong, 0);
  const topReason = receivingData.reason_overall[0];
  let topReasonSharePct = 0;
  if (topReason && totalReasonCount > 0) {
    topReasonSharePct = Math.round((topReason.so_luong / totalReasonCount) * 1000) / 10;
    insights.push(wm.findingReceivingTopReason(localizeReceivingReason(topReason.nguyen_nhan, lang), topReasonSharePct));
  }

  if (trWorstHub && trWorstHub.ty_le_dung_gio_pct < 85) {
    insights.push(wm.findingTransitWorstHub(trWorstHub.hub ?? "", trWorstHub.ty_le_dung_gio_pct, trWorstHub.tong_don.toLocaleString("vi-VN")));
  }

  const dlvWorstBc = dashboardData.bc_worst15[0];
  if (dlvWorstBc && dlvWorstBc.ty_le_ky_nhan_pct < 85) {
    insights.push(wm.findingDeliveryWorstBc(dlvWorstBc.buu_cuc ?? "", dlvWorstBc.ty_le_ky_nhan_pct, dlvWorstBc.tong_don.toLocaleString("vi-VN")));
  }

  let worstWeekdayLabel: string | null = null;
  if (dashboardData.weekday.length > 1) {
    const worstDay = [...dashboardData.weekday].sort((a, b) => a.ty_le_ky_nhan_pct - b.ty_le_ky_nhan_pct)[0];
    const others = dashboardData.weekday.filter((w) => w.weekday !== worstDay.weekday);
    const avgOthers = others.reduce((s, w) => s + w.ty_le_ky_nhan_pct, 0) / others.length;
    const gap = Math.round((avgOthers - worstDay.ty_le_ky_nhan_pct) * 10) / 10;
    if (gap >= 1) {
      worstWeekdayLabel = localizeWeekday(worstDay.weekday, lang);
      insights.push(wm.findingDeliveryWorstWeekday(worstWeekdayLabel, worstDay.ty_le_ky_nhan_pct, gap));
    }
  }

  let worstIssueDayPct = 0;
  if (dashboardData.kpi_daily.length > 1) {
    const worstIssueDay = [...dashboardData.kpi_daily].sort((a, b) => b.ty_le_van_de_pct - a.ty_le_van_de_pct)[0];
    worstIssueDayPct = worstIssueDay.ty_le_van_de_pct;
    insights.push(wm.findingDeliveryWorstIssueDay(worstIssueDay.report_date, worstIssueDayPct));
  }

  // ---- Phương án cải thiện ----
  const recommendations: string[] = [];
  if (rcvWorstBc && rcvWorstBc.ty_le_thanh_cong_pct < 85) {
    recommendations.push(wm.recoReceivingBc(rcvWorstBc.bc ?? "", rcvWorstBc.ty_le_thanh_cong_pct));
  }
  if (topReason && topReasonSharePct >= 30) {
    recommendations.push(wm.recoReceivingReason(localizeReceivingReason(topReason.nguyen_nhan, lang)));
  }
  const rcvWorstSeller = receivingData.seller_worst15[0];
  if (rcvWorstSeller && rcvWorstSeller.ty_le_thanh_cong_pct < 50) {
    recommendations.push(wm.recoReceivingSeller(rcvWorstSeller.seller, rcvWorstSeller.ty_le_thanh_cong_pct));
  }
  if (trWorstHub && trWorstHub.ty_le_dung_gio_pct < 85) {
    recommendations.push(wm.recoTransitHub(trWorstHub.hub ?? "", trWorstHub.ty_le_dung_gio_pct));
  }
  if (dlvWorstBc && dlvWorstBc.ty_le_ky_nhan_pct < 85) {
    recommendations.push(wm.recoDeliveryBc(dlvWorstBc.buu_cuc ?? "", dlvWorstBc.ty_le_ky_nhan_pct));
  }
  if (worstWeekdayLabel) {
    recommendations.push(wm.recoDeliveryWeekday(worstWeekdayLabel));
  }
  if (worstIssueDayPct >= 12) {
    recommendations.push(wm.recoIssueDay(worstIssueDayPct));
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {wm.pageTitle}
        </h2>
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {wm.subtitle}
        </p>
      </div>

      {receivingData.has_data && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {wm.receivingSectionTitle} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {note}</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile label={t.pages.receiving.statTongDon} value={receivingData.meta.tong_don.toLocaleString("vi-VN")} icon={PackageCheck} />
            <StatTile
              label={t.pages.receiving.statThanhCong}
              value={t.pages.receiving.statCountPct(receivingData.meta.thanh_cong.toLocaleString("vi-VN"), receivingData.meta.ty_le_thanh_cong_pct)}
              icon={CheckCircle2}
            />
            <StatTile
              label={t.pages.receiving.statKhongThanhCong}
              value={t.pages.receiving.statCountPct(
                receivingData.meta.khong_thanh_cong.toLocaleString("vi-VN"),
                receivingData.meta.ty_le_khong_thanh_cong_pct
              )}
              icon={AlertCircle}
              critical
            />
            <StatTile
              label={t.pages.receiving.statHuy}
              value={t.pages.receiving.statCountPct(receivingData.meta.huy.toLocaleString("vi-VN"), receivingData.meta.ty_le_huy_pct)}
              icon={XCircle}
              critical
            />
          </div>
        </div>
      )}

      {transitData.has_data && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {wm.transitSectionTitle} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {note}</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatTile label={t.pages.transit.statTongDon} value={transitData.meta.tong_don.toLocaleString("vi-VN")} icon={Truck} />
            <StatTile
              label={t.pages.transit.statDungGio}
              value={t.pages.transit.statCountPct(transitData.meta.dung_gio.toLocaleString("vi-VN"), transitData.meta.ty_le_dung_gio_pct)}
              icon={CheckCircle2}
            />
            <StatTile
              label={t.pages.transit.statTre}
              value={t.pages.transit.statCountPct(transitData.meta.tre.toLocaleString("vi-VN"), transitData.meta.ty_le_tre_pct)}
              icon={AlertCircle}
              critical
            />
          </div>
        </div>
      )}

      {dashboardData.has_data && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {wm.deliverySectionTitle} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {note}</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile
              label={t.pages.overview.totalOrders(dashboardData.meta.so_ngay)}
              value={dashboardData.meta.tong_don_21_ngay.toLocaleString("vi-VN")}
              icon={Package}
            />
            <StatTile label={t.pages.overview.signRateLabel} value={`${dashboardData.meta.ty_le_ky_nhan_pct}%`} icon={CheckCircle2} />
            <StatTile
              label={t.pages.overview.avgDurationLabel}
              value={t.pages.overview.avgDurationValue(dashboardData.meta.tg_xu_ly_tb_h)}
              icon={Clock3}
            />
            <StatTile label={t.pages.overview.issueRateLabel} value={`${dashboardData.meta.ty_le_van_de_pct}%`} icon={AlertTriangle} critical />
          </div>
        </div>
      )}

      <div
        className="relative rounded-2xl border p-5 pl-6 overflow-hidden"
        style={{ background: "var(--brand-red-tint)", borderColor: "var(--brand-red-light)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: "var(--brand-red)" }} />
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--brand-red-dark)" }}>
          <Lightbulb size={16} strokeWidth={2.2} />
          {wm.insightsTitle}
        </h3>
        {insights.length > 0 ? (
          <ul className="space-y-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {insights.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {wm.noInsight}
          </p>
        )}
      </div>

      <div
        className="relative rounded-2xl border p-5 pl-6 overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: "var(--series-secondary)" }} />
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Wrench size={16} strokeWidth={2.2} />
          {wm.recommendationsTitle}
        </h3>
        {recommendations.length > 0 ? (
          <ul className="space-y-1.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {wm.noRecommendation}
          </p>
        )}
      </div>

      {rcvBcWorstLocalized.length > 0 && (
        <div
          className="rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {wm.bcReceivingSectionTitle}
          </h3>
          <ReceivingBcTabs worst={rcvBcWorstLocalized} best={rcvBcBestLocalized} lang={lang} />
        </div>
      )}

      {dashboardData.bc_worst15.length > 0 && (
        <div
          className="rounded-2xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            {wm.bcDeliverySectionTitle}
          </h3>
          <BcTabs worst={dashboardData.bc_worst15} best={dashboardData.bc_best15} lang={lang} />
        </div>
      )}
    </div>
  );
}
