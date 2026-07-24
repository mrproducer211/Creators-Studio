"use client";

import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/data/blogPosts";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedPost } from "@/data/blogTranslations";

interface Props {
  post: BlogPost;
  displayCategory?: string;
}

export default function BlogFeaturedHero({ post: rawPost, displayCategory }: Props) {
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

  const featuredText = lang === "th" ? "แนะนำ" : lang === "zh" ? "精选" : "Featured";
  const readArticleText = lang === "th" ? "อ่านบทความ →" : lang === "zh" ? "阅读文章 →" : "Read Article →";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group no-underline flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 mb-6 md:mb-10 w-full relative h-[340px] sm:h-[380px] md:h-auto"
      style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
    >
      {/* Image container: Absolute on mobile to cover background, relative on desktop */}
      <div className="absolute inset-0 md:relative w-full md:w-1/2 h-full md:h-auto overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-103"
        />
        {/* Soft Brand-Green Gradient Overlay (Mobile Only) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C3A2F]/95 via-[#1C3A2F]/40 to-transparent md:hidden" />
        
        {/* Desktop Badge only */}
        <div className="absolute top-4 left-4 hidden md:flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#C9A84C", color: "#1C3A2F" }}
          >
            {featuredText} · {displayCategory || post.category}
          </span>
          {post.trending && (
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse"
              style={{ background: "#FF6B6B", color: "#FFFFFF" }}
            >
              🔥 Trending
            </span>
          )}
        </div>
      </div>

      {/* Content Container: Positioned over image on mobile, side-by-side on desktop */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10 md:relative md:w-1/2 md:p-10 flex flex-col justify-end md:justify-between h-full">
        <div className="flex flex-col gap-1 md:gap-3">
          {/* Mobile-only Badge */}
          <div className="flex items-center gap-2 mb-1 md:hidden">
            <span
              className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider"
              style={{ background: "#C9A84C", color: "#1C3A2F" }}
            >
              {featuredText}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]">
              {displayCategory || post.category}
            </span>
          </div>

          {/* Metadata: White text on mobile, gray on desktop */}
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-medium text-white/60 md:text-[#999999]">
            <span className="hidden md:inline">{post.author} ·</span>
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>

          {/* Title: White on mobile, dark green on desktop */}
          <h2
            className="text-[18px] sm:text-[22px] md:text-[28px] font-bold leading-tight group-hover:text-[#C9A84C] transition-colors font-outfit text-white md:text-[#1C3A2F] mt-1 md:mt-0"
            style={{ letterSpacing: "-0.4px" }}
          >
            {post.title}
          </h2>

          <p className="hidden md:block text-[13px] md:text-[14px] font-light leading-relaxed text-gray-500 m-0 line-clamp-4">
            {post.excerpt}
          </p>
        </div>

        <div className="hidden md:block">
          <span
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[12px] font-bold text-white transition-opacity group-hover:opacity-90"
            style={{ background: "#1C3A2F" }}
          >
            {readArticleText}
          </span>
        </div>
      </div>
    </Link>
  );
}
