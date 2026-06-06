import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userBookmarks = await db
      .select({ propertyId: bookmarks.propertyId })
      .from(bookmarks)
      .where(eq(bookmarks.userEmail, session.user.email));

    const ids = userBookmarks.map((b) => b.propertyId);
    return NextResponse.json({ ids });
  } catch (err) {
    console.error("GET bookmarks error:", err);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  let body: { propertyId?: number; syncIds?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // 1. Batch sync local bookmarks on login
    if (body.syncIds && Array.isArray(body.syncIds)) {
      if (body.syncIds.length === 0) {
        return NextResponse.json({ success: true, count: 0 });
      }

      const values = body.syncIds.map((id) => ({
        userEmail: email,
        propertyId: Number(id),
      }));

      await db.insert(bookmarks).values(values).onConflictDoNothing();
      return NextResponse.json({ success: true, count: values.length });
    }

    // 2. Toggle single bookmark
    if (body.propertyId !== undefined) {
      const propertyId = Number(body.propertyId);

      const existing = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userEmail, email), eq(bookmarks.propertyId, propertyId)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .delete(bookmarks)
          .where(and(eq(bookmarks.userEmail, email), eq(bookmarks.propertyId, propertyId)));
        return NextResponse.json({ success: true, bookmarked: false });
      } else {
        await db.insert(bookmarks).values({
          userEmail: email,
          propertyId,
        });
        return NextResponse.json({ success: true, bookmarked: true });
      }
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (err) {
    console.error("POST bookmarks error:", err);
    return NextResponse.json({ error: "Failed to update bookmarks" }, { status: 500 });
  }
}
