import { getPenaltyPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
import { getLang, dict, localizeLabel } from "@/lib/i18n";
import ChartCard from "@/components/ChartCard";
import HBarChart from "@/components/charts/HBarChart";
import PenaltyDailyChart from "@/components/charts/PenaltyDailyChart";
import PenaltyBcBreakdown from "@/components/PenaltyBcBreakdown";
import KhuFilter from "@/components/KhuFilter";
import StatTile from "@/components/StatTile";
import EmptyState from "@/components/EmptyState";
import { ClipboardList, CheckCircle2, Gavel, Banknote } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PhatPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const lang = getLang(params);
  const t = dict[lang];
  const { data, range, khu } = getPenaltyPageData(params);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range, lang)} lang={lang} />;
  }

  const rangeLabel = rangeDisplayLabel(range, lang);
  const note = khu ? `${rangeLabel} · ${t.common.khuLabel} ${khu}` : rangeLabel;
  const viPhamOverall = data.tinh_trang_overall.filter((tt) => tt.is_vi_pham);
  const viPhamOverallLocalized = viPhamOverall.map((r) => ({ ...r, tinh_trang: localizeLabel(r.tinh_trang, lang) }));

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {t.pages.phat.pageTitle}
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {t.pages.phat.subtitle}
          </p>
        </div>
        <KhuFilter options={data.khu_options} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label={t.pages.phat.statTongDon} value={data.meta.tong_don_ra_soat.toLocaleString("vi-VN")} icon={ClipboardList} />
        <StatTile label={t.pages.phat.statTyLeDungGio} value={`${data.meta.ty_le_dung_gio_pct}%`} icon={CheckCircle2} />
        <StatTile label={t.pages.phat.statSoDonViPham} value={data.meta.so_don_vi_pham.toLocaleString("vi-VN")} icon={Gavel} critical />
        <StatTile
          label={t.pages.phat.statTongTienPhat}
          value={`${data.meta.tong_tien_phat.toLocaleString("vi-VN")} ${t.common.currencySuffix}`}
          icon={Banknote}
          critical
        />
      </div>

      {viPhamOverall.length > 0 && (
        <ChartCard title={t.pages.phat.typeChartTitle} note={note}>
          <HBarChart
            data={viPhamOverallLocalized as unknown as Record<string, unknown>[]}
            dataKey="so_luong"
            categoryKey="tinh_trang"
            name={t.chartNames.quantity}
            width={220}
            color="var(--series-primary)"
            height={Math.max(160, viPhamOverall.length * 60)}
          />
        </ChartCard>
      )}

      {data.daily.length > 1 && (
        <ChartCard title={t.pages.phat.dailyChartTitle} note={note}>
          <PenaltyDailyChart data={data.daily} lang={lang} />
        </ChartCard>
      )}

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          {t.pages.phat.bcSectionTitle}
        </h3>
        <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
          {t.pages.phat.bcSectionDesc}
        </p>
        <PenaltyBcBreakdown typeOverall={data.tinh_trang_overall} penaltyBc={data.penalty_bc} lang={lang} />
      </div>
    </div>
  );
}
