import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/store/blog";
import BlogIndexClient from "@/components/blog/BlogIndexClient";
import NewsletterCapture from "@/components/blog/NewsletterCapture";
import { Suspense } from "react";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Property Guides & Expat Tips — NHP Blog",
  description: "Expert guides on living in Bangkok — neighbourhood comparisons, rental prices, digital nomad tips and family relocation advice from the NHP team.",
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: "Bangkok Property Guides & Expat Tips — NHP Blog",
    description: "Expert guides on living in Bangkok — neighbourhood comparisons, rental prices, digital nomad tips and family relocation advice from the NHP team.",
    url: `${baseUrl}/blog`,
    siteName: "New Homes Property",
    images: [
      {
        url: "/images/homepage_hero_v2.webp",
        width: 1200,
        height: 630,
        alt: "New Homes Property Blog",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangkok Property Guides & Expat Tips — NHP Blog",
    description: "Expert guides on living in Bangkok — neighbourhood comparisons, rental prices, digital nomad tips and family relocation advice from the NHP team.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

export default async function BlogPage() {
  const POSTS = await getAllPosts();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${baseUrl}/blog`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", minHeight: "100vh" }}>
        {/* Header */}
        <div className="px-4 md:px-8 py-8 md:py-12" style={{ background: "#1C3A2F" }}>
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5" style={{ color: "#C9A84C" }}>
              Local Guides
            </p>
            <h1 className="text-[24px] sm:text-[28px] md:text-[36px] font-bold mb-2 md:mb-3 leading-[1.2] md:leading-[1.15]" style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}>
              Know Bangkok before you arrive
            </h1>
            <p className="text-[13px] md:text-[14px] font-light max-w-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
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
