import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { validateBlogPost } from "@/lib/validation";
import { updatePost, deletePost } from "@/lib/store/blog";

interface Ctx { params: Promise<{ slug: string }> }

export async function PUT(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { slug } = await ctx.params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const result = validateBlogPost(body);
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 422 });

  const updated = await updatePost(slug, result.value.post);
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ post: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { slug } = await ctx.params;
  const ok = await deletePost(slug);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
