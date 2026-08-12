import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { getDbProperties } from "@/lib/db/dbLoader";

// Hub page: crawlable landing for "properties for sale" (replaces the
// robots-disallowed /explore?type=sale). Cached for 1 hour.
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Condos & Property For Sale | NHP",
  description:
    "Browse condos, apartments, and houses for sale in Bangkok's top neighborhoods like Sukhumvit, Thong Lo & Sathorn. Verified listings with photos and prices.",
  alternates: {
    canonical: `${baseUrl}/for-sale`,
  },
  openGraph: {
    title: "Bangkok Condos & Property For Sale | NHP",
    description:
      "Browse condos, apartments, and houses for sale in Bangkok's top neighborhoods like Sukhumvit, Thong Lo & Sathorn. Verified listings with photos and prices.",
    url: `${baseUrl}/for-sale`,
    siteName: "New Homes Property",
    images: [{ url: "/images/homepage_hero_v2.webp", width: 1200, height: 630, alt: "Bangkok property for sale" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangkok Condos & Property For Sale | NHP",
    description:
      "Browse condos, apartments, and houses for sale in Bangkok's top neighborhoods like Sukhumvit, Thong Lo & Sathorn. Verified listings with photos and prices.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

import SeoCategoryGuide from "@/components/seo/SeoCategoryGuide";
import { CATEGORY_SEO_GUIDES } from "@/data/categorySeoGuides";

export default async function ForSalePage() {
  const properties = await getDbProperties();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Property For Sale", item: `${baseUrl}/for-sale` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen" style={{ background: "#F7F3EC", paddingTop: "56px" }}>
        <Suspense fallback={
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="h-8 w-64 bg-[#1C3A2F]/10 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[340px] rounded-2xl bg-[#1C3A2F]/5 animate-pulse" />
              ))}
            </div>
          </div>
        }>
          <ExploreClient
            properties={properties}
            listingType="sale"
            heading={{ eyebrow: "Buy in Bangkok", title: "Property For Sale in Bangkok" }}
          />
        </Suspense>

        <SeoCategoryGuide {...CATEGORY_SEO_GUIDES.sale} canonicalUrl={`${baseUrl}/for-sale`} />
      </main>
      <Footer />
    </>
  );
}
