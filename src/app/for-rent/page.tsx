import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { getDbProperties } from "@/lib/db/dbLoader";

// Hub page: crawlable landing for "long-term rentals" (replaces the
// robots-disallowed /explore?type=rent). Cached for 1 hour.
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Condos & Apartments For Long-Term Rent | NHP",
  description:
    "Find long-term rental condos and apartments in Bangkok — Sukhumvit, Thong Lo, Asok, Sathorn, Ari and more. Filter by area, budget, bedrooms and BTS/MRT access.",
  alternates: {
    canonical: `${baseUrl}/for-rent`,
  },
  openGraph: {
    title: "Bangkok Condos & Apartments For Long-Term Rent | NHP",
    description:
      "Find long-term rental condos and apartments in Bangkok — Sukhumvit, Thong Lo, Asok, Sathorn, Ari and more. Filter by area, budget, bedrooms and BTS/MRT access.",
    url: `${baseUrl}/for-rent`,
    siteName: "New Homes Property",
    images: [{ url: "/images/homepage_hero_v2.webp", width: 1200, height: 630, alt: "Bangkok long-term rentals" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangkok Condos & Apartments For Long-Term Rent | NHP",
    description:
      "Find long-term rental condos and apartments in Bangkok — Sukhumvit, Thong Lo, Asok, Sathorn, Ari and more.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

export default async function ForRentPage() {
  const properties = await getDbProperties();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Long-Term Rentals", item: `${baseUrl}/for-rent` },
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
        <Suspense fallback={null}>
          <ExploreClient
            properties={properties}
            listingType="rent"
            heading={{ eyebrow: "Rent in Bangkok", title: "Long-Term Rentals in Bangkok" }}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
