"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useMemo } from "react";
import { PropertyCard } from "@/types/property";
import { useEnquiry } from "@/hooks/useEnquiry";
import { useRecentlyViewed } from "@/contexts/RecentlyViewedContext";
import { useSaved } from "@/contexts/SavedContext";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import Link from "next/link";
import { useCurrency } from "@/contexts/CurrencyContext";
import dynamic from "next/dynamic";
import { StoredCommuteHub } from "@/lib/store/commuteHubs";
import { useSession } from "next-auth/react";

const CommuteMap = dynamic(() => import("./CommuteMap"), { ssr: false });

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function listingBadge(t: string) {
  if (t === "sale") return "For Sale";
  if (t === "rent") return "Long Rent";
  return "Short Stay";
}
function formatPrice(p: PropertyCard, formatPriceFn: (n: number) => string) {
  if (p.listingType === "short_stay" && (p.priceLabel ?? "").includes("night")) {
    const monthly = Number(p.priceTHB) * 30;
    return `${formatPriceFn(monthly)}/month`;
  }
  if (p.listingType === "sale") return formatPriceFn(Number(p.priceTHB));
  return `${formatPriceFn(Number(p.priceTHB))}${p.priceLabel ?? ""}`;
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


// Cleans the map pin label to show only the core building name
function cleanMapLabel(name: string): string {
  let clean = name;
  // Strip "For Rent – ", "For Sale -", etc.
  clean = clean.replace(/^(?:for\s+(?:rent|sale)\s*[-–—]\s*)/i, "");
  // Strip pricing info like "💰 Rental Price..." or "Rental Price..."
  clean = clean.replace(/(?:💰?\s*Rental\s+Price.*)$/i, "");
  clean = clean.replace(/(?:💰?\s*Price.*)$/i, "");
  
  const parts = clean.split(/\s*[-–—]\s*/);
  if (parts.length > 1) {
    clean = parts[0];
  }
  
  if (clean.length > 25) {
    clean = clean.slice(0, 25) + "...";
  }
  return clean.trim();
}

// Extracts BTS, MRT, and Malls dynamically from property descriptions for non-standard neighborhoods
function getDynamicFacilities(p: PropertyCard): Facility[] {
  if (NEIGHBORHOOD_DATA[p.area]) {
    return NEIGHBORHOOD_DATA[p.area];
  }

  const desc = p.description || "";
  const facilities: Facility[] = [];

  // Parse BTS (e.g., "Only 300 m. to BTS Ha Yaek Lat Phrao")
  const btsRegex = /(?:(\d+)\s*(?:m|meter|min|minute)s?\.?\s*(?:to|from)?\s*)?BTS\s+([A-Za-z0-9\s\-]+?)(?=\.|\,|and|near|only|with|features|is|in|$)/gi;
  let btsMatch;
  while ((btsMatch = btsRegex.exec(desc)) !== null) {
    const meters = btsMatch[1] ? parseInt(btsMatch[1], 10) : null;
    const station = btsMatch[2].trim();
    if (station) {
      const distance = meters
        ? meters < 100 ? `${meters} min walk` : `${Math.round(meters / 80)} min walk`
        : "5 min walk";
      facilities.push({
        name: `BTS ${station}`,
        distance,
        type: "transit",
        icon: "🚇",
        latOffset: -0.005,
        lngOffset: -0.006
      });
    }
  }

  // Parse MRT (e.g., "700 m. to MRT Phahon Yothin")
  const mrtRegex = /(?:(\d+)\s*(?:m|meter|min|minute)s?\.?\s*(?:to|from)?\s*)?MRT\s+([A-Za-z0-9\s\-]+?)(?=\.|\,|and|near|only|with|features|is|in|$)/gi;
  let mrtMatch;
  while ((mrtMatch = mrtRegex.exec(desc)) !== null) {
    const meters = mrtMatch[1] ? parseInt(mrtMatch[1], 10) : null;
    const station = mrtMatch[2].trim();
    if (station) {
      const distance = meters
        ? meters < 100 ? `${meters} min walk` : `${Math.round(meters / 80)} min walk`
        : "5 min walk";
      facilities.push({
        name: `MRT ${station}`,
        distance,
        type: "transit",
        icon: "🚇",
        latOffset: 0.004,
        lngOffset: 0.005
      });
    }
  }

  // Parse Landmarks (e.g., "Near Central Ladprao, Lotus, and Union Mall")
  const nearRegex = /(?:near|close to)\s+([A-Za-z0-9\s,]+?)(?=\.|\n|$)/gi;
  const nearMatch = nearRegex.exec(desc);
  if (nearMatch && nearMatch[1]) {
    const places = nearMatch[1].split(/,|\band\b/i).map(x => x.trim()).filter(Boolean);
    places.forEach((place, idx) => {
      if (place.toUpperCase().includes("BTS") || place.toUpperCase().includes("MRT")) return;
      
      let type: "mall" | "cafe" | "hospital" | "school" = "mall";
      let icon = "🛍";
      const lowerPlace = place.toLowerCase();
      if (lowerPlace.includes("hospital")) {
        type = "hospital";
        icon = "🏥";
      } else if (lowerPlace.includes("school") || lowerPlace.includes("university")) {
        type = "school";
        icon = "🏫";
      } else if (lowerPlace.includes("cafe") || lowerPlace.includes("coffee")) {
        type = "cafe";
        icon = "☕";
      }

      facilities.push({
        name: place,
        distance: `${3 + idx * 2} min walk`,
        type,
        icon,
        latOffset: 0.003 + (idx * 0.002),
        lngOffset: -0.004 - (idx * 0.002)
      });
    });
  }

  return facilities.length > 0 ? facilities : NEIGHBORHOOD_DATA["Sukhumvit"];
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


function houseRulesDefaults(p: PropertyCard): Required<NonNullable<PropertyCard["houseRules"]>> {
  const r = p.houseRules ?? {};
  return {
    pets:     r.pets     ?? p.petFriendly,
    smoking:  r.smoking  ?? false,
    parties:  r.parties  ?? false,
    children: r.children ?? true,
  };
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
  heart:      ({ filled = false }: { filled?: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#10B981" : "none"} stroke={filled ? "#10B981" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
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

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }
  };

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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-200 ${
              saved ? "animate-pop-bounce scale-110" : "hover:scale-110 active:scale-90"
            }`}
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
   Enquiry form (used by Send Enquiry button)
───────────────────────────────────────────── */
function EnquiryModal({ property, onClose }: { property: PropertyCard; onClose: () => void }) {
  const { data: session }     = useSession();
  const [name, setName]       = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod]   = useState("WhatsApp");
  const [msg, setMsg]         = useState("");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();

  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      if (session.user.email && !contact) {
        setContact(session.user.email);
      }
    }
  }, [session, name, contact]);

  const { formatPrice: formatPriceFn } = useCurrency();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    await sendEnquiry({
      propertySlug: property.slug,
      propertyName: property.name,
      listingType:  property.listingType,
      price:        formatPrice(property, formatPriceFn),
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
  const { formatPrice: formatPriceFn } = useCurrency();
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
          {formatPriceFn(Number(property.priceTHB))}
          {property.listingType === "sale" ? "" : (property.priceLabel ?? "")}
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
  const { data: session }   = useSession();
  const [selDate, setDate]  = useState<string | null>(null);
  const [selTime, setTime]  = useState<string | null>(null);
  const [name, setName]     = useState("");
  const [method, setMethod] = useState<"WhatsApp" | "Line">("WhatsApp");
  const [contact, setContact] = useState("");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();

  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      if (session.user.email && !contact) {
        setContact(session.user.email);
      }
    }
  }, [session, name, contact]);

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

  const { formatPrice: formatPriceFn } = useCurrency();

  const submit = async () => {
    if (!selDate || !selTime || !name || !contact) return;
    await sendEnquiry({
      propertySlug: property.slug,
      propertyName: property.name,
      listingType:  property.listingType,
      price:        formatPrice(property, formatPriceFn),
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
    <div className="px-5 md:px-10 py-4 md:py-5" style={{ background: "#FFFFFF", borderTop: "1px solid #EDE8DF" }}>
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
/* ─────────────────────────────────────────────
   NEARBY PLACES DATA & HELPERS
   ───────────────────────────────────────────── */
interface NearbyPlace {
  name: string;
  category: "BTS/MRT" | "Cafes" | "Restaurants" | "Shopping" | "Fitness" | "Parks" | "Co-working" | "Markets";
  distance: string;
  rating: number;
  image: string;
}

const NEARBY_PLACES_DATA: Record<string, NearbyPlace[]> = {
  "Sukhumvit": [
    { name: "EmQuartier Shopping Mall", category: "Shopping", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Benjasiri Park", category: "Parks", distance: "4 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: "Phrom Phong BTS Station", category: "BTS/MRT", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&auto=format&q=80" },
    { name: "Holey Artisan Bakery", category: "Cafes", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&auto=format&q=80" },
    { name: "The Hive Phrom Phong", category: "Co-working", distance: "6 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&q=80" },
    { name: "Roast EmQuartier", category: "Restaurants", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&q=80" }
  ],
  "Sathorn": [
    { name: "Chong Nonsi BTS Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1580237072617-771c4e21b910?w=400&auto=format&q=80" },
    { name: "Lumphini Park", category: "Parks", distance: "15 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1588771746270-f47225102510?w=400&auto=format&q=80" },
    { name: "Sarnies Suki", category: "Restaurants", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80" },
    { name: "Rocket Coffeebar S.12", category: "Cafes", distance: "6 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: "The Hive Sathorn", category: "Co-working", distance: "4 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: "Fitness First Sathorn Square", category: "Fitness", distance: "8 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&q=80" }
  ],
  "Thong Lo": [
    { name: "Thong Lo BTS Station", category: "BTS/MRT", distance: "4 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?w=400&auto=format&q=80" },
    { name: "The Commons Thonglor", category: "Shopping", distance: "5 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1582298538104-ed2d6bb5ab82?w=400&auto=format&q=80" },
    { name: "Patom Organic Living", category: "Cafes", distance: "8 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80" },
    { name: "Octave Rooftop Lounge", category: "Restaurants", distance: "6 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&q=80" },
    { name: "Absolute You Gym", category: "Fitness", distance: "7 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&q=80" },
    { name: "theCOMMONS Lawn", category: "Parks", distance: "5 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" }
  ],
  "Asok": [
    { name: "Asok BTS / Sukhumvit MRT Station", category: "BTS/MRT", distance: "1 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&auto=format&q=80" },
    { name: "Terminal 21 Asok", category: "Shopping", distance: "2 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: "Benjakitti Park", category: "Parks", distance: "10 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: "Artis Coffee", category: "Cafes", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: "The Work Loft Asok", category: "Co-working", distance: "4 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&q=80" },
    { name: "El Gaucho Steakhouse", category: "Restaurants", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80" }
  ],
  "Silom": [
    { name: "Sala Daeng BTS / Si Lom MRT Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&auto=format&q=80" },
    { name: "Silom Complex", category: "Shopping", distance: "3 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Lumphini Park", category: "Parks", distance: "8 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1588771746270-f47225102510?w=400&auto=format&q=80" },
    { name: "Everyday Karmakamet", category: "Cafes", distance: "4 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80" },
    { name: "Sarnies Roastery", category: "Restaurants", distance: "6 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&q=80" },
    { name: "Patpong Night Market", category: "Markets", distance: "5 min walk", rating: 4.1, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&q=80" }
  ],
  "On Nut": [
    { name: "On Nut BTS Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1580237072617-771c4e21b910?w=400&auto=format&q=80" },
    { name: "Lotus's On Nut", category: "Shopping", distance: "3 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&q=80" },
    { name: "Century Movie Plaza On Nut", category: "Shopping", distance: "2 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: "The Wood Land Cafe", category: "Cafes", distance: "6 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&q=80" },
    { name: "Habito Hub", category: "Co-working", distance: "10 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: "On Nut Food Court", category: "Markets", distance: "4 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&q=80" }
  ],
  "Ekkamai": [
    { name: "Ekkamai BTS Station", category: "BTS/MRT", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?w=400&auto=format&q=80" },
    { name: "Gateway Ekkamai", category: "Shopping", distance: "3 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Featherstone Cafe", category: "Cafes", distance: "12 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80" },
    { name: "Ekkamai Beer House", category: "Restaurants", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80" },
    { name: "The Hive Ekkamai", category: "Co-working", distance: "6 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: "Ekkamai Pocket Garden", category: "Parks", distance: "8 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1588771746270-f47225102510?w=400&auto=format&q=80" }
  ],
  "Ari": [
    { name: "Ari BTS Station", category: "BTS/MRT", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&auto=format&q=80" },
    { name: "La Villa Ari", category: "Shopping", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1582298538104-ed2d6bb5ab82?w=400&auto=format&q=80" },
    { name: "Villa Market Ari", category: "Shopping", distance: "6 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&q=80" },
    { name: "Common Room x Babe", category: "Cafes", distance: "5 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: "The Hive Ari", category: "Co-working", distance: "7 min walk", rating: 4.8, image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&q=80" },
    { name: "Landhaus Bakery", category: "Cafes", distance: "8 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&auto=format&q=80" },
    { name: "Gump's Ari", category: "Markets", distance: "4 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&q=80" }
  ],
  "Rama 9": [
    { name: "Phra Ram 9 MRT Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?w=400&auto=format&q=80" },
    { name: "Central Plaza Grand Rama 9", category: "Shopping", distance: "3 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Fortune Town IT Mall", category: "Shopping", distance: "4 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: "Bellinee's G Tower", category: "Cafes", distance: "2 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&q=80" },
    { name: "Regus G Tower", category: "Co-working", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" },
    { name: "Jodd Fairs Rama 9", category: "Markets", distance: "6 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&q=80" }
  ],
  "Bang Na": [
    { name: "Bang Na BTS Station", category: "BTS/MRT", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1580237072617-771c4e21b910?w=400&auto=format&q=80" },
    { name: "Mega Bangna & IKEA", category: "Shopping", distance: "15 min drive", rating: 4.7, image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&auto=format&q=80" },
    { name: "Central Plaza Bangna", category: "Shopping", distance: "8 min drive", rating: 4.4, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "La Mesa Coffee Co.", category: "Cafes", distance: "6 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&q=80" },
    { name: "Rama IX Park", category: "Parks", distance: "12 min drive", rating: 4.6, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: "Bang Na Market", category: "Markets", distance: "8 min walk", rating: 4.1, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&q=80" }
  ],
  "Huai Khwang": [
    { name: "Huai Khwang MRT Station", category: "BTS/MRT", distance: "2 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&auto=format&q=80" },
    { name: "The Street Ratchada", category: "Shopping", distance: "10 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: "Esplanade Ratchada", category: "Shopping", distance: "12 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" },
    { name: "Huai Khwang Night Market", category: "Markets", distance: "5 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&q=80" },
    { name: "Chuan Chuan Cafe", category: "Cafes", distance: "6 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: "The Street Cyberport", category: "Co-working", distance: "10 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400&auto=format&q=80" }
  ],
  "Phaya Thai": [
    { name: "Phaya Thai BTS & ARL Station", category: "BTS/MRT", distance: "1 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&auto=format&q=80" },
    { name: "Century Movie Plaza", category: "Shopping", distance: "6 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&auto=format&q=80" },
    { name: "Factory Coffee", category: "Cafes", distance: "2 min walk", rating: 4.8, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&q=80" },
    { name: "Santiphap Park", category: "Parks", distance: "8 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1588771746270-f47225102510?w=400&auto=format&q=80" },
    { name: "Spaces Phayathai", category: "Co-working", distance: "2 min walk", rating: 4.7, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&auto=format&q=80" },
    { name: "King Power Rangnam", category: "Shopping", distance: "7 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&q=80" }
  ]
};

function getDirectionsUrl(property: PropertyCard, placeName: string) {
  const origin = property.latitude && property.longitude
    ? `${property.latitude},${property.longitude}`
    : `${property.name}, Bangkok`;
  const destination = `${placeName}, ${property.area}, Bangkok`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
}

function getNearbyPlaces(area: string): NearbyPlace[] {
  if (NEARBY_PLACES_DATA[area]) {
    return NEARBY_PLACES_DATA[area];
  }
  return [
    { name: `${area} Transit Station`, category: "BTS/MRT", distance: "5 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&auto=format&q=80" },
    { name: `${area} Landmark Mall`, category: "Shopping", distance: "5 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1569937728357-4971c45f974c?w=400&auto=format&q=80" },
    { name: `${area} Local Diner`, category: "Restaurants", distance: "4 min walk", rating: 4.3, image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&q=80" },
    { name: `${area} Market`, category: "Markets", distance: "7 min walk", rating: 4.2, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&q=80" },
    { name: `${area} Specialty Coffee`, category: "Cafes", distance: "3 min walk", rating: 4.6, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&q=80" },
    { name: `${area} Fitness Club`, category: "Fitness", distance: "10 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&q=80" },
    { name: `${area} Community Park`, category: "Parks", distance: "12 min walk", rating: 4.4, image: "https://images.unsplash.com/photo-1596700447384-e40ab4a4a4a4?w=400&auto=format&q=80" },
    { name: `${area} Coworking Space`, category: "Co-working", distance: "8 min walk", rating: 4.5, image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&q=80" }
  ];
}

interface PropertyDetailProps {
  property: PropertyCard;
  sameBuilding: PropertyCard[];
  nearby: PropertyCard[];
  sameArea?: PropertyCard[];
}

interface CommuteItem {
  name: string;
  minutes: number;
  distance: number;
  transitMode: "transit" | "driving" | "walking";
}

export default function PropertyDetail({ property, sameBuilding, nearby }: Omit<PropertyDetailProps, "sameArea">) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [rawHubs, setRawHubs] = useState<StoredCommuteHub[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nhp_commute_hubs");
      if (stored) {
        setRawHubs(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const commutes = useMemo<CommuteItem[]>(() => {
    if (!property.latitude || !property.longitude) return [];
    const pLat = Number(property.latitude);
    const pLng = Number(property.longitude);
    if (isNaN(pLat) || isNaN(pLng)) return [];

    return rawHubs.map((h: StoredCommuteHub) => {
      const hLat = Number(h.latitude);
      const hLng = Number(h.longitude);
      const R = 6371;
      const dLat = ((hLat - pLat) * Math.PI) / 180;
      const dLon = ((hLng - pLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pLat * Math.PI) / 180) *
          Math.cos((hLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      let mins = 15;
      if (h.transitMode === "walking") {
        mins = Math.round(dist * 12);
      } else if (h.transitMode === "driving") {
        mins = Math.round(dist * 3 + 5);
      } else {
        mins = Math.round(dist * 2.5 + 8);
      }
      return {
        name: h.name,
        minutes: Math.max(1, mins),
        distance: dist,
        transitMode: h.transitMode,
      };
    });
  }, [rawHubs, property.latitude, property.longitude]);

  const nearbyPlaces = useMemo(() => getNearbyPlaces(property.area), [property.area]);
  const filteredPlaces = useMemo(() => {
    if (activeCategory === "All") return nearbyPlaces;
    return nearbyPlaces.filter((p) => p.category === activeCategory);
  }, [nearbyPlaces, activeCategory]);
  const [tourOpen, setTourOpen] = useState(false);
  const allImages = property.images?.length ? property.images : [property.coverImage ?? ""];
  const posted    = relativeDate(property.createdAt);
  const { track } = useRecentlyViewed();
  const { formatPrice: formatPriceFn } = useCurrency();

  // Real-time View Tracking State
  const [views, setViews] = useState<number>(property.viewCount ?? viewCount(property));

  // Selected Place State for Interactive Map


  const areaFacilities = getDynamicFacilities(property);

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
          setViews((v: number) => v + 1);
        }
      })
      .catch(() => {});
  }, [property.id, track]);

  /* ── Right-sidebar stats (Beds | Baths | Sq Ft | Garage) ── */
  const parkingValue = getDynamicParking(property.description, property.id, property.propertyType).split(" ")[0];

  return (
    <div>
      {property.status === "unlisted" && (
        <div className="px-5 md:px-10 py-3.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-[13px] font-medium flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span>This listing is currently unlisted. It is only accessible via direct link.</span>
        </div>
      )}

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
      <div className="px-5 md:px-10 pt-6 pb-2 md:pt-8 md:pb-4">
        <div className="md:grid md:grid-cols-[1fr_400px] md:gap-4 lg:gap-5">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div>

            {/* ── MOBILE PART A — chips + title + location BEFORE gallery ── */}
            <div className="md:hidden mb-4">
              {/* Trust chips row */}
              <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar flex-nowrap whitespace-nowrap pb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {views.toLocaleString()} views
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#2E7D4F", border: "1px solid rgba(74,222,128,0.3)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  {lastVerifiedLabel(property)}
                </span>
                {posted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FAF8F3", color: "#999", border: "1px solid #EDE8DF" }}>
                    <span className="text-[10px]"><Icon.calendar /></span>
                    {posted}
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

              {/* Commute Times */}
              {commutes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {commutes.map((c) => (
                    <span
                      key={c.name}
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                      style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}
                      title={`${c.distance.toFixed(1)} km away`}
                    >
                      {c.transitMode === "walking" ? "🚶" : c.transitMode === "driving" ? "🚗" : "🚆"}{" "}
                      {c.minutes}m to {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Gallery */}
            <Gallery images={allImages} name={property.name} isFeatured={property.featured} propertyId={property.id} />

            {/* ── 2-Column Content Block (About on left, Amenities & Location stacked on right) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mt-6">
              
              {/* Column 1: ABOUT THIS PROPERTY */}
              <div className="rounded-2xl p-6 transition-all duration-300" style={{ background: "#ffffff", border: "none", boxShadow: "none" }}>
                <h3 className="text-[12px] font-bold uppercase tracking-[1.5px] mb-5 font-outfit" style={{ color: "#C9A84C" }}>
                  About this property
                </h3>
                <p className="text-[13px] leading-[1.65] font-light text-gray-600 mb-6">
                  {property.description}
                </p>
                
                <h4 className="text-[13px] font-bold mb-3 font-outfit" style={{ color: "#1C3A2F" }}>
                  Highlights
                </h4>
                <ul className="list-none p-0 m-0 space-y-2.5">
                  {[
                    "Fully furnished",
                    "City view",
                    "Modern kitchen with microwave",
                    "Washing machine",
                    "High-speed internet ready"
                  ].map((hl, i) => (
                    <li key={i} className="flex items-start text-[13px] text-gray-500 font-light">
                      <span className="text-[#C9A84C] font-bold mr-2.5 flex-shrink-0 text-[13px]">✓</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: AMENITIES & LOCATION Stacked */}
              <div className="flex flex-col gap-4">
                
                {/* AMENITIES card */}
                <div className="rounded-2xl p-6 transition-all duration-300" style={{ background: "#ffffff", border: "none", boxShadow: "none" }}>
                  <h3 className="text-[12px] font-bold uppercase tracking-[1.5px] mb-5 font-outfit" style={{ color: "#C9A84C" }}>
                    Amenities
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-5 gap-x-3">
                    {[
                      { label: "Swimming Pool", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20s2-2 5-2 5 2 7 2 5-2 5-2 2 2 3 2"/><path d="M2 16s2-2 5-2 5 2 7 2 5-2 5-2 2 2 3 2"/><path d="M6 11V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"/><path d="M14 11V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v11"/></svg> },
                      { label: "Fitness Center", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5 17.5 17.5"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg> },
                      { label: "Garden", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a6 6 0 0 0-6-6H3v3a6 6 0 0 0 6 6h3z"/><path d="M12 22V12"/><path d="M12 12a6 6 0 0 1 6-6h3v3a6 6 0 0 1-6 6h-3z"/></svg> },
                      { label: "Co-working Space", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="3" rx="2"/><path d="M12 15v5M5 20h14"/></svg> },
                      { label: "Sauna", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M8 4v4M16 4v4M4 14h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2z"/></svg> },
                      { label: "24h Security", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
                      { label: "Parking", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg> },
                      { label: "Keycard Access", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> }
                    ].map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-[13px] text-gray-600 font-light">
                        <span className="text-[#1C3A2F] flex-shrink-0">{amenity.icon}</span>
                        <span className="truncate">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LOCATION card */}
                <div className="rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between" style={{ background: "#ffffff", border: "none", boxShadow: "none" }}>
                  <div>
                    <h3 className="text-[12px] font-bold uppercase tracking-[1.5px] mb-5 font-outfit" style={{ color: "#C9A84C" }}>
                      Location
                    </h3>
                    
                    {/* Light Cartographic Map Container */}
                    {property.latitude && property.longitude ? (
                      <div className="mb-4" style={{ height: 220 }}>
                        <CommuteMap
                          propertyLat={Number(property.latitude)}
                          propertyLng={Number(property.longitude)}
                          propertyName={cleanMapLabel(property.name)}
                          commuteHubs={rawHubs.map(h => ({
                            name: h.name,
                            latitude: h.latitude,
                            longitude: h.longitude,
                            transitMode: h.transitMode
                          }))}
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl overflow-hidden relative mb-4" style={{ height: 150, background: "#F0EBE1", border: "1px solid #E8E2D6" }}>
                        {/* Road grid lines */}
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 150">
                          {/* Horizontal roads */}
                          <line x1="0" y1="40" x2="300" y2="42" stroke="#DDD7CA" strokeWidth="3" />
                          <line x1="0" y1="75" x2="300" y2="73" stroke="#E3DDD0" strokeWidth="5" />
                          <line x1="0" y1="110" x2="300" y2="112" stroke="#DDD7CA" strokeWidth="2.5" />
                          {/* Vertical roads */}
                          <line x1="60" y1="0" x2="58" y2="150" stroke="#DDD7CA" strokeWidth="2.5" />
                          <line x1="150" y1="0" x2="152" y2="150" stroke="#E3DDD0" strokeWidth="4" />
                          <line x1="230" y1="0" x2="228" y2="150" stroke="#DDD7CA" strokeWidth="2" />
                          {/* Diagonal accent road */}
                          <line x1="20" y1="0" x2="280" y2="150" stroke="#E3DDD0" strokeWidth="2" opacity="0.5" />
                          {/* Small blocks / green areas */}
                          <rect x="70" y="48" width="30" height="20" rx="3" fill="#C8D4BC" opacity="0.5" />
                          <rect x="170" y="80" width="25" height="25" rx="3" fill="#C8D4BC" opacity="0.4" />
                          <rect x="100" y="15" width="35" height="18" rx="3" fill="#D6CFC2" opacity="0.5" />
                          <rect x="200" y="30" width="20" height="30" rx="3" fill="#D6CFC2" opacity="0.4" />
                          <rect x="35" y="90" width="18" height="15" rx="2" fill="#C8D4BC" opacity="0.35" />
                          <rect x="245" y="95" width="28" height="18" rx="3" fill="#D6CFC2" opacity="0.4" />
                        </svg>
                        {/* Pin + Label */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                          {/* Pin */}
                          <div className="flex flex-col items-center">
                            <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                              <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#1C3A2F"/>
                              <circle cx="14" cy="13" r="5.5" fill="#ffffff"/>
                            </svg>
                          </div>
                          {/* Property label */}
                          <span className="mt-1 text-[8px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.9)", color: "#1C3A2F", whiteSpace: "nowrap", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }} title={property.name}>
                            {cleanMapLabel(property.name)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Travel facilities list */}
                    <div className="space-y-2.5 mb-4">
                      {areaFacilities.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-[12px]">
                          <span className="flex-shrink-0" style={{ color: "#1C3A2F" }}>
                            {f.type === "transit" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 15h8M12 2v13"/></svg>}
                            {f.type === "hospital" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M12 8v8M8 12h8"/></svg>}
                            {f.type === "mall" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>}
                            {f.type === "cafe" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/></svg>}
                            {f.type === "school" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>}
                          </span>
                          <span className="font-medium truncate" style={{ color: "#1A1A1A" }}>{f.name}</span>
                          <span className="ml-auto text-[11px] flex-shrink-0" style={{ color: "#999" }}>{f.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Google Maps Link */}
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(property.name + " " + (property.district ?? property.area) + " Bangkok")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold no-underline transition-opacity hover:opacity-70 pt-2"
                    style={{ color: "#C9A84C" }}
                  >
                    View on Google Maps →
                  </a>
                </div>

              </div>

            </div>

            {/* ── NEARBY PLACES Section ── */}
            <div className="rounded-2xl p-6 mt-6 mb-8" style={{ background: "#ffffff", border: "none", boxShadow: "none" }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[12px] font-bold uppercase tracking-[1.5px] font-outfit" style={{ color: "#C9A84C" }}>
                  Nearby Places
                </h3>
                <a
                  href={`https://www.google.com/maps/search/places+near+${encodeURIComponent(property.area + " Bangkok")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-semibold no-underline transition-opacity hover:opacity-70"
                  style={{ color: "#C9A84C" }}
                >
                  View all places →
                </a>
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4">
                {["All", "BTS/MRT", "Cafes", "Restaurants", "Shopping", "Fitness", "Parks", "Co-working", "Markets"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-4 py-2 rounded-full text-[12px] font-semibold cursor-pointer border transition-all whitespace-nowrap flex-shrink-0"
                    style={{
                      background: activeCategory === cat ? "#1C3A2F" : "#FFFFFF",
                      color: activeCategory === cat ? "#FFFFFF" : "#555",
                      borderColor: activeCategory === cat ? "#1C3A2F" : "#E5E0D8",
                      fontFamily: "inherit",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Places grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {filteredPlaces.slice(0, 6).map((place, idx) => (
                  <a
                    key={idx}
                    href={getDirectionsUrl(property, place.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative rounded-xl overflow-hidden group cursor-pointer block no-underline"
                    style={{ aspectRatio: "3 / 4" }}
                  >
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }} />
                    {/* Rating badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.92)", color: "#1C3A2F" }}>
                      ★ {place.rating}
                    </div>
                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                      <div className="text-[12px] font-bold text-white leading-tight mb-0.5">{place.name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/80">{place.distance}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(201,168,76,0.85)", color: "#1C3A2F" }}>
                          {place.category}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Empty state */}
              {filteredPlaces.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[13px]" style={{ color: "#999" }}>No places found in this category.</p>
                </div>
              )}
            </div>


            {/* Similar properties — building → nearby */}
            {(sameBuilding.length + nearby.length) > 0 && (
              <div className="pb-0" style={{ borderTop: "1px solid #EDE8DF", paddingTop: 32 }}>

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
            <div className="sticky top-20 flex flex-col gap-5">

              {/* Sidebar Combined Container: Name, Price, Details, Tour and Enquiry */}
              <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                
                {/* Trust Badge Chips Row (views, verified, posted) at the top of the container */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {views.toLocaleString()} views
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.12)", color: "#2E7D4F", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {lastVerifiedLabel(property)}
                  </span>
                  {posted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FAF8F3", color: "#999", border: "1px solid #EDE8DF" }}>
                      <span className="text-[10px]"><Icon.calendar /></span>
                      {posted}
                    </span>
                  )}
                </div>

                {/* Property Name Title */}
                <h1 className="text-[22px] font-bold mb-1.5 leading-tight" style={{ color: "#1A1A1A", letterSpacing: "-0.4px" }}>
                  {property.name}
                </h1>

                {/* Location — clickable Google Maps link */}
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(property.name + " " + (property.district ?? "") + " " + property.area + " Bangkok")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] mb-2 no-underline transition-opacity hover:opacity-70"
                  style={{ color: "#999" }}
                >
                  <span style={{ color: "#1C3A2F" }}><Icon.pin /></span>
                  <span style={{ borderBottom: "1px solid #ccc" }}>
                    {property.district ? `${property.district}, ` : ""}{property.area}, Bangkok
                  </span>
                </a>

                {/* Commute Times */}
                {commutes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 mt-1">
                    {commutes.map((c) => (
                      <span
                        key={c.name}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: "#FAF8F3", color: "#1C3A2F", border: "1px solid #EDE8DF" }}
                        title={`${c.distance.toFixed(1)} km away`}
                      >
                        {c.transitMode === "walking" ? "🚶" : c.transitMode === "driving" ? "🚗" : "🚆"}{" "}
                        {c.minutes}m to {c.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Gold price (currency-aware) */}
                <div className="text-[26px] font-bold mb-4" style={{ color: "#C9A84C", letterSpacing: "-0.8px", lineHeight: 1 }}>
                  {formatPriceFn(Number(property.priceTHB))}
                  {property.listingType !== "sale" && (
                    <span className="text-[14px] font-normal ml-1" style={{ color: "#555" }}>
                      {property.priceLabel ?? " /month"}
                    </span>
                  )}
                </div>

                {/* Stats Horizontal Row */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-[12px] font-medium border-t pt-4 mt-2 mb-6" style={{ color: "#555", borderColor: "#E5E0D8" }}>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#1C3A2F" }}><Icon.bed /></span>
                    <span>{property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bed`}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#1C3A2F" }}><Icon.bath /></span>
                    <span>{property.bathrooms} Bath</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#1C3A2F" }}><Icon.garage /></span>
                    <span>{parkingValue} Parking</span>
                  </div>
                  {property.sqm && (
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: "#1C3A2F" }}><Icon.sqft /></span>
                      <span>{property.sqm} m²</span>
                    </div>
                  )}
                </div>

                {/* Tour booking & Enquiry Section */}
                <div className="border-t pt-5" style={{ borderColor: "#E5E0D8" }}>
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
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
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
                </div>

              </div>

              {/* WHY YOU'LL LOVE [AREA] Card */}
              {(() => {
                const loveAreaBulletPoints = (() => {
                  if (property.area === "Ari") {
                    return [
                      "Creative and indie vibe",
                      "Amazing cafes and brunch spots",
                      "Walkable and bike-friendly",
                      "Easy access to BTS Ari",
                      "Great for remote work lifestyle"
                    ];
                  }
                  if (property.area === "Thong Lo") {
                    return [
                      "Trendy and upscale nightlife",
                      "High-end dining and cafes",
                      "Expansive shopping malls",
                      "Easy access to BTS Thong Lo",
                      "Vibrant expat community"
                    ];
                  }
                  if (property.area === "Sathorn") {
                    return [
                      "Vibrant business district",
                      "Excellent dining and rooftop bars",
                      "Close to Lumphini Park",
                      "Easy access to BTS Chong Nonsi",
                      "Modern skyscrapers & urban vibe"
                    ];
                  }
                  return [
                    "Vibrant local neighborhood",
                    "Great food and local cafes",
                    "Convenient transportation options",
                    "Blend of traditional & modern lifestyle",
                    "Highly desirable residential area"
                  ];
                })();

                return (
                  <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3 font-outfit" style={{ color: "#1C3A2F" }}>
                        Why you&apos;ll love {property.area}
                      </h3>
                      <ul className="list-none p-0 m-0 space-y-2">
                        {loveAreaBulletPoints.map((bp, i) => (
                          <li key={i} className="flex items-start text-[12px] leading-tight" style={{ color: "#555" }}>
                            <span className="font-semibold mr-1.5 flex-shrink-0" style={{ color: "#C9A84C" }}>✓</span>
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        <Link
                          href={`/explore?area=${property.area}`}
                          className="text-[11px] font-semibold hover:underline no-underline inline-flex items-center gap-1"
                          style={{ color: "#C9A84C" }}
                        >
                          Learn more about {property.area} <span className="text-[9px]">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* At a Glance Box (No Title) */}
              <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                <div className="grid grid-cols-3 gap-2">
                  {/* Property Type */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}><Icon.home /></span>
                      <span>Type</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1 capitalize" style={{ color: "#1A1A1A" }}>
                      {property.propertyType}
                    </div>
                  </div>

                  {/* Floor */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m16 14-4-4-4 4"/></svg>
                      </span>
                      <span>Floor</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                      {property.floor ? String(property.floor) : getDynamicFloor(property.description, property.id, property.propertyType).split(" / ")[0]}
                    </div>
                  </div>

                  {/* Total Floors */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}><Icon.stories /></span>
                      <span>Total Floors</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                      {property.totalFloors ? String(property.totalFloors) : getDynamicFloor(property.description, property.id, property.propertyType).split(" / ")[1] || "—"}
                    </div>
                  </div>

                  {/* Pet Friendly */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S8.83 8 8 8zm8 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S16.83 8 16 8zm-4 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                      </span>
                      <span>Pets</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1" style={{ color: "#1A1A1A" }}>
                      {property.petFriendly || houseRulesDefaults(property).pets ? "Yes" : "No"}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}><Icon.calendar /></span>
                      <span>Available</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1 leading-tight truncate" style={{ color: "#1A1A1A" }}>
                      {availableFromLabel(property) === "Immediate" || availableFromLabel(property) === "Negotiable" ? "Available Now" : availableFromLabel(property)}
                    </div>
                  </div>

                  {/* Min Stay */}
                  <div className="border p-3.5 rounded-xl flex flex-col justify-between min-h-[76px]" style={{ background: "#FAF8F3", borderColor: "#EDE8DF" }}>
                    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold" style={{ color: "#999" }}>
                      <span style={{ color: "#1C3A2F" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </span>
                      <span>Min. Stay</span>
                    </div>
                    <div className="text-[12px] font-bold mt-1 truncate" style={{ color: "#1A1A1A" }}>
                      {property.listingType === "sale" ? "Freehold" : property.listingType === "short_stay" ? "1 Night" : "12 Months"}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ─────────── MOBILE STICKY CTA BAR ─────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: "#FFFFFF", borderTop: "1px solid #E5E0D8", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}
      >
        <button
          onClick={() => {
            setTourOpen(true);
            fetch(`/api/properties/${property.id}/track`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "click" }),
            }).catch(() => {});
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13px] font-bold bg-white border border-border text-charcoal cursor-pointer"
          style={{ fontFamily: "inherit" }}
        >
          <Icon.calendar /> Request Viewing
        </button>
        <button
          onClick={() => {
            setEnquiryOpen(true);
            fetch(`/api/properties/${property.id}/track`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "click" }),
            }).catch(() => {});
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13px] font-bold bg-forest text-white cursor-pointer border-none"
          style={{ fontFamily: "inherit" }}
        >
          Send Enquiry
        </button>
      </div>

      {/* Recently viewed strip */}
      <RecentlyViewedStrip currentId={property.id} />

      {/* Padding for mobile sticky CTA */}
      <div className="md:hidden" style={{ height: 80 }} />

      {/* Enquiry modal */}
      {enquiryOpen && <EnquiryModal property={property} onClose={() => setEnquiryOpen(false)} />}

      {/* Tour calendar modal */}
      {tourOpen && <TourCalendar property={property} onClose={() => setTourOpen(false)} />}
    </div>
  );
}
