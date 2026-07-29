import { Inbox } from "lucide-react";

export default function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="rounded-2xl border p-12 flex flex-col items-center justify-center text-center w-full"
      style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
        style={{ background: "var(--brand-red-tint)" }}
      >
        <Inbox size={26} style={{ color: "var(--brand-red)" }} />
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        Không có dữ liệu cho khoảng thời gian đã chọn
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        {label} — chưa có file export nào khớp khoảng ngày này. Hãy chọn khoảng khác ở góc trên bên phải.
      </p>
    </div>
  );
}
