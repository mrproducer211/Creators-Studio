import { NextResponse } from "next/server";
import { getDbProperties } from "@/lib/db/dbLoader";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  const listingType = searchParams.get("type");
  const propertyType = searchParams.get("propertyType");
  const bedrooms = searchParams.get("bedrooms");
  const maxPrice = searchParams.get("maxPrice");

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://newhomesproperty.com");

  try {
    const all = await getDbProperties({ includeUnlisted: false });

    let filtered = all.filter((p) => p.status === "active");

    if (area) {
      const areaLower = area.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.area.toLowerCase().includes(areaLower) ||
          (p.district && p.district.toLowerCase().includes(areaLower))
      );
    }

    if (listingType) {
      filtered = filtered.filter(
        (p) => p.listingType === listingType.toLowerCase()
      );
    }

    if (propertyType) {
      filtered = filtered.filter(
        (p) => p.propertyType === propertyType.toLowerCase()
      );
    }

    if (bedrooms) {
      const bedsNum = parseInt(bedrooms, 10);
      if (!isNaN(bedsNum)) {
        filtered = filtered.filter((p) => p.bedrooms === bedsNum);
      }
    }

    if (maxPrice) {
      const maxP = parseFloat(maxPrice);
      if (!isNaN(maxP)) {
        filtered = filtered.filter(
          (p) => Number(p.priceTHB || 0) <= maxP
        );
      }
    }

    const formattedListings = filtered.slice(0, 50).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      url: `${baseUrl}/property/${p.slug}`,
      listingType: p.listingType,
      propertyType: p.propertyType,
      priceTHB: Number(p.priceTHB),
      priceLabel: p.priceLabel || (p.listingType === "sale" ? "" : "/month"),
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqm: p.sqm,
      area: p.area,
      district: p.district,
      btsStation: p.btsStation,
      btsWalkMin: p.btsWalkMin,
      coverImage: p.coverImage,
      petFriendly: p.petFriendly,
      foreignQuota: p.foreignQuota,
      description: p.description ? p.description.slice(0, 300) : "",
    }));

    return NextResponse.json(
      {
        status: "success",
        total: formattedListings.length,
        properties: formattedListings,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Public API Error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
