import { db, isDbConfigured } from "./index";
import {
  properties as propertiesTable,
  enquiries as enquiriesTable,
  appointments as appointmentsTable,
  pageViews as pageViewsTable,
  auditLogs as auditLogsTable,
} from "./schema";
import { desc, eq, sql, and, lt } from "drizzle-orm";
import { getAllLocalAppointments } from "@/lib/store/appointments";
import { getAllEnquiries } from "@/lib/store/enquiries";
import { getSystemSettings } from "@/lib/store/settings";
import { PropertyCard } from "@/types/property";
import { writeJson } from "@/lib/store/fileStore";
import { getCanonicalArea } from "@/lib/area";
import { enrichPropertyDescription, generateCleanSeoSlug } from "@/lib/seoEnricher";
import { getAllProperties, getPropertyById, updateProperty } from "@/lib/store/properties";

let lastExpiryCheck = 0;
const EXPIRY_CHECK_INTERVAL = 1000 * 60 * 60; // Run once per hour max to optimize performance

export async function checkAndRunListingExpiry() {
  const now = new Date();
  const currentTime = now.getTime();
  if (currentTime - lastExpiryCheck < EXPIRY_CHECK_INTERVAL) {
    return;
  }
  lastExpiryCheck = currentTime;

  try {
    const settings = await getSystemSettings();
    if (isDbConfigured) {
      // 1. Unlist if past explicit expiry date
      await db
        .update(propertiesTable)
        .set({ status: "draft" })
        .where(
          and(
            eq(propertiesTable.status, "active"),
            lt(propertiesTable.expiryDate, now)
          )
        );

      // 2. Unlist if past general rental expiry threshold
      if (settings.rentalExpiryEnabled && settings.rentalExpiryDays > 0) {
        const threshold = new Date(Date.now() - settings.rentalExpiryDays * 24 * 60 * 60 * 1000);
        await db
          .update(propertiesTable)
          .set({ status: "draft" })
          .where(
            and(
              eq(propertiesTable.status, "active"),
              eq(propertiesTable.listingType, "rent"),
              lt(propertiesTable.createdAt, threshold)
            )
          );
      }
    } else {
      const all = await getAllProperties();
      let changed = false;
      const updated = all.map((p) => {
        if (p.status !== "unlisted") {
          // Explicit expiry date check
          if (p.expiryDate && now > new Date(p.expiryDate)) {
            changed = true;
            return { ...p, status: "unlisted" as const };
          }
          // General rental auto-expiry check
          if (settings.rentalExpiryEnabled && settings.rentalExpiryDays > 0 && p.listingType === "rent") {
            const threshold = new Date(Date.now() - settings.rentalExpiryDays * 24 * 60 * 60 * 1000);
            if (new Date(p.createdAt) < threshold) {
              changed = true;
              return { ...p, status: "unlisted" as const };
            }
          }
        }
        return p;
      });

      if (changed) {
        await writeJson("properties.json", updated);
      }
    }
  } catch (err) {
    console.error("Listing expiry check error:", err);
  }
}

