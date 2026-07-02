"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { BlogPost } from "@/data/blogPosts";
import Link from "next/link";
import Image from "next/image";

const POSTS = [
  {
    slug:     "thong-lo-vs-on-nut",
    category: "Neighbourhood Guide",
    title:    "Thong Lo vs On Nut: Which Bangkok Neighbourhood Suits You?",
    excerpt:  "Both are BTS-connected, expat-friendly and full of great food — but the vibe, price and lifestyle are worlds apart. Here's how to choose.",
    image:    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&q=80",
    readTime: "5 min read",
  },
  {
    slug:     "digital-nomad-guide-sukhumvit",
    category: "Expat Tips",
    title:    "A Digital Nomad's Complete Guide to Living in Sukhumvit",
    excerpt:  "From co-working spaces to SIM cards, health insurance and the best coffee shops with reliable Wi-Fi — everything you need before you land.",
    image:    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&q=80",
    readTime: "8 min read",
  },
  {
    slug:     "what-40k-gets-you-bangkok",
    category: "Property Insights",
    title:    "What ฿40,000/Month Gets You in Bangkok's Top Areas",
    excerpt:  "A studio in Thong Lo, a 2-bed in On Nut, or a penthouse in Ari? We break down exactly what your budget unlocks district by district.",
    image:    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&q=80",
    readTime: "6 min read",
  },
  {
    slug:     "international-schools-bangkok",
    category: "Family Living",
    title:    "Top International Schools Near Bangkok's Expat Neighbourhoods",
    excerpt:  "Relocating with children? We map the best international schools against the city's most liveable expat areas so the commute never becomes the sacrifice.",
    image:    "/images/blog/bangkok_international_school.webp",
    readTime: "7 min read",
  },
];

const categoryKeys: Record<string, string> = {
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

      {/* 4-col grid — 1 col mobile → 2 col tablet → 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group no-underline flex flex-col rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-lg"
            style={{ background: "#F7F3EC", border: "1px solid #E5E0D8" }}
          >
            {/* Cover image */}
            <div className="relative overflow-hidden flex-shrink-0" style={{ height: 190 }}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
        ))}
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
