import type { NodePerfRow } from "@/lib/types";

export default function PerfTable({ rows, labelKey }: { rows: NodePerfRow[]; labelKey: "buu_cuc" | "khu" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <Th align="left">{labelKey === "buu_cuc" ? "Bưu cục" : "Khu"}</Th>
            <Th>Tổng đơn</Th>
            <Th>Đã ký nhận</Th>
            <Th>Tỷ lệ ký nhận %</Th>
            <Th>Tỷ lệ cùng ngày %</Th>
            <Th>TG xử lý TB (giờ)</Th>
            <Th>Số đơn vấn đề</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[labelKey]} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
              <Td align="left" strong>
                {r[labelKey]}
              </Td>
              <Td>{r.tong_don.toLocaleString("vi-VN")}</Td>
              <Td>{r.da_ky_nhan.toLocaleString("vi-VN")}</Td>
              <Td>{r.ty_le_ky_nhan_pct}%</Td>
              <Td>
                <span
                  className="font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    color: r.ty_le_cung_ngay_pct < 70 ? "var(--status-critical)" : "var(--text-primary)",
                    background: r.ty_le_cung_ngay_pct < 70 ? "var(--brand-red-light)" : "transparent",
                  }}
                >
                  {r.ty_le_cung_ngay_pct}%
                </span>
              </Td>
              <Td>{r.tg_xu_ly_tb_h ?? "—"}</Td>
              <Td>{r.so_don_van_de.toLocaleString("vi-VN")}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = "right" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`py-2 px-3 text-[11px] font-semibold uppercase tracking-wide ${align === "left" ? "text-left" : "text-right"}`}
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </th>
  );
}
function Td({ children, align = "right", strong = false }: { children: React.ReactNode; align?: "left" | "right"; strong?: boolean }) {
  return (
    <td
      className={`py-2 px-3 ${align === "left" ? "text-left" : "text-right"} ${strong ? "font-semibold" : ""}`}
      style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </td>
  );
}
