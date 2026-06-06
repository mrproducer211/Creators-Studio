import { readJson, writeJson } from "./fileStore";
import { hash } from "bcryptjs";

export interface LeadUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role: "user";
}

const FILE = "leads.json";

let cache: LeadUser[] | null = null;

async function load(): Promise<LeadUser[]> {
  if (cache) return cache;
  cache = await readJson<LeadUser[]>(FILE, []);
  return cache;
}

async function persist(list: LeadUser[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function getAllLeads(): Promise<LeadUser[]> {
  const all = await load();
  return [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findLeadByEmail(email: string): Promise<LeadUser | null> {
  const all = await load();
  const lower = email.toLowerCase();
  return all.find((u) => u.email.toLowerCase() === lower) ?? null;
}

export async function createLead(name: string, email: string, passwordPlain: string): Promise<LeadUser> {
  const all = await load();
  
  // Check duplicate email
  const existing = all.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("Email address already registered.");
  }

  const passwordHash = await hash(passwordPlain, 10);
  const next: LeadUser = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
    role: "user",
  };

  await persist([next, ...all]);
  return next;
}

export async function deleteLead(id: string): Promise<boolean> {
  const all = await load();
  const next = all.filter((u) => u.id !== id);
  if (next.length === all.length) return false;
  await persist(next);
  return true;
}
