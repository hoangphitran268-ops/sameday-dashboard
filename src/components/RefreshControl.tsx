"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { getLang, dict } from "@/lib/i18n";

function formatVN(iso: string | undefined, unknownLabel: string) {
  if (!iso) return unknownLabel;
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" }) + " (GMT+7)";
}

export default function RefreshControl({ generatedAt }: { generatedAt?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = dict[getLang(searchParams)];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? t.refresh.genericError);
      } else {
        router.refresh();
      }
    } catch {
      setError(t.refresh.connError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-150 disabled:opacity-60 hover:-translate-y-px active:translate-y-0"
        style={{
          background: "linear-gradient(135deg, var(--brand-red) 0%, var(--brand-red-dark) 100%)",
          color: "#fff",
          boxShadow: "var(--shadow-red)",
        }}
      >
        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        {loading ? t.refresh.refreshing : t.refresh.refreshNow}
      </button>
      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {t.refresh.lastUpdated(formatVN(generatedAt, t.refresh.unknown))}
      </span>
      {error && (
        <span className="text-[11px] max-w-md" style={{ color: "var(--status-critical)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
