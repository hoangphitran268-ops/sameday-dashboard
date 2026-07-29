"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import type { WeekdayRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";
import { dict, localizeWeekday, type Lang } from "@/lib/i18n";

export default function WeekdayBarChart({ data, lang = "vi" }: { data: WeekdayRow[]; lang?: Lang }) {
  const t = dict[lang].chartNames;
  const chartData = data.map((d) => ({ ...d, weekday: localizeWeekday(d.weekday, lang) }));
  const minVal = chartData.length ? Math.min(...chartData.map((d) => d.ty_le_ky_nhan_pct)) : null;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 20, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="weekday" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="ty_le_ky_nhan_pct" name={t.signRatePct} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.ty_le_ky_nhan_pct === minVal ? "var(--status-critical)" : "var(--series-primary)"} />
          ))}
          <LabelList
            dataKey="ty_le_ky_nhan_pct"
            position="top"
            formatter={(v?: React.ReactNode) => `${v}%`}
            style={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
