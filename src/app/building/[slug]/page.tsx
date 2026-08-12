import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuildingClient from "@/components/building/BuildingClient";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAggregateRatingForProperty, getAllReviews } from "@/lib/store/reviews";
import { cleanBuildingName, slugifyBuildingName, getBuildingSlug } from "@/lib/buildingSlug";
import { getCanonicalArea } from "@/lib/area";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const allProperties = await getDbProperties();

  const buildingProps = allProperties.filter((p) => {
    const pSlug = slugifyBuildingName(p.projectName || p.name);
    return pSlug === slug;
  });

  if (buildingProps.length === 0) {
    return { title: "Building Not Found | NHP Bangkok" };
  }

  const sample = buildingProps[0];
  const buildingName = cleanBuildingName(sample.projectName || sample.name);
  const area = sample.area;
  const description = `Explore ${buildingName} in ${area}, Bangkok. View available rental units, sale prices, building amenities, BTS/MRT access, and verified tenant reviews.`;

  return {
    title: `${buildingName} Condos for Rent & Sale in ${area} Bangkok (2026) | NHP`,
    description,
    alternates: {
      canonical: `${baseUrl}/building/${slug}`,
    },
    openGraph: {
      title: `${buildingName} Condos for Rent & Sale in ${area} Bangkok (2026) | NHP`,
      description,
      url: `${baseUrl}/building/${slug}`,
      siteName: "New Homes Property",
      images: [
        {
          url: sample.coverImage || "/images/homepage_hero_v2.webp",
          width: 1200,
          height: 630,
          alt: `${buildingName} Condos Bangkok`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${buildingName} Condos for Rent & Sale in ${area} Bangkok (2026) | NHP`,
      description,
      images: [sample.coverImage || "/images/homepage_hero_v2.webp"],
    },
  };
}

export default async function BuildingPage({ params }: Props) {
  const { slug } = await params;
  const allProperties = await getDbProperties();

  const buildingProperties = allProperties.filter((p) => {
    const rawName = p.projectName || p.name;
    const pSlug = getBuildingSlug(rawName);
    const pDirectSlug = slugifyBuildingName(rawName);
    return pSlug === slug || pDirectSlug === slug;
  });

  if (buildingProperties.length === 0) {
    redirect("/buildings");
  }

  const sample = buildingProperties[0];
  const buildingName = cleanBuildingName(sample.projectName || sample.name);
  const area = sample.area;
  const aggregate = await getAggregateRatingForProperty(sample.id, buildingName);

  const reviews = await getAllReviews();
  const publishedReviews = reviews.filter((r) => r.status === "published");
  const targetCanonicalArea = getCanonicalArea(area);

  // Group other building projects strictly in the same canonical area or adjacent BTS corridor
  const buildingMap = new Map<string, { slug: string; name: string; area: string; coverImage?: string; minPrice: number; unitCount: number; ratingValue?: number; reviewCount?: number; propertyIds: Set<number> }>();

  allProperties.forEach((p) => {
    const bName = cleanBuildingName(p.projectName || p.name);
    const bSlug = slugifyBuildingName(bName);
    if (!bSlug || bSlug === slug) return;

    const propCanonicalArea = getCanonicalArea(p.area);

    // Strictly match same canonical neighborhood area
    if (propCanonicalArea === targetCanonicalArea) {
      const existing = buildingMap.get(bSlug);
      const priceNum = Number(p.priceTHB) || 0;
      if (existing) {
        existing.unitCount += 1;
        existing.propertyIds.add(p.id);
        if (priceNum > 0 && (existing.minPrice === 0 || priceNum < existing.minPrice)) {
          existing.minPrice = priceNum;
        }
      } else {
        buildingMap.set(bSlug, {
          slug: bSlug,
          name: bName,
          area: p.area,
          coverImage: p.coverImage,
          minPrice: priceNum,
          unitCount: 1,
          ratingValue: 0,
          reviewCount: 0,
          propertyIds: new Set([p.id]),
        });
      }
    }
  });

  // Calculate review ratings for each nearby building project
  buildingMap.forEach((b, bSlug) => {
    const bRevs = publishedReviews.filter((r) => {
      if (r.propertyId && b.propertyIds.has(Number(r.propertyId))) return true;
      const rSlug = r.projectSlug || slugifyBuildingName(r.projectName);
      return rSlug && rSlug === bSlug;
    });

    if (bRevs.length > 0) {
      const sum = bRevs.reduce((acc, r) => acc + r.rating, 0);
      b.reviewCount = bRevs.length;
      b.ratingValue = Number((sum / bRevs.length).toFixed(1));
    }
  });

  const nearbyBuildings = Array.from(buildingMap.values()).map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { propertyIds, ...b } = item;
    return b;
  }).slice(0, 4);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: `${area} Condos`, item: `${baseUrl}/explore?area=${area}` },
      { "@type": "ListItem", position: 3, name: buildingName, item: `${baseUrl}/building/${slug}` },
    ],
  };

  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": ["Product", "ApartmentComplex"],
    name: buildingName,
    description: `Condo building located in ${area}, Bangkok offering units for rent and sale.`,
    url: `${baseUrl}/building/${slug}`,
    image: sample.coverImage || "/images/homepage_hero_v2.webp",
    address: {
      "@type": "PostalAddress",
      addressLocality: sample.district || area,
      addressRegion: "Bangkok",
      addressCountry: "TH",
    },
  };

  if (aggregate.reviewCount > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: aggregate.ratingValue,
      reviewCount: aggregate.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen" style={{ background: "#F7F3EC", paddingTop: "56px" }}>
        <BuildingClient
          buildingSlug={slug}
          buildingName={buildingName}
          properties={buildingProperties}
          nearbyBuildings={nearbyBuildings}
        />
      </main>
      <Footer />
    </>
  );
}
