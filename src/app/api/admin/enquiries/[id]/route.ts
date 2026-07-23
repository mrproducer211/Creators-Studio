import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { setEnquiryStatus, deleteEnquiry, StoredEnquiry } from "@/lib/store/enquiries";

interface Ctx { params: Promise<{ id: string }> }

const VALID: StoredEnquiry["status"][] = ["new", "responded", "archived"];

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { id } = await ctx.params;
  let body: { status?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  if (typeof body.status !== "string" || !VALID.includes(body.status as StoredEnquiry["status"])) {
    return NextResponse.json({ error: "Invalid status." }, { status: 422 });
  }

  const updated = await setEnquiryStatus(id, body.status as StoredEnquiry["status"]);
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ enquiry: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { id } = await ctx.params;
  const deleted = await deleteEnquiry(id);
  if (!deleted) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
