import { readJson, writeJson } from "./fileStore";

export interface StoredShortlist {
  id: number;
  ownerEmail: string;
  collaboratorEmail: string;
  name: string;
  createdAt: string;
}

export interface StoredShortlistProperty {
  id: number;
  shortlistId: number;
  propertyId: number;
  createdAt: string;
}

export interface StoredShortlistComment {
  id: number;
  shortlistId: number;
  propertyId: number;
  userEmail: string;
  userName: string;
  comment: string;
  createdAt: string;
}

interface CollabData {
  shortlists: StoredShortlist[];
  properties: StoredShortlistProperty[];
  comments: StoredShortlistComment[];
}

const FILE = "collaborations.json";
let cache: CollabData | null = null;

async function load(): Promise<CollabData> {
  if (cache) return cache;
  cache = await readJson<CollabData>(FILE, { shortlists: [], properties: [], comments: [] });
  return cache;
}

async function persist(data: CollabData): Promise<void> {
  cache = data;
  await writeJson(FILE, data);
}

export async function getUserShortlists(email: string): Promise<StoredShortlist[]> {
  const data = await load();
  const lowerEmail = email.toLowerCase().trim();
  return data.shortlists.filter(
    (s) =>
      s.ownerEmail.toLowerCase().trim() === lowerEmail ||
      s.collaboratorEmail.toLowerCase().trim() === lowerEmail
  );
}

export async function createShortlist(
  ownerEmail: string,
  collaboratorEmail: string,
  name: string
): Promise<StoredShortlist> {
  const data = await load();
  const lowerOwner = ownerEmail.toLowerCase().trim();
  const lowerCollab = collaboratorEmail.toLowerCase().trim();
  const maxId = data.shortlists.reduce((m, s) => Math.max(m, s.id), 0);

  const newShortlist: StoredShortlist = {
    id: maxId + 1,
    ownerEmail: lowerOwner,
    collaboratorEmail: lowerCollab,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  data.shortlists.push(newShortlist);
  await persist(data);
  return newShortlist;
}

export async function addPropertyToShortlist(
  shortlistId: number,
  propertyId: number
): Promise<StoredShortlistProperty | null> {
  const data = await load();
  
  // Check if already exists
  const existing = data.properties.find(
    (p) => p.shortlistId === shortlistId && p.propertyId === propertyId
  );
  if (existing) return existing;

  const maxId = data.properties.reduce((m, p) => Math.max(m, p.id), 0);
  const newProp: StoredShortlistProperty = {
    id: maxId + 1,
    shortlistId,
    propertyId,
    createdAt: new Date().toISOString(),
  };

  data.properties.push(newProp);
  await persist(data);
  return newProp;
}

export async function removePropertyFromShortlist(
  shortlistId: number,
  propertyId: number
): Promise<boolean> {
  const data = await load();
  const initialLen = data.properties.length;
  data.properties = data.properties.filter(
    (p) => !(p.shortlistId === shortlistId && p.propertyId === propertyId)
  );

  if (data.properties.length === initialLen) return false;
  await persist(data);
  return true;
}

export async function getShortlistProperties(shortlistId: number): Promise<number[]> {
  const data = await load();
  return data.properties
    .filter((p) => p.shortlistId === shortlistId)
    .map((p) => p.propertyId);
}

export async function getShortlistComments(
  shortlistId: number,
  propertyId: number
): Promise<StoredShortlistComment[]> {
  const data = await load();
  return data.comments
    .filter((c) => c.shortlistId === shortlistId && c.propertyId === propertyId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function addShortlistComment(
  shortlistId: number,
  propertyId: number,
  userEmail: string,
  userName: string,
  comment: string
): Promise<StoredShortlistComment> {
  const data = await load();
  const maxId = data.comments.reduce((m, c) => Math.max(m, c.id), 0);

  const newComment: StoredShortlistComment = {
    id: maxId + 1,
    shortlistId,
    propertyId,
    userEmail: userEmail.toLowerCase().trim(),
    userName,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };

  data.comments.push(newComment);
  await persist(data);
  return newComment;
}

export async function deleteShortlist(shortlistId: number): Promise<boolean> {
  const data = await load();
  const initialLen = data.shortlists.length;
  data.shortlists = data.shortlists.filter((s) => s.id !== shortlistId);
  
  if (data.shortlists.length === initialLen) return false;

  // Clean up references
  data.properties = data.properties.filter((p) => p.shortlistId !== shortlistId);
  data.comments = data.comments.filter((c) => c.shortlistId !== shortlistId);

  await persist(data);
  return true;
}
