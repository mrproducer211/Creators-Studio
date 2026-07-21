import { PropertyCard } from "@/types/property";

/**
 * Generates clean, keyword-rich SEO URL slugs for properties.
 * Example: "1-bed-condo-rent-via-61-by-sansiri"
 */
export function generateCleanSeoSlug(
  p: {
    bedrooms: number;
    propertyType?: string;
    listingType?: string;
    name: string;
    id?: number | string;
  },
  existingSlugs?: Set<string> | string[]
): string {
  const roomStr = p.bedrooms === 0 ? "studio" : `${p.bedrooms}-bed`;
  const typeStr = (p.propertyType || "condo").toLowerCase().replace(/[^a-z0-9]/g, "");
  const actionStr = p.listingType === "sale" ? "sale" : p.listingType === "short_stay" ? "short-stay" : "rent";

  // Clean building name
  const nameSlug = (p.name || "")
    .toLowerCase()
    .replace(/#[a-zA-Z0-9_-]+/g, "") // remove hashtags
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens

  const baseSlug = `${roomStr}-${typeStr}-${actionStr}-${nameSlug}`;
  let finalSlug = baseSlug;

  if (existingSlugs) {
    const slugSet = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs);
    let counter = 2;
    while (slugSet.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return finalSlug;
}

/**
 * Generates rich, SEO-optimized image alt text for property images across the site.
 */
export function generatePropertyAltTag(
  p: Partial<PropertyCard> & { name: string; area: string },
  index?: number,
  context?: string
): string {
  const bedsStr = p.bedrooms === 0 ? "Studio" : `${p.bedrooms || 1} Bed`;
  const typeStr = p.propertyType ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1) : "Condo";
  const actionStr = p.listingType === "sale" ? "Sale" : "Rent";
  const areaStr = p.area || "Bangkok";
  const nameStr = p.name || "Bangkok Property";

  let alt = `${bedsStr} ${typeStr} for ${actionStr} in ${areaStr} Bangkok - ${nameStr}`;

  if (context) {
    alt += ` (${context})`;
  } else if (typeof index === "number" && index > 0) {
    alt += ` - Photo ${index + 1}`;
  }

  return alt;
}

/**
 * Generates descriptive SEO alt text for neighborhood hero banners and cards.
 */
export function generateNeighborhoodAltTag(name: string, context?: string): string {
  const ctxStr = context ? ` ${context}` : "";
  return `${name} Bangkok Expat Neighborhood Guide${ctxStr} - Condos for Rent & Sale near BTS Transit`;
}

/**
 * Clean Telegram hashtags, raw emojis, and unwanted formatting artifacts.
 */
function cleanRawText(text: string): string {
  if (!text) return "";
  return text
    .replace(/#[a-zA-Z0-9_-]+/g, "") // remove hashtags like #corner, #rent
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // strip emojis
    .trim();
}

export interface EnrichedSections {
  overview: string;
  interior: string;
  location: string;
  facilities: string;
  lease: string;
  additional?: string;
}

/**
 * Returns clean structured sections for rendering in PropertyDetail component.
 */
export function getStructuredSeoDescription(p: {
  name: string;
  description?: string;
  bedrooms: number;
  bathrooms: number;
  sqm?: number;
  floor?: number;
  area: string;
  district?: string;
  listingType: string;
  propertyType: string;
  priceTHB: number | string;
  priceLabel?: string;
  btsStation?: string;
  btsWalkMin?: number;
  mrtStation?: string;
  mrtWalkMin?: number;
  petFriendly?: boolean;
  foreignQuota?: boolean;
  amenities?: string[];
}): EnrichedSections {
  const cleanedName = cleanRawText(p.name || "Bangkok Residence");
  const cleanedArea = cleanRawText(p.area || "Sukhumvit");
  const cleanedDistrict = p.district ? cleanRawText(p.district) : "";
  let rawDesc = p.description ? cleanRawText(p.description) : "";

  const roomTypeStr = p.bedrooms === 0 ? "Studio" : `${p.bedrooms} Bedroom`;
  const propTypeCap = p.propertyType ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1) : "Condo";
  const actionText = p.listingType === "sale" ? "Sale" : p.listingType === "short_stay" ? "Short-Term Rent" : "Rent";
  const priceVal = Number(p.priceTHB || 0);
  const priceFormatted = priceVal > 0 ? `฿${priceVal.toLocaleString()}` : "Contact for Price";
  const labelText = p.priceLabel || (p.listingType === "sale" ? "" : "/month");

  let transitStr = "";
  if (p.btsStation) {
    transitStr = `just a ${p.btsWalkMin || 5}-minute walk from BTS ${cleanRawText(p.btsStation)} Station`;
  } else if (p.mrtStation) {
    transitStr = `${p.mrtWalkMin || 5} minutes from MRT ${cleanRawText(p.mrtStation)} Station`;
  } else {
    transitStr = `in prime ${cleanedArea}, with fast access to BTS Skytrain lines`;
  }

  const overview = `Discover high-rise luxury living with this spacious ${roomTypeStr} ${propTypeCap} for ${actionText} at ${cleanedName} in ${cleanedArea}, Bangkok. Featuring ${p.sqm || 35} sqm of premium living space, this unit offers contemporary finishes and skyline views. Offered at ${priceFormatted}${labelText}, this property is ${transitStr}.`;

  const interior = `The residence features ${p.bedrooms === 0 ? "an open-plan studio layout" : `${p.bedrooms} spacious bedroom(s)`} and ${p.bathrooms || 1} bathroom(s). Outfitted with luxury furnishings, climate-control air conditioning, smart TV, European kitchen, and an in-unit washing machine. High-speed fiber internet infrastructure is pre-installed for digital nomads and remote workers.`;

  const petText = p.petFriendly
    ? "This development is pet-friendly, welcoming dogs and cats under building regulations."
    : "Building rules maintain a peaceful, high-privacy residential environment.";
  const location = `Situated in ${cleanedArea}${cleanedDistrict ? `, ${cleanedDistrict}` : ""}, residents enjoy walking-distance access to specialty cafes, international restaurants, lifestyle shopping malls, and leading international schools. ${petText}`;

  const defaultAmenities = ["Infinity Pool", "Fitness Gym", "24/7 Security", "Smart Keycard Access", "Covered Parking"];
  const amenityListStr = (p.amenities && p.amenities.length > 0 ? p.amenities : defaultAmenities).join(", ");
  const ownershipText = p.foreignQuota
    ? "Available under Foreign Freehold Quota for 100% foreign ownership."
    : "Ideal for expats, executives, and digital nomads residing in Bangkok.";
  const facilities = `Residents enjoy full access to world-class facilities, including: ${amenityListStr}. Round-the-clock safety is guaranteed with 24-hour security guards, CCTV surveillance, and secure keycard entry. ${ownershipText}`;

  const lease = p.listingType === "short_stay"
    ? `Flexible lease options available for 3-month to 6-month short stays. Move-in requires valid passport identification and a 1-month refundable deposit.`
    : p.listingType === "sale"
    ? `Available for direct purchase with clean chanote title deed. Full assistance provided for ownership transfer at the Department of Lands.`
    : `Offered under standard 12-month lease agreements with a 2-month security deposit. Contact our team to schedule an in-person or video tour.`;

  return {
    overview,
    interior,
    location,
    facilities,
    lease,
    additional: rawDesc && rawDesc.length > 30 && !rawDesc.toLowerCase().includes("discover high-rise") ? rawDesc : undefined,
  };
}

/**
 * Returns plain text representation for crawlers and API endpoints.
 */
export function enrichPropertyDescription(p: any): string {
  const s = getStructuredSeoDescription(p);
  return [
    `Unit Overview & Highlights:\n${s.overview}`,
    `Interior Specs & Furnishings:\n${s.interior}`,
    `Location & Transit:\n${s.location}`,
    `Building Facilities:\n${s.facilities}`,
    `Lease Terms:\n${s.lease}`,
    ...(s.additional ? [`Additional Details:\n${s.additional}`] : []),
  ].join("\n\n");
}
