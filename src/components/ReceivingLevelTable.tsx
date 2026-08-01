import type { ReceivingLevelSummaryRow } from "@/lib/types";
import { dict, type Lang } from "@/lib/i18n";

export default function ReceivingLevelTable({
  rows,
  showKhu,
  lang = "vi",
}: {
  rows: ReceivingLevelSummaryRow[];
  showKhu: boolean;
  lang?: Lang;
}) {
  const t = dict[lang].receivingLevelTable;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <Th align="left">{t.key}</Th>
            {showKhu && <Th align="left">{t.khu}</Th>}
            <Th>{t.tongDon}</Th>
            <Th>{t.thanhCong}</Th>
            <Th>{t.tyLeThanhCongPct}</Th>
            <Th>{t.soNgay}</Th>
            <Th>{t.tbThanhCongNgay}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
              <Td align="left" strong>
                {r.key}
              </Td>
              {showKhu && <Td align="left">{r.khu ?? "—"}</Td>}
              <Td>{r.tong_don.toLocaleString("vi-VN")}</Td>
              <Td>{r.thanh_cong.toLocaleString("vi-VN")}</Td>
              <Td>
                <span
                  className="font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    color: r.ty_le_thanh_cong_pct < 85 ? "var(--status-critical)" : "var(--text-primary)",
                    background: r.ty_le_thanh_cong_pct < 85 ? "var(--brand-red-light)" : "transparent",
                  }}
                >
                  {r.ty_le_thanh_cong_pct}%
                </span>
              </Td>
              <Td>{r.so_ngay.toLocaleString("vi-VN")}</Td>
              <Td strong>{r.tb_thanh_cong_ngay.toLocaleString("vi-VN")}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = "right" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`py-2 px-3 text-[11px] font-semibold uppercase tracking-wide ${align === "left" ? "text-left" : "text-right"}`}
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </th>
  );
}
function Td({ children, align = "right", strong = false }: { children: React.ReactNode; align?: "left" | "right"; strong?: boolean }) {
  return (
    <td
      className={`py-2 px-3 ${align === "left" ? "text-left" : "text-right"} ${strong ? "font-semibold" : ""}`}
      style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </td>
  );
}
