"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { HourRow } from "@/lib/types";
import { ChartTooltip } from "./ChartTooltip";

export default function HourTrendLine({ data }: { data: HourRow[] }) {
  const chartData = data.map((d) => ({ ...d, gio_label: `${d.gio}h` }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis dataKey="gio_label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString("vi-VN")} />
        <Tooltip content={<ChartTooltip />} />
        <Line type="monotone" dataKey="so_don_lay_hang" name="Số đơn lấy hàng" stroke="var(--series-primary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="so_don_ky_nhan" name="Số đơn ký nhận" stroke="var(--series-secondary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
