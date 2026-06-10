import { readJson, writeJson } from "./fileStore";

export interface StoredSavedSearch {
  id: number;
  userEmail: string;
  query: string;
  filters: string; // JSON string
  alertEnabled: boolean;
  createdAt: string;
}

const FILE = "saved_searches.json";
let cache: StoredSavedSearch[] | null = null;

async function load(): Promise<StoredSavedSearch[]> {
  if (cache) return cache;
  cache = await readJson<StoredSavedSearch[]>(FILE, []);
  return cache;
}

async function persist(list: StoredSavedSearch[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function getUserSavedSearches(email: string): Promise<StoredSavedSearch[]> {
  const all = await load();
  const lowerEmail = email.toLowerCase().trim();
  return all.filter((s) => s.userEmail.toLowerCase().trim() === lowerEmail);
}

export async function addSavedSearch(
  email: string,
  query: string,
  filters: string
): Promise<StoredSavedSearch> {
  const all = await load();
  const lowerEmail = email.toLowerCase().trim();
  const maxId = all.reduce((m, s) => Math.max(m, s.id), 0);
  
  const newSearch: StoredSavedSearch = {
    id: maxId + 1,
    userEmail: lowerEmail,
    query: query.trim(),
    filters: filters,
    alertEnabled: true,
    createdAt: new Date().toISOString(),
  };

  await persist([...all, newSearch]);
  return newSearch;
}

export async function toggleSavedSearchAlert(id: number, enabled: boolean): Promise<boolean> {
  const all = await load();
  const index = all.findIndex((s) => s.id === id);
  if (index === -1) return false;

  all[index].alertEnabled = enabled;
  await persist([...all]);
  return true;
}

export async function deleteSavedSearch(id: number): Promise<boolean> {
  const all = await load();
  const filtered = all.filter((s) => s.id !== id);
  if (filtered.length === all.length) return false;

  await persist(filtered);
  return true;
}
