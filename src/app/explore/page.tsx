import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { getDbProperties } from "@/lib/db/dbLoader";

// ISR: bare /explore is cached for 1 hour. Parameterized variants
// (/explore?area=...) still render dynamically since they read searchParams.
export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Properties & Condos for Rent & Sale | Search NHP Bangkok",
  description: "Explore neighbourhood properties for rent and sale in Bangkok. Filter by area, rental price, bedroom count, and property type to find your perfect home.",
  alternates: {
    canonical: `${baseUrl}/explore`,
  },
  openGraph: {
    title: "Bangkok Properties & Condos for Rent & Sale | Search NHP Bangkok",
    description: "Explore neighbourhood properties for rent and sale in Bangkok. Filter by area, rental price, bedroom count, and property type to find your perfect home.",
    url: `${baseUrl}/explore`,
    siteName: "New Homes Property",
    images: [
      {
        url: "/images/homepage_hero_v2.webp",
        width: 1200,
        height: 630,
        alt: "Explore Bangkok properties with NHP",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangkok Properties & Condos for Rent & Sale | Search NHP Bangkok",
    description: "Explore neighbourhood properties for rent and sale in Bangkok. Filter by area, rental price, bedroom count, and property type to find your perfect home.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

export default async function ExplorePage() {
  const properties = await getDbProperties();
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
        "name": "Explore Condos",
        "item": `${baseUrl}/explore`
      }
    ]
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bangkok Properties & Condos for Rent & Sale",
    description: "Explore neighbourhood properties for rent and sale in Bangkok.",
    url: `${baseUrl}/explore`,
    numberOfItems: properties.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: properties.length,
      itemListElement: properties.slice(0, 30).map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: p.name,
        url: `${baseUrl}/property/${p.slug}`,
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
      <main className="min-h-screen" style={{ background: "#F7F3EC", paddingTop: "56px" }}>
        {/* Full-width client section */}
        <Suspense fallback={null}>
          <ExploreClient properties={properties} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
