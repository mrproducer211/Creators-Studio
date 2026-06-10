import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, isDbConfigured } from "@/lib/db";
import {
  sharedShortlists,
  shortlistProperties,
  shortlistComments,
} from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import {
  getUserShortlists,
  createShortlist,
  addPropertyToShortlist,
  removePropertyFromShortlist,
  getShortlistProperties,
  getShortlistComments,
  addShortlistComment,
  deleteShortlist,
} from "@/lib/store/collaborations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const { searchParams } = new URL(req.url);
  const shortlistIdStr = searchParams.get("shortlistId");
  const propertyIdStr = searchParams.get("propertyId");

  try {
    // 1. Fetch comments for a specific property in a shortlist
    if (shortlistIdStr && propertyIdStr) {
      const shortlistId = Number(shortlistIdStr);
      const propertyId = Number(propertyIdStr);

      if (!isDbConfigured) {
        const comments = await getShortlistComments(shortlistId, propertyId);
        return NextResponse.json({ comments });
      }

      const comments = await db
        .select()
        .from(shortlistComments)
        .where(
          and(
            eq(shortlistComments.shortlistId, shortlistId),
            eq(shortlistComments.propertyId, propertyId)
          )
        )
        .orderBy(shortlistComments.createdAt);

      return NextResponse.json({ comments });
    }

    // 2. Fetch properties in a shortlist
    if (shortlistIdStr) {
      const shortlistId = Number(shortlistIdStr);

      if (!isDbConfigured) {
        const propertyIds = await getShortlistProperties(shortlistId);
        return NextResponse.json({ propertyIds });
      }

      const records = await db
        .select({ propertyId: shortlistProperties.propertyId })
        .from(shortlistProperties)
        .where(eq(shortlistProperties.shortlistId, shortlistId));

      const propertyIds = records.map((r) => r.propertyId);
      return NextResponse.json({ propertyIds });
    }

    // 3. Fetch all shortlists for the user
    if (!isDbConfigured) {
      const shortlists = await getUserShortlists(email);
      return NextResponse.json({ shortlists });
    }

    const shortlists = await db
      .select()
      .from(sharedShortlists)
      .where(
        or(
          eq(sharedShortlists.ownerEmail, email),
          eq(sharedShortlists.collaboratorEmail, email)
        )
      );

    return NextResponse.json({ shortlists });
  } catch (err) {
    console.error("GET collaborations error:", err);
    return NextResponse.json({ error: "Failed to fetch collaborations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const name = session.user.name || email.split("@")[0];

  let body: {
    action: "create" | "addProperty" | "removeProperty" | "addComment";
    name?: string;
    collaboratorEmail?: string;
    shortlistId?: number;
    propertyId?: number;
    comment?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // 1. Create a shortlist
    if (body.action === "create") {
      if (!body.name || !body.collaboratorEmail) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      if (!isDbConfigured) {
        const item = await createShortlist(email, body.collaboratorEmail, body.name);
        return NextResponse.json({ success: true, item });
      }

      const [item] = await db
        .insert(sharedShortlists)
        .values({
          ownerEmail: email,
          collaboratorEmail: body.collaboratorEmail.toLowerCase().trim(),
          name: body.name,
        })
        .returning();

      return NextResponse.json({ success: true, item });
    }

    // 2. Add property to shortlist
    if (body.action === "addProperty") {
      if (body.shortlistId === undefined || body.propertyId === undefined) {
        return NextResponse.json({ error: "Missing shortlistId or propertyId" }, { status: 400 });
      }

      const shortlistId = Number(body.shortlistId);
      const propertyId = Number(body.propertyId);

      if (!isDbConfigured) {
        await addPropertyToShortlist(shortlistId, propertyId);
        return NextResponse.json({ success: true });
      }

      await db
        .insert(shortlistProperties)
        .values({ shortlistId, propertyId })
        .onConflictDoNothing();

      return NextResponse.json({ success: true });
    }

    // 3. Remove property from shortlist
    if (body.action === "removeProperty") {
      if (body.shortlistId === undefined || body.propertyId === undefined) {
        return NextResponse.json({ error: "Missing shortlistId or propertyId" }, { status: 400 });
      }

      const shortlistId = Number(body.shortlistId);
      const propertyId = Number(body.propertyId);

      if (!isDbConfigured) {
        await removePropertyFromShortlist(shortlistId, propertyId);
        return NextResponse.json({ success: true });
      }

      await db
        .delete(shortlistProperties)
        .where(
          and(
            eq(shortlistProperties.shortlistId, shortlistId),
            eq(shortlistProperties.propertyId, propertyId)
          )
        );

      return NextResponse.json({ success: true });
    }

    // 4. Add comment to shortlist property
    if (body.action === "addComment") {
      if (body.shortlistId === undefined || body.propertyId === undefined || !body.comment) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      const shortlistId = Number(body.shortlistId);
      const propertyId = Number(body.propertyId);
      const commentText = body.comment;

      if (!isDbConfigured) {
        const item = await addShortlistComment(shortlistId, propertyId, email, name, commentText);
        return NextResponse.json({ success: true, item });
      }

      const [item] = await db
        .insert(shortlistComments)
        .values({
          shortlistId,
          propertyId,
          userEmail: email,
          userName: name,
          comment: commentText,
        })
        .returning();

      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST collaborations error:", err);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const { searchParams } = new URL(req.url);
  const idStr = searchParams.get("id");

  if (!idStr) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const id = Number(idStr);

    if (!isDbConfigured) {
      await deleteShortlist(id);
      return NextResponse.json({ success: true });
    }

    // Only allow owner/collaborator to delete
    const [shortlist] = await db
      .select()
      .from(sharedShortlists)
      .where(
        and(
          eq(sharedShortlists.id, id),
          or(
            eq(sharedShortlists.ownerEmail, email),
            eq(sharedShortlists.collaboratorEmail, email)
          )
        )
      )
      .limit(1);

    if (!shortlist) {
      return NextResponse.json({ error: "Shortlist not found or unauthorized" }, { status: 404 });
    }

    await db.delete(sharedShortlists).where(eq(sharedShortlists.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE collaborations error:", err);
    return NextResponse.json({ error: "Failed to delete shortlist" }, { status: 500 });
  }
}
