import { readJson, writeJson } from "./fileStore";
import { hash } from "bcryptjs";

export interface LeadUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role: "user" | "agent";
  agentStatus?: "pending" | "approved" | "rejected";
}

const FILE = "leads.json";

async function load(): Promise<LeadUser[]> {
  return await readJson<LeadUser[]>(FILE, []);
}

async function persist(list: LeadUser[]): Promise<void> {
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

export async function createAgent(name: string, email: string, passwordPlain: string): Promise<LeadUser> {
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
    role: "agent",
    agentStatus: "pending",
  };

  await persist([next, ...all]);
  return next;
}

export async function getAllAgents(): Promise<LeadUser[]> {
  const all = await load();
  const agents = all.filter((u) => u.role === "agent");
  return agents.sort((a, b) => {
    const statusA = a.agentStatus || "pending";
    const statusB = b.agentStatus || "pending";
    if (statusA === "pending" && statusB !== "pending") return -1;
    if (statusA !== "pending" && statusB === "pending") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function updateAgentStatus(id: string, status: "approved" | "rejected"): Promise<boolean> {
  const all = await load();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  
  all[idx] = {
    ...all[idx],
    agentStatus: status,
  };
  
  await persist(all);
  return true;
}

export async function deleteLead(id: string): Promise<boolean> {
  const all = await load();
  const next = all.filter((u) => u.id !== id);
  if (next.length === all.length) return false;
  await persist(next);
  return true;
}
