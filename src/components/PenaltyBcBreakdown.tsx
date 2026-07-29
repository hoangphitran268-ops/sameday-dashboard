"use client";

import { useMemo, useState } from "react";
import type { PenaltyBcRow, PenaltyTypeRow } from "@/lib/types";
import { dict, localizeLabel, type Lang } from "@/lib/i18n";

export default function PenaltyBcBreakdown({
  typeOverall,
  penaltyBc,
  lang = "vi",
}: {
  typeOverall: PenaltyTypeRow[];
  penaltyBc: PenaltyBcRow[];
  lang?: Lang;
}) {
  const t = dict[lang].penaltyBc;
  const viPhamTypes = typeOverall.filter((tt) => tt.is_vi_pham);
  const [selected, setSelected] = useState<string>(viPhamTypes[0]?.tinh_trang ?? "");

  const rows = useMemo(() => {
    return penaltyBc
      .filter((r) => r.tinh_trang === selected)
      .sort((a, b) => b.tien_phat - a.tien_phat)
      .slice(0, 15);
  }, [penaltyBc, selected]);

  if (viPhamTypes.length === 0) return null;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {viPhamTypes.map((pt) => (
          <button
            key={pt.tinh_trang}
            onClick={() => setSelected(pt.tinh_trang)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150"
            style={
              selected === pt.tinh_trang
                ? {
                    background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
                    borderColor: "var(--brand-red)",
                    color: "#fff",
                    boxShadow: "var(--shadow-red)",
                  }
                : { background: "transparent", borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            {localizeLabel(pt.tinh_trang, lang)} ({pt.so_luong.toLocaleString("vi-VN")})
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
                <Th align="left">{t.buuCuc}</Th>
                <Th align="left">{t.khu}</Th>
                <Th>{t.soDonViPham}</Th>
                <Th>{t.tienPhat}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.bc} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
                  <Td align="left" strong>
                    {r.bc}
                  </Td>
                  <Td align="left">{r.khu ?? "—"}</Td>
                  <Td>{r.so_luong.toLocaleString("vi-VN")}</Td>
                  <Td strong>
                    {r.tien_phat.toLocaleString("vi-VN")} {dict[lang].common.currencySuffix}
                  </Td>
                </tr>
              ))}
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
