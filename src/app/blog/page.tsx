import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/store/blog";
import BlogIndexClient from "@/components/blog/BlogIndexClient";
import NewsletterCapture from "@/components/blog/NewsletterCapture";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bangkok Property Guides & Expat Tips — NHP Blog",
  description: "Expert guides on living in Bangkok — neighbourhood comparisons, rental prices, digital nomad tips and family relocation advice from the NHP team.",
  alternates: {
    canonical: "/blog",
  },
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

        {/* Client Side Search, Filter and Grid */}
        <Suspense fallback={<div className="text-center py-10 text-xs text-gray-500">Loading guides...</div>}>
          <BlogIndexClient initialPosts={POSTS} />
        </Suspense>
        <div className="pb-10">
          <NewsletterCapture />
        </div>
      </main>
      <Footer />
    </>
  );
}
