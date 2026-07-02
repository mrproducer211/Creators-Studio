import Navbar from "@/components/Navbar";
import Image from "next/image";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/store/blog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bangkok Property Guides & Expat Tips — NHP Blog",
  description: "Expert guides on living in Bangkok — neighbourhood comparisons, rental prices, digital nomad tips and family relocation advice from the NHP team.",
};

export default async function BlogPage() {
  const POSTS = await getAllPosts();
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", minHeight: "100vh" }}>
        {/* Header */}
        <div className="px-4 md:px-8 py-10" style={{ background: "#1C3A2F" }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: "#C9A84C" }}>
              Local Guides
            </p>
            <h1 className="text-[28px] md:text-[36px] font-bold mb-3" style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}>
              Know Bangkok before you arrive
            </h1>
            <p className="text-[14px] font-light max-w-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
              Honest neighbourhood guides, rental price breakdowns, expat tips and family relocation advice — written by the NHP team who live here.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {POSTS.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group no-underline flex flex-col rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
                style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
              >
                <div className="relative overflow-hidden flex-shrink-0" style={{ height: 220 }}>
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: "#C9A84C", color: "#1C3A2F" }}>
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <h2 className="text-[16px] font-bold leading-[1.4] mb-2 line-clamp-2" style={{ color: "#1A1A1A" }}>
                    {post.title}
                  </h2>
                  <p className="text-[13px] font-light leading-[1.6] mb-4 line-clamp-3 flex-1" style={{ color: "#666" }}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #EDE8DF" }}>
                    <span className="text-[11px]" style={{ color: "#999" }}>{post.readTime}</span>
                    <span className="text-[12px] font-semibold" style={{ color: "#1C3A2F" }}>
                      Read more →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
