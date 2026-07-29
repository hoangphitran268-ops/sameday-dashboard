import { getPenaltyPageData, type SearchParams } from "@/lib/data";
import { rangeDisplayLabel } from "@/lib/dateRanges";
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
  const { data, range, khu } = getPenaltyPageData(await searchParams);

  if (!data.has_data) {
    return <EmptyState label={rangeDisplayLabel(range)} />;
  }

  const note = khu ? `${rangeDisplayLabel(range)} · Khu ${khu}` : rangeDisplayLabel(range);
  const viPhamOverall = data.tinh_trang_overall.filter((t) => t.is_vi_pham);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Phạt vi phạm — Khâu Nhận
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Nguồn: file &ldquo;THỐNG KÊ PHẠT SAMEDAY&rdquo;, sheet &ldquo;data&rdquo; · lũy kế toàn kỳ, luôn lấy bản
            mới nhất
          </p>
        </div>
        <KhuFilter options={data.khu_options} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Tổng đơn được rà soát" value={data.meta.tong_don_ra_soat.toLocaleString("vi-VN")} icon={ClipboardList} />
        <StatTile label="Tỷ lệ gửi đúng giờ" value={`${data.meta.ty_le_dung_gio_pct}%`} icon={CheckCircle2} />
        <StatTile label="Số đơn vi phạm" value={data.meta.so_don_vi_pham.toLocaleString("vi-VN")} icon={Gavel} critical />
        <StatTile label="Tổng tiền phạt" value={`${data.meta.tong_tien_phat.toLocaleString("vi-VN")} đ`} icon={Banknote} critical />
      </div>

      {viPhamOverall.length > 0 && (
        <ChartCard title="Phân bố theo loại vi phạm (số đơn)" note={note}>
          <HBarChart
            data={viPhamOverall as unknown as Record<string, unknown>[]}
            dataKey="so_luong"
            categoryKey="tinh_trang"
            name="Số đơn"
            width={220}
            color="var(--status-critical)"
            height={Math.max(160, viPhamOverall.length * 60)}
          />
        </ChartCard>
      )}

      {data.daily.length > 1 && (
        <ChartCard title="Tiền phạt theo ngày" note={note}>
          <PenaltyDailyChart data={data.daily} />
        </ChartCard>
      )}

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Bưu cục chịu trách nhiệm nhiều nhất theo loại vi phạm
        </h3>
        <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
          Chọn 1 loại vi phạm để xem 15 bưu cục bị phạt nhiều nhất (theo &ldquo;Mã bc chịu trách nhiệm&rdquo;), sắp xếp
          theo tổng tiền phạt giảm dần.
        </p>
        <PenaltyBcBreakdown typeOverall={data.tinh_trang_overall} penaltyBc={data.penalty_bc} />
      </div>
    </div>
  );
}
