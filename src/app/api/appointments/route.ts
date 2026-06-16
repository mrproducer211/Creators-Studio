import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments as appointmentsTable, properties as propertiesTable } from "@/lib/db/schema";
import { addLocalAppointment } from "@/lib/store/appointments";
import { eq } from "drizzle-orm";
import { sendTelegramMessage, buildAppointmentTelegramMessage } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId, propertyName, propertySlug, name, email, phone, date, timeSlot, message } = body;

    if (!name || !email || !phone || !date || !timeSlot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let resolvedName = propertyName;
    let resolvedSlug = propertySlug;

    // Resolve property details from DB if only propertyId is provided
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
      if (isDbValid && propertyId && (!resolvedName || !resolvedSlug)) {
        const prop = await db
          .select({ name: propertiesTable.name, slug: propertiesTable.slug })
          .from(propertiesTable)
          .where(eq(propertiesTable.id, Number(propertyId)))
          .limit(1);
        if (prop.length > 0) {
          resolvedName = prop[0].name;
          resolvedSlug = prop[0].slug;
        }
      }
    } catch (dbErr) {
      console.warn("Failed to resolve property details from db:", dbErr);
    }

    let createdAppointment: any = null;
    let source: "database" | "local" = "local";

    // Attempt to write to the Postgres Database
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
      
      if (isDbValid) {
        const [inserted] = await db
          .insert(appointmentsTable)
          .values({
            propertyId: propertyId ? Number(propertyId) : null,
            name,
            email,
            phone,
            date,
            timeSlot,
            message: message || null,
            status: "pending",
          })
          .returning();
        createdAppointment = inserted;
        source = "database";
      }
    } catch (dbErr) {
      console.warn("Postgres insert failed for appointment, falling back to JSON store:", dbErr);
    }

    // Fallback: Write to local JSON store
    if (!createdAppointment) {
      const localApt = await addLocalAppointment({
        propertyId: propertyId ? Number(propertyId) : undefined,
        propertyName: resolvedName,
        propertySlug: resolvedSlug,
        name,
        email,
        phone,
        date,
        timeSlot,
        message,
      });
      createdAppointment = localApt;
      source = "local";
    }

    // Send Telegram Notification
    try {
      const baseUrl = process.env.NEXTAUTH_URL ?? `https://${req.headers.get("host") ?? "nhp-bangkok.com"}`;
      const text = buildAppointmentTelegramMessage({
        propertySlug: resolvedSlug,
        propertyName: resolvedName,
        name,
        email,
        phone,
        date,
        timeSlot,
        message,
      }, baseUrl);
      await sendTelegramMessage(text);
    } catch (tgErr) {
      console.error("Failed to send appointment Telegram notification:", tgErr);
    }

    return NextResponse.json({ success: true, appointment: createdAppointment, source });
  } catch (err) {
    console.error("Failed to create appointment:", err);
    return NextResponse.json({ error: "Failed to schedule appointment" }, { status: 500 });
  }
}
