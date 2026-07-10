import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPropertyById, createProperty, updateProperty } from "@/lib/store/properties";
import { db, isDbConfigured } from "@/lib/db";
import { properties as propertiesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSystemSettings } from "@/lib/store/settings";
import { findLeadByEmail } from "@/lib/store/leads";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const propertyId = Number(id);
  if (isNaN(propertyId)) {
    return NextResponse.json({ error: "Invalid property ID." }, { status: 400 });
  }

  const userEmail = session.user.email?.toLowerCase();
  const userRole = (session.user as { role?: string })?.role || "user";

  try {
    // 1. Fetch old property
    let oldProp: any = null;
    if (isDbConfigured) {
      const dbProp = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.id, propertyId))
        .limit(1);
      if (dbProp.length > 0) {
        oldProp = dbProp[0];
      }
    } else {
      oldProp = await getPropertyById(propertyId);
    }

    if (!oldProp) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    // 2. Authorize (Admin or Property Owner)
    const isOwner = oldProp.agentEmail && oldProp.agentEmail.toLowerCase() === userEmail;
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "You are not authorized to renew this property." }, { status: 403 });
    }

    // 3. Clear expiry date on old property so it stops prompting
    if (isDbConfigured) {
      await db
        .update(propertiesTable)
        .set({ expiryDate: null })
        .where(eq(propertiesTable.id, propertyId));
    } else {
      await updateProperty(propertyId, { expiryDate: undefined });
    }

    // 4. Calculate new expiry date based on settings
    const settings = await getSystemSettings();
    const expiryDays = settings.rentalExpiryDays || 30;
    const newExpiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    // 5. Check if agent requireVerification setting applies to new property
    let requireVerification = false;
    if (oldProp.agentEmail) {
      const agent = await findLeadByEmail(oldProp.agentEmail);
      if (agent?.requireVerification) {
        requireVerification = true;
      }
    }

    const targetStatus = requireVerification ? "unlisted" : "active";
    const pendingVerification = requireVerification;

    // 6. Clone to new property
    const newSlug = `${slugify(oldProp.name)}-${Date.now()}`;
    const newPropPayload = {
      slug: newSlug,
      name: oldProp.name,
      description: oldProp.description || "",
      listingType: oldProp.listingType,
      propertyType: oldProp.propertyType,
      priceTHB: Number(oldProp.priceTHB),
      priceUSD: oldProp.priceUSD ? Number(oldProp.priceUSD) : undefined,
      priceLabel: oldProp.priceLabel || undefined,
      bedrooms: oldProp.bedrooms,
      bathrooms: oldProp.bathrooms,
      sqm: oldProp.sqm ? Number(oldProp.sqm) : undefined,
      floor: oldProp.floor ? Number(oldProp.floor) : undefined,
      totalFloors: oldProp.totalFloors ? Number(oldProp.totalFloors) : undefined,
      area: oldProp.area,
      district: oldProp.district || undefined,
      latitude: oldProp.latitude ? String(oldProp.latitude) : undefined,
      longitude: oldProp.longitude ? String(oldProp.longitude) : undefined,
      coverImage: oldProp.coverImage || undefined,
      images: oldProp.images || [],
      videoUrl: oldProp.videoUrl || undefined,
      likes: 0,
      saves: 0,
      clicks: 0,
      viewCount: 0,
      featured: false,
      hasVideo: oldProp.hasVideo ?? false,
      petFriendly: oldProp.petFriendly ?? false,
      nearBts: oldProp.nearBts ?? false,
      verificationBadge: oldProp.verificationBadge ?? false,
      expiryDate: newExpiryDate,
      amenities: oldProp.amenities || [],
      features: oldProp.features || [],
      schools: oldProp.schools || [],
      transit: oldProp.transit || [],
      neighborhood: oldProp.neighborhood || undefined,
      furnishing: oldProp.furnishing || undefined,
      leaseTerms: oldProp.leaseTerms || undefined,
      agentEmail: oldProp.agentEmail || undefined,
      status: targetStatus,
      pendingVerification,
    };

    let createdProp: any = null;
    if (isDbConfigured) {
      const [dbCreated] = await db
        .insert(propertiesTable)
        .values({
          ...newPropPayload,
          status: newPropPayload.status === "unlisted" ? "draft" : newPropPayload.status,
          priceTHB: String(newPropPayload.priceTHB),
          priceUSD: newPropPayload.priceUSD ? String(newPropPayload.priceUSD) : null,
          latitude: newPropPayload.latitude || null,
          longitude: newPropPayload.longitude || null,
          expiryDate: new Date(newExpiryDate),
        } as any)
        .returning();
      createdProp = {
        ...dbCreated,
        priceTHB: Number(dbCreated.priceTHB),
        priceUSD: dbCreated.priceUSD ? Number(dbCreated.priceUSD) : undefined,
        status: dbCreated.status === "draft" ? "unlisted" : dbCreated.status,
      };
    } else {
      createdProp = await createProperty(newPropPayload as any);
    }

    return NextResponse.json({ success: true, property: createdProp });
  } catch (err) {
    console.error("Property renewal error:", err);
    return NextResponse.json({ error: "Failed to renew property." }, { status: 500 });
  }
}
