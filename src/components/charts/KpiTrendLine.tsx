"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { KpiDailyRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";

export default function KpiTrendLine({ data }: { data: KpiDailyRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="report_date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey="ty_le_ky_nhan_pct" name="Tỷ lệ ký nhận %" stroke="var(--series-primary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="ty_le_van_de_pct" name="Tỷ lệ có vấn đề %" stroke="var(--series-tertiary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
