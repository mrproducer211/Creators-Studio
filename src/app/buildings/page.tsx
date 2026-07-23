import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BuildingsDirectoryClient, { BuildingProjectInfo } from "@/components/buildings/BuildingsDirectoryClient";
import { getDbProperties } from "@/lib/db/dbLoader";
import { getAllReviews } from "@/lib/store/reviews";
import { slugifyBuildingName } from "@/lib/buildingSlug";

export const revalidate = 3600;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://newhomesproperty.com");

export const metadata = {
  title: "Bangkok Condo Buildings Directory (2026) | Explore Condo Projects — NHP",
  description: "Browse top condo buildings and residential projects across Bangkok's prime neighborhoods. Search by area, pet friendliness, and view active units for rent & sale.",
  alternates: {
    canonical: `${baseUrl}/buildings`,
  },
  openGraph: {
    title: "Bangkok Condo Buildings Directory (2026) | Explore Condo Projects — NHP",
    description: "Browse top condo buildings and residential projects across Bangkok's prime neighborhoods. Search by area, pet friendliness, and view active units for rent & sale.",
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
    description: "Browse top condo buildings and residential projects across Bangkok's prime neighborhoods. Search by area, pet friendliness, and view active units for rent & sale.",
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
    const name = p.projectName || p.name;
    const slug = slugifyBuildingName(name);
    if (!slug) return;

    const priceNum = Number(p.priceTHB) || 0;
    const existing = projectMap.get(slug);

    if (existing) {
      existing.unitCount += 1;
      existing.propertyIds.add(p.id);
      if (p.listingType === "rent") existing.rentCount += 1;
      if (p.listingType === "sale") existing.saleCount += 1;
      if (p.listingType === "short_stay") existing.shortStayCount += 1;
      if (p.petFriendly) existing.petFriendly = true;

      if (priceNum > 0 && (existing.minPrice === 0 || priceNum < existing.minPrice)) {
        existing.minPrice = priceNum;
      }
    } else {
      projectMap.set(slug, {
        slug,
        name,
        area: p.area,
        district: p.district || undefined,
        coverImage: p.coverImage || undefined,
        minPrice: priceNum,
        unitCount: 1,
        rentCount: p.listingType === "rent" ? 1 : 0,
        saleCount: p.listingType === "sale" ? 1 : 0,
        shortStayCount: p.listingType === "short_stay" ? 1 : 0,
        petFriendly: Boolean(p.petFriendly),
        ratingValue: 0,
        reviewCount: 0,
        propertyIds: new Set([p.id]),
      });
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

  const buildingProjects = Array.from(projectMap.values()).map(({ propertyIds, ...b }) => b);

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
        <Suspense fallback={null}>
          <BuildingsDirectoryClient buildingProjects={buildingProjects} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
