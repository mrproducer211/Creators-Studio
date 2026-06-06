import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/store/settings";

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({
      adminEmail: settings.adminEmail,
      adminPhone: settings.adminPhone,
      adminWhatsApp: settings.adminWhatsApp || "",
      adminLine: settings.adminLine || "",
      adminTelegram: settings.adminTelegram || "",
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load public settings" }, { status: 500 });
  }
}
