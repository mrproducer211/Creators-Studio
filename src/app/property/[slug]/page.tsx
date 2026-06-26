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

  const roomType = p.bedrooms === 0 ? "Studio" : `${p.bedrooms} Bed`;
  const propType = p.propertyType ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1) : "Condo";
  const action = p.listingType === "sale" ? "Sale" : "Rent";
  const priceVal = Number(p.priceTHB || 0);
  const priceStr = priceVal > 0 ? `฿${priceVal.toLocaleString()}` : "";
  const label = p.priceLabel || (p.listingType === "rent" ? "/mo" : "");
  
  const title = `${roomType} ${propType} for ${action} in ${p.area} | ${priceStr}${label} — NHP`;
  const description = p.description.slice(0, 160);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");
  const canonicalUrl = `${baseUrl}/property/${p.slug}`;
  
  let imageUrl = p.coverImage || "/images/homepage_hero_v2.webp";
  if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }
  // Convert Cloudinary WebP to JPG for better social platform link preview support
  if (imageUrl.includes("cloudinary.com") && imageUrl.endsWith(".webp")) {
    imageUrl = imageUrl.slice(0, -5) + ".jpg";
  }

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
          width: 1200,
          height: 630,
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

  let pageImageUrl = property.coverImage || "/images/homepage_hero_v2.webp";
  if (!pageImageUrl.startsWith("http://") && !pageImageUrl.startsWith("https://")) {
    pageImageUrl = `${baseUrl}${pageImageUrl.startsWith("/") ? "" : "/"}${pageImageUrl}`;
  }

  // Structured Data (JSON-LD) for RealEstateListing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.name,
    "description": property.description,
    "url": `${baseUrl}/property/${property.slug}`,
    "image": pageImageUrl,
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
      "url": `${baseUrl}/property/${property.slug}`,
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
