"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { HourCountRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";

export default function ArrivalHourChart({ data }: { data: HourCountRow[] }) {
  const chartData = data.map((d) => ({ ...d, gio_label: `${d.gio}h` }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="gio_label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString("vi-VN")} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="so_luong" name="Số đơn hàng đến" fill="var(--series-primary)" radius={[4, 4, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
