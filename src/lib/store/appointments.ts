import { readJson, writeJson } from "./fileStore";

export interface StoredAppointment {
  id:           string;
  propertyId?:  number;
  propertyName?: string;
  propertySlug?: string;
  name:         string;
  email:        string;
  phone:        string;
  date:         string;
  timeSlot:     string;
  status:       "pending" | "confirmed" | "cancelled";
  message?:     string;
  createdAt:    string; // ISO timestamp
}

const FILE = "appointments.json";
let cache: StoredAppointment[] | null = null;

async function load(): Promise<StoredAppointment[]> {
  if (cache) return cache;
  cache = await readJson<StoredAppointment[]>(FILE, []);
  return cache;
}

async function persist(list: StoredAppointment[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function getAllLocalAppointments(): Promise<StoredAppointment[]> {
  const all = await load();
  return [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addLocalAppointment(input: Omit<StoredAppointment, "id" | "createdAt" | "status">): Promise<StoredAppointment> {
  const all = await load();
  const next: StoredAppointment = {
    ...input,
    id:        `apt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status:    "pending",
  };
  await persist([next, ...all]);
  return next;
}

export async function updateLocalAppointmentStatus(id: string, status: StoredAppointment["status"]): Promise<StoredAppointment | null> {
  const all = await load();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const updated = { ...all[idx], status };
  const next = [...all];
  next[idx] = updated;
  await persist(next);
  return updated;
}
