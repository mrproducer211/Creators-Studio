"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost, BlogSection } from "@/data/blogPosts";

type BlogFormState = BlogPost & {
  fontFamily?: string;
  headerFontFamily?: string;
};

const EMPTY: BlogFormState = {
  slug: "", category: "Neighbourhood Guide", title: "", metaTitle: "", metaDesc: "",
  excerpt: "", image: "", readTime: "5 min read",
  publishedAt: new Date().toISOString().split("T")[0], author: "NHP Bangkok Team",
  keywords: [], intro: "", sections: [],
  cta: { heading: "Browse Bangkok properties", body: "See what fits your budget right now.", href: "/explore", label: "Browse Properties" },
  fontFamily: "Inter",
  headerFontFamily: "Outfit",
};

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const GOOGLE_HEADER_FONTS = ["Outfit", "Playfair Display", "Lora", "Space Grotesk", "Merriweather"];
const GOOGLE_TEXT_FONTS = ["Inter", "Lora", "Merriweather", "Roboto", "Outfit"];

export default function BlogForm({ initial, isNew }: { initial?: BlogPost; isNew: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<BlogFormState>((initial as BlogFormState) ?? EMPTY);
  const [keywordsText, setKeywordsText] = useState((initial?.keywords ?? []).join(", "));
  const [sectionsText, setSectionsText] = useState(
    (initial?.sections ?? []).map((s: BlogSection) => `## ${s.heading}\n${s.body.join("\n\n")}`).join("\n\n---\n\n")
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastUploadedMarkdown, setLastUploadedMarkdown] = useState("");

  const setField = <K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "cover" | "inline") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (target === "cover") {
        setField("image", data.url);
      } else {
        const markdown = `\n![Blog Image](${data.url})\n`;
        setLastUploadedMarkdown(markdown);
        insertAtCursor(markdown);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const insertAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById("blog_sections_textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    setSectionsText(before + textToInsert + after);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  const parseSections = (text: string): BlogSection[] => {
    return text.split(/\n---+\n/).map((chunk) => {
      const lines = chunk.trim().split("\n");
      const headingLine = lines[0] ?? "";
      const heading = headingLine.replace(/^##+\s*/, "").trim();
      const bodyRaw = lines.slice(1).join("\n").trim();
      const body = bodyRaw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      return { heading, body };
    }).filter((s) => s.heading && s.body.length);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const payload = {
      ...state,
      keywords:  keywordsText.split(",").map((s) => s.trim()).filter(Boolean),
      sections:  parseSections(sectionsText),
      metaTitle: state.metaTitle || state.title,
      metaDesc:  state.metaDesc  || state.excerpt,
    };

    const url    = isNew ? "/api/admin/blog" : `/api/admin/blog/${initial!.slug}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res  = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body:   JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors ?? { _form: data.error ?? "Save failed." });
        setSubmitting(false);
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : "Unknown error" });
      setSubmitting(false);
    }
  };

  const inputCls = "w-full rounded-xl px-4 py-3 text-[13px] outline-none";
  const inputStyle: React.CSSProperties = { border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" };
  const sectionCls = "rounded-2xl p-5 border";
  const sectionStyle = { background: "#FFFFFF", borderColor: "#E5E0D8" };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Basics */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Basics</h3>
          <div className="flex flex-col gap-4">
            <Field label="Title" error={errors.title}>
              <input className={inputCls} style={inputStyle} value={state.title}
                onChange={(e) => {
                  setField("title", e.target.value);
                  if (isNew && !state.slug) setField("slug", toSlug(e.target.value));
                }} required />
            </Field>
            <Field label="Slug" error={errors.slug} hint="Used as /blog/[slug].">
              <input className={inputCls} style={inputStyle} value={state.slug} onChange={(e) => setField("slug", e.target.value)} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" error={errors.category}>
                <input className={inputCls} style={inputStyle} value={state.category} onChange={(e) => setField("category", e.target.value)} required />
              </Field>
              <Field label="Read time">
                <input className={inputCls} style={inputStyle} value={state.readTime} onChange={(e) => setField("readTime", e.target.value)} placeholder="5 min read" />
              </Field>
            </div>
            <Field label="Excerpt" error={errors.excerpt} hint="Short summary shown on listings.">
              <textarea className={`${inputCls} resize-y`} style={{ ...inputStyle, minHeight: 60 }} value={state.excerpt} onChange={(e) => setField("excerpt", e.target.value)} required />
            </Field>
            <div>
              <Field label="Cover image URL" error={errors.image}>
                <div className="flex gap-2">
                  <input className={inputCls} style={inputStyle} value={state.image} onChange={(e) => setField("image", e.target.value)} required />
                  <label className="flex-shrink-0 px-4 py-3 rounded-xl text-[12px] font-semibold cursor-pointer text-white flex items-center justify-center min-w-[110px]" style={{ background: "#1C3A2F" }}>
                    {uploading ? "Uploading..." : "Upload File"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover")} disabled={uploading} />
                  </label>
                </div>
              </Field>
              {state.image && (
                <img src={state.image} alt="Cover Preview" className="mt-2 h-16 rounded-lg border object-cover" />
              )}
            </div>
          </div>
        </div>

        {/* Content Section & Inline Image Uploader */}
        <div className={sectionCls} style={sectionStyle}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold" style={{ color: "#1C3A2F" }}>Article Content</h3>
            
            {/* Inline Image Uploader */}
            <label className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer text-[#1C3A2F] border border-[#1C3A2F] hover:bg-[#FAF8F3] transition-all">
              {uploading ? "Uploading..." : "📷 Insert Image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "inline")} disabled={uploading} />
            </label>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Intro paragraph" error={errors.intro}>
              <textarea className={`${inputCls} resize-y`} style={{ ...inputStyle, minHeight: 90 }} value={state.intro} onChange={(e) => setField("intro", e.target.value)} required />
            </Field>
            <Field label="Sections"
              hint={`Use "## Heading" then paragraphs. Separate sections with "---" on its own line.`}>
              {lastUploadedMarkdown && (
                <div className="mb-2 p-2.5 rounded-lg text-[11px] flex items-center justify-between" style={{ background: "#FAF8F3", border: "1px solid #EDE8DF" }}>
                  <span>Inserted markdown: <code className="bg-white px-1 border rounded">{lastUploadedMarkdown.trim()}</code></span>
                  <button type="button" onClick={() => insertAtCursor(lastUploadedMarkdown)} className="text-[#1C3A2F] font-bold">Re-insert</button>
                </div>
              )}
              <textarea
                id="blog_sections_textarea"
                className={`${inputCls} resize-y`}
                style={{ ...inputStyle, minHeight: 280, fontFamily: "monospace", fontSize: 12 }}
                value={sectionsText}
                onChange={(e) => setSectionsText(e.target.value)}
                placeholder={`## Section Heading\nParagraph contents here...\n\n---\n\n## Next Heading\nMore paragraphs...`}
              />
            </Field>
          </div>
        </div>

        {/* SEO & meta */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>SEO & Meta</h3>
          <div className="flex flex-col gap-4">
            <Field label="Meta title (optional)" hint="Defaults to the post title.">
              <input className={inputCls} style={inputStyle} value={state.metaTitle ?? ""} onChange={(e) => setField("metaTitle", e.target.value)} />
            </Field>
            <Field label="Meta description (optional)" hint="Defaults to the excerpt.">
              <textarea className={`${inputCls} resize-y`} style={{ ...inputStyle, minHeight: 60 }} value={state.metaDesc ?? ""} onChange={(e) => setField("metaDesc", e.target.value)} />
            </Field>
            <Field label="Keywords" hint="Comma-separated.">
              <input className={inputCls} style={inputStyle} value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} placeholder="bangkok rent, expat tips" />
            </Field>
          </div>
        </div>

        {/* Call to action */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Call to Action (CTA) Box</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="CTA heading">
                <input className={inputCls} style={inputStyle} value={state.cta.heading} onChange={(e) => setField("cta", { ...state.cta, heading: e.target.value })} />
              </Field>
              <Field label="CTA button label">
                <input className={inputCls} style={inputStyle} value={state.cta.label} onChange={(e) => setField("cta", { ...state.cta, label: e.target.value })} />
              </Field>
            </div>
            <Field label="CTA body">
              <textarea className={`${inputCls} resize-y`} style={{ ...inputStyle, minHeight: 60 }} value={state.cta.body} onChange={(e) => setField("cta", { ...state.cta, body: e.target.value })} />
            </Field>
            <Field label="CTA URL">
              <input className={inputCls} style={inputStyle} value={state.cta.href} onChange={(e) => setField("cta", { ...state.cta, href: e.target.value })} />
            </Field>
          </div>
        </div>
      </div>

      {/* Side column */}
      <div className="flex flex-col gap-6">
        
        {/* Style Customization (Enterprise Upgrade) */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Typography Customization</h3>
          <div className="flex flex-col gap-4">
            <Field label="Header Font Family" hint="Applied to blog title and sections headings.">
              <select className={inputCls} style={inputStyle} value={state.headerFontFamily ?? "Outfit"} onChange={(e) => setField("headerFontFamily", e.target.value)}>
                {GOOGLE_HEADER_FONTS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </Field>
            <Field label="Body Text Font Family" hint="Applied to paragraph text blocks.">
              <select className={inputCls} style={inputStyle} value={state.fontFamily ?? "Inter"} onChange={(e) => setField("fontFamily", e.target.value)}>
                {GOOGLE_TEXT_FONTS.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Publish Details */}
        <div className={sectionCls} style={sectionStyle}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Publishing</h3>
          <div className="flex flex-col gap-4">
            <Field label="Published date">
              <input type="date" className={inputCls} style={inputStyle} value={state.publishedAt} onChange={(e) => setField("publishedAt", e.target.value)} />
            </Field>
            <Field label="Author">
              <input className={inputCls} style={inputStyle} value={state.author} onChange={(e) => setField("author", e.target.value)} />
            </Field>
          </div>
        </div>

        {errors._form && (
          <p className="text-[12px] px-3 py-2 rounded-lg" style={{ background: "rgba(224,82,82,0.1)", color: "#E05252" }}>⚠ {errors._form}</p>
        )}

        <div className="flex flex-col gap-2">
          <button type="submit" disabled={submitting}
            className="w-full py-4 rounded-xl text-[14px] font-semibold cursor-pointer border-none disabled:opacity-60 text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: "#1C3A2F", fontFamily: "inherit" }}>
            {submitting ? "Saving Post..." : isNew ? "Publish Post" : "Save Changes"}
          </button>
          <a href="/admin/blog" className="text-center w-full py-3.5 rounded-xl text-[13px] font-semibold no-underline border transition-all hover:bg-[#FAF8F3]"
            style={{ background: "transparent", borderColor: "#E5E0D8", color: "#555" }}>
            Cancel
          </a>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[1px] mb-1.5" style={{ color: "#999" }}>{label}</label>
      {children}
      {hint  && !error && <p className="text-[11px] mt-1" style={{ color: "#999" }}>{hint}</p>}
      {error && <p className="text-[11px] mt-1" style={{ color: "#E05252" }}>⚠ {error}</p>}
    </div>
  );
}
