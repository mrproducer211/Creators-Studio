import { NextRequest, NextResponse } from "next/server";
import { requireAgentApi } from "@/lib/auth-helpers";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAllEnquiries, setEnquiryStatus } from "@/lib/store/enquiries";
import { findLeadByEmail } from "@/lib/store/leads";
import { db, isDbConfigured } from "@/lib/db";
import { enquiries as enquiriesTable, properties as propertiesTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  const agentEmail = guard.user.email;

  try {
    const agent = await findLeadByEmail(agentEmail);
    if (!agent || agent.agentStatus !== "approved") {
      return NextResponse.json({ error: "Your account is not approved to access leads." }, { status: 403 });
    }

    // 1. Get all properties uploaded by this agent
    let agentPropertySlugs: string[] = [];
    let agentPropertyIds: number[] = [];
    
    if (isDbConfigured) {
      // Fetch all properties from DB and filter by agentEmail in JS to prevent schema mismatch crashes
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
      return NextResponse.json({ success: true, enquiries: [] });
    }

    // 2. Fetch and filter enquiries matching this agent's properties
    if (isDbConfigured) {
      const dbEnquiries = await db
        .select()
        .from(enquiriesTable)
        .where(inArray(enquiriesTable.propertyId, agentPropertyIds));
      return NextResponse.json({ success: true, enquiries: dbEnquiries });
    } else {
      const allEnquiries = await getAllEnquiries();
      const filteredEnquiries = allEnquiries.filter(e => 
        agentPropertySlugs.includes(e.propertySlug) || 
        ("propertyId" in e && typeof (e as any).propertyId === "number" && agentPropertyIds.includes((e as any).propertyId))
      );
      return NextResponse.json({ success: true, enquiries: filteredEnquiries });
    }
  } catch (err) {
    console.error("Failed to fetch agent leads:", err);
    return NextResponse.json({ error: "Failed to fetch leads." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Enquiry ID and status are required." }, { status: 400 });
    }

    if (isDbConfigured) {
      const updated = await db
        .update(enquiriesTable)
        .set({ status })
        .where(eq(enquiriesTable.id, Number(id)))
        .returning();
      return NextResponse.json({ success: true, enquiry: updated[0] });
    } else {
      const updated = await setEnquiryStatus(id, status);
      if (!updated) {
        return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, enquiry: updated });
    }
  } catch (err) {
    console.error("Failed to update enquiry status:", err);
    return NextResponse.json({ error: "Failed to update enquiry." }, { status: 500 });
  }
}
