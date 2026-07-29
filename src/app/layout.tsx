import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import RefreshControl from "@/components/RefreshControl";
import DateRangeFilter from "@/components/DateRangeFilter";
import { readRawData } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "J&T Same Day — Ops Dashboard",
  description: "Dashboard vận hành SAME DAY — J&T Express",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let generatedAt: string | undefined;
  try {
    generatedAt = readRawData().generated_at;
  } catch {
    generatedAt = undefined;
  }

  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex" style={{ background: "var(--background)" }}>
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
        <div className="flex-1 min-w-0 flex flex-col">
          <header
            className="relative flex items-center justify-between px-8 py-4 gap-4"
            style={{ background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ background: "linear-gradient(90deg, var(--brand-red) 0%, var(--brand-red-dark) 60%, transparent 100%)" }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  Dashboard vận hành SAME DAY
                </h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ background: "var(--brand-red)", color: "#fff" }}
                >
                  J&amp;T Express
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Nguồn: sheet &ldquo;data&rdquo; của file export hằng ngày
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <DateRangeFilter />
              </Suspense>
              <RefreshControl generatedAt={generatedAt} />
            </div>
          </header>
          <main className="flex-1 min-w-0 px-8 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
