"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/data/blogPosts";

export default function BlogTable({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const del = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setBusy(slug);
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Delete failed.");
      }
    } finally { setBusy(null); }
  };

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: "#FAF8F3", borderBottom: "1px solid #E5E0D8" }}>
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3" style={{ color: "#888" }}>Post</th>
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-3 py-3" style={{ color: "#888" }}>Category</th>
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-3 py-3" style={{ color: "#888" }}>Published</th>
            <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3" style={{ color: "#888" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.slug} style={{ borderBottom: "1px solid #F0EAE0" }}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {p.image && <img src={p.image} alt="" className="w-12 h-9 rounded object-cover flex-shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: "#1A1A1A" }}>{p.title}</div>
                    <div className="text-[11px] truncate" style={{ color: "#999" }}>/blog/{p.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3"><span className="text-[10px] font-semibold uppercase tracking-[0.5px] px-2 py-0.5 rounded-full" style={{ background: "#EDE8DF", color: "#1C3A2F" }}>{p.category}</span></td>
              <td className="px-3 py-3 text-[12px]" style={{ color: "#555" }}>
                {new Date(p.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium no-underline" style={{ background: "#F7F3EC", color: "#1C3A2F", border: "1px solid #E5E0D8" }}>
                    View
                  </a>
                  <a href={`/admin/blog/${p.slug}`} className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium no-underline" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>
                    Edit
                  </a>
                  <button onClick={() => del(p.slug, p.title)} disabled={busy === p.slug}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border-none disabled:opacity-50"
                    style={{ background: "rgba(224,82,82,0.1)", color: "#E05252", fontFamily: "inherit" }}>
                    {busy === p.slug ? "…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr><td colSpan={4} className="text-[13px] text-center py-10" style={{ color: "#999" }}>No blog posts yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
