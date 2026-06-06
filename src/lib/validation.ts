/**
 * Plain-TS validators. We don't pull in zod just for this — keeping
 * deps light. Each validator returns either { ok, value } or { ok: false, errors }.
 */

import { PropertyCard } from "@/types/property";

export type ValidationResult<T> =
  | { ok: true;  value: T }
  | { ok: false; errors: Record<string, string> };

/* ───────────────────────── Property ───────────────────────── */

const LISTING_TYPES  = ["sale", "rent", "short_stay"] as const;
const PROPERTY_TYPES = ["condo", "house", "villa", "townhouse", "apartment"] as const;

export function validateProperty(input: unknown): ValidationResult<Omit<PropertyCard, "id" | "createdAt">> {
  const errors: Record<string, string> = {};
  const o = (input ?? {}) as Record<string, unknown>;

  const str = (v: unknown, max = 500) => typeof v === "string" && v.length <= max ? v.trim() : null;
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v : (typeof v === "string" && v !== "" && !isNaN(Number(v)) ? Number(v) : null);
  const bool = (v: unknown) => typeof v === "boolean" ? v : v === "true" ? true : v === "false" ? false : false;

  const slug         = str(o.slug, 200);
  const name         = str(o.name, 300);
  const description  = str(o.description, 5000);
  const listingType  = LISTING_TYPES.includes(o.listingType as never) ? o.listingType as PropertyCard["listingType"] : null;
  const propertyType = PROPERTY_TYPES.includes(o.propertyType as never) ? o.propertyType as PropertyCard["propertyType"] : null;
  const priceTHB     = num(o.priceTHB);
  const bedrooms     = num(o.bedrooms);
  const bathrooms    = num(o.bathrooms);
  const area         = str(o.area, 100);

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) errors.slug = "Slug must be lowercase letters, numbers and dashes.";
  if (!name)                                errors.name = "Name is required.";
  if (!description)                         errors.description = "Description is required.";
  if (!listingType)                         errors.listingType = "Invalid listing type.";
  if (!propertyType)                        errors.propertyType = "Invalid property type.";
  if (priceTHB == null || priceTHB < 0)     errors.priceTHB = "Price must be a non-negative number.";
  if (bedrooms == null || bedrooms < 0)     errors.bedrooms = "Bedrooms must be ≥ 0.";
  if (bathrooms == null || bathrooms < 0)   errors.bathrooms = "Bathrooms must be ≥ 0.";
  if (!area)                                errors.area = "Area is required.";

  if (Object.keys(errors).length) return { ok: false, errors };

  const value: Omit<PropertyCard, "id" | "createdAt"> = {
    slug:         slug!,
    name:         name!,
    description:  description!,
    listingType:  listingType!,
    propertyType: propertyType!,
    priceTHB:     priceTHB!,
    priceUSD:     num(o.priceUSD) ?? undefined,
    priceLabel:   str(o.priceLabel, 60) ?? undefined,
    bedrooms:     bedrooms!,
    bathrooms:    bathrooms!,
    sqm:          num(o.sqm) ?? undefined,
    area:         area!,
    district:     str(o.district, 100) ?? undefined,
    coverImage:   str(o.coverImage, 1000) ?? undefined,
    images:       Array.isArray(o.images) ? (o.images as unknown[]).filter((u): u is string => typeof u === "string" && u.length < 1000) : undefined,
    videoUrl:     str(o.videoUrl, 1000) ?? undefined,
    likes:        num(o.likes)    ?? 0,
    saves:        num(o.saves)    ?? 0,
    clicks:       num(o.clicks)   ?? 0,
    featured:     bool(o.featured),
    hasVideo:     bool(o.hasVideo),
    petFriendly:  bool(o.petFriendly),
    nearBts:      bool(o.nearBts),
    verificationBadge: bool(o.verificationBadge),
    expiryDate:   str(o.expiryDate, 60) ?? undefined,
    amenities:    Array.isArray(o.amenities) ? (o.amenities as unknown[]).filter((u): u is string => typeof u === "string" && u.length < 500) : [],
    features:     Array.isArray(o.features) ? (o.features as unknown[]).filter((u): u is string => typeof u === "string" && u.length < 1000) : [],
    schools:      Array.isArray(o.schools) ? (o.schools as unknown[]).filter((u): u is string => typeof u === "string" && u.length < 1000) : [],
    transit:      Array.isArray(o.transit) ? (o.transit as unknown[]).filter((u): u is string => typeof u === "string" && u.length < 1000) : [],
    neighborhood: str(o.neighborhood, 5000) ?? undefined,
  };

  return { ok: true, value };
}

/* ───────────────────────── Blog ───────────────────────── */

export function validateBlogPost(input: unknown): ValidationResult<{ post: import("@/data/blogPosts").BlogPost }> {
  const errors: Record<string, string> = {};
  const o = (input ?? {}) as Record<string, unknown>;

  const str = (v: unknown, max = 5000) => typeof v === "string" && v.length <= max ? v.trim() : null;

  const slug     = str(o.slug, 200);
  const title    = str(o.title, 300);
  const category = str(o.category, 100);
  const excerpt  = str(o.excerpt, 600);
  const intro    = str(o.intro, 5000);
  const image    = str(o.image, 1000);

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) errors.slug = "Slug must be lowercase letters, numbers and dashes.";
  if (!title)    errors.title    = "Title is required.";
  if (!category) errors.category = "Category is required.";
  if (!excerpt)  errors.excerpt  = "Excerpt is required.";
  if (!intro)    errors.intro    = "Intro is required.";
  if (!image)    errors.image    = "Cover image URL is required.";

  if (Object.keys(errors).length) return { ok: false, errors };

  const sections = Array.isArray(o.sections)
    ? (o.sections as Array<{ heading?: unknown; body?: unknown }>).map((s) => ({
        heading: typeof s.heading === "string" ? s.heading : "",
        body:    Array.isArray(s.body) ? s.body.filter((b): b is string => typeof b === "string") : [],
      })).filter((s) => s.heading && s.body.length)
    : [];

  const keywords = Array.isArray(o.keywords)
    ? (o.keywords as unknown[]).filter((k): k is string => typeof k === "string")
    : [];

  const cta = o.cta && typeof o.cta === "object" ? o.cta as Record<string, unknown> : {};

  const fontFamily = str(o.fontFamily, 100) ?? "Inter";
  const headerFontFamily = str(o.headerFontFamily, 100) ?? "Outfit";

  const post: import("@/data/blogPosts").BlogPost & { fontFamily?: string; headerFontFamily?: string } = {
    slug:        slug!,
    category:    category!,
    title:       title!,
    metaTitle:   str(o.metaTitle, 300) ?? title!,
    metaDesc:    str(o.metaDesc, 500) ?? excerpt!,
    excerpt:     excerpt!,
    image:       image!,
    readTime:    str(o.readTime, 40)  ?? "5 min read",
    publishedAt: str(o.publishedAt, 40) ?? new Date().toISOString().split("T")[0],
    author:      str(o.author, 100) ?? "NHP Bangkok Team",
    keywords,
    intro:       intro!,
    sections,
    cta: {
      heading: typeof cta.heading === "string" ? cta.heading : "Browse Bangkok properties",
      body:    typeof cta.body    === "string" ? cta.body    : "See what fits your budget right now.",
      href:    typeof cta.href    === "string" ? cta.href    : "/explore",
      label:   typeof cta.label   === "string" ? cta.label   : "Browse Properties",
    },
    fontFamily,
    headerFontFamily,
  };

  return { ok: true, value: { post } };
}
