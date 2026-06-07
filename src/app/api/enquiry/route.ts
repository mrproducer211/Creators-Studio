import { NextRequest, NextResponse } from "next/server";
import { buildTelegramMessage, sendTelegramMessage, EnquiryPayload } from "@/lib/telegram";
import { addEnquiry } from "@/lib/store/enquiries";
import { db, isDbConfigured } from "@/lib/db";
import { enquiries as enquiriesTable, properties as propertiesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Simple in-memory rate limiter (resets on cold start — good enough for MVP)
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS    = 60_000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const hits  = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return hits.length > MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  // Parse body
  let body: Partial<EnquiryPayload>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Validate required fields
  const { propertySlug, propertyName, name, contact, method, source } = body;
  if (!propertySlug || !propertyName || !name || !contact || !method || !source) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (name.length > 200 || contact.length > 200) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 });
  }

  // Build base URL
  const baseUrl = process.env.NEXTAUTH_URL ?? `https://${req.headers.get("host") ?? "nhp-bangkok.com"}`;

  // Persist enquiry (Database or Local File Store)
  try {
    if (isDbConfigured) {
      // Resolve propertyId from propertySlug if possible
      let resolvedPropertyId: number | null = null;
      if (body.propertySlug) {
        const prop = await db
          .select({ id: propertiesTable.id })
          .from(propertiesTable)
          .where(eq(propertiesTable.slug, body.propertySlug))
          .limit(1);
        if (prop.length > 0) {
          resolvedPropertyId = prop[0].id;
        }
      }

      await db.insert(enquiriesTable).values({
        propertyId: resolvedPropertyId,
        name: body.name!,
        contact: body.contact!,
        method: body.method!,
        message: body.message || null,
        status: "new",
      });
    } else {
      await addEnquiry({
        propertySlug: body.propertySlug!,
        propertyName: body.propertyName!,
        listingType:  body.listingType!,
        price:        body.price!,
        area:         body.area!,
        name:         body.name!,
        contact:      body.contact!,
        method:       body.method!,
        message:      body.message,
        source:       body.source!,
        tourDate:     body.tourDate,
        tourTime:     body.tourTime,
      });
    }
  } catch (err) {
    // Persistence failure shouldn't block Telegram — log and continue.
    console.error("Enquiry persist error:", err);
  }

  try {
    const text = buildTelegramMessage(body as EnquiryPayload, baseUrl);
    await sendTelegramMessage(text);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Enquiry send error:", err);
    return NextResponse.json({ error: "Failed to send enquiry. Please try again." }, { status: 500 });
  }
}
