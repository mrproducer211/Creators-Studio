import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyDetail from "@/components/property/PropertyDetail";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAggregateRatingForProperty } from "@/lib/store/reviews";
import { NEIGHBORHOODS } from "@/data/neighborhoods";

import { generateCleanSeoSlug } from "@/lib/seoEnricher";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

function findPropertyBySlug(all: any[], slug: string) {
  if (!slug) return undefined;
  const lower = slug.toLowerCase().trim();
  const lowerNoTg = lower.replace(/-tg-\d+$/, "");

  return all.find((p) => {
    if (p.slug && p.slug.toLowerCase().trim() === lower) return true;
    if (p.dbSlug && p.dbSlug.toLowerCase().trim() === lower) return true;
    if (p.id && String(p.id) === lower) return true;
    
    // Check clean SEO slug match
    const clean = generateCleanSeoSlug(p).toLowerCase().trim();
    if (clean === lower) return true;
    
    // Check base name without -tg- suffix match
    if (p.slug) {
      const pSlugNoTg = p.slug.toLowerCase().replace(/-tg-\d+$/, "");
      if (pSlugNoTg === lowerNoTg || pSlugNoTg === lower || clean === lowerNoTg) return true;
    }

    return false;
  });
}

export async function generateStaticParams() {
  const all = await getDbProperties();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const all = await getDbProperties({ includeUnlisted: true });
  const p = findPropertyBySlug(all, slug);
  if (!p) return { title: "Property Not Found — NHP" };

  const roomType = p.bedrooms === 0 ? "Studio" : `${p.bedrooms} Bedroom`;
  const propType = p.propertyType ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1) : "Condo";
  const action = p.listingType === "sale" ? "Sale" : p.listingType === "short_stay" ? "Short-Term Rent" : "Rent";
  const priceVal = Number(p.priceTHB || 0);
  const priceStr = priceVal > 0 ? `฿${priceVal.toLocaleString()}` : "";
  const label = p.priceLabel || (p.listingType === "sale" ? "" : "/mo");
  
  const seoTitle = `${roomType} ${propType} for ${action} in ${p.name}`;
  const title = `${seoTitle}, ${p.area} Bangkok | NHP`;
  const description = `Spacious ${seoTitle} at ${p.area}, Bangkok. ${p.sqm ? `${p.sqm} sqm layout. ` : ""}${priceStr ? `Offered at ${priceStr}${label}. ` : ""}View photos & details at New Homes Property.`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");
  
  // Canonical normalization: if property is a short_stay variation and a primary rent/sale listing exists, point canonical to primary
  let canonicalSlug = p.slug;
  if (p.slug.endsWith("-short_stay")) {
    const primaryRentSlug = p.slug.replace(/-short_stay$/, "-rent");
    const primarySaleSlug = p.slug.replace(/-short_stay$/, "-sale");
    if (all.some((x) => x.slug === primaryRentSlug)) {
      canonicalSlug = primaryRentSlug;
    } else if (all.some((x) => x.slug === primarySaleSlug)) {
      canonicalSlug = primarySaleSlug;
    }
  }
  const canonicalUrl = `${baseUrl}/property/${canonicalSlug}`;
  
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

