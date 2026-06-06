export interface EnquiryPayload {
  propertySlug:  string;
  propertyName:  string;
  listingType:   string;
  price:         string;
  area:          string;
  name:          string;
  contact:       string;
  method:        string;   // WhatsApp | Line | Telegram
  message?:      string;
  source:        "detail" | "reels" | "homepage" | "swipe" | "tour";

  // Optional tour-request fields (only set when source === "tour")
  tourDate?:     string;   // ISO date e.g. "2026-06-12"
  tourTime?:     string;   // "HH:MM"
}

function listingEmoji(t: string) {
  if (t === "sale")       return "🏷️ For Sale";
  if (t === "rent")       return "🔑 Long Rent";
  return "🌙 Short Stay";
}

function sourceLabel(s: string) {
  if (s === "detail")   return "Property Page";
  if (s === "reels")    return "Reels";
  if (s === "swipe")    return "Swipe Mode";
  if (s === "tour")     return "Tour Booking";
  return "Homepage";
}

function methodEmoji(m: string) {
  if (m === "WhatsApp") return "💬 WhatsApp";
  if (m === "Line")     return "💚 Line";
  return "✈️ Telegram";
}

function formatTourDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function buildTelegramMessage(p: EnquiryPayload, baseUrl: string): string {
  const propertyUrl = `${baseUrl}/property/${p.propertySlug}`;
  const now = new Date().toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok",
  });

  const isTour = p.source === "tour";
  const title  = isTour ? "📅 *New Tour Request — NHP Bangkok*" : "🏠 *New Enquiry — NHP Bangkok*";

  return [
    title,
    ``,
    `*Property:* ${p.propertyName}`,
    `*Listing:* ${listingEmoji(p.listingType)}`,
    `*Price:* ${p.price}`,
    `*Area:* ${p.area}, Bangkok`,
    `🔗 [View Property](${propertyUrl})`,
    ``,
    `━━━━━━━━━━━━━━━`,
    ...(isTour && p.tourDate && p.tourTime ? [
      `📅 *Tour Details*`,
      `*Date:* ${formatTourDate(p.tourDate)}`,
      `*Time:* ${p.tourTime}`,
      ``,
      `━━━━━━━━━━━━━━━`,
    ] : []),
    `👤 *Contact*`,
    `*Name:* ${p.name}`,
    `*Via:* ${methodEmoji(p.method)}`,
    `*Contact:* ${p.contact}`,
    ...(p.message ? [`*Message:* ${p.message}`] : []),
    ``,
    `━━━━━━━━━━━━━━━`,
    `📍 Source: ${sourceLabel(p.source)}`,
    `📅 Submitted ${now} (Bangkok time)`,
  ].join("\n");
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token  = process.env.TELEGRAM_NOTIFICATIONS_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Skip if not yet configured (missing or still a placeholder value)
  const unconfigured =
    !token || !chatId ||
    token.startsWith("your_") || chatId.startsWith("your_") ||
    token === "generate_a_random_string_here";

  if (unconfigured) {
    console.log("──── TELEGRAM (bot not configured yet) ────");
    console.log(text);
    console.log("────────────────────────────────────────────────────");
    return;
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${res.status} — ${err}`);
  }
}
