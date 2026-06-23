import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getAllAgents, updateAgentStatus, updateAgentRestrictions } from "@/lib/store/leads";

export async function GET() {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  try {
    const agents = await getAllAgents();
    return NextResponse.json({ success: true, agents });
  } catch (err) {
    console.error("Failed to fetch agents:", err);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  try {
    const { id, status, postingRestricted, requireVerification } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required." }, { status: 400 });
    }

    if (status !== undefined) {
      if (!["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
      }
      const success = await updateAgentStatus(id, status);
      if (!success) {
        return NextResponse.json({ error: "Agent not found." }, { status: 404 });
      }
    }

    const restrictionPatch: { postingRestricted?: boolean; requireVerification?: boolean } = {};
    if (postingRestricted !== undefined) restrictionPatch.postingRestricted = !!postingRestricted;
    if (requireVerification !== undefined) restrictionPatch.requireVerification = !!requireVerification;

    if (Object.keys(restrictionPatch).length > 0) {
      const success = await updateAgentRestrictions(id, restrictionPatch);
      if (!success) {
        return NextResponse.json({ error: "Agent not found for updating restrictions." }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update agent details:", err);
    return NextResponse.json({ error: "Failed to update agent details." }, { status: 500 });
  }
}
