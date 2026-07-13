import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/data/blogPosts";

interface Props {
  post: BlogPost;
}

export default function BlogFeaturedHero({ post }: Props) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group no-underline flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 mb-6 md:mb-10 w-full"
      style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
    >
      {/* Image container */}
      <div className="relative w-full md:w-1/2 aspect-[16/10] md:aspect-auto min-h-[200px] md:min-h-[360px] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-103"
        />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#C9A84C", color: "#1C3A2F" }}
          >
            Featured · {post.category}
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
      <div className="w-full md:w-1/2 p-5 md:p-10 flex flex-col justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="flex items-center gap-3 text-[11px] font-medium" style={{ color: "#999" }}>
            <span>{post.author}</span>
            <span>·</span>
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>

          <h2
            className="text-[20px] md:text-[28px] font-bold leading-tight group-hover:text-[#C9A84C] transition-colors font-outfit"
            style={{ color: "#1C3A2F", letterSpacing: "-0.5px" }}
          >
            {post.title}
          </h2>

          <p className="text-[13px] md:text-[14px] font-light leading-relaxed text-gray-500 m-0 line-clamp-4">
            {post.excerpt}
          </p>
        </div>

        <div>
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
