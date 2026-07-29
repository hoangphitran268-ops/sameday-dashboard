"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ReceivingDailyRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";
import { dict, type Lang } from "@/lib/i18n";

export default function ReceivingTrendLine({ data, lang = "vi" }: { data: ReceivingDailyRow[]; lang?: Lang }) {
  const t = dict[lang].chartNames;
  return (
    <ResponsiveContainer width="100%" height={280}>
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
        <Line
          type="monotone"
          dataKey="ty_le_thanh_cong_pct"
          name={t.receivingSuccessPct}
          stroke="var(--series-primary)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="ty_le_huy_pct"
          name={t.cancelPct}
          stroke="var(--series-tertiary)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
