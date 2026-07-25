import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { deleteMultipleEnquiries } from "@/lib/store/enquiries";

export async function DELETE(req: NextRequest) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty IDs array." }, { status: 400 });
    }

    const stringIds = ids.map((id: any) => String(id));
    await deleteMultipleEnquiries(stringIds);
    return NextResponse.json({ success: true, count: stringIds.length });
  } catch (err) {
    console.error("Failed to delete enquiries:", err);
    return NextResponse.json({ error: "Failed to delete enquiries." }, { status: 500 });
  }
}
