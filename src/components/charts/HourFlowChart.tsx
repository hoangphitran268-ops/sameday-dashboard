"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { HourFlowRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";
import { dict, type Lang } from "@/lib/i18n";

export default function HourFlowChart({ data, lang = "vi" }: { data: HourFlowRow[]; lang?: Lang }) {
  const t = dict[lang].chartNames;
  const chartData = data.map((d) => ({ ...d, gio_label: `${d.gio}h` }));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="gio_label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString("vi-VN")} />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey="pickup" name={t.pickupCount} stroke="var(--series-primary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="sign" name={t.signCount} stroke="var(--series-secondary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="arrival" name={t.arrivalCount} stroke="var(--series-tertiary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
