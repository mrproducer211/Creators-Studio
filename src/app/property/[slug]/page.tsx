import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyDetail from "@/components/property/PropertyDetail";
import { getDbProperties } from "@/lib/db/dbLoader";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = await getDbProperties();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const all = await getDbProperties({ includeUnlisted: true });
  const p = all.find((x) => x.slug === slug);
  if (!p) return { title: "Property Not Found — NHP" };

  const title = `${p.name} — NHP Bangkok`;
  const description = p.description.slice(0, 160);
  const canonicalUrl = `https://nhpbangkok.com/property/${p.slug}`;
  const imageUrl = p.coverImage || "https://nhpbangkok.com/images/homepage_hero_v2.webp";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "NHP Bangkok",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: p.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/* ─────────────────────────────────────────────
   Adjacency map — for "nearby area" fallback
───────────────────────────────────────────── */
const NEARBY_AREAS: Record<string, string[]> = {
  "Sukhumvit": ["Asok", "Thong Lo", "Ekkamai", "On Nut"],
  "Sathorn":   ["Silom"],
  "Silom":     ["Sathorn"],
  "Thong Lo":  ["Ekkamai", "Sukhumvit", "On Nut"],
  "On Nut":    ["Ekkamai", "Sukhumvit", "Thong Lo"],
  "Ekkamai":   ["Thong Lo", "On Nut", "Sukhumvit"],
  "Asok":      ["Sukhumvit"],
  "Ari":       [],
};

/* Extract a building "hint" — text before any em-dash or comma */
function buildingHint(name: string): string {
  return name.split(/[—–-]/)[0].trim().toLowerCase();
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const all          = await getDbProperties({ includeUnlisted: true });
  const property = all.find((p) => p.slug === slug);
  if (!property) notFound();

  const bHint = buildingHint(property.name);

  // Recommendations should be active properties only
  const activeListings = all.filter((p) => p.status !== "unlisted");

  const currentBaseSlug = property.slug.replace(/-(?:sale|rent|short_stay)$/, "");
  const siblings = activeListings.filter((p) => {
    const pBase = p.slug.replace(/-(?:sale|rent|short_stay)$/, "");
    return pBase === currentBaseSlug;
  });

  // 1. Same building properties (excluding current)
  const sameBuilding = activeListings
    .filter((p) => p.id !== property.id && buildingHint(p.name) === bHint)
    .slice(0, 4);

  // 2. Nearby properties (excluding current and same building, matching area or adjacent areas)
  const nearbyAreas = NEARBY_AREAS[property.area] ?? [];
  const nearby = activeListings
    .filter((p) => 
      p.id !== property.id && 
      buildingHint(p.name) !== bHint && 
      (p.area === property.area || nearbyAreas.includes(p.area))
    )
    .slice(0, 4);

  // Structured Data (JSON-LD) for RealEstateListing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.name,
    "description": property.description,
    "url": `https://nhpbangkok.com/property/${property.slug}`,
    "image": property.coverImage || "https://nhpbangkok.com/images/homepage_hero_v2.webp",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.district || property.area,
      "addressRegion": "Bangkok",
      "addressCountry": "TH",
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "THB",
      "price": property.priceTHB,
      "url": `https://nhpbangkok.com/property/${property.slug}`,
      "category": property.listingType === "sale" ? "sale" : "rent",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main style={{ paddingTop: "56px", background: "#F7F3EC", minHeight: "100vh" }}>
        <PropertyDetail
          property={property}
          siblings={siblings}
          sameBuilding={sameBuilding}
          nearby={nearby}
          googleMapsApiKey={process.env.GOOGLE_PLACES_API_KEY}
        />
      </main>
      <Footer />
    </>
  );
}
