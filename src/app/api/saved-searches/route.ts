import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, isDbConfigured } from "@/lib/db";
import { savedSearches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getUserSavedSearches,
  addSavedSearch,
  toggleSavedSearchAlert,
  deleteSavedSearch,
} from "@/lib/store/savedSearches";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  try {
    if (!isDbConfigured) {
      const list = await getUserSavedSearches(email);
      return NextResponse.json({ list });
    }

    const list = await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userEmail, email));

    return NextResponse.json({ list });
  } catch (err) {
    console.error("GET saved-searches error:", err);
    return NextResponse.json({ error: "Failed to fetch saved searches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  let body: { id?: number; query?: string; filters?: Record<string, any>; alertEnabled?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // 1. Toggle alert status
    if (body.id !== undefined && body.alertEnabled !== undefined) {
      const id = Number(body.id);
      const enabled = Boolean(body.alertEnabled);

      if (!isDbConfigured) {
        const success = await toggleSavedSearchAlert(id, enabled);
        return NextResponse.json({ success });
      }

      await db
        .update(savedSearches)
        .set({ alertEnabled: enabled })
        .where(and(eq(savedSearches.id, id), eq(savedSearches.userEmail, email)));

      return NextResponse.json({ success: true });
    }

    // 2. Add new saved search
    if (body.query) {
      const searchStr = body.query;
      const filtersStr = body.filters ? JSON.stringify(body.filters) : "{}";

      if (!isDbConfigured) {
        const item = await addSavedSearch(email, searchStr, filtersStr);
        return NextResponse.json({ success: true, item });
      }

      const [item] = await db
        .insert(savedSearches)
        .values({
          userEmail: email,
          query: searchStr,
          filters: filtersStr,
          alertEnabled: true,
        })
        .returning();

      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (err) {
    console.error("POST saved-searches error:", err);
    return NextResponse.json({ error: "Failed to update saved searches" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const searchId = Number(id);

    if (!isDbConfigured) {
      const success = await deleteSavedSearch(searchId);
      return NextResponse.json({ success });
    }

    await db
      .delete(savedSearches)
      .where(and(eq(savedSearches.id, searchId), eq(savedSearches.userEmail, email)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE saved-searches error:", err);
    return NextResponse.json({ error: "Failed to delete saved search" }, { status: 500 });
  }
}
