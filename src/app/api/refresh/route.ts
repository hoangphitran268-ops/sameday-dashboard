import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { readDashboardData } from "@/lib/data";

const execFileAsync = promisify(execFile);
const SCRIPT_PATH = path.join(process.cwd(), "scripts", "regenerate-data.mjs");

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { stdout } = await execFileAsync("node", [SCRIPT_PATH], { timeout: 60_000 });
    const data = readDashboardData();
    return NextResponse.json({ ok: true, log: stdout, generated_at: data.meta.generated_at ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Không quét được dữ liệu mới. Tính năng này chỉ hoạt động khi chạy dashboard cục bộ (npm run dev) trên máy có thư mục data/raw/sameday — không khả dụng khi deploy trên Vercel vì Vercel không truy cập được ổ đĩa cục bộ.",
        detail: message,
      },
      { status: 500 }
    );
  }
}
