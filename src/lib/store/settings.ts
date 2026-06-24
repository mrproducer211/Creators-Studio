import { readJson, writeJson } from "./fileStore";
import { db, isDbConfigured } from "@/lib/db";
import { systemSettings as settingsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
  adminEmail: "admin@newhomesproperty.com",
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

  if (isDbConfigured) {
    try {
      const [dbRow] = await db.select().from(settingsTable).where(eq(settingsTable.id, 1)).limit(1);
      if (dbRow) {
        cache = {
          adminEmail: dbRow.adminEmail,
          adminPhone: dbRow.adminPhone,
          rentalExpiryEnabled: dbRow.rentalExpiryEnabled,
          rentalExpiryDays: dbRow.rentalExpiryDays,
          adminWhatsApp: dbRow.adminWhatsApp || "",
          adminLine: dbRow.adminLine || "",
          adminTelegram: dbRow.adminTelegram || "",
        };
        return cache;
      }
      // If db configured but table row not found, bootstrap from local JSON
      const stored = await readJson<Partial<SystemSettings>>(FILE, {});
      const merged = { ...DEFAULT_SETTINGS, ...stored } as SystemSettings;
      await db.insert(settingsTable).values({
        id: 1,
        adminEmail: merged.adminEmail,
        adminPhone: merged.adminPhone,
        rentalExpiryEnabled: merged.rentalExpiryEnabled,
        rentalExpiryDays: merged.rentalExpiryDays,
        adminWhatsApp: merged.adminWhatsApp,
        adminLine: merged.adminLine,
        adminTelegram: merged.adminTelegram,
      });
      cache = merged;
      return cache;
    } catch (err) {
      console.error("Failed to load settings from DB, falling back to local JSON:", err);
    }
  }

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

  if (isDbConfigured) {
    try {
      const [dbRow] = await db.select().from(settingsTable).where(eq(settingsTable.id, 1)).limit(1);
      if (dbRow) {
        await db
          .update(settingsTable)
          .set({
            adminEmail: updated.adminEmail,
            adminPhone: updated.adminPhone,
            rentalExpiryEnabled: updated.rentalExpiryEnabled,
            rentalExpiryDays: updated.rentalExpiryDays,
            adminWhatsApp: updated.adminWhatsApp,
            adminLine: updated.adminLine,
            adminTelegram: updated.adminTelegram,
            updatedAt: new Date(),
          })
          .where(eq(settingsTable.id, 1));
      } else {
        await db.insert(settingsTable).values({
          id: 1,
          adminEmail: updated.adminEmail,
          adminPhone: updated.adminPhone,
          rentalExpiryEnabled: updated.rentalExpiryEnabled,
          rentalExpiryDays: updated.rentalExpiryDays,
          adminWhatsApp: updated.adminWhatsApp,
          adminLine: updated.adminLine,
          adminTelegram: updated.adminTelegram,
        });
      }
      return updated;
    } catch (err) {
      console.error("Failed to update settings in DB:", err);
    }
  }

  await writeJson(FILE, updated);
  return updated;
}
