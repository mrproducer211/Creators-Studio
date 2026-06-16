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

export interface AppointmentPayload {
  propertySlug?: string;
  propertyName?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  message?: string;
}

function escapeHTML(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
  const title  = isTour ? "📅 <b>New Tour Request — NHP Bangkok</b>" : "🏠 <b>New Enquiry — NHP Bangkok</b>";

  return [
    title,
    ``,
    `<b>Property:</b> ${escapeHTML(p.propertyName)}`,
    `<b>Listing:</b> ${escapeHTML(listingEmoji(p.listingType))}`,
    `<b>Price:</b> ${escapeHTML(p.price)}`,
    `<b>Area:</b> ${escapeHTML(p.area)}, Bangkok`,
    `🔗 <a href="${propertyUrl}">View Property</a>`,
    ``,
    `━━━━━━━━━━━━━━━`,
    ...(isTour && p.tourDate && p.tourTime ? [
      `📅 <b>Tour Details</b>`,
      `<b>Date:</b> ${escapeHTML(formatTourDate(p.tourDate))}`,
      `<b>Time:</b> ${escapeHTML(p.tourTime)}`,
      ``,
      `━━━━━━━━━━━━━━━`,
    ] : []),
    `👤 <b>Contact</b>`,
    `<b>Name:</b> ${escapeHTML(p.name)}`,
    `<b>Via:</b> ${escapeHTML(methodEmoji(p.method))}`,
    `<b>Contact:</b> ${escapeHTML(p.contact)}`,
    ...(p.message ? [`<b>Message:</b> ${escapeHTML(p.message)}`] : []),
    ``,
    `━━━━━━━━━━━━━━━`,
    `📍 Source: ${escapeHTML(sourceLabel(p.source))}`,
    `📅 Submitted ${now} (Bangkok time)`,
  ].join("\n");
}

export function buildAppointmentTelegramMessage(a: AppointmentPayload, baseUrl: string): string {
  const now = new Date().toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok",
  });

  const propertyInfo = a.propertyName && a.propertySlug
    ? `<b>Property:</b> ${escapeHTML(a.propertyName)}\n🔗 <a href="${baseUrl}/property/${a.propertySlug}">View Property</a>\n`
    : "";

  return [
    `📅 <b>New Tour Booking — NHP Bangkok</b>`,
    ``,
    propertyInfo,
    `📅 <b>Tour Details</b>`,
    `<b>Date:</b> ${escapeHTML(formatTourDate(a.date))}`,
    `<b>Time:</b> ${escapeHTML(a.timeSlot)}`,
    ``,
    `━━━━━━━━━━━━━━━`,
    `👤 <b>Contact</b>`,
    `<b>Name:</b> ${escapeHTML(a.name)}`,
    `<b>Email:</b> ${escapeHTML(a.email)}`,
    `<b>Phone:</b> ${escapeHTML(a.phone)}`,
    ...(a.message ? [`<b>Message:</b> ${escapeHTML(a.message)}`] : []),
    ``,
    `━━━━━━━━━━━━━━━`,
    `📅 Submitted ${now} (Bangkok time)`,
  ].filter(line => line !== null).join("\n");
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
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${res.status} — ${err}`);
  }
}
