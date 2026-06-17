/**
 * Utility to strip emojis and other pictorial characters from text.
 * Helps keep the frontend clean even if raw emojis are synced from the database or Telegram.
 */
export function stripEmojis(text: string | null | undefined): string {
  if (!text) return "";
  // Removes standard emojis, symbols, and Extended Pictographic characters
  return text.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
}
