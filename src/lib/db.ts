import fs from "fs";
import path from "path";
import os from "os";
import { getInitialSeedData } from "@/lib/seed-data";
import { StoreDatabase } from "@/types/store";

declare global {
  // eslint-disable-next-line no-var
  var __atelierDbCache: StoreDatabase | undefined;
}

function getDbFilePath(): string {
  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isVercel) {
    return path.join(os.tmpdir(), "atelier-vera-runtime-db.json");
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      return path.join(os.tmpdir(), "atelier-vera-runtime-db.json");
    }
  }
  return path.join(dataDir, "runtime-db.json");
}

export function readDb(): StoreDatabase {
  const filePath = getDbFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw) as StoreDatabase;
      global.__atelierDbCache = parsed;
      return parsed;
    }
  } catch {
    if (global.__atelierDbCache) {
      return global.__atelierDbCache;
    }
  }

  const initial = getInitialSeedData();
  writeDb(initial);
  return initial;
}

export function writeDb(data: StoreDatabase): void {
  global.__atelierDbCache = data;
  const filePath = getDbFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Fallback to in-memory cache if filesystem is strictly read-only
  }
}

export function resetDbToSeed(): StoreDatabase {
  const initial = getInitialSeedData();
  writeDb(initial);
  return initial;
}

