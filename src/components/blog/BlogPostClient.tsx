"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { BlogPost } from "@/data/blogPosts";
import { getLocalizedPost } from "@/data/blogTranslations";
import Image from "next/image";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import NewsletterCapture from "./NewsletterCapture";
import ReadingProgressBar from "./ReadingProgressBar";

interface Props {
  post: BlogPost;
  currentUrl: string;
  relatedPosts: BlogPost[];
}

function renderParagraphWithLinks(para: string, linkedNeighbourhoods: Set<string>): React.ReactNode {
  const words = para.split(/(\s+)/);
  
  return words.map((word, index) => {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
    
    if ((cleanWord === "thonglo" || cleanWord === "thong-lo" || cleanWord === "thong") && !linkedNeighbourhoods.has("thong-lo")) {
      linkedNeighbourhoods.add("thong-lo");
      return (
        <Link key={index} href="/neighborhood/thong-lo" className="text-[#1C3A2F] underline font-semibold hover:text-[#C9A84C] transition-colors">
          {word}
        </Link>
      );
    }
    
    if ((cleanWord === "onnut" || cleanWord === "on-nut" || cleanWord === "on") && !linkedNeighbourhoods.has("on-nut")) {
      linkedNeighbourhoods.add("on-nut");
      return (
        <Link key={index} href="/neighborhood/on-nut" className="text-[#1C3A2F] underline font-semibold hover:text-[#C9A84C] transition-colors">
          {word}
        </Link>
      );
    }
    
    if ((cleanWord === "phromphong" || cleanWord === "phrom-phong" || cleanWord === "phrom") && !linkedNeighbourhoods.has("phrom-phong")) {
      linkedNeighbourhoods.add("phrom-phong");
      return (
        <Link key={index} href="/neighborhood/phrom-phong" className="text-[#1C3A2F] underline font-semibold hover:text-[#C9A84C] transition-colors">
          {word}
        </Link>
      );
    }
    
    if ((cleanWord === "ekkamai" || cleanWord === "ekamai") && !linkedNeighbourhoods.has("ekkamai")) {
      linkedNeighbourhoods.add("ekkamai");
      return (
        <Link key={index} href="/neighborhood/ekkamai" className="text-[#1C3A2F] underline font-semibold hover:text-[#C9A84C] transition-colors">
          {word}
        </Link>
      );
    }
    
    return word;
  });
}

