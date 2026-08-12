"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { BlogPost } from "@/data/blogPosts";
import Link from "next/link";
import Image from "next/image";
import { getLocalizedPost } from "@/data/blogTranslations";

const POSTS = [
  {
    slug:     "things-to-do-in-bangkok",
    category: "Activities",
    title:    "12 Unforgettable Things to Do in Bangkok: The Ultimate 2026 Travel Guide",
    excerpt:  "From ancient sacred temples and sizzling street food markets to floating water tours and luxury riverfront complexes, here is your complete 3,600+ word guide.",
    image:    "/images/blog/grand-palace-bangkok.webp",
    readTime: "18 min read",
  },
  {
    slug:     "thong-lo-vs-on-nut",
    category: "Neighbourhood Guide",
    title:    "Thong Lo vs On Nut: Which Bangkok Neighbourhood Suits You?",
    excerpt:  "Both are BTS-connected, expat-friendly and full of great food, but the vibe, price and lifestyle are worlds apart. Here's how to choose.",
    image:    "/images/blog/thong-lo-vs-on-nut.webp",
    readTime: "11 min read",
  },
  {
    slug:     "phrom-phong-vs-ekkamai-sukhumvit",
    category: "Neighbourhood Guide",
    title:    "Phrom Phong vs Ekkamai: Which Mid-Sukhumvit Neighbourhood Suits You?",
    excerpt:  "They are only two BTS stops apart, but the lifestyles they offer are entirely different. One is high-end retail and luxury condos; the other is hipster cafes and local charm.",
    image:    "/images/blog/phrom-phong-vs-ekkamai-sukhumvit.webp",
    readTime: "11 min read",
  },
  {
    slug:     "things-not-to-do-in-thailand",
    category: "Expat Tips",
    title:    "10 Things You Must Never Do in Thailand: A Foreigner's Guide to Cultural Taboos & Laws",
    excerpt:  "Thailand is the 'Land of Smiles,' but minor cultural misunderstandings can lead to severe offense or even arrest. Here are 10 things you must never do.",
    image:    "/images/blog/things-not-to-do-in-thailand.webp",
    readTime: "12 min read",
  }
];

const categoryKeys: Record<string, string> = {
  "Activities": "activities",
  "Neighbourhood Guide": "neighbourhood",
  "Expat Tips": "expatTips",
  "Property Insights": "propertyInsights",
  "Family Living": "familyLiving",
};

interface BlogSectionProps {
  posts?: BlogPost[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
  const { t, lang } = useLanguage();
  const displayPosts = posts && posts.length > 0 ? posts : POSTS;

  const getLocalizedCategory = (cat: string) => {
    const key = categoryKeys[cat];
    return key ? (t.blog.blogCategories as Record<string, string>)[key] : cat;
  };

  const getLocalizedReadTime = (rt: string) => {
    if (lang === "th") {
      const num = rt.replace(" min read", "");
      return `อ่าน ${num} ${t.blog.minRead}`;
    }
    if (lang === "zh") {
      const num = rt.replace(" min read", "");
      return `${num} ${t.blog.minRead}`;
    }
    return rt;
  };

  return (
    <section className="py-10 px-4 md:px-6" style={{ background: "#FFFFFF" }}>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5"
            style={{ color: "#C9A84C" }}
          >
            {t.blog.label}
          </p>
          <h2
            className="text-[20px] font-bold leading-[1.3]"
            style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}
          >
            {t.blog.title}
          </h2>
        </div>
        <Link
          href="/blog"
          className="hidden md:block text-[12px] font-medium no-underline pb-px"
          style={{ color: "#1C3A2F", borderBottom: "1px solid #1C3A2F" }}
        >
          {t.blog.all}
        </Link>
      </div>

      {/* 4-col grid, 1 col mobile → 2 col tablet → 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayPosts.map((rawPost, idx) => {
          const post = getLocalizedPost(rawPost, lang);
          return (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={`group no-underline flex flex-col rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-lg ${
              idx >= 3 ? "hidden sm:flex" : "flex"
            }`}
            style={{ background: "#F7F3EC", border: "1px solid #E5E0D8" }}
          >
            {/* Cover image */}
            <div className="relative overflow-hidden flex-shrink-0" style={{ height: 190 }}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                quality={60}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Category pill over image */}
              <span
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: "#C9A84C", color: "#1C3A2F" }}
              >
                {getLocalizedCategory(post.category)}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-4">
              <h3
                className="text-[14px] font-bold leading-[1.4] mb-2 line-clamp-2"
                style={{ color: "#1A1A1A" }}
              >
                {post.title}
              </h3>
              <p
                className="text-[12px] font-light leading-[1.6] mb-4 line-clamp-3 flex-1"
                style={{ color: "#666" }}
              >
                {post.excerpt}
              </p>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #EDE8DF" }}>
                <span className="text-[11px]" style={{ color: "#999" }}>
                  {getLocalizedReadTime(post.readTime)}
                </span>
                <span
                  className="text-[11px] font-semibold flex items-center gap-1 transition-gap group-hover:gap-2"
                  style={{ color: "#1C3A2F" }}
                >
                  {t.blog.read}
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </div>
          </Link>
          );
        })}
      </div>

      <div className="sm:hidden mt-5">
        <Link
          href="/blog"
          className="flex items-center justify-center py-3.5 rounded-2xl text-[13px] font-semibold no-underline"
          style={{ background: "#F7F3EC", color: "#1C3A2F", border: "1px solid #E5E0D8" }}
        >
          {t.blog.all} →
        </Link>
      </div>
    </section>
  );
}
