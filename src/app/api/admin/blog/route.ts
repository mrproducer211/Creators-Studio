import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { validateBlogPost } from "@/lib/validation";
import { createPost, getPostBySlug } from "@/lib/store/blog";

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const result = validateBlogPost(body);
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 422 });

  const existing = await getPostBySlug(result.value.post.slug);
  if (existing) return NextResponse.json({ errors: { slug: "Slug already in use." } }, { status: 422 });

  try {
    const created = await createPost(result.value.post);
    return NextResponse.json({ post: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Create failed." }, { status: 500 });
  }
}
