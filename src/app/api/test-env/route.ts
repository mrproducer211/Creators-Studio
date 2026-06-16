import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments as appointmentsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const envKeys = Object.keys(process.env);
  const dbConfigured = !!process.env.DATABASE_URL;

  let dbTest = "not_run";
  let dbError = null;

  let insertTest = "not_run";
  let insertError = null;

  try {
    const res = await db.select().from(appointmentsTable).limit(1);
    dbTest = `select_success_count_${res.length}`;
  } catch (err: any) {
    dbTest = "select_failed";
    dbError = err.message || String(err);
  }

  try {
    const [inserted] = await db
      .insert(appointmentsTable)
      .values({
        name: "Test Insert",
        email: "test@example.com",
        phone: "123456",
        date: "2026-06-20",
        timeSlot: "10:30 AM",
        message: "Test message",
        status: "pending",
      })
      .returning();
    insertTest = `insert_success_id_${inserted.id}`;

    // Clean up
    await db.delete(appointmentsTable).where(eq(appointmentsTable.id, inserted.id));
  } catch (err: any) {
    insertTest = "insert_failed";
    insertError = err.message || String(err);
  }

  return NextResponse.json({
    envKeys,
    dbConfigured,
    dbTest,
    dbError,
    insertTest,
    insertError,
    vercelEnv: process.env.VERCEL_ENV || "unknown",
  });
}
