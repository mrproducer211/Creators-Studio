import { NextRequest, NextResponse } from "next/server";
import { parseAgentMessage } from "@/lib/telegram-parser";
import { getAllProperties } from "@/lib/store/properties";
import { db, isDbConfigured } from "@/lib/db";
import { properties as propertiesTable } from "@/lib/db/schema";
import { and, eq, ilike, lte, or } from "drizzle-orm";

// Direct helper to communicate with Telegram
async function replyToTelegram(chatId: number, text: string, token: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`Telegram sendMessage failed: ${res.status} — ${err}`);
    }
  } catch (err) {
    console.error("Error calling Telegram API:", err);
  }
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_FINDER_BOT_TOKEN;
  const myChatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !myChatId) {
    console.error("Telegram bot is not configured in the environment variables.");
    return new NextResponse("Configuration error", { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  // Extract message and chat info
  const message = body.message;
  if (!message || !message.chat || !message.chat.id) {
    // Return 200 so Telegram stops retrying bad payloads
    return new NextResponse("OK", { status: 200 });
  }

  const chatId = message.chat.id;

  // 1. Authorization: Only allow the owner's chat ID
  if (String(chatId) !== String(myChatId)) {
    console.warn(`Unauthorized Telegram access attempt from Chat ID: ${chatId}`);
    return new NextResponse("Unauthorized", { status: 200 });
  }

  const text = (message.text || "").trim();

  // 2. Command handlers
  if (text.startsWith("/start")) {
    const welcome = [
      "👋 <b>Welcome to the NHP Bangkok Matchmaker Bot!</b>",
      "",
      "Forward or copy-paste any agent requirement posts from your groups here.",
      "I will automatically parse: ",
      "• 📍 Location / Area",
      "• 🏢 Building Brand (Noble, Supalai, Rhythm, etc.)",
      "• 💰 Budget",
      "• 🛌 Bedrooms",
      "• 📐 Size (SQM)",
      "• 🐾 Pet Friendliness",
      "",
      "And respond instantly with matching listing links from your website!",
    ].join("\n");
    await replyToTelegram(chatId, welcome, token);
    return new NextResponse("OK", { status: 200 });
  }

  if (!text) {
    await replyToTelegram(chatId, "⚠️ Please send a text message.", token);
    return new NextResponse("OK", { status: 200 });
  }

  // 3. Local text parsing
  const parsed = parseAgentMessage(text);

  // 4. Database / Store search query
  let results: any[] = [];
  try {
    if (isDbConfigured) {
      const conditions = [];

      // Only search for active properties
      conditions.push(eq(propertiesTable.status, "active"));

      // Budget filter (cap on maximum rent price)
      if (parsed.budget) {
        conditions.push(lte(propertiesTable.priceTHB, String(parsed.budget)));
      }

      // Bedrooms filter
      if (parsed.bedrooms !== null) {
        conditions.push(eq(propertiesTable.bedrooms, parsed.bedrooms));
      }

      // Pet-friendly filter
      if (parsed.petFriendly) {
        conditions.push(eq(propertiesTable.petFriendly, true));
      }

      // Area filter
      if (parsed.area) {
        conditions.push(eq(propertiesTable.area, parsed.area));
      }

      // Developer brand filter (sub-match name or description)
      if (parsed.brand) {
        conditions.push(
          or(
            ilike(propertiesTable.name, `%${parsed.brand}%`),
            ilike(propertiesTable.description, `%${parsed.brand}%`)
          )
        );
      }

      results = await db
        .select()
        .from(propertiesTable)
        .where(and(...conditions))
        .limit(5);
    } else {
      // Local fallback stores
      let list = await getAllProperties();
      list = list.filter((p: any) => !p.status || p.status === "active");

      if (parsed.budget) {
        list = list.filter((p) => Number(p.priceTHB) <= parsed.budget!);
      }
      if (parsed.bedrooms !== null) {
        list = list.filter((p) => p.bedrooms === parsed.bedrooms);
      }
      if (parsed.petFriendly) {
        list = list.filter((p) => p.petFriendly === true);
      }
      if (parsed.area) {
        list = list.filter((p) => p.area.toLowerCase() === parsed.area!.toLowerCase());
      }
      if (parsed.brand) {
        const bLower = parsed.brand.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(bLower) ||
            (p.description && p.description.toLowerCase().includes(bLower))
        );
      }
      results = list.slice(0, 5);
    }
  } catch (err) {
    console.error("Database search in Telegram bot route failed:", err);
    await replyToTelegram(chatId, "❌ An error occurred while searching the database.", token);
    return new NextResponse("OK", { status: 200 });
  }

  // 5. Build and send response report
  const baseUrl = process.env.NEXTAUTH_URL ?? `https://${req.headers.get("host") ?? "newhomesproperty.com"}`;
  
  const reportLines = [
    `🔍 <b>Search Report</b>`,
    `━━━━━━━━━━━━━━━`,
    `📍 <b>Area:</b> ${parsed.area || "Any"}`,
    `🏢 <b>Brand:</b> ${parsed.brand ? parsed.brand.toUpperCase() : "Any"}`,
    `💰 <b>Budget:</b> ${parsed.budget ? `฿${parsed.budget.toLocaleString()}` : "Any"}`,
    `🛌 <b>Beds:</b> ${parsed.bedrooms !== null ? (parsed.bedrooms === 0 ? "Studio" : parsed.bedrooms) : "Any"}`,
    `📐 <b>Min Size:</b> ${parsed.sqm ? `${parsed.sqm} sqm` : "Any"}`,
    `🐾 <b>Pet Friendly:</b> ${parsed.petFriendly ? "Yes ✅" : "Any"}`,
    `━━━━━━━━━━━━━━━`,
    `✨ <b>Matches Found:</b> ${results.length}`,
    "",
  ];

  if (results.length === 0) {
    reportLines.push("😔 No matching properties found in the system matching these criteria.");
  } else {
    results.forEach((prop, idx) => {
      const priceVal = Number(prop.priceTHB);
      const priceFormatted = `฿${priceVal.toLocaleString()}${prop.priceLabel || "/month"}`;
      const petBadge = prop.petFriendly ? " 🐾" : "";
      
      reportLines.push(
        `${idx + 1}. <b>${prop.name}</b>${petBadge}`,
        `   📍 ${prop.area} · 🛌 ${prop.bedrooms === 0 ? "Studio" : `${prop.bedrooms} Bed`} · 📐 ${prop.sqm} sqm`,
        `   💵 <b>${priceFormatted}</b>`,
        `   🔗 <a href="${baseUrl}/property/${prop.slug}">View Details on NHP</a>`,
        ""
      );
    });
  }

  await replyToTelegram(chatId, reportLines.join("\n"), token);

  return new NextResponse("OK", { status: 200 });
}
