import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import RefreshControl from "@/components/RefreshControl";
import DateRangeFilter from "@/components/DateRangeFilter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HeaderBrand from "@/components/HeaderBrand";
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
            <Suspense fallback={null}>
              <HeaderBrand />
            </Suspense>
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <LanguageSwitcher />
              </Suspense>
              <Suspense fallback={null}>
                <DateRangeFilter />
              </Suspense>
              <Suspense fallback={null}>
                <RefreshControl generatedAt={generatedAt} />
              </Suspense>
            </div>
          </header>
          <main className="flex-1 min-w-0 px-8 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
