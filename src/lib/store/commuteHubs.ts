import { readJson, writeJson } from "./fileStore";

export interface StoredCommuteHub {
  id: number;
  userEmail: string;
  name: string; // e.g. Work, School
  address: string;
  latitude: number;
  longitude: number;
  transitMode: "transit" | "driving" | "walking";
  createdAt: string;
}

const FILE = "commute_hubs.json";
let cache: StoredCommuteHub[] | null = null;

async function load(): Promise<StoredCommuteHub[]> {
  if (cache) return cache;
  cache = await readJson<StoredCommuteHub[]>(FILE, []);
  return cache;
}

async function persist(list: StoredCommuteHub[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function getUserCommuteHubs(email: string): Promise<StoredCommuteHub[]> {
  const all = await load();
  const lowerEmail = email.toLowerCase().trim();
  return all.filter((h) => h.userEmail.toLowerCase().trim() === lowerEmail);
}

export async function saveCommuteHub(
  email: string,
  name: string,
  address: string,
  latitude: number,
  longitude: number,
  transitMode: "transit" | "driving" | "walking"
): Promise<StoredCommuteHub> {
  const all = await load();
  const lowerEmail = email.toLowerCase().trim();
  
  // Check if a hub with the same name already exists for this user and overwrite/update it, or insert new
  const existingIdx = all.findIndex(
    (h) => h.userEmail.toLowerCase().trim() === lowerEmail && h.name.toLowerCase().trim() === name.toLowerCase().trim()
  );

  if (existingIdx !== -1) {
    const updated = {
      ...all[existingIdx],
      address,
      latitude,
      longitude,
      transitMode,
    };
    all[existingIdx] = updated;
    await persist([...all]);
    return updated;
  } else {
    const maxId = all.reduce((m, h) => Math.max(m, h.id), 0);
    const newHub: StoredCommuteHub = {
      id: maxId + 1,
      userEmail: lowerEmail,
      name,
      address,
      latitude,
      longitude,
      transitMode,
      createdAt: new Date().toISOString(),
    };
    await persist([...all, newHub]);
    return newHub;
  }
}

export async function deleteCommuteHub(id: number): Promise<boolean> {
  const all = await load();
  const filtered = all.filter((h) => h.id !== id);
  if (filtered.length === all.length) return false;

  await persist(filtered);
  return true;
}
