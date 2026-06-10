import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getAllAgents, updateAgentStatus } from "@/lib/store/leads";

export async function GET(req: NextRequest) {
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
    const { id, status } = await req.json();

    if (!id || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid agent ID or status." }, { status: 400 });
    }

    const success = await updateAgentStatus(id, status);
    if (!success) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update agent status:", err);
    return NextResponse.json({ error: "Failed to update agent status." }, { status: 500 });
  }
}
