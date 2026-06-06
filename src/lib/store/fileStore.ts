import { promises as fs } from "fs";
import path from "path";

/**
 * Lightweight JSON file store for development. Each store reads/writes a JSON
 * file under <project-root>/data/.
 *
 * In production this should be swapped for the Drizzle / Neon DB layer. The
 * function signatures are designed to be database-shaped so the switch is
 * mechanical.
 */

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const fullPath = path.join(DATA_DIR, file);
    const raw      = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDataDir();
  const fullPath = path.join(DATA_DIR, file);
  // Atomic-ish write: tmp file + rename
  const tmp      = `${fullPath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, fullPath);
}
