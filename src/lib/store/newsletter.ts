import { readJson, writeJson } from "./fileStore";

const FILE = "newsletter.json";

export interface SubscriberRecord {
  email: string;
  createdAt: string;
  source: string;
}

let cache: SubscriberRecord[] | null = null;

async function load(): Promise<SubscriberRecord[]> {
  if (cache) return cache;
  const raw = await readJson<any[]>(FILE, []);
  cache = raw.map((item) => {
    if (typeof item === "string") {
      return {
        email: item.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
        source: "Blog Newsletter",
      };
    }
    return {
      email: String(item.email || "").trim().toLowerCase(),
      createdAt: item.createdAt || new Date().toISOString(),
      source: item.source || "Blog Newsletter",
    };
  });
  return cache;
}

async function persist(list: SubscriberRecord[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function addSubscriber(email: string, source: string = "Blog Newsletter"): Promise<boolean> {
  const all = await load();
  const normalized = email.trim().toLowerCase();

  if (all.some((s) => s.email === normalized)) {
    return false; // Already subscribed
  }

  const newRecord: SubscriberRecord = {
    email: normalized,
    createdAt: new Date().toISOString(),
    source,
  };

  await persist([newRecord, ...all]);
  return true;
}

export async function getSubscribers(): Promise<SubscriberRecord[]> {
  return await load();
}

export async function removeSubscriber(email: string): Promise<boolean> {
  const all = await load();
  const normalized = email.trim().toLowerCase();
  const filtered = all.filter((s) => s.email !== normalized);
  if (filtered.length === all.length) return false;
  await persist(filtered);
  return true;
}
