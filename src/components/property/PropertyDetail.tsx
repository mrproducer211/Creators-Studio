"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PropertyCard } from "@/types/property";
import { useEnquiry } from "@/hooks/useEnquiry";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useSaved } from "@/contexts/SavedContext";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function listingBadge(t: string) {
  if (t === "sale") return "For Sale";
  if (t === "rent") return "Long Rent";
  return "Short Stay";
}
function formatPrice(p: PropertyCard) {
  // Short stays: convert nightly to monthly (×30) and show as /month
  if (p.listingType === "short_stay" && (p.priceLabel ?? "").includes("night")) {
    const monthly = Number(p.priceTHB) * 30;
    return `฿${monthly.toLocaleString("th-TH")}/month`;
  }
  const thb = Number(p.priceTHB).toLocaleString("th-TH");
  if (p.listingType === "sale") return `฿${thb}`;
  return `฿${thb}${p.priceLabel ?? ""}`;
}

/* Relative date string e.g. "Posted 3 days ago" */
function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now  = Date.now();
  const days = Math.max(0, Math.floor((now - then) / 86_400_000));
  if (days === 0)  return "Posted today";
  if (days === 1)  return "Posted yesterday";
  if (days <  7)   return `Posted ${days} days ago`;
  if (days < 30)   return `Posted ${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
  if (days < 365)  return `Posted ${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"} ago`;
  return `Posted on ${new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

/* Contract / lease duration text by listing type */
function contractTerms(t: PropertyCard["listingType"]) {
  if (t === "sale")       return "Freehold ownership · Foreign quota available";
  if (t === "rent")       return "12-month minimum · 2-month deposit";
  return "1-night minimum · Up to 30 nights";
}

function depositTerms(t: PropertyCard["listingType"]) {
  if (t === "sale")       return "10% reservation fee";
  if (t === "rent")       return "2 months security deposit";
  return "1-night refundable hold";
}

/* ── Smart defaults — derived from id/listingType when explicit field absent ── */

function viewCount(p: PropertyCard): number {
  if (p.viewCount != null) return p.viewCount;
  // Deterministic pseudo-random based on id + likes
  return p.likes * 6 + p.id * 23 + 47;
}

interface Facility {
  name: string;
  distance: string; // e.g. "5 min walk", "10 min drive"
  type: "transit" | "mall" | "cafe" | "hospital" | "school";
  icon: string;
  latOffset: number; // For rendering on map relative to center
  lngOffset: number;
}

const NEIGHBORHOOD_DATA: Record<string, Facility[]> = {
  "Sukhumvit": [
    { name: "BTS Phrom Phong", distance: "5 min walk", type: "transit", icon: "🚇", latOffset: -0.005, lngOffset: -0.006 },
    { name: "EmQuartier Shopping Mall", distance: "6 min walk", type: "mall", icon: "🛍", latOffset: 0.004, lngOffset: 0.007 },
    { name: "Starbucks Sukhumvit 24", distance: "3 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.003 },
    { name: "Bumrungrad International Hospital", distance: "8 min drive", type: "hospital", icon: "🏥", latOffset: -0.007, lngOffset: 0.005 },
    { name: "NIST International School", distance: "10 min drive", type: "school", icon: "🏫", latOffset: 0.005, lngOffset: -0.005 }
  ],
  "Asok": [
    { name: "BTS Asok / MRT Sukhumvit", distance: "3 min walk", type: "transit", icon: "🚇", latOffset: -0.003, lngOffset: -0.004 },
    { name: "Terminal 21 Asok", distance: "4 min walk", type: "mall", icon: "🛍", latOffset: 0.005, lngOffset: 0.005 },
    { name: "Craft Wi-Fi Cafe", distance: "5 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.002 },
    { name: "Samitivej Sukhumvit Hospital", distance: "10 min drive", type: "hospital", icon: "🏥", latOffset: -0.006, lngOffset: 0.006 },
    { name: "Australian International School", distance: "8 min drive", type: "school", icon: "🏫", latOffset: 0.006, lngOffset: -0.003 }
  ],
  "Thong Lo": [
    { name: "BTS Thong Lo", distance: "4 min walk", type: "transit", icon: "🚇", latOffset: -0.004, lngOffset: -0.005 },
    { name: "The Commons Thonglor", distance: "7 min walk", type: "mall", icon: "🛍", latOffset: 0.006, lngOffset: 0.006 },
    { name: "Roast Coffee & Eatery", distance: "6 min walk", type: "cafe", icon: "☕", latOffset: 0.003, lngOffset: -0.003 },
    { name: "Camillian Hospital", distance: "5 min drive", type: "hospital", icon: "🏥", latOffset: -0.005, lngOffset: 0.004 },
    { name: "The American School of Bangkok", distance: "7 min drive", type: "school", icon: "🏫", latOffset: 0.004, lngOffset: -0.004 }
  ],
  "Ekkamai": [
    { name: "BTS Ekkamai", distance: "5 min walk", type: "transit", icon: "🚇", latOffset: -0.005, lngOffset: -0.005 },
    { name: "Gateway Ekamai Mall", distance: "6 min walk", type: "mall", icon: "🛍", latOffset: 0.004, lngOffset: 0.006 },
    { name: "Ink & Lion Cafe", distance: "4 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.002 },
    { name: "Sukumvit Hospital", distance: "3 min drive", type: "hospital", icon: "🏥", latOffset: -0.003, lngOffset: 0.004 },
    { name: "St. Andrews International School", distance: "5 min drive", type: "school", icon: "🏫", latOffset: 0.005, lngOffset: -0.003 }
  ],
  "On Nut": [
    { name: "BTS On Nut", distance: "6 min walk", type: "transit", icon: "🚇", latOffset: -0.006, lngOffset: -0.006 },
    { name: "Century The Movie Plaza", distance: "5 min walk", type: "mall", icon: "🛍", latOffset: 0.003, lngOffset: 0.005 },
    { name: "The Coffee Club", distance: "4 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.003 },
    { name: "Kluaynamthai Hospital", distance: "8 min drive", type: "hospital", icon: "🏥", latOffset: -0.006, lngOffset: 0.004 },
    { name: "Wells International School", distance: "7 min drive", type: "school", icon: "🏫", latOffset: 0.004, lngOffset: -0.004 }
  ],
  "Silom": [
    { name: "BTS Sala Daeng / MRT Silom", distance: "4 min walk", type: "transit", icon: "🚇", latOffset: -0.004, lngOffset: -0.005 },
    { name: "Silom Complex", distance: "5 min walk", type: "mall", icon: "🛍", latOffset: 0.004, lngOffset: 0.006 },
    { name: "Everyday KMKM Cafe", distance: "3 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.002 },
    { name: "Bangkok Christian Hospital", distance: "6 min walk", type: "hospital", icon: "🏥", latOffset: -0.002, lngOffset: 0.004 },
    { name: "St. Joseph Convent School", distance: "8 min walk", type: "school", icon: "🏫", latOffset: 0.003, lngOffset: -0.004 }
  ],
  "Sathorn": [
    { name: "BTS Chong Nonsi / MRT Lumphini", distance: "7 min walk", type: "transit", icon: "🚇", latOffset: -0.005, lngOffset: -0.006 },
    { name: "Sathorn Square", distance: "8 min walk", type: "mall", icon: "🛍", latOffset: 0.005, lngOffset: 0.006 },
    { name: "Glow Cafe", distance: "5 min walk", type: "cafe", icon: "☕", latOffset: 0.002, lngOffset: -0.003 },
    { name: "BNH Hospital", distance: "5 min drive", type: "hospital", icon: "🏥", latOffset: -0.004, lngOffset: 0.004 },
    { name: "Garden International School", distance: "9 min drive", type: "school", icon: "🏫", latOffset: 0.006, lngOffset: -0.004 }
  ],
  "Ari": [
    { name: "BTS Ari", distance: "8 min walk", type: "transit", icon: "🚇", latOffset: -0.006, lngOffset: -0.006 },
    { name: "La Villa Ari", distance: "7 min walk", type: "mall", icon: "🛍", latOffset: 0.005, lngOffset: 0.005 },
    { name: "Common Room x Ari Cafe", distance: "4 min walk", type: "cafe", icon: "☕", latOffset: 0.001, lngOffset: -0.002 },
    { name: "Vichaiyut Hospital", distance: "6 min drive", type: "hospital", icon: "🏥", latOffset: -0.005, lngOffset: 0.004 },
    { name: "RBIS International School", distance: "9 min drive", type: "school", icon: "🏫", latOffset: 0.004, lngOffset: -0.004 }
  ]
};

function getNeighborhoodFacilities(area: string): Facility[] {
  return NEIGHBORHOOD_DATA[area] || NEIGHBORHOOD_DATA["Sukhumvit"];
}

function getDynamicFloor(description: string, id: number, propertyType: string): string {
  const floorRegex = /(?:floor\s+(\d+))|(?:(\d+)(?:st|nd|rd|th)\s+floor)/i;
  const match = description.match(floorRegex);
  const condoType = propertyType.toLowerCase() === "condo" || propertyType.toLowerCase() === "apartment";
  
  if (!condoType) {
    return "Ground";
  }

  let floor = (id % 25) + 3;
  if (match) {
    floor = Number(match[1] || match[2]);
  }
  
  const totalFloors = Math.max(floor + 3, (id % 20) + 15);
  return `${floor} / ${totalFloors}`;
}

function getDynamicParking(description: string, id: number, propertyType: string): string {
  const parkingRegex = /(?:(\d+)\s*(?:parking|car\s*park|parking\s*space|garage\s*space|parking\s*spot|private\s*space|car\s*slot|slot|spot))/i;
  const match = description.match(parkingRegex);
  
  if (match) {
    const spaces = Number(match[1]);
    return `${spaces} Space${spaces > 1 ? "s" : ""}`;
  }

  const isHouse = propertyType.toLowerCase() === "house" || propertyType.toLowerCase() === "villa" || propertyType.toLowerCase() === "townhouse";
  if (isHouse) {
    const spaces = (id % 3) + 2;
    return `${spaces} Private Space${spaces > 1 ? "s" : ""}`;
  }
  
  const spaces = (id % 2) + 1;
  return `${spaces} Covered Spot${spaces > 1 ? "s" : ""}`;
}

function getDynamicMaintenance(description: string, id: number, listingType: string): string {
  if (listingType !== "sale") {
    return "Included";
  }
  const maintenanceRegex = /(?:maintenance|fee|cam\s*fee)[^\d]*(?:฿|thb|baht)?\s*(\d+)/i;
  const match = description.match(maintenanceRegex);
  if (match) {
    return `฿${match[1]} / m² / mo`;
  }
  
  const fee = 45 + (id % 9) * 5;
  return `฿${fee} / m² / mo`;
}

function furnishingLabel(p: PropertyCard): string {
  if (p.furnishing) {
    if (p.furnishing === "furnished") return "Fully Furnished";
    if (p.furnishing === "partially_furnished") return "Partially Furnished";
    return "Unfurnished";
  }
  // Defaults: short stay always furnished, rent usually furnished, sale unfurnished
  if (p.listingType === "short_stay") return "Fully Furnished";
  if (p.listingType === "rent")       return p.bedrooms <= 1 ? "Fully Furnished" : "Partially Furnished";
  return "Unfurnished";
}

function availableFromLabel(p: PropertyCard): string {
  if (p.availableFrom) {
    const d = new Date(p.availableFrom);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    return p.availableFrom;
  }
  // For short stay / available units: "Immediate"; sale: "Negotiable"
  if (p.listingType === "sale") return "Negotiable";
  return "Immediate";
}

function getDynamicViews(description: string, features: string[] = []): string {
  const views: string[] = [];
  const lowerDesc = (description || "").toLowerCase();
  
  if (lowerDesc.includes("skyline") || lowerDesc.includes("city view") || features.some(f => f.toLowerCase().includes("city") || f.toLowerCase().includes("skyline"))) {
    views.push("City", "Sky");
  }
  if (lowerDesc.includes("pool view") || features.some(f => f.toLowerCase().includes("pool"))) {
    views.push("Pool");
  }
  if (lowerDesc.includes("garden") || features.some(f => f.toLowerCase().includes("garden"))) {
    views.push("Garden");
  }
  if (lowerDesc.includes("river") || features.some(f => f.toLowerCase().includes("river"))) {
    views.push("River");
  }
  if (views.length === 0) {
    return "City, Sky";
  }
  return [...new Set(views)].join(", ");
}

function getDynamicHeating(description: string): string {
  const lower = (description || "").toLowerCase();
  if (lower.includes("heating") || lower.includes("heater")) return "Water Heater";
  return "Central";
}

function getDynamicCooling(description: string): string {
  const lower = (description || "").toLowerCase();
  if (lower.includes("central ac") || lower.includes("central air")) return "Central AC";
  if (lower.includes("ac") || lower.includes("aircon") || lower.includes("air conditioning")) return "Split AC Units";
  return "Central AC";
}

function getDynamicKitchen(description: string, features: string[] = []): string {
  const lower = (description || "").toLowerCase();
  if (lower.includes("fully fitted") || lower.includes("fitted kitchen") || features.some(f => f.toLowerCase().includes("kitchen"))) return "Fully Fitted";
  if (lower.includes("equipped kitchen")) return "Equipped";
  return "Fully Fitted";
}

function lastVerifiedLabel(p: PropertyCard): string {
  if (p.lastVerifiedAt) {
    const days = Math.floor((Date.now() - new Date(p.lastVerifiedAt).getTime()) / 86_400_000);
    if (days === 0) return "Verified today";
    if (days === 1) return "Verified yesterday";
    if (days < 7)   return `Verified ${days} days ago`;
    if (days < 30)  return `Verified ${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? "" : "s"} ago`;
    return `Verified ${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"} ago`;
  }
  // Default: 3–10 days after createdAt
  return "Verified by NHP team";
}

