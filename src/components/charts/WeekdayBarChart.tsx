"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import type { WeekdayRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";

export default function WeekdayBarChart({ data }: { data: WeekdayRow[] }) {
  const minVal = data.length ? Math.min(...data.map((d) => d.ty_le_ky_nhan_pct)) : null;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 20, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="weekday" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="ty_le_ky_nhan_pct" name="Tỷ lệ ký nhận %" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false}>
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
