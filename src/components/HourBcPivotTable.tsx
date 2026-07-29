import type { HourBcDetailRow, HourBcHourRow, HourFlowRow } from "@/lib/types";
import { dict, type Lang } from "@/lib/i18n";

const MAX_ROWS = 15;

export default function HourBcPivotTable({
  metric,
  bcDetail,
  bcHour,
  hours,
  lang = "vi",
}: {
  metric: "pickup" | "sign" | "arrival";
  bcDetail: HourBcDetailRow[];
  bcHour: HourBcHourRow[];
  hours: HourFlowRow[];
  lang?: Lang;
}) {
  const t = dict[lang].hourBcPivot;
  const METRIC_LABEL = t.metricLabel;
  const gioColumns = hours.filter((h) => h[metric] > 0).map((h) => h.gio);
  const sortedBc = [...bcDetail].filter((b) => b[metric] > 0).sort((a, b) => b[metric] - a[metric]);
  const shown = sortedBc.slice(0, MAX_ROWS);

  const valueMap = new Map<string, number>();
  for (const r of bcHour) valueMap.set(`${r.buu_cuc} ${r.gio}`, r[metric]);

  if (shown.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {t.empty(METRIC_LABEL[metric])}
      </p>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th
                className="py-2 px-3 text-left text-[11px] font-semibold uppercase tracking-wide sticky left-0"
                style={{ color: "var(--text-secondary)", background: "var(--surface)" }}
              >
                {t.buuCucPhat}
              </th>
              {gioColumns.map((g) => (
                <th
                  key={g}
                  className="py-2 px-2 text-right text-[11px] font-semibold uppercase whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {g}h
                </th>
              ))}
              <th className="py-2 px-3 text-right text-[11px] font-semibold uppercase" style={{ color: "var(--text-secondary)" }}>
                {t.tong}
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((b) => (
              <tr key={b.buu_cuc} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
                <td
                  className="py-2 px-3 text-left font-semibold whitespace-nowrap sticky left-0"
                  style={{ color: "var(--text-primary)", background: "var(--surface)" }}
                >
                  {b.buu_cuc}
                </td>
                {gioColumns.map((g) => {
                  const v = valueMap.get(`${b.buu_cuc} ${g}`) ?? 0;
                  return (
                    <td
                      key={g}
                      className="py-2 px-2 text-right"
                      style={{
                        color: v > 0 ? "var(--text-primary)" : "var(--text-muted)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {v > 0 ? v.toLocaleString("vi-VN") : "—"}
                    </td>
                  );
                })}
                <td className="py-2 px-3 text-right font-semibold" style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                  {b[metric].toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedBc.length > MAX_ROWS && (
        <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
          {t.truncated(MAX_ROWS, sortedBc.length, METRIC_LABEL[metric])}
        </p>
      )}
    </div>
  );
}
