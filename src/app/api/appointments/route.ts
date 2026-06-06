import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments as appointmentsTable } from "@/lib/db/schema";
import { addLocalAppointment } from "@/lib/store/appointments";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { propertyId, propertyName, propertySlug, name, email, phone, date, timeSlot, message } = body;

    if (!name || !email || !phone || !date || !timeSlot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
        return NextResponse.json({ success: true, appointment: inserted, source: "database" });
      }
    } catch (dbErr) {
      console.warn("Postgres insert failed for appointment, falling back to JSON store:", dbErr);
    }

    // Fallback: Write to local JSON store
    const localApt = await addLocalAppointment({
      propertyId: propertyId ? Number(propertyId) : undefined,
      propertyName,
      propertySlug,
      name,
      email,
      phone,
      date,
      timeSlot,
      message,
    });

    return NextResponse.json({ success: true, appointment: localApt, source: "local" });
  } catch (err) {
    console.error("Failed to create appointment:", err);
    return NextResponse.json({ error: "Failed to schedule appointment" }, { status: 500 });
  }
}
