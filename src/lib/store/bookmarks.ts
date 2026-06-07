import { readJson, writeJson } from "./fileStore";

export interface StoredBookmark {
  id: number;
  userEmail: string;
  propertyId: number;
  createdAt: string;
}

const FILE = "bookmarks.json";

let cache: StoredBookmark[] | null = null;

async function load(): Promise<StoredBookmark[]> {
  if (cache) return cache;
  cache = await readJson<StoredBookmark[]>(FILE, []);
  return cache;
}

async function persist(list: StoredBookmark[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function getUserBookmarks(email: string): Promise<number[]> {
  const all = await load();
  const lowerEmail = email.toLowerCase().trim();
  return all
    .filter((b) => b.userEmail.toLowerCase().trim() === lowerEmail)
    .map((b) => b.propertyId);
}

export async function syncUserBookmarks(email: string, propertyIds: number[]): Promise<void> {
  const all = await load();
  const lowerEmail = email.toLowerCase().trim();
  
  // Remove existing bookmarks for this user first
  const next = all.filter((b) => b.userEmail.toLowerCase().trim() !== lowerEmail);
  
  // Add new bookmarks
  const now = new Date().toISOString();
  let maxId = all.reduce((m, b) => Math.max(m, b.id), 0);
  
  const newBookmarks = propertyIds.map((id) => {
    maxId++;
    return {
      id: maxId,
      userEmail: lowerEmail,
      propertyId: Number(id),
      createdAt: now,
    };
  });
  
  await persist([...next, ...newBookmarks]);
}

export async function toggleUserBookmark(email: string, propertyId: number): Promise<boolean> {
  const all = await load();
  const lowerEmail = email.toLowerCase().trim();
  
  const existingIndex = all.findIndex(
    (b) => b.userEmail.toLowerCase().trim() === lowerEmail && b.propertyId === propertyId
  );
  
  if (existingIndex !== -1) {
    // Remove
    const next = all.filter((_, idx) => idx !== existingIndex);
    await persist(next);
    return false; // Not bookmarked now
  } else {
    // Add
    const maxId = all.reduce((m, b) => Math.max(m, b.id), 0);
    const next: StoredBookmark = {
      id: maxId + 1,
      userEmail: lowerEmail,
      propertyId: Number(propertyId),
      createdAt: new Date().toISOString(),
    };
    await persist([...all, next]);
    return true; // Bookmarked now
  }
}
