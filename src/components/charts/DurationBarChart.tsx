"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { KpiDailyRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";

export default function DurationBarChart({ data }: { data: KpiDailyRow[] }) {
  const avg = data.reduce((a, d) => a + d.tg_xu_ly_trung_binh_h, 0) / data.length;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="report_date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="tg_xu_ly_trung_binh_h" name="TG xử lý TB (giờ)" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.tg_xu_ly_trung_binh_h > avg * 1.3 ? "var(--status-critical)" : "var(--series-tertiary)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
