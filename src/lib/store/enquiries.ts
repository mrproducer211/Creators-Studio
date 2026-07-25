import { readJson, writeJson } from "./fileStore";
import { db, isDbConfigured } from "@/lib/db";
import { enquiries as enquiriesTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export interface StoredEnquiry {
  id:           string;
  createdAt:    string;       // ISO timestamp
  propertySlug: string;
  propertyName: string;
  listingType:  string;
  price:        string;
  area:         string;
  name:         string;
  contact:      string;
  method:       string;
  message?:     string;
  source:       string;
  tourDate?:    string;
  tourTime?:    string;
  status:       "new" | "responded" | "archived";
  userRole?:    string;
}

const FILE = "enquiries.json";

let cache: StoredEnquiry[] | null = null;

async function load(): Promise<StoredEnquiry[]> {
  if (cache) return cache;
  cache = await readJson<StoredEnquiry[]>(FILE, []);
  return cache;
}

async function persist(list: StoredEnquiry[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function getAllEnquiries(): Promise<StoredEnquiry[]> {
  const all = await load();
  return [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addEnquiry(input: Omit<StoredEnquiry, "id" | "createdAt" | "status">): Promise<StoredEnquiry> {
  const all = await load();
  const next: StoredEnquiry = {
    ...input,
    id:        `enq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status:    "new",
  };
  await persist([next, ...all]);
  return next;
}

export async function setEnquiryStatus(id: string, status: StoredEnquiry["status"]): Promise<StoredEnquiry | null> {
  if (isDbConfigured) {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      await db
        .update(enquiriesTable)
        .set({ status })
        .where(eq(enquiriesTable.id, numId));
    }
  }
  const all = await load();
  const idx = all.findIndex((e) => String(e.id) === String(id));
  if (idx !== -1) {
    const updated = { ...all[idx], status };
    const next    = [...all];
    next[idx]     = updated;
    await persist(next);
    return updated;
  }
  return { id, status } as any;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  let dbSuccess = false;
  if (isDbConfigured) {
    const numId = parseInt(id, 10);
    if (!isNaN(numId)) {
      await db.delete(enquiriesTable).where(eq(enquiriesTable.id, numId));
      dbSuccess = true;
    }
  }
  const all = await load();
  const next = all.filter((e) => String(e.id) !== String(id));
  if (next.length !== all.length) {
    await persist(next);
    return true;
  }
  return dbSuccess;
}

export async function deleteMultipleEnquiries(ids: string[]): Promise<boolean> {
  if (!ids || ids.length === 0) return false;
  if (isDbConfigured) {
    const numIds = ids.map((id) => parseInt(id, 10)).filter((num) => !isNaN(num));
    if (numIds.length > 0) {
      await db.delete(enquiriesTable).where(inArray(enquiriesTable.id, numIds));
    }
  }
  const all = await load();
  const idSet = new Set(ids.map((id) => String(id)));
  const next = all.filter((e) => !idSet.has(String(e.id)));
  if (next.length !== all.length) {
    await persist(next);
  }
  return true;
}
