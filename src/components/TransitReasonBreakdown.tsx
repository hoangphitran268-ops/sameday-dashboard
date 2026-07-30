"use client";

import { useMemo, useState } from "react";
import type { TransitReasonBcRow, TransitReasonRow } from "@/lib/types";
import { dict, type Lang } from "@/lib/i18n";

export default function TransitReasonBreakdown({
  reasonOverall,
  reasonBc,
  lang = "vi",
}: {
  reasonOverall: TransitReasonRow[];
  reasonBc: TransitReasonBcRow[];
  lang?: Lang;
}) {
  const t = dict[lang].transitReasonBc;
  const [selected, setSelected] = useState<string>(reasonOverall[0]?.reason ?? "");

  const pairTotals = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of reasonBc) {
      const key = `${r.hub}||${r.bc_gui}`;
      m.set(key, (m.get(key) ?? 0) + r.so_luong);
    }
    return m;
  }, [reasonBc]);

  const rows = useMemo(() => {
    return reasonBc
      .filter((r) => r.reason === selected)
      .sort((a, b) => b.so_luong - a.so_luong)
      .slice(0, 15);
  }, [reasonBc, selected]);

  if (reasonOverall.length === 0) return null;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {reasonOverall.map((r) => (
          <button
            key={r.reason}
            onClick={() => setSelected(r.reason)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150"
            style={
              selected === r.reason
                ? {
                    background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
                    borderColor: "var(--brand-red)",
                    color: "#fff",
                    boxShadow: "var(--shadow-red)",
                  }
                : { background: "transparent", borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            {r.reason} ({r.so_luong.toLocaleString("vi-VN")})
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
                <Th align="left">{t.hub}</Th>
                <Th align="left">{t.bcGui}</Th>
                <Th>{t.soDonReason}</Th>
                <Th>{t.sharePct}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pairTotal = pairTotals.get(`${r.hub}||${r.bc_gui}`) ?? 0;
                const share = pairTotal ? Math.round((r.so_luong / pairTotal) * 1000) / 10 : 0;
                return (
                  <tr key={`${r.hub}||${r.bc_gui}`} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
                    <Td align="left">{r.hub}</Td>
                    <Td align="left" strong>
                      {r.bc_gui}
                    </Td>
                    <Td>{r.so_luong.toLocaleString("vi-VN")}</Td>
                    <Td>
                      <span
                        className="font-semibold px-1.5 py-0.5 rounded"
                        style={
                          share >= 50
                            ? { color: "var(--status-critical)", background: "var(--brand-red-light)" }
                            : { color: "var(--text-primary)" }
                        }
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
