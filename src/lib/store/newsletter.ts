import { readJson, writeJson } from "./fileStore";

const FILE = "newsletter.json";

let cache: string[] | null = null;

async function load(): Promise<string[]> {
  if (cache) return cache;
  cache = await readJson<string[]>(FILE, []);
  return cache;
}

async function persist(list: string[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function addSubscriber(email: string): Promise<boolean> {
  const all = await load();
  const normalized = email.trim().toLowerCase();
  
  if (all.includes(normalized)) {
    return false; // Already subscribed
  }

  await persist([normalized, ...all]);
  return true;
}

export async function getSubscribers(): Promise<string[]> {
  return await load();
}
