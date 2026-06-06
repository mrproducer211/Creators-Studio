import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const botToken = process.env.TELEGRAM_CHANNEL_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_CHANNEL_BOT_TOKEN or TELEGRAM_BOT_TOKEN env variable is missing." }, { status: 500 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.url) {
    return NextResponse.json({ error: "Webhook url is required." }, { status: 400 });
  }

  let targetUrl = body.url.trim();
  if (!targetUrl.includes("/api/webhooks/telegram")) {
    targetUrl = targetUrl.replace(/\/$/, "") + "/api/webhooks/telegram";
  }

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || "nhp_webhook_secret_key";
  const telegramSetupUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(targetUrl)}&secret_token=${encodeURIComponent(webhookSecret)}`;

  try {
    const res = await fetch(telegramSetupUrl, { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return NextResponse.json({ error: data.description || "Failed to set Telegram webhook" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}