/* BTS / MRT station derived from area when not explicit */
const STATION_MAP: Record<string, { bts?: { name: string; walk: number }; mrt?: { name: string; walk: number } }> = {
  "Sukhumvit":  { bts: { name: "Phrom Phong",   walk: 5  }, mrt: { name: "Sukhumvit",     walk: 8  } },
  "Asok":       { bts: { name: "Asok",          walk: 3  }, mrt: { name: "Sukhumvit",     walk: 4  } },
  "Thong Lo":   { bts: { name: "Thong Lo",      walk: 4  } },
  "Ekkamai":    { bts: { name: "Ekkamai",       walk: 5  } },
  "On Nut":     { bts: { name: "On Nut",        walk: 6  } },
  "Silom":      { bts: { name: "Sala Daeng",    walk: 5  }, mrt: { name: "Silom",         walk: 4  } },
  "Sathorn":    { bts: { name: "Chong Nonsi",   walk: 7  }, mrt: { name: "Lumphini",      walk: 8  } },
  "Ari":        { bts: { name: "Ari",           walk: 8  } },
};

function btsInfo(p: PropertyCard): { station: string; walk: number } | null {
  if (p.btsStation && p.btsWalkMin != null) return { station: p.btsStation, walk: p.btsWalkMin };
  const m = STATION_MAP[p.area];
  if (m?.bts) return { station: m.bts.name, walk: m.bts.walk };
  return null;
}
function mrtInfo(p: PropertyCard): { station: string; walk: number } | null {
  if (p.mrtStation && p.mrtWalkMin != null) return { station: p.mrtStation, walk: p.mrtWalkMin };
  const m = STATION_MAP[p.area];
  if (m?.mrt) return { station: m.mrt.name, walk: m.mrt.walk };
  return null;
}

function buildingBuiltYear(p: PropertyCard): number {
  if (p.buildingBuilt) return p.buildingBuilt;
  return 2018 + ((p.id * 7) % 7); // 2018–2024
}
function lastRenovatedYear(p: PropertyCard): number | null {
  if (p.lastRenovated) return p.lastRenovated;
  const built = buildingBuiltYear(p);
  if (built >= 2022) return null;
  return 2023 + (p.id % 2);
}

function foreignQuotaStatus(p: PropertyCard): boolean {
  if (p.foreignQuota != null) return p.foreignQuota;
  return p.id % 3 !== 0; // ~66% available
}

function visaFriendlyStatus(p: PropertyCard): boolean {
  if (p.visaFriendly != null) return p.visaFriendly;
  // Default: sale or higher-end rent (>= 30k/mo)
  if (p.listingType === "sale") return true;
  if (p.listingType === "rent" && Number(p.priceTHB) >= 30000) return true;
  return false;
}

