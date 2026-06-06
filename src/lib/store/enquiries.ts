import { readJson, writeJson } from "./fileStore";

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
  const all = await load();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated = { ...all[idx], status };
  const next    = [...all];
  next[idx]     = updated;
  await persist(next);
  return updated;
}
