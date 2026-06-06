import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

/** Shape we expect on session.user after the JWT callback. */
export interface AdminUser {
  id:    string;
  email: string;
  name:  string;
  role:  "admin" | "user";
}

/** Server component / page guard — redirects if not an admin. */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await auth();
  const user    = session?.user as AdminUser | undefined;

  if (!user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}

/** API route guard — returns 401/403 instead of redirecting. */
export async function requireAdminApi(): Promise<{ user: AdminUser } | { error: NextResponse }> {
  const session = await auth();
  const user    = session?.user as AdminUser | undefined;

  if (!user) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  if (user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

/** Lightweight session reader for layouts that need the user but not enforcement. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const session = await auth();
  return (session?.user as AdminUser | undefined) ?? null;
}