function utilitiesDefaults(p: PropertyCard): Required<NonNullable<PropertyCard["utilities"]>> {
  const u = p.utilities ?? {};
  if (p.listingType === "short_stay") {
    return {
      water:       u.water       ?? "included",
      electricity: u.electricity ?? "included",
      internet:    u.internet    ?? "included",
      aircon:      u.aircon      ?? "included",
    };
  }
  if (p.listingType === "rent") {
    return {
      water:       u.water       ?? "included",
      electricity: u.electricity ?? "metered",
      internet:    u.internet    ?? "tenant",
      aircon:      u.aircon      ?? "metered",
    };
  }
  return {
    water:       u.water       ?? "metered",
    electricity: u.electricity ?? "metered",
    internet:    u.internet    ?? "tenant",
    aircon:      u.aircon      ?? "metered",
  };
}

function houseRulesDefaults(p: PropertyCard): Required<NonNullable<PropertyCard["houseRules"]>> {
  const r = p.houseRules ?? {};
  return {
    pets:     r.pets     ?? p.petFriendly,
    smoking:  r.smoking  ?? false,
    parties:  r.parties  ?? false,
    children: r.children ?? true,
  };
}

/* Common area amenity images — used for the gallery */
const COMMON_AREA_IMAGES = [
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&q=80",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&auto=format&q=80",
  "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&auto=format&q=80",
];
function commonAreaImages(p: PropertyCard): string[] {
  return p.commonAreaImages?.length ? p.commonAreaImages : COMMON_AREA_IMAGES;
}

