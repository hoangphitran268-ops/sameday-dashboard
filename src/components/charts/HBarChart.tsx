"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export default function HBarChart({
  data,
  dataKey,
  categoryKey,
  name,
  color = "var(--series-primary)",
  height,
  unit = "",
  width = 150,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  categoryKey: string;
  name: string;
  color?: string;
  height?: number;
  unit?: string;
  width?: number;
}) {
  const h = height ?? Math.max(160, data.length * 30);
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
        barCategoryGap={8}
      >
        <CartesianGrid stroke="var(--grid)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} unit={unit} />
        <YAxis
          type="category"
          dataKey={categoryKey}
          width={width}
          tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[0, 4, 4, 0]} maxBarSize={18} unit={unit} />
      </BarChart>
    </ResponsiveContainer>
  );
}
