import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { validateProperty } from "@/lib/validation";
import { createProperty, getPropertyBySlug } from "@/lib/store/properties";
import { getDbProperties, createAuditLog } from "@/lib/db/dbLoader";
import { getCanonicalArea } from "@/lib/area";
import { db } from "@/lib/db";
import { properties as propertiesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { submitToGoogleIndexing } from "@/lib/google-indexing";

export async function GET() {
  const guard = await requireAdminApi();
  if ("error" in guard) {
    return guard.error;
  }
  
  // Return database properties with mock fallback
  const list = await getDbProperties();
  return NextResponse.json({ properties: list });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if ("error" in guard) {
    return guard.error;
  }
  const adminUser = guard.user;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = validateProperty(body);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 422 });
  }

  const val = result.value;
  val.area = getCanonicalArea(val.area);

  // Database creation
  const dbUrl = process.env.DATABASE_URL || "";
  const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

  if (isDbValid) {
    try {
      // Validate slug uniqueness in DB
      const existing = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.slug, val.slug))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json({ errors: { slug: "Slug already in use." } }, { status: 422 });
      }

      const [created] = await db
        .insert(propertiesTable)
        .values({
          slug: val.slug,
          name: val.name,
          description: val.description,
          listingType: val.listingType,
          propertyType: val.propertyType,
          priceTHB: String(val.priceTHB),
          priceUSD: val.priceUSD ? String(val.priceUSD) : null,
          priceLabel: val.priceLabel || null,
          bedrooms: val.bedrooms,
          bathrooms: val.bathrooms,
          sqm: val.sqm || null,
          area: val.area,
          district: val.district || null,
          coverImage: val.coverImage || null,
          images: val.images || [],
          videoUrl: val.videoUrl || null,
          likes: val.likes,
          saves: val.saves,
          clicks: val.clicks,
          featured: val.featured,
          hasVideo: val.hasVideo,
          petFriendly: val.petFriendly,
          nearBts: val.nearBts,
          verificationBadge: val.verificationBadge ?? false,
          expiryDate: val.expiryDate ? new Date(val.expiryDate) : null,
          amenities: val.amenities || [],
          features: val.features || [],
          schools: val.schools || [],
          transit: val.transit || [],
          neighborhood: val.neighborhood || null,
        })
        .returning();

      await createAuditLog(
        adminUser.email,
        "create_property",
        `Created listing "${val.name}" (Slug: ${val.slug}) in database`
      );

      // Notify Google immediately (fire-and-forget — never blocks the API response)
      submitToGoogleIndexing(`https://newhomesproperty.com/property/${val.slug}`).catch((err) =>
        console.warn("Google Indexing ping failed:", err)
      );

      return NextResponse.json({ property: created }, { status: 201 });
    } catch (dbErr) {
      console.warn("DB insert failed, falling back to local fileStore:", dbErr);
    }
  }

  // Fallback JSON fileStore creation
  const existing = await getPropertyBySlug(val.slug);
  if (existing) {
    return NextResponse.json({ errors: { slug: "Slug already in use." } }, { status: 422 });
  }

  const created = await createProperty(val);
  await createAuditLog(
    adminUser.email,
    "create_property",
    `Created listing "${val.name}" (Slug: ${val.slug}) in local JSON store`
  );

  // Notify Google immediately (fire-and-forget — never blocks the API response)
  submitToGoogleIndexing(`https://newhomesproperty.com/property/${val.slug}`).catch((err) =>
    console.warn("Google Indexing ping failed:", err)
  );

  return NextResponse.json({ property: created }, { status: 201 });
}
