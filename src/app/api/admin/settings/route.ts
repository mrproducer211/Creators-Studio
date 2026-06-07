import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { getSystemSettings, updateSystemSettings } from "@/lib/store/settings";
import { createAuditLog } from "@/lib/db/dbLoader";

export async function POST(req: NextRequest) {
  const authCheck = await requireAdminApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }
  const user = authCheck.user;

  try {
    const body = await req.json();
    const {
      adminEmail,
      adminPhone,
      rentalExpiryEnabled,
      rentalExpiryDays,
      adminWhatsApp,
      adminLine,
      adminTelegram
    } = body;

    if (!adminEmail || !adminPhone) {
      return NextResponse.json({ error: "Email and Phone are required." }, { status: 400 });
    }

    const updated = await updateSystemSettings({
      adminEmail,
      adminPhone,
      rentalExpiryEnabled: !!rentalExpiryEnabled,
      rentalExpiryDays: Number(rentalExpiryDays) || 30,
      adminWhatsApp: adminWhatsApp || "",
      adminLine: adminLine || "",
      adminTelegram: adminTelegram || "",
    });

    // Write audit log
    await createAuditLog(
      user.email,
      "update_settings",
      `Updated email: ${adminEmail}, phone: ${adminPhone}, WA: ${adminWhatsApp}, Line: ${adminLine}, TG: ${adminTelegram}, expiry: ${!!rentalExpiryEnabled ? "On" : "Off"} (${rentalExpiryDays} days)`
    );

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("POST settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

export async function GET() {
  const authCheck = await requireAdminApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }

  try {
    const settings = await getSystemSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 });
  }
}
