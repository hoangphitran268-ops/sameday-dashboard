import type { HourBcDetailRow } from "@/lib/types";
import { dict, type Lang } from "@/lib/i18n";

const MAX_ROWS = 30;

export default function HourBcDetailTable({ rows, lang = "vi" }: { rows: HourBcDetailRow[]; lang?: Lang }) {
  const t = dict[lang].hourBcDetail;
  if (rows.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {t.empty}
      </p>
    );
  }

  const shown = rows.slice(0, MAX_ROWS);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <Th align="left">{t.buuCucPhat}</Th>
              <Th align="left">{t.khu}</Th>
              <Th>{t.pickup}</Th>
              <Th>{t.sign}</Th>
              <Th>{t.arrival}</Th>
              <Th>{t.tong}</Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.buu_cuc} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
                <Td align="left" strong>
                  {r.buu_cuc}
                </Td>
                <Td align="left">{r.khu ?? "—"}</Td>
                <Td>{r.pickup.toLocaleString("vi-VN")}</Td>
                <Td>{r.sign.toLocaleString("vi-VN")}</Td>
                <Td>{r.arrival.toLocaleString("vi-VN")}</Td>
                <Td strong>{r.tong.toLocaleString("vi-VN")}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > MAX_ROWS && (
        <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
          {t.truncated(MAX_ROWS, rows.length)}
        </p>
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
