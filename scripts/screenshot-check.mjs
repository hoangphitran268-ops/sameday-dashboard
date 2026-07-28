import { chromium } from "playwright";
import path from "node:path";

const pages = [
  { path: "/", name: "01-tong-quan" },
  { path: "/kpi", name: "02-kpi" },
  { path: "/hieu-suat", name: "03-hieu-suat" },
  { path: "/nguyen-nhan", name: "04-nguyen-nhan" },
  { path: "/theo-gio", name: "05-theo-gio" },
];

const outDir = path.join(process.cwd(), "screenshots");

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
});
page.on("pageerror", (err) => consoleErrors.push(`[pageerror] ${err.message}`));

for (const p of pages) {
  await page.goto(`http://localhost:3000${p.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, `${p.name}.png`), fullPage: true });
  console.log("captured", p.path);
}

await browser.close();

if (consoleErrors.length) {
  console.log("\n=== CONSOLE ERRORS ===");
  consoleErrors.forEach((e) => console.log(e));
} else {
  console.log("\nNo console errors.");
}
