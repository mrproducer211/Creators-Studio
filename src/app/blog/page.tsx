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

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bangkok Property Guides & Expat Tips — NHP Blog",
    description: "Expert guides on living in Bangkok — neighbourhood comparisons, rental prices, digital nomad tips and family relocation advice.",
    url: `${baseUrl}/blog`,
    numberOfItems: POSTS.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: POSTS.length,
      itemListElement: POSTS.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: `${baseUrl}/blog/${post.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", minHeight: "100vh" }}>
        {/* Header — translated by BlogIndexClient */}

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
