import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { deleteLead } from "@/lib/store/leads";
import { createAuditLog } from "@/lib/db/dbLoader";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdminApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }
  const admin = authCheck.user;

  try {
    const { id } = await params;
    const success = await deleteLead(id);

    if (!success) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    await createAuditLog(admin.email, "delete_lead", `Deleted lead user: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete lead error:", err);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
