"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ReceivingLevelDailyRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";
import { dict, type Lang } from "@/lib/i18n";

export default function ReceivingLevelComboChart({ data, lang = "vi" }: { data: ReceivingLevelDailyRow[]; lang?: Lang }) {
  const t = dict[lang].chartNames;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="report_date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar yAxisId="left" dataKey="thanh_cong" name={t.receivingSuccessCount} fill="var(--series-primary)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="ty_le_thanh_cong_pct"
          name={t.receivingSuccessPct}
          stroke="var(--brand-red)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
          unit="%"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
