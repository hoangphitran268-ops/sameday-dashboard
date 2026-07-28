import fs from "node:fs";
import path from "node:path";
import type { DashboardData } from "./types";

const DATA_PATH = path.join(process.cwd(), "src", "data", "dashboard-data.json");

export function readDashboardData(): DashboardData {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as DashboardData;
}

export function getDataPath() {
  return DATA_PATH;
}
