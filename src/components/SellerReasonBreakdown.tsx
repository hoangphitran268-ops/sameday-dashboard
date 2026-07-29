"use client";

import { useMemo, useState } from "react";
import type { ReasonRow, ReceivingSellerReasonRow } from "@/lib/types";
import { dict, localizeLabel, type Lang } from "@/lib/i18n";

export default function SellerReasonBreakdown({
  reasonOverall,
  sellerReason,
  lang = "vi",
}: {
  reasonOverall: ReasonRow[];
  sellerReason: ReceivingSellerReasonRow[];
  lang?: Lang;
}) {
  const t = dict[lang].sellerReason;
  const [selected, setSelected] = useState<string>(reasonOverall[0]?.nguyen_nhan ?? "");

  const sellerTotals = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of sellerReason) m.set(r.seller, (m.get(r.seller) ?? 0) + r.so_luong);
    return m;
  }, [sellerReason]);

  const rows = useMemo(() => {
    return sellerReason
      .filter((r) => r.nguyen_nhan === selected)
      .sort((a, b) => b.so_luong - a.so_luong)
      .slice(0, 15);
  }, [sellerReason, selected]);

  if (reasonOverall.length === 0) return null;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {reasonOverall.map((r) => (
          <button
            key={r.nguyen_nhan}
            onClick={() => setSelected(r.nguyen_nhan)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150"
            style={
              selected === r.nguyen_nhan
                ? {
                    background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
                    borderColor: "var(--brand-red)",
                    color: "#fff",
                    boxShadow: "var(--shadow-red)",
                  }
                : { background: "transparent", borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            {localizeLabel(r.nguyen_nhan, lang)} ({r.so_luong.toLocaleString("vi-VN")})
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {t.empty}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <Th align="left">{t.seller}</Th>
                <Th>{t.soDonReason}</Th>
                <Th>{t.sharePct}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sellerTotal = sellerTotals.get(r.seller) ?? 0;
                const share = sellerTotal ? Math.round((r.so_luong / sellerTotal) * 1000) / 10 : 0;
                return (
                  <tr key={r.seller} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
                    <Td align="left" strong>
                      {r.seller}
                    </Td>
                    <Td>{r.so_luong.toLocaleString("vi-VN")}</Td>
                    <Td>
                      <span
                        className="font-semibold px-1.5 py-0.5 rounded"
                        style={share >= 50 ? { color: "var(--status-critical)", background: "var(--brand-red-light)" } : { color: "var(--text-primary)" }}
                      >
                        {share}%
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