export async function getDbProperties(options?: { includeUnlisted?: boolean }): Promise<PropertyCard[]> {
  const includeUnlisted = options?.includeUnlisted ?? false;

  // Run auto expiry checker
  await checkAndRunListingExpiry();

  if (!isDbConfigured) {
    const localList = await getAllProperties();
    const visibleList = includeUnlisted ? localList : localList.filter((p) => p.status !== "unlisted" && p.status !== "draft");
    return visibleList.map((p) => ({
      ...p,
      area: getCanonicalArea(p.area),
      clicks: p.clicks ?? 0,
      amenities: p.amenities ?? [],
      features: p.features ?? [],
      schools: p.schools ?? [],
      transit: p.transit ?? [],
      neighborhood: p.neighborhood ?? "",
      verificationBadge: p.verificationBadge ?? false,
      expiryDate: p.expiryDate ?? undefined,
      updatedAt: p.updatedAt || p.createdAt,
    }));
  }
  try {
    const list = await db
      .select()
      .from(propertiesTable)
      .orderBy(desc(propertiesTable.createdAt));
    
    // Map Drizzle output model to PropertyCard shape
    if (list && list.length > 0) {
      const seenSlugs = new Set<string>();
      const mapped = list.map((p) => {
        const priceTHB = Number(p.priceTHB);
        const priceUSD = p.priceUSD ? Number(p.priceUSD) : undefined;
        const priceLabel = p.priceLabel || undefined;
        const areaCanonical = getCanonicalArea(p.area);

        const enrichedDesc = enrichPropertyDescription({
          name: p.name,
          description: p.description || "",
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqm: p.sqm || undefined,
          floor: p.floor || undefined,
          area: areaCanonical,
          district: p.district || undefined,
          listingType: p.listingType,
          propertyType: p.propertyType,
          priceTHB,
          priceLabel,
          btsStation: p.btsStation || undefined,
          btsWalkMin: p.btsWalkMin || undefined,
          mrtStation: p.mrtStation || undefined,
          mrtWalkMin: p.mrtWalkMin || undefined,
          petFriendly: p.petFriendly ?? false,
          foreignQuota: p.foreignQuota ?? false,
          amenities: p.amenities || [],
        });

        const cleanSeoSlug = generateCleanSeoSlug(
          {
            bedrooms: p.bedrooms,
            propertyType: p.propertyType,
            listingType: p.listingType,
            name: p.name,
            id: p.id,
          },
          seenSlugs
        );
        const finalSlug = p.slug || cleanSeoSlug;
        seenSlugs.add(finalSlug);

        return {
          id: p.id,
          slug: finalSlug,
          dbSlug: p.slug || undefined,
          name: p.name,
          projectName: p.projectName || undefined,
          description: enrichedDesc,
          listingType: p.listingType,
          propertyType: p.propertyType,
          priceTHB,
          priceUSD,
          priceLabel,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqm: p.sqm || undefined,
          area: getCanonicalArea(p.area),
          district: p.district || undefined,
          latitude: p.latitude || undefined,
          longitude: p.longitude || undefined,
          coverImage: p.coverImage || undefined,
          images: p.images || [],
          videoUrl: p.videoUrl || undefined,
          likes: p.likes,
          saves: p.saves,
          clicks: p.clicks,
          viewCount: p.views,
          featured: p.featured,
          hasVideo: p.hasVideo,
          petFriendly: p.petFriendly,
          nearBts: p.nearBts,
          verificationBadge: p.verificationBadge,
          expiryDate: p.expiryDate ? p.expiryDate.toISOString() : undefined,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt ? p.updatedAt.toISOString() : p.createdAt.toISOString(),
          amenities: p.amenities || [],
          features: p.features || [],
          schools: p.schools || [],
          transit: p.transit || [],
          neighborhood: p.neighborhood || "",
          telegramMediaGroupId: p.telegramMediaGroupId || undefined,
          floor: p.floor || undefined,
          totalFloors: p.totalFloors || undefined,
          buildingBuilt: p.buildingBuilt || undefined,
          lastRenovated: p.lastRenovated || undefined,
          furnishing: (p.furnishing as "furnished" | "partially_furnished" | "unfurnished" | null) || undefined,
          availableFrom: p.availableFrom || undefined,
          lastVerifiedAt: p.lastVerifiedAt || undefined,
          btsStation: p.btsStation || undefined,
          btsWalkMin: p.btsWalkMin || undefined,
          mrtStation: p.mrtStation || undefined,
          mrtWalkMin: p.mrtWalkMin || undefined,
          foreignQuota: p.foreignQuota || undefined,
          visaFriendly: p.visaFriendly || undefined,
          leaseTerms: p.leaseTerms || undefined,
          depositTerms: p.depositTerms || undefined,
          maintenance: p.maintenance || undefined,
          status: (p.status as PropertyCard["status"]) || undefined,
        };
      });
      const dbList = includeUnlisted ? mapped : mapped.filter((p) => p.status !== "unlisted" && p.status !== "draft");
      return dbList;
    }
  } catch (err) {
    console.error("DB properties fetch failed, falling back to local file store:", err);
  }

  // Robust fallback to local properties file store if database query fails or returns empty
  const localList = await getAllProperties();
  const visibleList = includeUnlisted ? localList : localList.filter((p) => p.status !== "unlisted" && p.status !== "draft");
  return visibleList.map((p) => ({
    ...p,
    area: getCanonicalArea(p.area),
    clicks: p.clicks ?? 0,
    amenities: p.amenities ?? [],
    features: p.features ?? [],
    schools: p.schools ?? [],
    transit: p.transit ?? [],
    neighborhood: p.neighborhood ?? "",
    verificationBadge: p.verificationBadge ?? false,
    expiryDate: p.expiryDate ?? undefined,
    updatedAt: p.updatedAt || p.createdAt,
  }));
}

/**
 * Increments property view count
 */
export async function incrementPropertyView(id: number) {
  if (!isDbConfigured) {
    try {
      const p = await getPropertyById(id);
      if (p) {
        await updateProperty(id, { viewCount: (p.viewCount ?? 0) + 1 });
      }
    } catch (err) {
      console.warn("Failed to increment view count locally:", err);
    }
    return;
  }
  try {
    await db
      .update(propertiesTable)
      .set({ views: sql`${propertiesTable.views} + 1` })
      .where(eq(propertiesTable.id, id));
  } catch (err) {
    console.warn("Failed to increment view count in DB:", err);
  }
}

/**
 * Increments property click count
 */
export async function incrementPropertyClick(id: number) {
  if (!isDbConfigured) {
    try {
      const p = await getPropertyById(id);
      if (p) {
        await updateProperty(id, { clicks: (p.clicks ?? 0) + 1 });
      }
    } catch (err) {
      console.warn("Failed to increment click count locally:", err);
    }
    return;
  }
  try {
    await db
      .update(propertiesTable)
      .set({ clicks: sql`${propertiesTable.clicks} + 1` })
      .where(eq(propertiesTable.id, id));
  } catch (err) {
    console.warn("Failed to increment click count in DB:", err);
  }
}

