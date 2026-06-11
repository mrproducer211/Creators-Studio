import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "@/lib/store/leads";

// Simple in-memory rate limiter (resets on cold start)
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS    = 60_000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const hits  = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return hits.length > MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const agent = await createAgent(name, email, password);
    return NextResponse.json({ success: true, agent: { id: agent.id, name: agent.name, email: agent.email } });
  } catch (err) {
    console.error("Agent registration error:", err);
    const message = err instanceof Error ? err.message : "Failed to register agent account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
