import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments as appointmentsTable } from "@/lib/db/schema";
import { updateLocalAppointmentStatus } from "@/lib/store/appointments";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/auth-helpers";
import { createAuditLog } from "@/lib/db/dbLoader";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authorization
  const authCheck = await requireAdminApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }
  const adminUser = authCheck.user;

  try {
    const { id } = await params;
    const { status } = await req.json().catch(() => ({ status: "" }));

    if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Try DB first if ID is numeric
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      try {
        const dbUrl = process.env.DATABASE_URL || "";
        const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

        if (isDbValid) {
          const [updated] = await db
            .update(appointmentsTable)
            .set({ status })
            .where(eq(appointmentsTable.id, numericId))
            .returning();

          if (updated) {
            await createAuditLog(
              adminUser.email,
              "update_appointment",
              `Updated appointment #${id} ("${updated.name}") to status "${status}"`
            );
            return NextResponse.json({ success: true, appointment: updated, source: "database" });
          }
        }
      } catch (dbErr) {
        console.warn("DB update failed for appointment, falling back to JSON:", dbErr);
      }
    }

    // Fallback: update local JSON store
    const updatedLocal = await updateLocalAppointmentStatus(id, status as any);
    if (updatedLocal) {
      await createAuditLog(
        adminUser.email,
        "update_appointment",
        `Updated local appointment "${id}" ("${updatedLocal.name}") to status "${status}"`
      );
      return NextResponse.json({ success: true, appointment: updatedLocal, source: "local" });
    }

    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  } catch (err) {
    console.error("Appointment update error:", err);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
