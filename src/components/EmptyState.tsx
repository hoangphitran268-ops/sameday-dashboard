import { Inbox } from "lucide-react";

export default function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="rounded-xl border p-12 flex flex-col items-center justify-center text-center max-w-6xl"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <Inbox size={32} style={{ color: "var(--text-muted)" }} />
      <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        Không có dữ liệu cho khoảng thời gian đã chọn
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        {label} — chưa có file export nào khớp khoảng ngày này. Hãy chọn khoảng khác ở góc trên bên phải.
      </p>
    </div>
  );
}