/**
 * Increments property like count
 */
export async function incrementPropertyLike(id: number) {
  if (!isDbConfigured) {
    try {
      const p = await getPropertyById(id);
      if (p) {
        await updateProperty(id, { likes: (p.likes ?? 0) + 1 });
      }
    } catch (err) {
      console.warn("Failed to increment like count locally:", err);
    }
    return;
  }
  try {
    await db
      .update(propertiesTable)
      .set({ likes: sql`${propertiesTable.likes} + 1` })
      .where(eq(propertiesTable.id, id));
  } catch (err) {
    console.warn("Failed to increment like count in DB:", err);
  }
}

/**
 * Tracks a page view in the page_views table
 */
export async function trackPageView(propertyId: number | null, page: string) {
  if (!isDbConfigured) return;
  try {
    await db.insert(pageViewsTable).values({
      propertyId,
      page,
    });
  } catch (err) {
    console.warn("Failed to log page view in DB:", err);
  }
}

/**
 * Fetches scheduled viewing appointments joined with property details
 */
export async function getDbAppointments() {
  if (!isDbConfigured) {
    try {
      const local = await getAllLocalAppointments();
      return local.map((a) => ({
        id: a.id,
        propertyId: a.propertyId || null,
        name: a.name,
        email: a.email,
        phone: a.phone,
        date: a.date,
        timeSlot: a.timeSlot,
        status: a.status,
        message: a.message || null,
        createdAt: new Date(a.createdAt),
        propertyName: a.propertyName || null,
        propertySlug: a.propertySlug || null,
      }));
    } catch {
      return [];
    }
  }
  try {
    const list = await db
      .select({
        id: appointmentsTable.id,
        propertyId: appointmentsTable.propertyId,
        name: appointmentsTable.name,
        email: appointmentsTable.email,
        phone: appointmentsTable.phone,
        date: appointmentsTable.date,
        timeSlot: appointmentsTable.timeSlot,
        status: appointmentsTable.status,
        message: appointmentsTable.message,
        createdAt: appointmentsTable.createdAt,
        propertyName: propertiesTable.name,
        propertySlug: propertiesTable.slug,
      })
      .from(appointmentsTable)
      .leftJoin(propertiesTable, eq(appointmentsTable.propertyId, propertiesTable.id))
      .orderBy(desc(appointmentsTable.createdAt));
    return list;
  } catch (err) {
    console.error("Failed to fetch appointments:", err);
    return [];
  }
}

/**
 * Counts page views aggregated hourly or total for the last 24 hours
 */
export async function get24HourTraffic() {
  if (!isDbConfigured) return [];
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const list = await db
      .select()
      .from(pageViewsTable)
      .where(sql`${pageViewsTable.createdAt} >= ${yesterday}`)
      .orderBy(pageViewsTable.createdAt);
    return list;
  } catch (err) {
    console.error("Failed to fetch page views:", err);
    return [];
  }
}

/**
 * Fetches admin audit logs
 */
export async function getDbAuditLogs() {
  if (!isDbConfigured) return [];
  try {
    return await db
      .select()
      .from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(30);
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    return [];
  }
}

/**
 * Writes a new entry to the admin audit log
 */
export async function createAuditLog(adminEmail: string, action: string, details: string) {
  if (!isDbConfigured) return;
  try {
    await db.insert(auditLogsTable).values({
      adminEmail,
      action,
      details,
    });
  } catch (err) {
    console.error("Failed to insert audit log:", err);
  }
}

/**
 * Fetches submitted enquiries from the database, joined with property names.
 */
export async function getDbEnquiries() {
  if (!isDbConfigured) {
    try {
      const local = await getAllEnquiries();
      return local.map((e) => ({
        id: e.id,
        propertyId: null,
        name: e.name,
        contact: e.contact,
        method: e.method,
        message: e.message || null,
        status: e.status,
        createdAt: new Date(e.createdAt),
        userRole: e.userRole || "user",
        propertyName: e.propertyName || null,
        propertySlug: e.propertySlug || null,
      }));
    } catch {
      return [];
    }
  }
  try {
    const list = await db
      .select({
        id: enquiriesTable.id,
        propertyId: enquiriesTable.propertyId,
        name: enquiriesTable.name,
        contact: enquiriesTable.contact,
        method: enquiriesTable.method,
        message: enquiriesTable.message,
        status: enquiriesTable.status,
        createdAt: enquiriesTable.createdAt,
        userRole: enquiriesTable.userRole,
        propertyName: propertiesTable.name,
        propertySlug: propertiesTable.slug,
      })
      .from(enquiriesTable)
      .leftJoin(propertiesTable, eq(enquiriesTable.propertyId, propertiesTable.id))
      .orderBy(desc(enquiriesTable.createdAt));
    return list;
  } catch (err) {
    console.error("Failed to fetch enquiries:", err);
    return [];
  }
}
