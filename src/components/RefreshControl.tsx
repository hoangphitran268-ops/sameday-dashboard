"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

function formatVN(iso?: string) {
  if (!iso) return "chưa rõ";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" }) + " (GMT+7)";
}

export default function RefreshControl({ generatedAt }: { generatedAt?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Có lỗi khi cập nhật dữ liệu.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Không kết nối được API cập nhật.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-60"
        style={{ borderColor: "var(--brand-red)", color: "var(--brand-red)", background: "var(--brand-red-tint)" }}
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        {loading ? "Đang quét dữ liệu..." : "Cập nhật ngay"}
      </button>
      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        Cập nhật lần cuối: {formatVN(generatedAt)} · Tự động quét mỗi 3 giờ
      </span>
      {error && (
        <span className="text-[11px] max-w-md" style={{ color: "var(--status-critical)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
