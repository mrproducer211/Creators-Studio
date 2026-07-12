import { notFound } from "next/navigation";
import { getDbProperties } from "@/lib/db/dbLoader";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import { NEIGHBORHOOD_GUIDES } from "@/data/neighborhoodGuides";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NeighborhoodClient from "@/components/explore/NeighborhoodClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const n = NEIGHBORHOODS.find((item) => item.slug.toLowerCase() === slug.toLowerCase());
  if (!n) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

  return {
    title: `${n.name} Condos & Rentals | Properties for Rent in ${n.name} Bangkok — NHP`,
    description: `Find the best properties for rent and sale in ${n.name}, Bangkok. Read our detailed expat neighborhood guide covering schools, BTS stations, cafes, and cost of living.`,
    alternates: {
      canonical: `${baseUrl}/neighborhood/${n.slug.toLowerCase()}`,
    },
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const { slug } = await params;
  const neighborhood = NEIGHBORHOODS.find(
    (item) => item.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!neighborhood) {
    notFound();
  }

  const allProperties = await getDbProperties();
  const guide = NEIGHBORHOOD_GUIDES[slug.toLowerCase()];

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
        "name": "Neighborhoods",
        "item": `${baseUrl}/neighborhood`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": neighborhood.name,
        "item": `${baseUrl}/neighborhood/${neighborhood.slug.toLowerCase()}`
      }
    ]
  };

  const placeJsonLd = (typeof neighborhood.lat === 'number' && typeof neighborhood.lng === 'number') ? {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": neighborhood.name,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": neighborhood.lat,
      "longitude": neighborhood.lng
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bangkok",
      "addressCountry": "TH"
    }
  } : null;
  
  const faqSchema = guide && guide.faqs && guide.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": guide.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {placeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <Navbar />
      <main className="min-h-screen" style={{ background: "#FAF8F3", paddingTop: "56px" }}>
        <NeighborhoodClient neighborhood={neighborhood} initialProperties={allProperties} />
      </main>
      <Footer />
    </>
  );
}
