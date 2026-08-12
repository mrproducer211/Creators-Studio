import { PropertyCard } from "@/types/property";

/**
 * Computes the canonical slug for a property listing.
 * 
 * Rules:
 * 1. If a property is a short-stay variation (-short_stay or -short_stay-N) and a primary
 *    rent or sale listing exists for the same building/unit, its canonical points to the primary.
 * 2. All distinct primary listings (including unit variations like -2, -3 if independent)
 *    canonicalize to their own self-referencing slug.
 */
export function getCanonicalSlugForProperty(
  p: Partial<PropertyCard> & { slug: string },
  allProperties: { slug: string }[]
): string {
  if (!p.slug) return "";

  if (p.slug.includes("-short_stay")) {
    const primaryRentSlug = p.slug.replace(/-short_stay(-\d+)?$/, "-rent");
    const primarySaleSlug = p.slug.replace(/-short_stay(-\d+)?$/, "-sale");

    if (allProperties.some((x) => x.slug === primaryRentSlug)) {
      return primaryRentSlug;
    }
    if (allProperties.some((x) => x.slug === primarySaleSlug)) {
      return primarySaleSlug;
    }
  }

  return p.slug;
}

/**
 * Checks if a property should be included in sitemap.xml.
 * Only self-canonicalizing pages should be in sitemap.xml to pass Google Search Console validation.
 */
export function isPropertySitemapEligible(
  p: Partial<PropertyCard> & { slug: string; status?: string },
  allProperties: { slug: string }[]
): boolean {
  if (!p.slug) return false;
  if (p.status === "unlisted" || p.status === "draft") return false;

  // A page MUST canonicalize to itself to be included in sitemap.xml
  const canonicalSlug = getCanonicalSlugForProperty(p, allProperties);
  return canonicalSlug === p.slug;
}
