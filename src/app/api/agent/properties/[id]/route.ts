import { NextRequest, NextResponse } from "next/server";
import { requireAgentApi } from "@/lib/auth-helpers";
import { findLeadByEmail } from "@/lib/store/leads";
import { getPropertyById, deleteProperty } from "@/lib/store/properties";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  const agentEmail = guard.user.email;
  const { id } = await params;
  const propertyId = Number(id);

  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
  }

  try {
    // Check if agent is approved
    const agent = await findLeadByEmail(agentEmail);
    if (!agent || agent.agentStatus !== "approved") {
      return NextResponse.json({ error: "Your account is not approved to manage listings." }, { status: 403 });
    }

    const prop = await getPropertyById(propertyId);
    if (!prop) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    // Verify ownership
    if ((prop as any).agentEmail !== agentEmail) {
      return NextResponse.json({ error: "You are not authorized to delete this property." }, { status: 403 });
    }

    const success = await deleteProperty(propertyId);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete property." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete property:", err);
    return NextResponse.json({ error: "Failed to delete property." }, { status: 500 });
  }
}
