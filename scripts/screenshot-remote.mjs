import { chromium } from "playwright";
import path from "node:path";

const URL = process.argv[2] || "https://dashboard-seven-dusky-96.vercel.app/";
const outDir = path.join(process.cwd(), "screenshots");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });

await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(outDir, "remote-01.png"), fullPage: true });

const pages = ["/kpi", "/hieu-suat", "/nguyen-nhan", "/theo-gio"];
for (const p of pages) {
  await page.goto(URL.replace(/\/$/, "") + p, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, `remote-${p.replace("/", "")}.png`), fullPage: true });
}

console.log("Title:", await page.title());
console.log("\n=== ERRORS/HTTP ISSUES ===");
if (errors.length) errors.forEach((e) => console.log(e));
else console.log("None");

await browser.close();
