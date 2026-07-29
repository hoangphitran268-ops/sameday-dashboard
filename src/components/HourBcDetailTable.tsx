import type { HourBcDetailRow } from "@/lib/types";

const MAX_ROWS = 30;

export default function HourBcDetailTable({ rows }: { rows: HourBcDetailRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Không có dữ liệu bưu cục cho lựa chọn hiện tại.
      </p>
    );
  }

  const shown = rows.slice(0, MAX_ROWS);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <Th align="left">Bưu cục phát</Th>
              <Th align="left">Khu</Th>
              <Th>Số đơn lấy hàng</Th>
              <Th>Số đơn ký nhận</Th>
              <Th>Số đơn hàng đến</Th>
              <Th>Tổng cộng</Th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.buu_cuc} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-[var(--brand-red-tint)]">
                <Td align="left" strong>
                  {r.buu_cuc}
                </Td>
                <Td align="left">{r.khu ?? "—"}</Td>
                <Td>{r.pickup.toLocaleString("vi-VN")}</Td>
                <Td>{r.sign.toLocaleString("vi-VN")}</Td>
                <Td>{r.arrival.toLocaleString("vi-VN")}</Td>
                <Td strong>{r.tong.toLocaleString("vi-VN")}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > MAX_ROWS && (
        <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
          Đang hiển thị {MAX_ROWS}/{rows.length} bưu cục theo khối lượng cao nhất — thu hẹp bằng bộ lọc Khu/Bưu cục ở
          trên để xem đầy đủ.
        </p>
      )}
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
