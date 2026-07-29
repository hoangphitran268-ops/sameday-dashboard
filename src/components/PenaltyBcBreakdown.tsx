"use client";

import { useMemo, useState } from "react";
import type { PenaltyBcRow, PenaltyTypeRow } from "@/lib/types";

export default function PenaltyBcBreakdown({
  typeOverall,
  penaltyBc,
}: {
  typeOverall: PenaltyTypeRow[];
  penaltyBc: PenaltyBcRow[];
}) {
  const viPhamTypes = typeOverall.filter((t) => t.is_vi_pham);
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
        {viPhamTypes.map((t) => (
          <button
            key={t.tinh_trang}
            onClick={() => setSelected(t.tinh_trang)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-150"
            style={
              selected === t.tinh_trang
                ? {
                    background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
                    borderColor: "var(--brand-red)",
                    color: "#fff",
                    boxShadow: "var(--shadow-red)",
                  }
                : { background: "transparent", borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            {t.tinh_trang} ({t.so_luong.toLocaleString("vi-VN")})
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Không có bưu cục nào bị ghi nhận loại vi phạm này trong khoảng đã chọn.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <Th align="left">Bưu cục chịu trách nhiệm</Th>
                <Th align="left">Khu</Th>
                <Th>Số đơn vi phạm</Th>
                <Th>Tiền phạt</Th>
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
                  <Td strong>{r.tien_phat.toLocaleString("vi-VN")} đ</Td>
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
