import { readJson, writeJson } from "./fileStore";
import STATIC_POSTS, { BlogPost } from "@/data/blogPosts";

const FILE = "blog.json";

let cache: BlogPost[] | null = null;

async function load(): Promise<BlogPost[]> {
  if (process.env.NODE_ENV === "development") cache = null;
  if (cache) return cache;
  const stored = await readJson<BlogPost[] | null>(FILE, null);
  cache = stored && stored.length ? stored : [...STATIC_POSTS];
  return cache;
}

async function persist(list: BlogPost[]): Promise<void> {
  cache = list;
  await writeJson(FILE, list);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await load();
  console.log("DEBUG getAllPosts count:", posts.length, "First post:", posts[0]?.slug);
  return [...posts];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = await load();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function createPost(post: BlogPost): Promise<BlogPost> {
  const all = await load();
  if (all.some((p) => p.slug === post.slug)) {
    throw new Error("A post with that slug already exists.");
  }
  await persist([post, ...all]);
  return post;
}

export async function updatePost(slug: string, patch: Partial<BlogPost>): Promise<BlogPost | null> {
  const all = await load();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const updated: BlogPost = { ...all[idx], ...patch, slug }; // slug is immutable
  const next = [...all];
  next[idx]  = updated;
  await persist(next);
  return updated;
}

export async function deletePost(slug: string): Promise<boolean> {
  const all  = await load();
  const next = all.filter((p) => p.slug !== slug);
  if (next.length === all.length) return false;
  await persist(next);
  return true;
}
