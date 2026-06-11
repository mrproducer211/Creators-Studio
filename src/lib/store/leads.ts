import { readJson, writeJson } from "./fileStore";
import { hash } from "bcryptjs";
import { db, isDbConfigured } from "@/lib/db";
import { leads as leadsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface LeadUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role: "user" | "agent";
  agentStatus?: "pending" | "approved" | "rejected";
  postingRestricted?: boolean;
  requireVerification?: boolean;
}

const FILE = "leads.json";

async function load(): Promise<LeadUser[]> {
  return await readJson<LeadUser[]>(FILE, []);
}

async function persist(list: LeadUser[]): Promise<void> {
  await writeJson(FILE, list);
}

export async function getAllLeads(): Promise<LeadUser[]> {
  if (isDbConfigured) {
    const list = await db.select().from(leadsTable);
    return list.map(l => ({
      id: l.id,
      name: l.name,
      email: l.email,
      passwordHash: l.passwordHash,
      role: l.role as "user" | "agent",
      agentStatus: l.agentStatus as "pending" | "approved" | "rejected" | undefined,
      postingRestricted: l.postingRestricted,
      requireVerification: l.requireVerification,
      createdAt: l.createdAt.toISOString(),
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const all = await load();
  return [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findLeadByEmail(email: string): Promise<LeadUser | null> {
  const lower = email.toLowerCase();
  if (isDbConfigured) {
    const list = await db.select().from(leadsTable).where(eq(leadsTable.email, lower)).limit(1);
    if (list.length === 0) return null;
    const l = list[0];
    return {
      id: l.id,
      name: l.name,
      email: l.email,
      passwordHash: l.passwordHash,
      role: l.role as "user" | "agent",
      agentStatus: l.agentStatus as "pending" | "approved" | "rejected" | undefined,
      postingRestricted: l.postingRestricted,
      requireVerification: l.requireVerification,
      createdAt: l.createdAt.toISOString(),
    };
  }
  const all = await load();
  return all.find((u) => u.email.toLowerCase() === lower) ?? null;
}

export async function createLead(name: string, email: string, passwordPlain: string): Promise<LeadUser> {
  const lower = email.toLowerCase();
  
  if (isDbConfigured) {
    const existing = await db.select().from(leadsTable).where(eq(leadsTable.email, lower)).limit(1);
    if (existing.length > 0) {
      throw new Error("Email address already registered.");
    }
  } else {
    const all = await load();
    const existing = all.find((u) => u.email.toLowerCase() === lower);
    if (existing) {
      throw new Error("Email address already registered.");
    }
  }

  const passwordHash = await hash(passwordPlain, 10);
  const next: LeadUser = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: lower,
    passwordHash,
    createdAt: new Date().toISOString(),
    role: "user",
  };

  if (isDbConfigured) {
    await db.insert(leadsTable).values({
      id: next.id,
      name: next.name,
      email: next.email,
      passwordHash: next.passwordHash,
      role: next.role,
      createdAt: new Date(next.createdAt),
    });
  } else {
    const all = await load();
    await persist([next, ...all]);
  }
  return next;
}

export async function createAgent(name: string, email: string, passwordPlain: string): Promise<LeadUser> {
  const lower = email.toLowerCase();
  
  if (isDbConfigured) {
    const existing = await db.select().from(leadsTable).where(eq(leadsTable.email, lower)).limit(1);
    if (existing.length > 0) {
      throw new Error("Email address already registered.");
    }
  } else {
    const all = await load();
    const existing = all.find((u) => u.email.toLowerCase() === lower);
    if (existing) {
      throw new Error("Email address already registered.");
    }
  }

  const passwordHash = await hash(passwordPlain, 10);
  const next: LeadUser = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: lower,
    passwordHash,
    createdAt: new Date().toISOString(),
    role: "agent",
    agentStatus: "pending",
  };

  if (isDbConfigured) {
    await db.insert(leadsTable).values({
      id: next.id,
      name: next.name,
      email: next.email,
      passwordHash: next.passwordHash,
      role: next.role,
      agentStatus: next.agentStatus,
      createdAt: new Date(next.createdAt),
    });
  } else {
    const all = await load();
    await persist([next, ...all]);
  }
  return next;
}

export async function getAllAgents(): Promise<LeadUser[]> {
  if (isDbConfigured) {
    const list = await db.select().from(leadsTable).where(eq(leadsTable.role, "agent"));
    const mapped = list.map(l => ({
      id: l.id,
      name: l.name,
      email: l.email,
      passwordHash: l.passwordHash,
      role: l.role as "user" | "agent",
      agentStatus: l.agentStatus as "pending" | "approved" | "rejected" | undefined,
      postingRestricted: l.postingRestricted,
      requireVerification: l.requireVerification,
      createdAt: l.createdAt.toISOString(),
    }));
    return mapped.sort((a, b) => {
      const statusA = a.agentStatus || "pending";
      const statusB = b.agentStatus || "pending";
      if (statusA === "pending" && statusB !== "pending") return -1;
      if (statusA !== "pending" && statusB === "pending") return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }
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
  if (isDbConfigured) {
    const res = await db.update(leadsTable).set({ agentStatus: status }).where(eq(leadsTable.id, id)).returning();
    return res.length > 0;
  }
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

export async function updateAgentRestrictions(
  id: string,
  patch: { postingRestricted?: boolean; requireVerification?: boolean }
): Promise<boolean> {
  if (isDbConfigured) {
    const res = await db.update(leadsTable).set(patch).where(eq(leadsTable.id, id)).returning();
    return res.length > 0;
  }
  const all = await load();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  
  all[idx] = {
    ...all[idx],
    ...patch,
  };
  
  await persist(all);
  return true;
}

export async function deleteLead(id: string): Promise<boolean> {
  if (isDbConfigured) {
    const res = await db.delete(leadsTable).where(eq(leadsTable.id, id)).returning();
    return res.length > 0;
  }
  const all = await load();
  const next = all.filter((u) => u.id !== id);
  if (next.length === all.length) return false;
  await persist(next);
  return true;
}

export async function updateAgentProfile(
  email: string,
  patch: { name?: string; passwordPlain?: string }
): Promise<boolean> {
  const lower = email.toLowerCase();
  
  const patchData: { name?: string; passwordHash?: string } = {};
  if (patch.name) {
    patchData.name = patch.name;
  }
  if (patch.passwordPlain) {
    patchData.passwordHash = await hash(patch.passwordPlain, 10);
  }

  if (isDbConfigured) {
    const res = await db.update(leadsTable).set(patchData).where(eq(leadsTable.email, lower)).returning();
    return res.length > 0;
  }
  
  const all = await load();
  const idx = all.findIndex((u) => u.email.toLowerCase() === lower);
  if (idx === -1) return false;

  const updated: LeadUser = { ...all[idx] };
  if (patch.name) {
    updated.name = patch.name;
  }
  if (patch.passwordPlain) {
    updated.passwordHash = patchData.passwordHash!;
  }

  all[idx] = updated;
  await persist(all);
  return true;
}
