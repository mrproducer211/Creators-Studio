import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/store/leads";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const lead = await createLead(name, email, password);
    return NextResponse.json({ success: true, lead: { id: lead.id, name: lead.name, email: lead.email } });
  } catch (err) {
    console.error("Registration error:", err);
    const message = err instanceof Error ? err.message : "Failed to register account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
