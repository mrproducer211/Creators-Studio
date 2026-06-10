import { PropertyCard } from "@/types/property";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { readJson, writeJson } from "./fileStore";

const FILE = "properties.json";

async function load(): Promise<PropertyCard[]> {
  const stored = await readJson<PropertyCard[] | null>(FILE, null);
  return stored && stored.length ? stored : [...MOCK_PROPERTIES];
}

async function persist(list: PropertyCard[]): Promise<void> {
  await writeJson(FILE, list);
}

import { getSystemSettings } from "./settings";

/* ────────── Public API ────────── */
export async function getAllProperties(): Promise<PropertyCard[]> {
  const all = await load();

  // Check and run automatic rental expiry deletion for local store
  const settings = await getSystemSettings();
  if (settings.rentalExpiryEnabled && settings.rentalExpiryDays > 0) {
    const threshold = new Date(Date.now() - settings.rentalExpiryDays * 24 * 60 * 60 * 1000);
    const filtered = all.filter((p) => {
      if (p.listingType !== "rent") return true;
      const createdDate = new Date(p.createdAt);
      return createdDate >= threshold;
    });

    if (filtered.length !== all.length) {
      await persist(filtered);
      return filtered;
    }
  }

  return [...all];
}

export async function getPropertyById(id: number): Promise<PropertyCard | null> {
  const all = await load();
  return all.find((p) => p.id === id) ?? null;
}

export async function getPropertyBySlug(slug: string): Promise<PropertyCard | null> {
  const all = await load();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function createProperty(input: Omit<PropertyCard, "id" | "createdAt" | "updatedAt">): Promise<PropertyCard> {
  const all   = await load();
  const maxId = all.reduce((m, p) => Math.max(m, p.id), 0);
  const next: PropertyCard = {
    ...input,
    id:        maxId + 1,
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString(),
    viewCount: input.viewCount ?? 0,
    clicks:    input.clicks ?? 0,
  };
  await persist([...all, next]);
  return next;
}

export async function updateProperty(id: number, patch: Partial<PropertyCard>): Promise<PropertyCard | null> {
  const all = await load();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const updated: PropertyCard = {
    ...all[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  }; // id is immutable
  const next = [...all];
  next[idx]  = updated;
  await persist(next);
  return updated;
}

export async function deleteProperty(id: number): Promise<boolean> {
  const all  = await load();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  await persist(next);
  return true;
}
