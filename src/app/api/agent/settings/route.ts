import { NextRequest, NextResponse } from "next/server";
import { requireAgentApi } from "@/lib/auth-helpers";
import { findLeadByEmail, updateAgentProfile } from "@/lib/store/leads";

export async function POST(req: NextRequest) {
  const guard = await requireAgentApi();
  if ("error" in guard) return guard.error;

  const agentEmail = guard.user.email;

  try {
    const agent = await findLeadByEmail(agentEmail);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const body = await req.json();
    const { name, password } = body;

    const patch: { name?: string; passwordPlain?: string } = {};
    if (name && name.trim()) {
      patch.name = name.trim();
    }
    if (password && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
      }
      patch.passwordPlain = password;
    }

    if (!patch.name && !patch.passwordPlain) {
      return NextResponse.json({ error: "No changes requested." }, { status: 400 });
    }

    const success = await updateAgentProfile(agentEmail, patch);
    if (!success) {
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully." });
  } catch (err) {
    console.error("Failed to update agent profile settings:", err);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
