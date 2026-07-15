import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/data/blogPosts";

interface Props {
  post: BlogPost;
  displayCategory?: string;
}

export default function BlogFeaturedHero({ post, displayCategory }: Props) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group no-underline flex flex-row rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 mb-6 md:mb-10 w-full"
      style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
    >
      {/* Image container */}
      <div className="relative w-[35%] md:w-1/2 aspect-[4/5] md:aspect-auto min-h-[140px] md:min-h-[360px] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          sizes="(max-width: 768px) 35vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-103"
        />
        {/* Desktop Badge only */}
        <div className="absolute top-4 left-4 hidden md:flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#C9A84C", color: "#1C3A2F" }}
          >
            Featured · {displayCategory || post.category}
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

      {/* Content Container */}
      <div className="w-[65%] md:w-1/2 p-3.5 md:p-10 flex flex-col justify-center md:justify-between gap-2 md:gap-6">
        <div className="flex flex-col gap-1.5 md:gap-3">
          {/* Mobile-only Badge */}
          <div className="flex items-center gap-1.5 md:hidden">
            <span
              className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider"
              style={{ background: "#C9A84C", color: "#1C3A2F" }}
            >
              Featured
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
              {displayCategory || post.category}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1 text-[9px] md:text-[11px] font-medium" style={{ color: "#999" }}>
            <span className="hidden md:inline">{post.author}</span>
            <span className="hidden md:inline">·</span>
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>

          <h2
            className="text-[14px] sm:text-[18px] md:text-[28px] font-bold leading-snug group-hover:text-[#C9A84C] transition-colors font-outfit line-clamp-3 md:line-clamp-none"
            style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}
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
            Read Article →
          </span>
        </div>
      </div>
    </Link>
  );
}
