import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { validateProperty } from "@/lib/validation";
import { getPropertyById, updateProperty, deleteProperty, getPropertyBySlug } from "@/lib/store/properties";
import { getCanonicalArea } from "@/lib/area";
import { db } from "@/lib/db";
import { PropertyCard } from "@/types/property";
import { properties as propertiesTable } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { createAuditLog } from "@/lib/db/dbLoader";
import { revalidateProperty } from "@/lib/revalidate";

interface Ctx { params: Promise<{ id: string }> }

async function parseId(params: Ctx["params"]): Promise<number | null> {
  const { id } = await params;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const id = await parseId(ctx.params);
  if (id == null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  // Try DB first
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
    try {
      const [p] = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.id, id))
        .limit(1);
      
      if (p) {
        return NextResponse.json({
          property: {
            ...p,
            priceTHB: Number(p.priceTHB),
            priceUSD: p.priceUSD ? Number(p.priceUSD) : undefined,
            images: p.images || [],
            amenities: p.amenities || [],
            features: p.features || [],
            schools: p.schools || [],
            transit: p.transit || [],
          }
        });
      }
    } catch (err) {
      console.warn("DB get failed, falling back to local file store:", err);
    }
  }

  const p = await getPropertyById(id);
  if (!p) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ property: p });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;
  const adminUser = guard.user;

  const id = await parseId(ctx.params);
  if (id == null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = validateProperty(body);
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 422 });
  const val = result.value;
  val.area = getCanonicalArea(val.area);

  // DB Logic
  const dbUrl = process.env.DATABASE_URL || "";
  const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

  if (isDbValid) {
    try {
      // Slug uniqueness checks in DB
      const dup = await db
        .select()
        .from(propertiesTable)
        .where(and(eq(propertiesTable.slug, val.slug), ne(propertiesTable.id, id)))
        .limit(1);
      
      if (dup.length > 0) {
        return NextResponse.json({ errors: { slug: "Slug already in use." } }, { status: 422 });
      }

      const [updated] = await db
        .update(propertiesTable)
        .set({
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
        .where(eq(propertiesTable.id, id))
        .returning();

      if (updated) {
        await createAuditLog(
          adminUser.email,
          "edit_property",
          `Updated listing #${id} ("${val.name}") in database`
        );
        revalidateProperty(updated.slug, updated.area);
        return NextResponse.json({
          property: {
            ...updated,
            priceTHB: Number(updated.priceTHB),
            priceUSD: updated.priceUSD ? Number(updated.priceUSD) : undefined,
          }
        });
      }
    } catch (dbErr) {
      console.warn("DB update failed, falling back to local file store:", dbErr);
    }
  }

  // Fallback JSON fileStore update
  const dup = await getPropertyBySlug(val.slug);
  if (dup && dup.id !== id) {
    return NextResponse.json({ errors: { slug: "Slug already in use." } }, { status: 422 });
  }

  const updated = await updateProperty(id, val);
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await createAuditLog(
    adminUser.email,
    "edit_property",
    `Updated listing #${id} ("${val.name}") in local JSON store`
  );
  revalidateProperty(updated.slug, updated.area);
  return NextResponse.json({ property: updated });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;
  const adminUser = guard.user;

  const id = await parseId(ctx.params);
  if (id == null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const { status, pendingVerification, expiryDate } = b;
  const patch: { status?: string; pendingVerification?: boolean; expiryDate?: string | null } = {};
  if (status !== undefined) patch.status = status as string;
  if (pendingVerification !== undefined) patch.pendingVerification = pendingVerification as boolean;
  if (expiryDate !== undefined) {
    patch.expiryDate = expiryDate ? new Date(expiryDate as string).toISOString() : null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  // DB logic
  const dbUrl = process.env.DATABASE_URL || "";
  const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

  if (isDbValid) {
    try {
      const dbPatch: Partial<typeof propertiesTable.$inferInsert> = {};
      if (patch.status !== undefined) {
        dbPatch.status = (patch.status === "unlisted" ? "draft" : patch.status) as "active" | "sold" | "rented" | "draft";
      }
      if (patch.pendingVerification !== undefined) dbPatch.pendingVerification = patch.pendingVerification;
      if (patch.expiryDate !== undefined) {
        dbPatch.expiryDate = patch.expiryDate ? new Date(patch.expiryDate) : null;
      }

      const [updated] = await db
        .update(propertiesTable)
        .set(dbPatch)
        .where(eq(propertiesTable.id, id))
        .returning();

      if (updated) {
        await createAuditLog(
          adminUser.email,
          "edit_property",
          `Patched listing #${id} in database`
        );
        revalidateProperty(updated.slug, updated.area);
        return NextResponse.json({
          property: {
            ...updated,
            priceTHB: Number(updated.priceTHB),
            priceUSD: updated.priceUSD ? Number(updated.priceUSD) : undefined,
            status: updated.status === "draft" ? "unlisted" : updated.status,
          }
        });
      }
    } catch (err) {
      console.warn("DB patch failed, falling back to local file store:", err);
    }
  }

  // File store logic
  const localPatch: Partial<PropertyCard> = {};
  if (patch.status !== undefined) localPatch.status = patch.status as PropertyCard["status"];
  if (patch.pendingVerification !== undefined) localPatch.pendingVerification = patch.pendingVerification;
  if (patch.expiryDate !== undefined) {
    localPatch.expiryDate = patch.expiryDate || undefined;
  }

  const updated = await updateProperty(id, localPatch);
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await createAuditLog(
    adminUser.email,
    "edit_property",
    `Patched listing #${id} in local JSON store`
  );
  revalidateProperty(updated.slug, updated.area);

  return NextResponse.json({ property: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;
  const adminUser = guard.user;

  const id = await parseId(ctx.params);
  if (id == null) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  // Get property first for revalidation before deletion
  const dbUrl = process.env.DATABASE_URL || "";
  const isDbValid = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
  const prop = isDbValid ? null : await getPropertyById(id);

  // DB logic
  if (isDbValid) {
    try {
      const [deleted] = await db
        .delete(propertiesTable)
        .where(eq(propertiesTable.id, id))
        .returning();
      
      if (deleted) {
        await createAuditLog(
          adminUser.email,
          "delete_property",
          `Deleted listing #${id} ("${deleted.name}") from database`
        );
        revalidateProperty(deleted.slug, deleted.area);
        return NextResponse.json({ success: true });
      }
    } catch (err) {
      console.warn("DB delete failed, falling back to local file store:", err);
    }
  }

  const ok = await deleteProperty(id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await createAuditLog(
    adminUser.email,
    "delete_property",
    `Deleted listing #${id} from local JSON store`
  );
  if (prop) {
    revalidateProperty(prop.slug, prop.area);
  }
  return NextResponse.json({ success: true });
}
