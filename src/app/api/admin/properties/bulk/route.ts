import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties as propertiesTable } from "@/lib/db/schema";
import { getDbProperties, createAuditLog } from "@/lib/db/dbLoader";
import { createProperty } from "@/lib/store/properties";
import { requireAdminApi } from "@/lib/auth-helpers";

// GET /api/admin/properties/bulk — Export all listings as a JSON dump
export async function GET() {
  const authCheck = await requireAdminApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }

  try {
    const list = await getDbProperties();
    return new NextResponse(JSON.stringify(list, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="nhp-properties-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    console.error("Properties export error:", err);
    return NextResponse.json({ error: "Failed to export properties" }, { status: 500 });
  }
}

// POST /api/admin/properties/bulk — Bulk import listings
export async function POST(req: Request) {
  const authCheck = await requireAdminApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }
  const adminUser = authCheck.user;

  try {
    const body = await req.json();
    const listings = Array.isArray(body) ? body : [body];

    if (!listings || listings.length === 0) {
      return NextResponse.json({ error: "Empty property array" }, { status: 400 });
    }

    let successCount = 0;
    const errors: string[] = [];

    const dbUrl = process.env.DATABASE_URL || "";
    const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

    for (const item of listings) {
      const {
        slug, name, description, listingType, propertyType,
        priceTHB, priceUSD, priceLabel, bedrooms, bathrooms, sqm, floor, totalFloors,
        area, district, coverImage, images, videoUrl, likes, views, saves, clicks,
        featured, hasVideo, petFriendly, nearBts, verificationBadge, expiryDate,
        amenities, features, schools, transit, neighborhood
      } = item;

      // Basic validation
      if (!slug || !name || !listingType || !propertyType || !priceTHB || !area) {
        errors.push(`Skipped "${name || slug || 'Unknown Listing'}": Missing required fields (slug, name, listingType, propertyType, priceTHB, or area).`);
        continue;
      }

      if (isDbValid) {
        try {
          await db.insert(propertiesTable).values({
            slug,
            name,
            description: description || null,
            listingType,
            propertyType,
            priceTHB: String(priceTHB),
            priceUSD: priceUSD ? String(priceUSD) : null,
            priceLabel: priceLabel || null,
            bedrooms: Number(bedrooms) || 0,
            bathrooms: Number(bathrooms) || 1,
            sqm: sqm ? Number(sqm) : null,
            floor: floor ? Number(floor) : null,
            totalFloors: totalFloors ? Number(totalFloors) : null,
            area,
            district: district || null,
            coverImage: coverImage || null,
            images: images || [],
            videoUrl: videoUrl || null,
            likes: Number(likes) || 0,
            views: Number(views) || 0,
            saves: Number(saves) || 0,
            clicks: Number(clicks) || 0,
            featured: !!featured,
            hasVideo: !!hasVideo,
            petFriendly: !!petFriendly,
            nearBts: !!nearBts,
            verificationBadge: !!verificationBadge,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            amenities: amenities || [],
            features: features || [],
            schools: schools || [],
            transit: transit || [],
            neighborhood: neighborhood || null,
          });
          successCount++;
        } catch (dbErr) {
          errors.push(`Database error importing "${name}": ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`);
        }
      } else {
        // Fallback fileStore insertion
        try {
          await createProperty({
            slug, name, description: description || "", listingType, propertyType,
            priceTHB, priceUSD, priceLabel, bedrooms, bathrooms, sqm,
            area, district, coverImage, images, videoUrl, likes: likes || 0, saves: saves || 0, clicks: clicks || 0,
            featured: !!featured, hasVideo: !!hasVideo, petFriendly: !!petFriendly, nearBts: !!nearBts,
            verificationBadge: !!verificationBadge, expiryDate: expiryDate || undefined,
            amenities: amenities || [], features: features || [], schools: schools || [], transit: transit || [],
            neighborhood: neighborhood || "",
          });
          successCount++;
        } catch (storeErr) {
          errors.push(`Local store error importing "${name}": ${storeErr instanceof Error ? storeErr.message : String(storeErr)}`);
        }
      }
    }

    await createAuditLog(
      adminUser.email,
      "bulk_import",
      `Bulk imported ${successCount} listings successfully. Failed: ${errors.length}.`
    );

    return NextResponse.json({
      success: true,
      importedCount: successCount,
      failedCount: errors.length,
      errors: errors.slice(0, 100), // Cap output error list size
    });
  } catch (err) {
    console.error("Properties import error:", err);
    return NextResponse.json({ error: "Failed to process bulk import JSON" }, { status: 500 });
  }
}
