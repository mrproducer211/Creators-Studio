import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments as appointmentsTable } from "@/lib/db/schema";

export async function GET() {
  const envKeys = Object.keys(process.env);
  const dbConfigured = !!process.env.DATABASE_URL;

  let dbTest = "not_run";
  let dbError = null;

  try {
    const res = await db.select().from(appointmentsTable).limit(1);
    dbTest = `success_count_${res.length}`;
  } catch (err: any) {
    dbTest = "failed";
    dbError = err.message || String(err);
  }

  return NextResponse.json({
    envKeys,
    dbConfigured,
    dbTest,
    dbError,
    vercelEnv: process.env.VERCEL_ENV || "unknown",
  });
}
