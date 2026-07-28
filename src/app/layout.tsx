import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import RefreshControl from "@/components/RefreshControl";
import { readDashboardData } from "@/lib/data";

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
    generatedAt = readDashboardData().meta.generated_at;
  } catch {
    generatedAt = undefined;
  }

  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex" style={{ background: "var(--background)" }}>
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <header
            className="flex items-center justify-between px-8 py-4 border-b"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div>
              <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Dashboard vận hành SAME DAY
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                J&T Express · Nguồn: sheet &ldquo;data&rdquo; của file export hằng ngày
              </p>
            </div>
            <RefreshControl generatedAt={generatedAt} />
          </header>
          <main className="flex-1 min-w-0 px-8 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