/* ─────────────────────────────────────────────
   Icons (inline SVGs — no external lib needed)
───────────────────────────────────────────── */
const Icon = {
  bed:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h20v12M22 12H2"/></svg>,
  bath:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.5 1.06V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5H2"/><path d="M10 5a2 2 0 0 1 4 0v3h-4z"/></svg>,
  sqft:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h6M3 15h6M9 3v6M15 3v6M9 21v-6M15 21v-6M15 9h6M15 15h6"/></svg>,
  garage:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8l9-5 9 5v13M5 21V11h14v10"/><path d="M5 14h14"/></svg>,
  home:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  status:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
  subtype:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/></svg>,
  calendar:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  hash:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  stories:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="5"/><rect x="4" y="11" width="16" height="5"/><rect x="4" y="18" width="16" height="3"/></svg>,
  ruler:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m21 8-9-5-9 5v11l9 5 9-5z"/><path d="M3 8h6M3 14h6"/></svg>,
  money:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8M12 6v2M12 16v2"/></svg>,
  parking:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>,
  view:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  heating:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21V10M16 21V10M12 21V3"/><path d="M8 7s2-2 4-2 4 2 4 2"/></svg>,
  cooling:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>,
  fire:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  share:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  heart:      ({ filled = false }: { filled?: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#E05252" : "none"} stroke={filled ? "#E05252" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  chevL:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevR:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevRSm:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  phone:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  pin:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};

/* ─────────────────────────────────────────────
   Gallery — main image + thumbnails
───────────────────────────────────────────── */
function Gallery({ images, name, isFeatured, propertyId }: { images: string[]; name: string; isFeatured: boolean; propertyId: number }) {
  const [active, setActive]       = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const { isSaved, toggle }       = useSaved();
  const saved                     = isSaved(propertyId);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const rawImages = useMemo(() => images.filter(Boolean), [images]);
  // Pad to always show 4 thumbnails — cycle through available images when fewer exist
  const safeImages = rawImages.length === 0
    ? []
    : rawImages.length >= 4
      ? rawImages
      : Array.from({ length: 4 }, (_, i) => rawImages[i % rawImages.length]);
  const visibleThumbs = safeImages.slice(0, 4);
  const extraCount = Math.max(0, rawImages.length - 4);

  const prev = useCallback(() => setActive((a) => {
    const len = rawImages.length || 1;
    return (a - 1 + len) % len;
  }), [rawImages.length]);

  const next = useCallback(() => setActive((a) => {
    const len = rawImages.length || 1;
    return (a + 1) % len;
  }), [rawImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, prev, next]);

  const GALLERY_H = "clamp(360px, 36vw, 460px)";

  return (
    <div>
      <div className="flex gap-4 md:gap-5" style={{ height: GALLERY_H }}>

      {/* ── LEFT: vertical thumbnail column (desktop) ── */}
      {safeImages.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 flex-shrink-0" style={{ width: 210 }}>
          {visibleThumbs.map((src, i) => {
            const isLastWithExtra = i === visibleThumbs.length - 1 && extraCount > 0;
            return (
              <button
                key={i}
                onClick={() => setActive(i % (rawImages.length || 1))}
                className="relative overflow-hidden rounded-xl cursor-pointer transition-all flex-1 min-h-0"
                style={{
                  border: (i % (rawImages.length || 1)) === (active % (rawImages.length || 1)) ? "2px solid #C9A84C" : "2px solid transparent",
                  background: "#1C3A2F",
                }}
              >
                {!imgErrors[i] && (
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setImgErrors((e) => ({ ...e, [i]: true }))}
                  />
                )}
                {/* Last thumb + extra count overlay */}
                {isLastWithExtra && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(28,58,47,0.75)" }}>
                    <span className="text-[18px] font-bold leading-none mb-1" style={{ color: "#E2C97E" }}>+{extraCount}</span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>Photos</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── RIGHT: main image — fills remaining width ── */}
      <div
        className="relative overflow-hidden rounded-2xl flex-1 min-w-0 h-full"
        style={{ background: "#1C3A2F" }}
      >
        {rawImages[active % (rawImages.length || 1)] && !imgErrors[active % (rawImages.length || 1)] ? (
          <img
            src={rawImages[active % (rawImages.length || 1)]}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgErrors((e) => ({ ...e, [active % (rawImages.length || 1)]: true }))}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl font-black" style={{ color: "rgba(255,255,255,0.06)", letterSpacing: "-8px" }}>NHP</span>
          </div>
        )}

        {/* "New Listing" badge */}
        {isFeatured && (
          <div
            className="absolute top-4 left-4 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.5px]"
            style={{ background: "rgba(28,58,47,0.92)", color: "#E2C97E", borderRadius: 6 }}
          >
            New Listing
          </div>
        )}

        {/* Share + Heart — top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-transform active:scale-90"
            style={{ background: "#FFFFFF", color: "#1C3A2F", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            aria-label="Share"
          >
            <Icon.share />
          </button>
          <button
            onClick={() => toggle(propertyId)}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-transform active:scale-90"
            style={{ background: "#FFFFFF", color: "#1C3A2F", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
            aria-label="Save"
          >
            <Icon.heart filled={saved} />
          </button>
        </div>

        {/* View Photos Button */}
        {rawImages.length > 0 && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-4 right-4 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border-none flex items-center gap-2 transition-all active:scale-95 hover:bg-opacity-90 shadow-md z-10"
            style={{ background: "#FFFFFF", color: "#1C3A2F", fontFamily: "inherit" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            View Photos
          </button>
        )}

        {/* Prev / Next */}
        {rawImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.92)", color: "#1C3A2F", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
              aria-label="Previous image"
            >
              <Icon.chevL />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.92)", color: "#1C3A2F", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
              aria-label="Next image"
            >
              <Icon.chevR />
            </button>
          </>
        )}
      </div>

      </div>

      {/* ── MOBILE: horizontal thumbnail strip below main image ── */}
      {safeImages.length > 1 && (
        <div className="md:hidden grid grid-cols-4 gap-2 mt-2.5">
          {visibleThumbs.map((src, i) => {
            const isLastWithExtra = i === visibleThumbs.length - 1 && extraCount > 0;
            return (
              <button
                key={i}
                onClick={() => setActive(i % (rawImages.length || 1))}
                className="relative overflow-hidden rounded-lg cursor-pointer transition-all"
                style={{
                  aspectRatio: "4 / 3",
                  border: (i % (rawImages.length || 1)) === (active % (rawImages.length || 1)) ? "2px solid #C9A84C" : "2px solid transparent",
                  background: "#1C3A2F",
                }}
              >
                {!imgErrors[i] && (
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" onError={() => setImgErrors((e) => ({ ...e, [i]: true }))} />
                )}
                {isLastWithExtra && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(28,58,47,0.75)" }}>
                    <span className="text-[14px] font-bold leading-none" style={{ color: "#E2C97E" }}>+{extraCount}</span>
                    <span className="text-[9px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.85)" }}>Photos</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" 
          style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxOpen(false)} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none text-white text-xl z-50 transition-all hover:scale-110 active:scale-90"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            ✕
          </button>

          {/* Center container */}
          <div className="relative max-w-5xl w-full h-[75vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {rawImages[active % (rawImages.length || 1)] && (
              <img 
                src={rawImages[active % (rawImages.length || 1)]} 
                alt={name} 
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* Prev / Next buttons */}
            {rawImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prev(); }} 
                  className="absolute left-2 md:left-4 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-none text-white transition-all hover:scale-110 hover:bg-opacity-30 active:scale-90"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Icon.chevL />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); next(); }} 
                  className="absolute right-2 md:right-4 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-none text-white transition-all hover:scale-110 hover:bg-opacity-30 active:scale-90"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Icon.chevR />
                </button>
              </>
            )}
          </div>

          {/* Image counter */}
          <div className="text-white text-[14px] font-semibold mt-6 tracking-wide px-4 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            {(active % (rawImages.length || 1)) + 1} of {rawImages.length}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tab navigation
───────────────────────────────────────────── */
const TABS = ["Overview", "Details", "Features", "Neighborhood"] as const;
type TabKey = typeof TABS[number];

function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div className="flex justify-start md:justify-center gap-1 mt-8 mb-6 overflow-x-auto no-scrollbar px-4 md:px-0" style={{ borderBottom: "1px solid #E5E0D8" }}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="px-4 py-3 text-[13px] cursor-pointer border-none bg-transparent transition-all whitespace-nowrap flex-shrink-0"
          style={{
            color:      active === tab ? "#1C3A2F" : "#999",
            fontWeight: active === tab ? 700 : 500,
            borderBottom: active === tab ? "2px solid #1C3A2F" : "2px solid transparent",
            marginBottom: -1,
            fontFamily: "inherit",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Property details — icon + label / value rows
───────────────────────────────────────────── */
function DetailsGrid({ property }: { property: PropertyCard }) {
  const rows: Array<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = [
    { icon: <Icon.home />,     label: "Property Type",   value: property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) },
    { icon: <Icon.status />,   label: "Status",          value: (
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ADE80" }} />
        {listingBadge(property.listingType)}
      </span>
    )},
    { icon: <Icon.calendar />, label: "Posted",          value: relativeDate(property.createdAt) },
    { icon: <Icon.calendar />, label: "Available From",  value: availableFromLabel(property) },
    { icon: <Icon.pin />,      label: "Location",        value: `${property.district ? property.district + ", " : ""}${property.area}, Bangkok` },
    { icon: <Icon.home />,     label: "Furnishing",      value: furnishingLabel(property) },
    { icon: <Icon.calendar />, label: "Building Built",  value: String(buildingBuiltYear(property)) },
    ...(lastRenovatedYear(property) != null ? [{
      icon:  <Icon.calendar />, label: "Last Renovated",  value: String(lastRenovatedYear(property)),
    }] : []),
    { icon: <Icon.hash />,     label: "Listing ID",      value: `NHP-${String(property.id).padStart(7, "0")}` },
    { icon: <Icon.ruler />,    label: "Floor Area",      value: property.sqm ? `${property.sqm} m²` : "—" },
    { icon: <Icon.money />,    label: "Maintenance",     value: property.maintenance ? property.maintenance : getDynamicMaintenance(property.description, property.id, property.listingType) },
    { icon: <Icon.subtype />,  label: "Lease Terms",     value: property.leaseTerms ? property.leaseTerms : contractTerms(property.listingType) },
    { icon: <Icon.money />,    label: "Deposit",         value: property.depositTerms ? property.depositTerms : depositTerms(property.listingType) },
    { icon: <Icon.stories />,  label: "Floor / Floors",  value: property.floor && property.totalFloors ? `${property.floor} / ${property.totalFloors}` : property.floor ? String(property.floor) : getDynamicFloor(property.description, property.id, property.propertyType) },
    { icon: <Icon.parking />,  label: "Parking",         value: getDynamicParking(property.description, property.id, property.propertyType) },
    ...(property.listingType === "sale" ? [{
      icon: <Icon.status />,
      label: "Foreign Quota",
      value: (
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: foreignQuotaStatus(property) ? "#4ADE80" : "#E05252" }} />
          {foreignQuotaStatus(property) ? "Available" : "Thai Quota Only"}
        </span>
      ),
    }] : []),
    ...(visaFriendlyStatus(property) ? [{
      icon:  <Icon.status />,  label: "Visa Friendly",   value: "LTR / Elite Visa Accepted",
    }] : []),
    ...(btsInfo(property) ? [{
      icon:  <Icon.pin />,     label: "Nearest BTS",     value: `${btsInfo(property)!.station} · ${btsInfo(property)!.walk} min walk`,
    }] : []),
    ...(mrtInfo(property) ? [{
      icon:  <Icon.pin />,     label: "Nearest MRT",     value: `${mrtInfo(property)!.station} · ${mrtInfo(property)!.walk} min walk`,
    }] : []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between" style={{ paddingBottom: 16, borderBottom: "1px solid #EDE8DF" }}>
          <div className="flex items-center gap-2.5">
            <span style={{ color: "#1C3A2F" }}>{r.icon}</span>
            <span className="text-[13px]" style={{ color: "#777" }}>{r.label}</span>
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Enquiry form (used by Send Enquiry button)
───────────────────────────────────────────── */
function EnquiryModal({ property, onClose }: { property: PropertyCard; onClose: () => void }) {
  const [name, setName]       = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod]   = useState("WhatsApp");
  const [msg, setMsg]         = useState("");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    await sendEnquiry({
      propertySlug: property.slug,
      propertyName: property.name,
      listingType:  property.listingType,
      price:        formatPrice(property),
      area:         property.area,
      name, contact, method,
      message:      msg || undefined,
      source:       "detail",
    });
  };

  const inputStyle = { border: "1.5px solid #E5E0D8", background: "#F7F3EC", color: "#1A1A1A", fontFamily: "inherit" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {status === "done" ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-[18px] font-bold mb-2" style={{ color: "#1C3A2F" }}>Enquiry sent!</p>
              <p className="text-[13px] font-light mb-5" style={{ color: "#555" }}>
                We&apos;ll contact you via {method} within 24 hours.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer border-none" style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-bold" style={{ color: "#1C3A2F" }}>Send Enquiry</h3>
                  <p className="text-[12px] mt-0.5" style={{ color: "#999" }}>{property.name}</p>
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none text-base" style={{ background: "#EDE8DF", color: "#555", fontFamily: "inherit" }}>✕</button>
              </div>
              <form className="flex flex-col gap-3" onSubmit={submit}>
                <input suppressHydrationWarning className="w-full rounded-xl px-4 py-3 text-[14px] outline-none" style={inputStyle} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")} onBlur={(e) => (e.target.style.borderColor = "#E5E0D8")} required />
                <div className="flex gap-2">
                  <select suppressHydrationWarning value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-xl px-3 py-3 text-[14px] outline-none cursor-pointer" style={inputStyle}>
                    <option>WhatsApp</option><option>Line</option><option>Telegram</option>
                  </select>
                  <input suppressHydrationWarning className="flex-1 rounded-xl px-4 py-3 text-[14px] outline-none" style={inputStyle} placeholder="Phone / username" value={contact} onChange={(e) => setContact(e.target.value)} onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")} onBlur={(e) => (e.target.style.borderColor = "#E5E0D8")} required />
                </div>
                <textarea suppressHydrationWarning className="w-full rounded-xl px-4 py-3 text-[14px] outline-none resize-none" style={inputStyle} placeholder={`I'm interested in ${property.name}…`} rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")} onBlur={(e) => (e.target.style.borderColor = "#E5E0D8")} />
                {errorMsg && <p className="text-[12px] px-1" style={{ color: "#E05252" }}>⚠ {errorMsg}</p>}
                <button suppressHydrationWarning type="submit" disabled={status === "loading"} className="w-full py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer border-none disabled:opacity-60" style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                  {status === "loading" ? "Sending…" : "Send Enquiry →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Similar card
───────────────────────────────────────────── */
function SimilarCard({ property }: { property: PropertyCard }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <a href={`/property/${property.slug}`} className="no-underline rounded-2xl overflow-hidden block group" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
      <div className="relative h-36 overflow-hidden" style={{ background: "#1C3A2F" }}>
        {property.coverImage && !imgErr ? (
          <img src={property.coverImage} alt={property.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-3xl font-black" style={{ color: "rgba(255,255,255,0.08)" }}>NHP</span></div>
        )}
      </div>
      <div className="p-3">
        <div className="text-[14px] font-bold mb-0.5" style={{ color: "#1C3A2F" }}>
          ฿{Number(property.priceTHB).toLocaleString("th-TH")}{property.priceLabel ?? ""}
        </div>
        <div className="text-[12px] font-medium line-clamp-1 mb-1" style={{ color: "#1A1A1A" }}>{property.name}</div>
        <div className="text-[11px] flex gap-2" style={{ color: "#999" }}>
          <span>🛏 {property.bedrooms === 0 ? "Studio" : property.bedrooms}</span>
          <span>🚿 {property.bathrooms}</span>
          {property.sqm && <span>📐 {property.sqm}m²</span>}
        </div>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────────
   Tour calendar — date + time picker modal
───────────────────────────────────────────── */
function TourCalendar({ property, onClose }: { property: PropertyCard; onClose: () => void }) {
  const [selDate, setDate]  = useState<string | null>(null);
  const [selTime, setTime]  = useState<string | null>(null);
  const [name, setName]     = useState("");
  const [method, setMethod] = useState<"WhatsApp" | "Line">("WhatsApp");
  const [contact, setContact] = useState("");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();
  const step: "pick" | "done" = status === "done" ? "done" : "pick";

  /* ── Calendar logic ── */
  const today        = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const year         = today.getFullYear();
  const month        = today.getMonth();
  const monthLabel   = today.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat

  // Selectable window: today + next 7 days, BUT only if within current month
  const maxDate = new Date(year, month, today.getDate() + 7);
  const isSelectable = (day: number) => {
    const d = new Date(year, month, day);
    return d >= todayMidnight && d <= maxDate;
  };

  const times = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  const submit = async () => {
    if (!selDate || !selTime || !name || !contact) return;
    await sendEnquiry({
      propertySlug: property.slug,
      propertyName: property.name,
      listingType:  property.listingType,
      price:        formatPrice(property),
      area:         property.area,
      name,
      contact,
      method,
      message:      `Tour requested for ${selDate} at ${selTime}`,
      source:       "tour",
      tourDate:     selDate,
      tourTime:     selTime,
    });
  };

  // Build the calendar grid: empty cells for days before month start + each day
  const totalCells = firstWeekday + daysInMonth;
  const rows = Math.ceil(totalCells / 7);
  const cells: (number | null)[] = [];
  for (let i = 0; i < rows * 7; i++) {
    const day = i - firstWeekday + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {step === "done" ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-[18px] font-bold mb-2" style={{ color: "#1C3A2F" }}>Tour requested!</p>
              <p className="text-[13px] font-light mb-1" style={{ color: "#555" }}>
                {selDate} at {selTime}
              </p>
              <p className="text-[12px] font-light mb-5" style={{ color: "#999" }}>
                We&apos;ll confirm via {method} within 1 hour.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer border-none" style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[16px] font-bold" style={{ color: "#1C3A2F" }}>Schedule a Tour</h3>
                  <p className="text-[12px] mt-0.5" style={{ color: "#999" }}>{property.name}</p>
                </div>
                <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none text-base" style={{ background: "#EDE8DF", color: "#555", fontFamily: "inherit" }}>✕</button>
              </div>

              {/* ── Calendar ── */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-[1px] font-semibold" style={{ color: "#999" }}>Pick a date</p>
                <p className="text-[14px] font-bold" style={{ color: "#1C3A2F" }}>{monthLabel}</p>
              </div>

              <div className="rounded-xl p-3 mb-1" style={{ background: "#FAF8F3", border: "1px solid #EDE8DF" }}>
                {/* Weekday header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekdays.map((w, i) => (
                    <div key={i} className="text-center text-[10px] font-semibold uppercase tracking-[0.5px]" style={{ color: "#999" }}>
                      {w}
                    </div>
                  ))}
                </div>
                {/* Day grid */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, i) => {
                    if (day == null) return <div key={i} />;
                    const iso = new Date(year, month, day).toISOString().split("T")[0];
                    const enabled = isSelectable(day);
                    const isSel   = selDate === iso;
                    const isToday = day === today.getDate();
                    return (
                      <button
                        key={i}
                        onClick={() => enabled && setDate(iso)}
                        disabled={!enabled}
                        className="aspect-square rounded-lg text-[13px] font-semibold cursor-pointer border-none transition-all relative"
                        style={{
                          background: isSel ? "#1C3A2F" : enabled ? "#FFFFFF" : "transparent",
                          color:      isSel ? "#FFFFFF" : enabled ? "#1A1A1A" : "#ccc",
                          cursor:     enabled ? "pointer" : "not-allowed",
                          fontFamily: "inherit",
                          border:     isToday && !isSel ? "1.5px solid #C9A84C" : "1.5px solid transparent",
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-[10px] mb-5" style={{ color: "#bbb" }}>
                Select a date within the next 7 days.
              </p>

              {/* ── Time ── */}
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5" style={{ color: "#999" }}>Pick a time</p>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {times.map((t) => {
                  const isSel = selTime === t;
                  return (
                    <button key={t} onClick={() => setTime(t)}
                      className="py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border-[1.5px] transition-all"
                      style={isSel
                        ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                        : { background: "#FFFFFF", color: "#444", borderColor: "#E5E0D8", fontFamily: "inherit" }
                      }
                    >{t}</button>
                  );
                })}
              </div>

              {/* ── Contact ── */}
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5" style={{ color: "#999" }}>Your contact</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none mb-2"
                style={{ border: "1.5px solid #E5E0D8", background: "#F7F3EC", color: "#1A1A1A", fontFamily: "inherit" }}
              />

              {/* WhatsApp / Line selector + number */}
              <div className="flex gap-2 mb-4">
                {/* Selector */}
                <div className="inline-flex rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1.5px solid #E5E0D8" }}>
                  {(["WhatsApp", "Line"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className="flex items-center gap-1.5 cursor-pointer border-none text-[12px] font-semibold transition-all"
                      style={{
                        padding: "0 12px",
                        background: method === m ? "#1C3A2F" : "#FFFFFF",
                        color:      method === m ? "#FFFFFF" : "#666",
                        fontFamily: "inherit",
                      }}
                    >
                      {m === "WhatsApp" ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zM12 .572C5.495.572.16 5.907.157 12.464c0 2.097.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 4.572"/></svg>
                      )}
                      {m}
                    </button>
                  ))}
                </div>
                {/* Number */}
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={method === "WhatsApp" ? "+66 81 234 5678" : "@your-line-id"}
                  className="flex-1 rounded-xl px-4 py-3 text-[14px] outline-none min-w-0"
                  style={{ border: "1.5px solid #E5E0D8", background: "#F7F3EC", color: "#1A1A1A", fontFamily: "inherit" }}
                />
              </div>

              {errorMsg && (
                <p className="text-[12px] mb-3 px-1" style={{ color: "#E05252" }}>⚠ {errorMsg}</p>
              )}
              <button onClick={submit} disabled={!selDate || !selTime || !name || !contact || status === "loading"}
                className="w-full py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer border-none disabled:opacity-50"
                style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
              >
                {status === "loading" ? "Sending…" : "Request Tour"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Recently viewed strip — sticky bottom row
───────────────────────────────────────────── */
function RecentlyViewedStrip({ currentId }: { currentId: number }) {
  const { ids } = useRecentlyViewed();
  const items = ids.filter((id) => id !== currentId).slice(0, 4)
    .map((id) => MOCK_PROPERTIES.find((p) => p.id === id))
    .filter((p): p is PropertyCard => p != null);

  if (items.length === 0) return null;

  return (
    <div className="px-5 md:px-10 py-6" style={{ background: "#FFFFFF", borderTop: "1px solid #EDE8DF" }}>
      <h3 className="text-[14px] font-bold mb-4" style={{ color: "#1A1A1A" }}>Recently viewed</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => <SimilarCard key={p.id} property={p} />)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
interface PropertyDetailProps {
  property:     PropertyCard;
  sameBuilding: PropertyCard[];
  sameArea:     PropertyCard[];
  nearby:       PropertyCard[];
}

export default function PropertyDetail({ property, sameBuilding, nearby }: Omit<PropertyDetailProps, "sameArea">) {
  const [tab, setTab] = useState<TabKey>("Overview");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const allImages = property.images?.length ? property.images : [property.coverImage ?? ""];
  const posted    = relativeDate(property.createdAt);
  const { track } = useRecentlyViewed();
  const [contacts, setContacts] = useState({ adminEmail: "admin@nhpbangkok.com", adminPhone: "+66812345678" });

  // Real-time View Tracking State
  const [views, setViews] = useState(property.viewCount ?? viewCount(property));

  // Selected Place State for Interactive Map
  const [selectedPlace, setSelectedPlace] = useState<Facility | null>(null);

  const areaFacilities = getNeighborhoodFacilities(property.area);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.adminEmail && data.adminPhone) {
          setContacts({ adminEmail: data.adminEmail, adminPhone: data.adminPhone });
        }
      })
      .catch(() => {});
  }, []);

  // Track this property as recently viewed and track active view engagement
  useEffect(() => {
    track(property.id);
    fetch(`/api/properties/${property.id}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view", page: window.location.pathname }),
    })
      .then((res) => {
        if (res.ok) {
          setViews((v) => v + 1);
        }
      })
      .catch(() => {});
  }, [property.id, track]);

  /* ── Right-sidebar stats (Beds | Baths | Sq Ft | Garage) ── */
  const parkingValue = getDynamicParking(property.description, property.id, property.propertyType).split(" ")[0];
  const stats = [
    { icon: <Icon.bed />,    value: property.bedrooms === 0 ? "Studio" : String(property.bedrooms), label: "Beds"   },
    { icon: <Icon.bath />,   value: String(property.bathrooms),                                     label: "Baths"  },
    { icon: <Icon.sqft />,   value: property.sqm ? property.sqm.toLocaleString() : "—",             label: "m²"     },
    { icon: <Icon.garage />, value: parkingValue,                                                   label: "Parking"},
  ];

  const listingTypeLabel = property.listingType === "sale" ? "Sale" : property.listingType === "rent" ? "Rent" : "Short Stay";
  const propTypeLabel = property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1);
  const dynamicHookTitle = `${property.bedrooms === 0 ? "Studio" : property.bedrooms + " Bed"} ${propTypeLabel} for ${listingTypeLabel} in ${property.area}`;

  return (
    <div>

      {/* ── Breadcrumb + Back to Search ── */}
      <div className="px-5 md:px-10 py-4 flex items-center justify-between" style={{ background: "#F7F3EC", borderBottom: "1px solid #EDE8DF" }}>
        <div className="flex items-center gap-2 text-[12px] overflow-x-auto no-scrollbar">
          <Link href="/" className="no-underline transition-opacity hover:opacity-70" style={{ color: "#999" }}>Home</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link href="/explore" className="no-underline transition-opacity hover:opacity-70" style={{ color: "#999" }}>{listingBadge(property.listingType)}</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link href={`/explore?area=${property.area}`} className="no-underline transition-opacity hover:opacity-70 whitespace-nowrap" style={{ color: "#999" }}>{property.area}</Link>
          <span style={{ color: "#ccc" }}>/</span>
          <span className="font-semibold whitespace-nowrap" style={{ color: "#1C3A2F" }}>{property.name}</span>
        </div>
        <Link href="/explore" className="hidden md:flex items-center gap-1.5 text-[12px] font-medium no-underline transition-opacity hover:opacity-70 whitespace-nowrap" style={{ color: "#1C3A2F" }}>
          <Icon.chevL /> Back to Search
        </Link>
      </div>

      {/* ── Main layout ── */}
      <div className="px-5 md:px-10 py-6 md:py-8">
        <div className="md:grid md:grid-cols-[1fr_400px] md:gap-4 lg:gap-5">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div>

            {/* ── MOBILE PART A — chips + title + location BEFORE gallery ── */}
            <div className="md:hidden mb-4">
              {/* Trust chips row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {views.toLocaleString()} views
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#2E7D4F", border: "1px solid rgba(74,222,128,0.3)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  {lastVerifiedLabel(property)}
                </span>
                {visaFriendlyStatus(property) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.15)", color: "#8B6914", border: "1px solid rgba(201,168,76,0.4)" }}>
                    🌍 Visa Friendly
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[22px] font-bold mb-1.5 leading-tight" style={{ color: "#1A1A1A", letterSpacing: "-0.4px" }}>
                {property.name}
              </h1>

              {/* Location — clickable Google Maps link */}
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(property.name + " " + (property.district ?? "") + " " + property.area + " Bangkok")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] no-underline transition-opacity hover:opacity-70"
                style={{ color: "#999" }}
              >
                <span style={{ color: "#1C3A2F" }}><Icon.pin /></span>
                <span style={{ borderBottom: "1px solid #ccc" }}>
                  {property.district ? `${property.district}, ` : ""}{property.area}, Bangkok
                </span>
              </a>
            </div>

            {/* Gallery */}
            <Gallery images={allImages} name={property.name} isFeatured={property.featured} propertyId={property.id} />

            {/* ── MOBILE PART B — price + posted + stats BEFORE tabs ── */}
            <div className="md:hidden mt-5">
              {/* Gold price */}
              <div className="mb-3">
                <div className="text-[26px] font-bold" style={{ color: "#C9A84C", letterSpacing: "-0.8px", lineHeight: 1 }}>
                  {formatPrice(property)}
                </div>
              </div>

              {/* Posted date */}
              <div className="flex items-center gap-1.5 mb-4 text-[11px]" style={{ color: "#999" }}>
                <span style={{ color: "#1C3A2F" }}><Icon.calendar /></span>
                <span>{posted}</span>
              </div>

              {/* Stats row */}
              <div className="flex items-center py-3.5 px-2 rounded-xl mb-2" style={{ background: "#FAF8F3", border: "1px solid #EDE8DF" }}>
                {stats.map((s, i) => (
                  <div key={s.label} className="flex-1 flex flex-col items-center" style={{ borderRight: i < stats.length - 1 ? "1px solid #E5E0D8" : "none" }}>
                    <span style={{ color: "#1C3A2F" }}>{s.icon}</span>
                    <span className="text-[15px] font-bold mt-1" style={{ color: "#1C3A2F" }}>{s.value}</span>
                    <span className="text-[10px] mt-0.5 uppercase tracking-[0.5px]" style={{ color: "#999" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab bar */}
            <TabBar active={tab} onChange={setTab} />

            {/* ── OVERVIEW ── */}
            {tab === "Overview" && (
              <div className="pb-8 text-center max-w-3xl mx-auto">
                <h2 className="text-[20px] md:text-[22px] font-bold mb-3" style={{ color: "#1A1A1A", letterSpacing: "-0.3px" }}>
                  {dynamicHookTitle}
                </h2>
                <p className="text-[14px] md:text-[15px] leading-[1.8] font-light" style={{ color: "#555" }}>
                  {property.description} This property is situated in one of Bangkok&apos;s most sought-after neighbourhoods, offering convenient access to BTS Skytrain stations, international schools, premium shopping malls, and world-class dining.
                </p>
              </div>
            )}

            {/* ── DETAILS ── */}
            {tab === "Details" && (
              <div className="pb-8 max-w-3xl mx-auto">
                <h2 className="text-[18px] font-bold mb-5 text-center" style={{ color: "#1A1A1A" }}>Property Details</h2>
                <DetailsGrid property={property} />
              </div>
            )}

            {/* ── FEATURES ── */}
            {tab === "Features" && (
              <div className="pb-8 max-w-3xl mx-auto">
                <h2 className="text-[18px] font-bold mb-5 text-center" style={{ color: "#1A1A1A" }}>Amenities & Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {property.amenities && property.amenities.length > 0 ? (
                    property.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2.5 py-3 px-4 rounded-xl text-[13px]" style={{ background: "#FFFFFF", border: "1px solid #EDE8DF", color: "#444" }}>
                        <span className="flex-shrink-0" style={{ color: "#1C3A2F" }}>✨</span>
                        {a}
                      </div>
                    ))
                  ) : (
                    [
                      {
                        label: "24h Security",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
                      },
                      {
                        label: "Rooftop Pool",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20s2-2 5-2 5 2 7 2 5-2 5-2 2 2 3 2"/><path d="M2 16s2-2 5-2 5 2 7 2 5-2 5-2 2 2 3 2"/><path d="M6 11V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v11"/><path d="M14 11V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v11"/></svg>,
                      },
                      {
                        label: "Fitness Center",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5 17.5 17.5"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>,
                      },
                      {
                        label: "Concierge",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
                      },
                      {
                        label: "Covered Parking",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>,
                      },
                      {
                        label: "1Gbps Fibre WiFi",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
                      },
                      {
                        label: "Smart Climate",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>,
                      },
                      {
                        label: "Skyline Views",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
                      },
                      {
                        label: "Pet Friendly",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>,
                      },
                      {
                        label: "Smart Home",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="2"/></svg>,
                      },
                      {
                        label: "On-site Laundry",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="5"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/></svg>,
                      },
                      {
                        label: "Storage Room",
                        svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4M20 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7M20 7l-2-4H6L4 7"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
                      },
                    ].map((a) => (
                      <div key={a.label} className="flex items-center gap-2.5 py-3 px-4 rounded-xl text-[13px]" style={{ background: "#FFFFFF", border: "1px solid #EDE8DF", color: "#444" }}>
                        <span className="flex-shrink-0" style={{ color: "#1C3A2F" }}>{a.svg}</span>
                        {a.label}
                      </div>
                    ))
                  )}
                </div>

                {/* ── House Rules ── */}
                <h3 className="text-[15px] font-bold mt-10 mb-4 text-center" style={{ color: "#1A1A1A" }}>House Rules</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {(() => {
                    const rules = houseRulesDefaults(property);
                    return [
                      { key: "pets",     label: "Pets",        allowed: rules.pets,
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>,
                      },
                      { key: "smoking",  label: "Smoking",     allowed: rules.smoking,
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 12h-2"/><rect x="2" y="12" width="14" height="6" rx="1"/><path d="M22 12v6"/><path d="M18 8c0-2.5-2-2.5-2-5"/><path d="M22 8c0-2.5-2-2.5-2-5"/></svg>,
                      },
                      { key: "parties",  label: "Parties",     allowed: rules.parties,
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 10 7-17"/><path d="M2 7h10"/></svg>,
                      },
                      { key: "children", label: "Children",    allowed: rules.children,
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.5"/><path d="M12 7.5v6"/><path d="m8 11 4 2.5L16 11"/><path d="m9 21 3-7.5L15 21"/></svg>,
                      },
                    ].map((r) => (
                      <div key={r.key} className="flex flex-col items-center text-center py-4 px-3 rounded-xl" style={{ background: r.allowed ? "#FFFFFF" : "#FAF8F3", border: `1px solid ${r.allowed ? "#EDE8DF" : "#E5E0D8"}` }}>
                        <span style={{ color: r.allowed ? "#1C3A2F" : "#bbb" }}>{r.icon}</span>
                        <div className="text-[12px] font-semibold mt-1.5" style={{ color: r.allowed ? "#1A1A1A" : "#999" }}>{r.label}</div>
                        <div className="text-[10px] font-medium mt-0.5 uppercase tracking-[0.5px]" style={{ color: r.allowed ? "#4ADE80" : "#E05252" }}>
                          {r.allowed ? "Allowed" : "Not Allowed"}
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* ── Utilities ── */}
                <h3 className="text-[15px] font-bold mt-10 mb-4 text-center" style={{ color: "#1A1A1A" }}>Utilities</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {(() => {
                    const u = utilitiesDefaults(property);
                    const utilityIcons = {
                      water:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
                      electricity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                      internet:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
                      aircon:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>,
                    };
                    const labels = { water: "Water", electricity: "Electricity", internet: "Internet", aircon: "Air Conditioning" };
                    const statusLabel = (s: string) => s === "included" ? "Included" : s === "metered" ? "Metered" : "Tenant Pays";
                    const statusColor = (s: string) => s === "included" ? "#4ADE80" : s === "metered" ? "#C9A84C" : "#999";
                    return (Object.keys(labels) as Array<keyof typeof labels>).map((k) => (
                      <div key={k} className="flex items-center gap-3 py-3 px-4 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #EDE8DF" }}>
                        <span className="flex-shrink-0" style={{ color: "#1C3A2F" }}>{utilityIcons[k]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>{labels[k]}</div>
                          <div className="text-[10px] font-medium uppercase tracking-[0.5px]" style={{ color: statusColor(u[k]!) }}>
                            {statusLabel(u[k]!)}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* ── Common Areas Gallery ── */}
                <h3 className="text-[15px] font-bold mt-10 mb-4 text-center" style={{ color: "#1A1A1A" }}>Building Common Areas</h3>
                <p className="text-[12px] text-center mb-4" style={{ color: "#999" }}>Shared amenities — pool, gym, lobby and lounge</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {commonAreaImages(property).map((src, i) => {
                    const captions = ["Rooftop Pool", "Gym & Fitness", "Lobby & Reception", "Co-working Lounge"];
                    return (
                      <div key={i} className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 3" }}>
                        <img src={src} alt={captions[i]} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)" }} />
                        <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold uppercase tracking-[0.5px]" style={{ color: "#FFFFFF" }}>
                          {captions[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* ── NEIGHBORHOOD ── */}
            {tab === "Neighborhood" && (
              <div className="pb-8 max-w-3xl mx-auto">
                <h2 className="text-[18px] font-bold mb-5 text-center" style={{ color: "#1A1A1A" }}>About {property.area}</h2>

                {/* Walk & Transit Score */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {(() => {
                    const bts = btsInfo(property);
                    const mrt = mrtInfo(property);
                    const walkScore = property.nearBts ? 92 : 78;
                    const transitScore = bts || mrt ? 95 : 70;
                    const scoreCol = (n: number) => n >= 90 ? "#4ADE80" : n >= 70 ? "#C9A84C" : "#E05252";
                    const scoreLabel = (n: number) => n >= 90 ? "Walker's Paradise" : n >= 70 ? "Very Walkable" : "Car-Dependent";
                    return [
                      { label: "Walk Score",    score: walkScore,    desc: scoreLabel(walkScore) },
                      { label: "Transit Score", score: transitScore, desc: bts ? `${bts.station} ${bts.walk} min` : "Limited" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold flex-shrink-0" style={{ background: scoreCol(s.score), color: "#FFFFFF" }}>
                          {s.score}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold" style={{ color: "#1A1A1A" }}>{s.label}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#999" }}>{s.desc}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Responsive Map block with pinned facilities */}
                <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid #E5E0D8" }}>
                  <div className="relative w-full" style={{ background: "linear-gradient(135deg,#254D3E,#1C3A2F)", height: 260 }}>
                    {/* Stylised dotted-grid map background */}
                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)", backgroundSize: "12px 12px" }} />

                    {/* Centre pin (this property) */}
                    <div 
                      onClick={() => setSelectedPlace(null)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ background: "#C9A84C", color: "#1C3A2F", boxShadow: "0 0 0 8px rgba(201,168,76,0.25), 0 4px 12px rgba(0,0,0,0.3)" }}>
                        <Icon.pin />
                      </div>
                      <span className="mt-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.75)", color: "#E2C97E", whiteSpace: "nowrap" }}>
                        {property.name}
                      </span>
                    </div>

                    {/* Surrounding facility pins */}
                    {areaFacilities.map((f, i) => {
                      const isSelected = selectedPlace?.name === f.name;
                      const leftPercent = 50 + f.lngOffset * 4500;
                      const topPercent = 50 - f.latOffset * 4500;
                      
                      return (
                        <div 
                          key={i} 
                          className="absolute flex flex-col items-center z-20" 
                          style={{ 
                            left: `${leftPercent}%`, 
                            top: `${topPercent}%`, 
                            transform: "translate(-50%,-50%)",
                            transition: "all 0.3s ease" 
                          }}
                        >
                          <button
                            onClick={() => setSelectedPlace(f)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] border-none shadow-md cursor-pointer transition-all hover:scale-110 active:scale-95"
                            style={{ 
                              background: isSelected ? "#C9A84C" : "rgba(255,255,255,0.92)",
                              boxShadow: isSelected ? "0 0 0 6px rgba(201,168,76,0.3)" : "0 2px 6px rgba(0,0,0,0.15)",
                              transform: isSelected ? "scale(1.15)" : "scale(1)"
                            }}
                            title={f.name}
                          >
                            {f.icon}
                          </button>
                          
                          {/* Tooltip for the selected facility */}
                          {isSelected && (
                            <div 
                              className="absolute bottom-10 bg-[#1C3A2F] text-white p-2.5 rounded-xl text-center shadow-lg border border-[#C9A84C] z-30 pointer-events-none"
                              style={{ width: 160 }}
                            >
                              <div className="text-[10px] font-bold text-[#E2C97E] uppercase tracking-[0.5px] mb-0.5">{f.type}</div>
                              <div className="text-[11px] font-semibold leading-tight line-clamp-2">{f.name}</div>
                              <div className="text-[10px] text-gray-300 mt-1">🕒 {f.distance}</div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1C3A2F]" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <a href={`https://www.google.com/maps/search/${encodeURIComponent((property.district ?? property.area) + " Bangkok")}`} target="_blank" rel="noopener noreferrer"
                       className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-[11px] font-semibold no-underline shadow-md"
                       style={{ background: "#C9A84C", color: "#1C3A2F" }}>
                      Open in Google Maps →
                    </a>
                  </div>

                  {/* Interactive neighborhood facilities list */}
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ background: "#FFFFFF" }}>
                    {areaFacilities.map((f, i) => {
                      const isSelected = selectedPlace?.name === f.name;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedPlace(f)}
                          className="flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all text-left w-full bg-transparent"
                          style={{
                            borderColor: isSelected ? "#C9A84C" : "#EDE8DF",
                            background: isSelected ? "#FAF8F3" : "transparent",
                            fontFamily: "inherit"
                          }}
                        >
                          <span className="text-lg flex-shrink-0">{f.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-bold leading-tight" style={{ color: "#1A1A1A" }}>{f.name}</div>
                            <div className="text-[11px] mt-0.5" style={{ color: "#999" }}>{f.distance} · <span className="capitalize">{f.type}</span></div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}


            {/* Similar properties — building → nearby */}
            {(sameBuilding.length + nearby.length) > 0 && (
              <div className="pb-10" style={{ borderTop: "1px solid #EDE8DF", paddingTop: 32 }}>

                {sameBuilding.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-[17px] font-bold mb-1" style={{ color: "#1A1A1A" }}>
                      More from this building
                    </h2>
                    <p className="text-[12px] mb-4" style={{ color: "#999" }}>Other units in the same condominium</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {sameBuilding.map((p) => <SimilarCard key={p.id} property={p} />)}
                    </div>
                  </div>
                )}

                {nearby.length > 0 && (
                  <div>
                    <h2 className="text-[17px] font-bold mb-1" style={{ color: "#1A1A1A" }}>
                      Nearby properties
                    </h2>
                    <p className="text-[12px] mb-4" style={{ color: "#999" }}>Just a few minutes from {property.area}</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {nearby.map((p) => <SimilarCard key={p.id} property={p} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
          <div className="hidden md:block">
            <div className="sticky top-20 flex flex-col gap-4">

              {/* Title + Price card */}
              <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>

                {/* Trust chips row — view count + verified + currency switcher */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {views.toLocaleString()} views
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#2E7D4F", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {lastVerifiedLabel(property)}
                  </span>
                  {visaFriendlyStatus(property) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.15)", color: "#8B6914", border: "1px solid rgba(201,168,76,0.4)" }}>
                      🌍 Visa Friendly
                    </span>
                  )}
                </div>

                <h1 className="text-[22px] font-bold mb-1.5 leading-tight" style={{ color: "#1A1A1A", letterSpacing: "-0.4px" }}>
                  {property.name}
                </h1>

                {/* Location — clickable Google Maps link */}
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(property.name + " " + (property.district ?? "") + " " + property.area + " Bangkok")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] mb-4 no-underline transition-opacity hover:opacity-70"
                  style={{ color: "#999" }}
                >
                  <span style={{ color: "#1C3A2F" }}><Icon.pin /></span>
                  <span style={{ borderBottom: "1px solid #ccc" }}>
                    {property.district ? `${property.district}, ` : ""}{property.area}, Bangkok
                  </span>
                </a>

                {/* Gold price (currency-aware) */}
                <div className="mb-4">
                  <div className="text-[26px] font-bold" style={{ color: "#C9A84C", letterSpacing: "-0.8px", lineHeight: 1 }}>
                    {formatPrice(property)}
                  </div>
                </div>

                {/* Posted date */}
                <div className="flex items-center gap-1.5 mb-4 text-[11px]" style={{ color: "#999" }}>
                  <span style={{ color: "#1C3A2F" }}><Icon.calendar /></span>
                  <span>{posted}</span>
                </div>

                {/* Stats row with vertical dividers */}
                <div
                  className="flex items-center py-3.5 px-2 rounded-xl"
                  style={{ background: "#FAF8F3" }}
                >
                  {stats.map((s, i) => (
                    <div
                      key={s.label}
                      className="flex-1 flex flex-col items-center"
                      style={{ borderRight: i < stats.length - 1 ? "1px solid #E5E0D8" : "none" }}
                    >
                      <span style={{ color: "#1C3A2F" }}>{s.icon}</span>
                      <span className="text-[15px] font-bold mt-1" style={{ color: "#1C3A2F" }}>{s.value}</span>
                      <span className="text-[10px] mt-0.5 uppercase tracking-[0.5px]" style={{ color: "#999" }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Schedule a Tour card */}
                <button
                  onClick={() => {
                    setTourOpen(true);
                    fetch(`/api/properties/${property.id}/track`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "click" }),
                    }).catch(() => {});
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl mt-4 cursor-pointer transition-all"
                  style={{ background: "#FAF8F3", border: "1px solid #EDE8DF", textAlign: "left", fontFamily: "inherit" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#C9A84C")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#EDE8DF")}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#FFFFFF", color: "#1C3A2F" }}>
                    <Icon.calendar />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>Schedule a Tour</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "#999" }}>Pick a date that works for you</div>
                  </div>
                  <span style={{ color: "#999" }}><Icon.chevRSm /></span>
                </button>

                {/* Send Enquiry button */}
                <button
                  onClick={() => {
                    setEnquiryOpen(true);
                    fetch(`/api/properties/${property.id}/track`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "click" }),
                    }).catch(() => {});
                  }}
                  className="w-full mt-3 py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer border-none transition-opacity hover:opacity-90 text-white"
                  style={{ background: "#1C3A2F", fontFamily: "inherit" }}
                >
                  Send Enquiry
                </button>

                {/* Call Agent button */}
                <a
                  href={`tel:${contacts.adminPhone}`}
                  onClick={() => {
                    fetch(`/api/properties/${property.id}/track`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ type: "click" }),
                    }).catch(() => {});
                  }}
                  className="w-full flex items-center justify-center gap-2 mt-2.5 py-3.5 rounded-xl text-[14px] font-semibold no-underline transition-all"
                  style={{ background: "transparent", border: "1.5px solid #1C3A2F", color: "#1C3A2F" }}
                >
                  <Icon.phone /> Call Agent
                </a>
              </div>

              {/* At a Glance — separate card */}
              <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                <h3 className="text-[15px] font-bold mb-4" style={{ color: "#1A1A1A" }}>At a Glance</h3>
                <div className="flex flex-col gap-3.5">
                  {(() => {
                    const bts = btsInfo(property);
                    const mrt = mrtInfo(property);
                    const btsText = bts ? `${bts.station} · ${bts.walk}m` : mrt ? `${mrt.station} · ${mrt.walk}m` : `${property.area} · 5m`;
                    const items: Array<{ icon: React.ReactNode; label: string; value: string }> = [
                      { icon: <Icon.pin />,      label: "Nearest BTS",  value: btsText },
                      { icon: <Icon.home />,    label: "Furnishing",   value: furnishingLabel(property) },
                      { icon: <Icon.view />,    label: "Views",        value: getDynamicViews(property.description, property.features) },
                      { icon: <Icon.heating />, label: "Heating",      value: getDynamicHeating(property.description) },
                      { icon: <Icon.cooling />, label: "Cooling",      value: getDynamicCooling(property.description) },
                      { icon: <Icon.fire />,    label: "Kitchen",      value: getDynamicKitchen(property.description, property.features) },
                    ];
                    return items.map((g) => (
                      <div key={g.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span style={{ color: "#1C3A2F" }}>{g.icon}</span>
                          <span className="text-[12px]" style={{ color: "#777" }}>{g.label}</span>
                        </div>
                        <span className="text-[12px] font-semibold text-right" style={{ color: "#1A1A1A" }}>{g.value}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ─────────── MOBILE STICKY CTA BAR ─────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-2 px-4 py-3"
        style={{ background: "#FFFFFF", borderTop: "1px solid #E5E0D8", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}
      >
        <a href={`tel:${contacts.adminPhone}`} className="flex items-center justify-center w-12 h-12 rounded-xl no-underline flex-shrink-0" style={{ background: "transparent", border: "1.5px solid #1C3A2F", color: "#1C3A2F" }}>
          <Icon.phone />
        </a>
        <button
          onClick={() => setEnquiryOpen(true)}
          className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer border-none"
          style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
        >
          Send Enquiry
        </button>
      </div>

      {/* Padding for mobile sticky CTA */}
      <div className="md:hidden" style={{ height: 80 }} />

      {/* Recently viewed strip */}
      <RecentlyViewedStrip currentId={property.id} />

      {/* Enquiry modal */}
      {enquiryOpen && <EnquiryModal property={property} onClose={() => setEnquiryOpen(false)} />}

      {/* Tour calendar modal */}
      {tourOpen && <TourCalendar property={property} onClose={() => setTourOpen(false)} />}
    </div>
  );
}
