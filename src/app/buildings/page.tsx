import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuildingsDirectoryClient, { BuildingProjectInfo } from "@/components/buildings/BuildingsDirectoryClient";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAllReviews } from "@/lib/store/reviews";
import { cleanBuildingName, slugifyBuildingName } from "@/lib/buildingSlug";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Condo Buildings Directory (2026) | Explore Condo Projects — NHP",
  description: "Browse top condo buildings and luxury residential projects across Bangkok. Compare amenities, floor plans, verified tenant reviews, and available rental units.",
  alternates: {
    canonical: `${baseUrl}/buildings`,
  },
  openGraph: {
    title: "Bangkok Condo Buildings Directory (2026) | Explore Condo Projects — NHP",
    description: "Browse top condo buildings and luxury residential projects across Bangkok. Compare amenities, floor plans, verified tenant reviews, and available rental units.",
    url: `${baseUrl}/buildings`,
    siteName: "New Homes Property",
    images: [
      {
        url: "/images/homepage_hero_v2.webp",
        width: 1200,
        height: 630,
        alt: "Bangkok Condo Buildings Directory",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangkok Condo Buildings Directory (2026) | Explore Condo Projects — NHP",
    description: "Browse top condo buildings and luxury residential projects across Bangkok. Compare amenities, floor plans, verified tenant reviews, and available rental units.",
    images: ["/images/homepage_hero_v2.webp"],
  },
};

export default async function BuildingsDirectoryPage() {
  const properties = await getDbProperties();
  const reviews = await getAllReviews();

  const publishedReviews = reviews.filter((r) => r.status === "published");

  // Group properties into unique building project cards
  const projectMap = new Map<string, BuildingProjectInfo & { propertyIds: Set<number> }>();

  properties.forEach((p) => {
    const rawName = p.projectName || p.name;
    const cleanName = cleanBuildingName(rawName);
    const slug = slugifyBuildingName(cleanName);
    if (!slug) return;

    const priceNum = Number(p.priceTHB) || 0;
    const existing = projectMap.get(slug);

    const matchingNeighborhood = NEIGHBORHOODS.find((n) => {
      const areaLower = p.area.toLowerCase().trim();
      return (
        n.slug.toLowerCase() === areaLower ||
        n.name.toLowerCase().trim() === areaLower ||
        n.aliases?.some((alias) => alias.toLowerCase().trim() === areaLower)
      );
    });

    const bts = p.btsStation || undefined;
    const mrt = p.mrtStation || undefined;
    const transit = bts
      ? `${bts} BTS`
      : mrt
      ? `${mrt} MRT`
      : (p.transit && p.transit.length > 0)
      ? p.transit[0]
      : matchingNeighborhood?.nearestTransit;

    if (existing) {
      existing.unitCount += 1;
      existing.propertyIds.add(p.id);
      if (p.listingType === "rent") existing.rentCount += 1;
      if (p.listingType === "sale") existing.saleCount += 1;
      if (p.listingType === "short_stay") existing.shortStayCount += 1;
      if (p.petFriendly) existing.petFriendly = true;
      if (p.nearBts) existing.nearBts = true;
      if (!existing.btsStation && bts) existing.btsStation = bts;
      if (!existing.mrtStation && mrt) existing.mrtStation = mrt;
      if (!existing.nearestTransit && transit) existing.nearestTransit = transit;

      if (priceNum > 0) {
        if (p.listingType === "rent" || p.listingType === "short_stay") {
          (existing as any).minRentPrice = (existing as any).minRentPrice > 0 ? Math.min((existing as any).minRentPrice, priceNum) : priceNum;
        } else if (p.listingType === "sale") {
          (existing as any).minSalePrice = (existing as any).minSalePrice > 0 ? Math.min((existing as any).minSalePrice, priceNum) : priceNum;
        }
      }
    } else {
      const isRentOrShort = p.listingType === "rent" || p.listingType === "short_stay";
      const isSale = p.listingType === "sale";
      projectMap.set(slug, {
        slug,
        name: cleanName,
        area: p.area,
        district: p.district || undefined,
        coverImage: p.coverImage || undefined,
        minPrice: priceNum,
        unitCount: 1,
        rentCount: p.listingType === "rent" ? 1 : 0,
        saleCount: p.listingType === "sale" ? 1 : 0,
        shortStayCount: p.listingType === "short_stay" ? 1 : 0,
        petFriendly: Boolean(p.petFriendly),
        nearBts: Boolean(p.nearBts || bts || mrt || (transit && transit.toLowerCase().includes("bts"))),
        nearestTransit: transit || undefined,
        btsStation: bts,
        mrtStation: mrt,
        ratingValue: 0,
        reviewCount: 0,
        propertyIds: new Set([p.id]),
        ...( { minRentPrice: isRentOrShort && priceNum > 0 ? priceNum : 0, minSalePrice: isSale && priceNum > 0 ? priceNum : 0 } as any ),
      });
    }
  });

  // Finalize minPrice to be the cheapest room price (preferring lowest rental/short-stay room, or lowest sale room)
  projectMap.forEach((b: any) => {
    if (b.minRentPrice > 0 && b.minSalePrice > 0) {
      b.minPrice = Math.min(b.minRentPrice, b.minSalePrice);
    } else if (b.minRentPrice > 0) {
      b.minPrice = b.minRentPrice;
    } else if (b.minSalePrice > 0) {
      b.minPrice = b.minSalePrice;
    }
  });

  // Calculate review rating scores for each building project
  projectMap.forEach((b, slug) => {
    const buildingRevs = publishedReviews.filter((r) => {
      // 1. Direct property ID match
      if (r.propertyId && b.propertyIds.has(Number(r.propertyId))) return true;

      // 2. Project slug / name match
      const rSlug = r.projectSlug || slugifyBuildingName(r.projectName);
      return rSlug && rSlug === slug;
    });

    if (buildingRevs.length > 0) {
      const sum = buildingRevs.reduce((acc, r) => acc + r.rating, 0);
      b.reviewCount = buildingRevs.length;
      b.ratingValue = Number((sum / buildingRevs.length).toFixed(1));
    }
  });

  const buildingProjects = Array.from(projectMap.values()).map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { propertyIds, ...b } = item;
    return b;
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Condo Buildings Directory", item: `${baseUrl}/buildings` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen" style={{ background: "#FAF8F3", paddingTop: "56px" }}>
        <Suspense fallback={
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="mb-8">
              <div className="h-4 w-36 bg-[#1C3A2F]/10 rounded animate-pulse mb-2" />
              <div className="h-8 w-72 bg-[#1C3A2F]/10 rounded animate-pulse mb-3" />
              <div className="h-4 w-96 max-w-full bg-[#1C3A2F]/5 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[280px] rounded-2xl bg-[#1C3A2F]/5 animate-pulse" />
              ))}
            </div>
          </div>
        }>
          <BuildingsDirectoryClient buildingProjects={buildingProjects} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
