import { readJson, writeJson } from "./fileStore";

export interface SystemSettings {
  adminEmail: string;
  adminPhone: string;
  rentalExpiryEnabled: boolean;
  rentalExpiryDays: number;
  adminWhatsApp: string;
  adminLine: string;
  adminTelegram: string;
}

const FILE = "settings.json";
const DEFAULT_SETTINGS: SystemSettings = {
  adminEmail: "admin@nhpbangkok.com",
  adminPhone: "+66812345678",
  rentalExpiryEnabled: false,
  rentalExpiryDays: 30,
  adminWhatsApp: "+66812345678",
  adminLine: "nhp-line-id",
  adminTelegram: "nhp-telegram",
};

let cache: SystemSettings | null = null;

async function load(): Promise<SystemSettings> {
  if (cache) return cache;
  const stored = await readJson<Partial<SystemSettings>>(FILE, {});
  cache = { ...DEFAULT_SETTINGS, ...stored } as SystemSettings;
  return cache;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  return await load();
}

export async function updateSystemSettings(input: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await load();
  const updated = { ...current, ...input };
  cache = updated;
  await writeJson(FILE, updated);
  return updated;
}
