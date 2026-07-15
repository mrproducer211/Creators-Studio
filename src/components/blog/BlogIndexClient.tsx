"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { BlogPost } from "@/data/blogPosts";
import BlogFeaturedHero from "./BlogFeaturedHero";

export function getJourneyCategory(post: BlogPost): string {
  const slug = post.slug;
  const dbCat = post.category;
  
  if (dbCat === "Digital Nomad" || slug === "thailand-ltr-visa-remote-workers") {
    return "Digital Nomad";
  }
  if (dbCat === "Retirement in Thailand" || slug === "retiring-in-bangkok-retirement-visa-guide") {
    return "Retirement";
  }
  if (
    dbCat === "Hidden Bangkok" ||
    dbCat === "Things To Do" ||
    slug === "hidden-gem-restaurants-bangkok" ||
    slug === "things-not-to-do-in-thailand"
  ) {
    return "Things to Do";
  }
  if (
    dbCat === "Neighbourhood Guide" ||
    slug === "thong-lo-vs-on-nut" ||
    slug === "phrom-phong-vs-ekkamai-sukhumvit" ||
    slug === "ari-neighbourhood-guide" ||
    slug === "opening-bank-account-thailand" ||
    slug === "medical-care-expat-guide" ||
    slug === "learning-thai-expat-guide" ||
    slug === "thailand-elite-visa-guide" ||
    slug === "safest-bangkok-neighbourhoods-families"
  ) {
    return "Moving to Bangkok";
  }
  if (
    dbCat === "Expat Tips" ||
    slug === "thai-taxes-expats-guide" ||
    slug === "buying-property-thailand-foreigner" ||
    slug === "living-in-nonthaburi-guide" ||
    slug === "silom-after-dark-expat-guide"
  ) {
    return "Living in Bangkok";
  }
  return "Moving to Bangkok";
}

interface Props {
  initialPosts: BlogPost[];
}

export default function BlogIndexClient({ initialPosts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag) {
      setSearchQuery(tag);
      setSelectedCategory("All");
    }
  }, [searchParams]);

  // Explicit Journey-Stage Categories
  const categories = [
    "All",
    "Moving to Bangkok",
    "Living in Bangkok",
    "Things to Do",
    "Digital Nomad",
    "Retirement"
  ];

  // Filter posts based on journey category and search query
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const journeyCategory = getJourneyCategory(post);
      const matchesCategory =
        selectedCategory === "All" || journeyCategory === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (post.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  // The first post in the filtered list is the featured post
  const featuredPost = filteredPosts[0];
  // The remaining posts go into the grid
  const gridPosts = filteredPosts.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-8 flex flex-col gap-5 md:gap-8">
      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDE8DF] pb-4 md:pb-6">
        {/* Category Pills (Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border cursor-pointer"
                style={{
                  background: isActive ? "#1C3A2F" : "#FFFFFF",
                  borderColor: isActive ? "#1C3A2F" : "#E5E0D8",
                  color: isActive ? "#FFFFFF" : "#555555",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 flex-shrink-0">
          <input
            type="text"
            placeholder="Search guides & articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl text-[13px] outline-none border transition-all"
            style={{
              borderColor: "#E5E0D8",
              background: "#FFFFFF",
              color: "#1A1A1A",
              fontFamily: "inherit",
            }}
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 text-gray-400 hover:text-gray-600 flex items-center justify-center"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Featured Post Card */}
      {featuredPost ? (
        <BlogFeaturedHero post={featuredPost} displayCategory={getJourneyCategory(featuredPost)} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-gray-300 mb-3">🔍</div>
          <h3 className="text-base font-bold text-[#1C3A2F] mb-1">No articles found</h3>
          <p className="text-xs text-gray-500 max-w-xs">
            We couldn't find any articles matching your search. Try adjusting your filters or keywords.
          </p>
        </div>
      )}

      {/* Regular Posts Grid */}
      {gridPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {gridPosts.map((post) => {
            const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group no-underline flex flex-col rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
                style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
              >
                {/* Image */}
                <div className="relative overflow-hidden flex-shrink-0 aspect-[16/10] bg-gray-100">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: "#C9A84C", color: "#1C3A2F" }}
                    >
                      {getJourneyCategory(post)}
                    </span>
                    {post.trending && (
                      <span
                        className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse"
                        style={{ background: "#FF6B6B", color: "#FFFFFF" }}
                      >
                        🔥 Trending
                      </span>
                    )}
                  </div>
                </div>

                {/* Info & Text */}
                <div className="flex flex-col flex-1 p-4 md:p-5 justify-between gap-3.5 md:gap-4">
                  <div className="flex flex-col gap-1.5 md:gap-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                      <span>{formattedDate}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3
                      className="text-[15px] font-bold leading-snug line-clamp-2 group-hover:text-[#C9A84C] transition-colors m-0"
                      style={{ color: "#1A1A1A" }}
                    >
                      {post.title}
                    </h3>

                    <p className="text-[12.5px] font-light leading-relaxed line-clamp-3 text-gray-500 m-0">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 md:pt-3" style={{ borderTop: "1px solid #EDE8DF" }}>
                    <span className="text-[11px] font-medium" style={{ color: "#999" }}>
                      By {post.author.replace(" NHP Bangkok Team", "NHP")}
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: "#1C3A2F" }}>
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
