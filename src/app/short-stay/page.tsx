import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { getDbProperties } from "@/lib/db/dbLoader";

// Hub page: crawlable landing for "short-stay rentals" (replaces the
// robots-disallowed /explore?type=short_stay). Cached for 1 hour.
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Short-Stay & Serviced Apartments | NHP",
  description:
    "Book short-stay and serviced apartments in Bangkok for days, weeks or months. Flexible furnished rentals in Sukhumvit, Thong Lo, Asok, Sathorn and more.",
  alternates: {
    canonical: `${baseUrl}/short-stay`,
  },
  openGraph: {
    title: "Bangkok Short-Stay & Serviced Apartments | NHP",
    description:
      "Book short-stay and serviced apartments in Bangkok for days, weeks or months. Flexible furnished rentals in Sukhumvit, Thong Lo, Asok, Sathorn and more.",
    url: `${baseUrl}/short-stay`,
    siteName: "New Homes Property",
    images: [{ url: "/images/homepage_hero_v2.webp", width: 1200, height: 630, alt: "Bangkok short-stay apartments" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangkok Short-Stay & Serviced Apartments | NHP",
    description:
      "Book short-stay and serviced apartments in Bangkok for days, weeks or months. Flexible furnished rentals in Sukhumvit, Thong Lo, Asok, Sathorn and more.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

import SeoCategoryGuide from "@/components/seo/SeoCategoryGuide";
import { CATEGORY_SEO_GUIDES } from "@/data/categorySeoGuides";

export default async function ShortStayPage() {
  const properties = await getDbProperties();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Short-Stay Rentals", item: `${baseUrl}/short-stay` },
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
            listingType="short_stay"
            heading={{ eyebrow: "Short Stay in Bangkok", title: "Short-Stay & Serviced Apartments in Bangkok" }}
          />
        </Suspense>

        <SeoCategoryGuide {...CATEGORY_SEO_GUIDES.short_stay} canonicalUrl={`${baseUrl}/short-stay`} />
      </main>
      <Footer />
    </>
  );
}