export default function BlogPostClient({ post: rawPost, currentUrl, relatedPosts }: Props) {
  const { lang } = useLanguage();
  const post = getLocalizedPost(rawPost, lang);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    lang === "th" ? "th-TH" : lang === "zh" ? "zh-CN" : "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const formattedUpdateDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString(
        lang === "th" ? "th-TH" : lang === "zh" ? "zh-CN" : "en-GB",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : null;

  const headerFont = post.headerFontFamily || "Outfit";
  const bodyFont = post.fontFamily || "Inter";

  const homeText = lang === "th" ? "หน้าแรก" : lang === "zh" ? "首页" : "Home";
  const guidesText = lang === "th" ? "คู่มือ" : lang === "zh" ? "指南" : "Guides";
  const tocTitle = lang === "th" ? "ในคู่มือนี้:" : lang === "zh" ? "本指南目录：" : "In this guide:";
  const moreGuidesTitle = lang === "th" ? "คู่มือเพิ่มเติม" : lang === "zh" ? "更多指南" : "More guides";

  const linkedNeighbourhoods = new Set<string>();

  return (
    <>
      <ReadingProgressBar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", fontFamily: `var(--font-inter), ${bodyFont}, sans-serif` }}>

        {/* ── Hero ── */}
        <div className="relative overflow-hidden w-full h-[280px] sm:h-[350px] md:h-[420px] lg:h-[480px]" style={{ background: "#1C3A2F" }}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-6 md:pb-8 max-w-3xl">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold" style={{ background: "#C9A84C", color: "#1C3A2F" }}>
                {post.category}
              </span>
              {post.trending && (
                <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold animate-pulse" style={{ background: "#FF6B6B", color: "#FFFFFF" }}>
                  🔥 Trending
                </span>
              )}
            </div>
            <h1 className="text-[18px] sm:text-[24px] md:text-[32px] font-bold leading-[1.2] mb-2 md:mb-3" style={{ color: "#FFFFFF", letterSpacing: "-0.5px", fontFamily: `${headerFont}, sans-serif` }}>
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-[12px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span>{post.author}</span>
              <span>·</span>
              <span>
                {formattedUpdateDate
                  ? (lang === "th" ? `อัปเดตเมื่อ ${formattedUpdateDate}` : lang === "zh" ? `更新于 ${formattedUpdateDate}` : `Updated ${formattedUpdateDate}`)
                  : (lang === "th" ? `เผยแพร่เมื่อ ${formattedDate}` : lang === "zh" ? `发布于 ${formattedDate}` : `Published ${formattedDate}`)}
              </span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>

        {/* ── Article body ── */}
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] mb-4 md:mb-8" style={{ color: "#999" }}>
            <Link href="/" className="no-underline hover:underline" style={{ color: "#999" }}>{homeText}</Link>
            <span>/</span>
            <Link href="/blog" className="no-underline hover:underline" style={{ color: "#999" }}>{guidesText}</Link>
            <span>/</span>
            <span style={{ color: "#1C3A2F" }}>{post.category}</span>
          </nav>

          {/* Intro */}
          <p
            className="text-[15.5px] md:text-[17px] leading-[1.8] mb-5 md:mb-8 font-light"
            style={{ color: "#333", borderLeft: "3px solid #C9A84C", paddingLeft: 16 }}
          >
            {renderParagraphWithLinks(post.intro, linkedNeighbourhoods)}
          </p>

          <ShareButtons url={currentUrl} title={post.title} />

          {/* Table of Contents */}
          {post.sections && post.sections.length > 1 && (
            <div className="rounded-2xl p-4 md:p-5 mt-4 mb-6 md:mt-6 md:mb-8 border border-[#EDE8DF] bg-white">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-3">
                {tocTitle}
              </h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-2">
                {post.sections.map((section, idx) => {
                  const cleanHeading = section.heading.replace(/^\d+\.\s*/, "");
                  return (
                    <li key={idx} className="m-0 text-[13px] font-light">
                      <a
                        href={`#section-${idx}`}
                        className="text-[#C9A84C] hover:underline no-underline font-medium"
                      >
                        {idx + 1}. {cleanHeading}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Sections */}
          {post.sections.map((section, i) => (
            <div key={i} id={`section-${i}`} className="mb-6 md:mb-8 scroll-mt-20">
              <h2
                className="text-[18px] md:text-[22px] font-bold mb-4"
                style={{ color: "#1C3A2F", letterSpacing: "-0.3px", fontFamily: `${headerFont}, sans-serif` }}
              >
                {section.heading}
              </h2>
              {section.image && (
                <div className="relative w-full h-[220px] sm:h-[300px] md:h-[360px] rounded-2xl overflow-hidden mb-5 border border-[#EDE8DF] shadow-xs">
                  <Image
                    src={section.image}
                    alt={section.imageAlt || section.heading}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 700px"
                  />
                </div>
              )}
              {section.body.map((para, j) => (
                <p
                  key={j}
                  className="text-[15px] leading-[1.8] mb-4 font-light"
                  style={{ color: "#444" }}
                >
                  {renderParagraphWithLinks(para, linkedNeighbourhoods)}
                </p>
              ))}
            </div>
          ))}

          {/* CTA box */}
          <div
            className="rounded-2xl p-5 md:p-6 mt-5 mb-5 md:mt-6 md:mb-6"
            style={{ background: "#1C3A2F" }}
          >
            <h3 className="text-[18px] font-bold mb-2" style={{ color: "#E2C97E" }}>
              {post.cta.heading}
            </h3>
            <p className="text-[14px] font-light mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
              {post.cta.body}
            </p>
            <a
              href={post.cta.href}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold no-underline transition-opacity hover:opacity-90"
              style={{ background: "#C9A84C", color: "#1C3A2F" }}
            >
              {post.cta.label} →
            </a>
          </div>

          <NewsletterCapture />
        </div>

        {/* ── Related articles ── */}
        {relatedPosts.length > 0 && (
          <div className="py-8 md:py-12 border-t border-[#EDE8DF]" style={{ background: "#FFFFFF" }}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
              <h3 className="text-[16px] font-bold mb-6 font-outfit" style={{ color: "#1C3A2F" }}>
                {moreGuidesTitle}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((relRaw) => {
                  const rel = getLocalizedPost(relRaw, lang);
                  return (
                    <Link
                      key={rel.slug}
                      href={`/blog/${rel.slug}`}
                      className="group no-underline rounded-2xl overflow-hidden flex flex-col border border-[#EDE8DF] hover:shadow-md transition-all"
                      style={{ background: "#FAF8F3" }}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          src={rel.image}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] mb-1 block">
                            {rel.category}
                          </span>
                          <h4 className="text-[13px] font-bold leading-tight text-[#1A1A1A] line-clamp-2 mb-2 group-hover:text-[#1C3A2F] transition-colors">
                            {rel.title}
                          </h4>
                        </div>
                        <span className="text-[11px] text-[#999] mt-2 block">{rel.readTime}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
