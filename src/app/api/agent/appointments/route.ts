import { NextRequest, NextResponse } from "next/server";
import { requireAgentApi } from "@/lib/auth-helpers";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAllLocalAppointments, updateLocalAppointmentStatus } from "@/lib/store/appointments";
import { findLeadByEmail } from "@/lib/store/leads";
import { db, isDbConfigured } from "@/lib/db";
import { appointments as appointmentsTable, properties as propertiesTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  const agentEmail = guard.user.email;

  try {
    const agent = await findLeadByEmail(agentEmail);
    if (!agent || agent.agentStatus !== "approved") {
      return NextResponse.json({ error: "Your account is not approved to access bookings." }, { status: 403 });
    }

    // 1. Get all properties uploaded by this agent
    let agentPropertySlugs: string[] = [];
    let agentPropertyIds: number[] = [];
    
    if (isDbConfigured) {
      const list = await db.select().from(propertiesTable);
      const filtered = list.filter((p: any) => p.agentEmail === agentEmail);
      agentPropertySlugs = filtered.map(p => p.slug);
      agentPropertyIds = filtered.map(p => p.id);
    } else {
      const allProps = await getDbProperties();
      const filtered = allProps.filter((p: any) => p.agentEmail === agentEmail);
      agentPropertySlugs = filtered.map(p => p.slug);
      agentPropertyIds = filtered.map(p => p.id);
    }

    if (agentPropertySlugs.length === 0) {
      return NextResponse.json({ success: true, appointments: [] });
    }

    // 2. Fetch and filter appointments matching this agent's properties
    if (isDbConfigured) {
      const dbAppointments = await db
        .select()
        .from(appointmentsTable)
        .where(inArray(appointmentsTable.propertyId, agentPropertyIds));
      return NextResponse.json({ success: true, appointments: dbAppointments });
    } else {
      const allAppts = await getAllLocalAppointments();
      const filteredAppts = allAppts.filter(a => 
        (a.propertySlug && agentPropertySlugs.includes(a.propertySlug)) ||
        (a.propertyId && agentPropertyIds.includes(a.propertyId))
      );
      return NextResponse.json({ success: true, appointments: filteredAppts });
    }
  } catch (err) {
    console.error("Failed to fetch agent bookings:", err);
    return NextResponse.json({ error: "Failed to fetch bookings." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Appointment ID and status are required." }, { status: 400 });
    }

    if (isDbConfigured) {
      const updated = await db
        .update(appointmentsTable)
        .set({ status })
        .where(eq(appointmentsTable.id, Number(id)))
        .returning();
      return NextResponse.json({ success: true, appointment: updated[0] });
    } else {
      const updated = await updateLocalAppointmentStatus(id, status);
      if (!updated) {
        return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, appointment: updated });
    }
  } catch (err) {
    console.error("Failed to update appointment status:", err);
    return NextResponse.json({ error: "Failed to update appointment." }, { status: 500 });
  }
}
