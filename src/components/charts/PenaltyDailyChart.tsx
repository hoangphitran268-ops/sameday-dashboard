"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { PenaltyDailyRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";
import { dict, type Lang } from "@/lib/i18n";

export default function PenaltyDailyChart({ data, lang = "vi" }: { data: PenaltyDailyRow[]; lang?: Lang }) {
  const t = dict[lang];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="report_date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toLocaleString("vi-VN")}k`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="tien_phat" name={t.chartNames.penaltyAmount} unit={` ${t.common.currencySuffix}`} fill="var(--series-tertiary)" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
