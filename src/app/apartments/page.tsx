import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExploreClient from "@/components/explore/ExploreClient";
import { getDbProperties } from "@/lib/db/dbLoader";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Apartments for Rent & Sale | NHP Bangkok",
  description:
    "Discover spacious apartments for rent and sale across prime Bangkok neighborhoods. Ideal for families, digital nomads, and long-term expats.",
  alternates: {
    canonical: `${baseUrl}/apartments`,
  },
  openGraph: {
    title: "Bangkok Apartments for Rent & Sale | NHP Bangkok",
    description:
      "Discover spacious apartments for rent and sale across prime Bangkok neighborhoods. Ideal for families, digital nomads, and long-term expats.",
    url: `${baseUrl}/apartments`,
    siteName: "New Homes Property",
    images: [{ url: "/images/homepage_hero_v2.webp", width: 1200, height: 630, alt: "Bangkok Apartments" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangkok Apartments for Rent & Sale | NHP Bangkok",
    description:
      "Discover spacious apartments for rent and sale across prime Bangkok neighborhoods.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

export default async function ApartmentsPage() {
  const properties = await getDbProperties();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Bangkok Apartments", item: `${baseUrl}/apartments` },
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
            propertyType="apartment"
            heading={{ eyebrow: "Spacious Living", title: "Apartments for Rent & Sale in Bangkok" }}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
