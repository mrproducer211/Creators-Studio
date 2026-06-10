import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, isDbConfigured } from "@/lib/db";
import { commuteHubs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getUserCommuteHubs,
  saveCommuteHub,
  deleteCommuteHub,
} from "@/lib/store/commuteHubs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  try {
    if (!isDbConfigured) {
      const list = await getUserCommuteHubs(email);
      return NextResponse.json({ list });
    }

    const rawList = await db
      .select()
      .from(commuteHubs)
      .where(eq(commuteHubs.userEmail, email));

    // Map numeric types back to standard numbers
    const list = rawList.map((h) => ({
      ...h,
      latitude: Number(h.latitude),
      longitude: Number(h.longitude),
    }));

    return NextResponse.json({ list });
  } catch (err) {
    console.error("GET commute-hubs error:", err);
    return NextResponse.json({ error: "Failed to fetch commute hubs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;

  let body: { name?: string; address?: string; latitude?: number; longitude?: number; transitMode?: "transit" | "driving" | "walking" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, address, latitude, longitude, transitMode } = body;
  if (!name || latitude === undefined || longitude === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const lat = Number(latitude);
    const lng = Number(longitude);
    const mode = transitMode || "transit";

    if (!isDbConfigured) {
      const item = await saveCommuteHub(email, name, address || "", lat, lng, mode);
      return NextResponse.json({ success: true, item });
    }

    // Check existing
    const existing = await db
      .select()
      .from(commuteHubs)
      .where(and(eq(commuteHubs.userEmail, email), eq(commuteHubs.name, name)))
      .limit(1);

    if (existing.length > 0) {
      const [item] = await db
        .update(commuteHubs)
        .set({
          address: address || "",
          latitude: String(lat),
          longitude: String(lng),
          transitMode: mode,
        })
        .where(and(eq(commuteHubs.userEmail, email), eq(commuteHubs.name, name)))
        .returning();

      return NextResponse.json({
        success: true,
        item: { ...item, latitude: Number(item.latitude), longitude: Number(item.longitude) },
      });
    } else {
      const [item] = await db
        .insert(commuteHubs)
        .values({
          userEmail: email,
          name,
          address: address || "",
          latitude: String(lat),
          longitude: String(lng),
          transitMode: mode,
        })
        .returning();

      return NextResponse.json({
        success: true,
        item: { ...item, latitude: Number(item.latitude), longitude: Number(item.longitude) },
      });
    }
  } catch (err) {
    console.error("POST commute-hubs error:", err);
    return NextResponse.json({ error: "Failed to save commute hub" }, { status: 500 });
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
    const hubId = Number(id);

    if (!isDbConfigured) {
      const success = await deleteCommuteHub(hubId);
      return NextResponse.json({ success });
    }

    await db
      .delete(commuteHubs)
      .where(and(eq(commuteHubs.id, hubId), eq(commuteHubs.userEmail, email)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE commute-hubs error:", err);
    return NextResponse.json({ error: "Failed to delete commute hub" }, { status: 500 });
  }
}