/* Extract a building "hint" — uses projectName if set, otherwise extracts from name text */
function buildingHint(p: { projectName?: string; name: string }): string {
  if (p.projectName) return p.projectName.trim().toLowerCase();
  return p.name.split(/[—–-]/)[0].trim().toLowerCase();
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const all          = await getDbProperties({ includeUnlisted: true });
  const property = findPropertyBySlug(all, slug);
  if (!property) notFound();

  const bHint = buildingHint(property);

  // Recommendations should be active properties only
  const activeListings = all.filter((p) => p.status !== "unlisted");

  const currentBaseSlug = property.slug.replace(/-(?:sale|rent|short_stay)$/, "");
  const siblings = activeListings.filter((p) => {
    const pBase = p.slug.replace(/-(?:sale|rent|short_stay)$/, "");
    return pBase === currentBaseSlug;
  });

  // 1. Same building properties (excluding current)
  const sameBuilding = activeListings
    .filter((p) => p.id !== property.id && buildingHint(p) === bHint)
    .slice(0, 4);

  // Set of property IDs to exclude from Nearby properties (current property + any property in "More from this building")
  const excludedIds = new Set<string | number>([
    property.id,
    ...sameBuilding.map((p) => p.id),
  ]);

  // Set of building hints to exclude from Nearby properties (current property's building + any building in "More from this building")
  const excludedBuildingHints = new Set<string>(
    [bHint, ...sameBuilding.map((p) => buildingHint(p))].filter(Boolean)
  );

  // 2. Nearby properties (excluding current property ID, properties/buildings already in "More from this building", matching area or adjacent areas)
  const nearbyAreas = NEARBY_AREAS[property.area] ?? [];
  const nearby = activeListings
    .filter((p) => {
      if (excludedIds.has(p.id)) return false;
      const pBHint = buildingHint(p);
      if (pBHint && excludedBuildingHints.has(pBHint)) return false;
      return p.area === property.area || nearbyAreas.includes(p.area);
    })
    .slice(0, 4);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

  let pageImageUrl = property.coverImage || "/images/homepage_hero_v2.webp";
  if (!pageImageUrl.startsWith("http://") && !pageImageUrl.startsWith("https://")) {
    pageImageUrl = `${baseUrl}${pageImageUrl.startsWith("/") ? "" : "/"}${pageImageUrl}`;
  }

  // Generate caption: e.g. "{beds}-bedroom {type}, {neighbourhood}, Bangkok"
  const bedStr = property.bedrooms === 0 ? "Studio" : `${property.bedrooms}-bedroom`;
  const typeStr = property.propertyType ? property.propertyType.toLowerCase() : "property";
  const areaStr = property.area || "";
  
  let imageCaption = `${bedStr} ${typeStr}`;
  if (areaStr) {
    imageCaption += `, ${areaStr}`;
  }
  imageCaption += `, Bangkok`;

  const resolveAbsoluteUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const coverImageObject = {
    "@type": "ImageObject",
    "url": pageImageUrl,
    "caption": imageCaption
  };

  let schemaImages: any = coverImageObject;

  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    const allImageObjects = [
      coverImageObject,
      ...property.images.map((imgUrl: string, index: number) => ({
        "@type": "ImageObject",
        "url": resolveAbsoluteUrl(imgUrl),
        "caption": `${imageCaption} - Image ${index + 1}`
      }))
    ];
    // Remove duplicate cover images if present in images array
    const uniqueImagesMap = new Map();
    allImageObjects.forEach(imgObj => {
      if (imgObj.url) {
        uniqueImagesMap.set(imgObj.url, imgObj);
      }
    });
    schemaImages = Array.from(uniqueImagesMap.values());
    if (schemaImages.length === 1) {
      schemaImages = schemaImages[0];
    }
  }

  const unitType = (property.propertyType === "condo" || property.propertyType === "apartment") ? "Apartment" : "House";

  // Offer availability derived from listing status
  const availability = property.status === "sold" || property.status === "rented"
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";

  // Business function: sale vs rent/lease
  const businessFunction = property.listingType === "sale"
    ? "https://schema.org/Sell"
    : "https://schema.org/RentOut";

  const aggregate = await getAggregateRatingForProperty(property.id, property.projectName || property.name);

  // Structured Data (JSON-LD): Product + Apartment/House with Offer.
  // `Product` enables Google price/review rich results; `Apartment`/`House`
  // adds real-estate semantics and carries the `address` property.
  // (Replaces the pending `RealEstateListing` type Google's validator rejects.)
  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": ["Product", unitType],
    "name": property.name,
    "description": property.description,
    "url": `${baseUrl}/property/${property.slug}`,
    "image": schemaImages,
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
      "availability": availability,
      "businessFunction": businessFunction,
      "category": property.listingType === "sale" ? "sale" : "rent",
      "itemOffered": {
        "@type": unitType,
        "name": property.name,
      },
    },
  };

  if (aggregate.reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": aggregate.ratingValue,
      "reviewCount": aggregate.reviewCount,
      "bestRating": "5",
      "worstRating": "1",
    };
  }

  // Find matching neighborhood to link to /neighborhood/[slug] instead of /explore?area={area}
  const matchingNeighborhood = NEIGHBORHOODS.find((n) => {
    const areaLower = property.area.toLowerCase().trim();
    const matchesName = n.name.toLowerCase().trim() === areaLower;
    const matchesAlias = n.aliases?.some((alias) => alias.toLowerCase().trim() === areaLower);
    return matchesName || matchesAlias;
  });

  const neighborhoodUrl = matchingNeighborhood
    ? `${baseUrl}/neighborhood/${matchingNeighborhood.slug.toLowerCase()}`
    : `${baseUrl}/explore?area=${encodeURIComponent(property.area)}`;

  // Structured Data (JSON-LD) for BreadcrumbList
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
        "name": property.listingType === "sale" ? "Buy" : property.listingType === "rent" ? "Rent" : "Short Stay",
        "item": `${baseUrl}/explore`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": property.area,
        "item": neighborhoodUrl
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": property.name,
        "item": `${baseUrl}/property/${property.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
