"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PropertyCard, ExploreFilters, ListingType, PropertyType } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home } from "lucide-react";
import ExploreFiltersBar from "./ExploreFilters";
import ExplorePropertyCard from "./ExplorePropertyCard";
import { getCanonicalArea } from "@/lib/area";

const DEFAULT_FILTERS: ExploreFilters = {
  listingType: "all",
  propertyType: "all",
  area: "",
  minPrice: 0,
  maxPrice: Infinity,
  bedrooms: "any",
  sort: "newest",
  search: "",
  petFriendly: false,
  nearBts: false,
  newHubs: false,
};

function filtersFromParams(params: URLSearchParams): ExploreFilters {
  const f = { ...DEFAULT_FILTERS };
  const type = params.get("type");
  if (type === "sale" || type === "rent" || type === "short_stay") {
    f.listingType = type as ListingType;
  }
  const area = params.get("area");
  if (area) f.area = area;
  const search = params.get("search");
  if (search) f.search = search;
  
  const petFriendly = params.get("pets") || params.get("petFriendly");
  if (petFriendly === "true") f.petFriendly = true;
  
  const nearBts = params.get("bts") || params.get("nearBts");
  if (nearBts === "true") f.nearBts = true;

  const newHubs = params.get("newHubs");
  if (newHubs === "true") f.newHubs = true;

  return f;
}

/**
 * Serialise the active filters back into URL search params, emitting only the
 * values that differ from the defaults. This makes filtered views shareable
 * (copy-paste URL), restores correctly on back/forward, and keeps the address
 * bar short. Mirrors the keys read by `filtersFromParams`.
 */
function filtersToParams(f: ExploreFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.listingType !== "all") params.set("type", f.listingType);
  if (f.propertyType !== "all") params.set("propertyType", f.propertyType);
  if (f.area) params.set("area", f.area);
  if (f.search) params.set("search", f.search);
  if (f.petFriendly) params.set("pets", "true");
  if (f.nearBts) params.set("bts", "true");
  if (f.newHubs) params.set("newHubs", "true");
  if (f.bedrooms !== "any") params.set("beds", String(f.bedrooms));
  if (f.minPrice > 0) params.set("minPrice", String(f.minPrice));
  if (f.maxPrice < Infinity) params.set("maxPrice", String(f.maxPrice));
  return params;
}

function detectAreaInSearch(query: string): string | null {
  const cleanQuery = query.toLowerCase().trim();
  const keys = [
    "sukhumvit", "phrom phong", "phromphong", "thong lo", "thonglo", "thonglor", "asok", "asoke", 
    "ekkamai", "ekamai", "on nut", "onnut", "ari", "sathorn", "sathon", "silom", 
    "rama 9", "rama9", "ratchada", "huai khwang", "huaikhwang", "phaya thai", "phayathai",
    "chatuchak", "jatujak", "rama 4", "rama4", "bangna", "bang na", "udom suk", "udomsuk", "samyan", "sam yan"
  ];
  
  for (const key of keys) {
    const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanQuery)) {
      return getCanonicalArea(key);
    }
  }
  return null;
}

function applyFilters(props: PropertyCard[], f: ExploreFilters): PropertyCard[] {
  let result = [...props];
  if (f.search) {
    const queryClean = f.search.toLowerCase().trim();
    const searchTerms = queryClean.split(/\s+/).filter(Boolean);
    const detectedArea = detectAreaInSearch(queryClean);
    
    result = result.filter((p) => {
      // If a specific area was detected in the search query, strictly require the property's area to match it
      if (detectedArea) {
        const pAreaCanonical = getCanonicalArea(p.area).toLowerCase();
        const targetAreaCanonical = detectedArea.toLowerCase();
        if (pAreaCanonical !== targetAreaCanonical) {
          return false;
        }
      }

      const nameLower = p.name.toLowerCase();
      
      // Normalize both query and area using getCanonicalArea to handle space/spelling variations
      const queryCanonical = getCanonicalArea(queryClean).toLowerCase();
      const areaCanonical = getCanonicalArea(p.area).toLowerCase();
      const districtCanonical = p.district ? getCanonicalArea(p.district).toLowerCase() : "";

      // 1. Direct name, area or district match
      if (queryClean.length >= 3 && (nameLower.includes(queryClean) || queryClean.includes(nameLower))) {
        return true;
      }
      if (queryClean.length >= 3 && (areaCanonical.includes(queryCanonical) || queryCanonical.includes(areaCanonical))) {
        return true;
      }
      if (queryClean.length >= 3 && districtCanonical && (districtCanonical.includes(queryCanonical) || queryCanonical.includes(districtCanonical))) {
        return true;
      }
      
      // 2. Word-by-word matching
      const searchableText = `${p.name} ${p.area} ${p.district || ""} ${p.description} ${p.btsStation || ""} ${p.mrtStation || ""}`.toLowerCase();
      const stopWords = ["in", "at", "on", "near", "under", "for", "with", "a", "an", "the", "และ", "ใน", "ที่", "ใกล้", "คอนโด", "condo", "apartment"];
      const keyTerms = searchTerms.filter((t) => !stopWords.includes(t));
      
      if (keyTerms.length === 0) {
        return searchTerms.every((term) => {
          const termCanonical = getCanonicalArea(term).toLowerCase();
          return searchableText.includes(term) || searchableText.includes(termCanonical);
        });
      }
      
      return keyTerms.every((term) => {
        const termCanonical = getCanonicalArea(term).toLowerCase();
        return searchableText.includes(term) || searchableText.includes(termCanonical);
      });
    });
  }
  if (f.listingType !== "all") result = result.filter((p) => p.listingType === f.listingType);
  if (f.propertyType !== "all") result = result.filter((p) => p.propertyType === f.propertyType);
  if (f.area) {
    if (f.area === "Other") {
      const standardAreas = ["Sukhumvit", "Sathorn", "Thong Lo", "Asok", "Silom", "On Nut", "Ekkamai", "Ari", "Rama 9", "Bang Na", "Chatuchak", "Rama 4"];
      result = result.filter((p) => !standardAreas.includes(p.area));
    } else {
      result = result.filter((p) => p.area === f.area);
    }
  }
  if (f.bedrooms !== "any") {
    result = result.filter((p) =>
      f.bedrooms === 4 ? p.bedrooms >= 4 : p.bedrooms === f.bedrooms
    );
  }
  // Budget
  if (f.minPrice > 0)        result = result.filter((p) => Number(p.priceTHB) >= f.minPrice);
  if (f.maxPrice < Infinity) result = result.filter((p) => Number(p.priceTHB) <= f.maxPrice);

  // Amenity toggles
  if (f.petFriendly) result = result.filter((p) => p.petFriendly);
  if (f.nearBts)     result = result.filter((p) => p.nearBts);

  if (f.newHubs) {
    const hubs = ["Rama 9", "Bang Na", "Huai Khwang", "Phaya Thai"];
    result = result.filter((p) => hubs.includes(p.area));
  }

  switch (f.sort) {
    case "price_asc":  result.sort((a, b) => Number(a.priceTHB) - Number(b.priceTHB)); break;
    case "price_desc": result.sort((a, b) => Number(b.priceTHB) - Number(a.priceTHB)); break;
    case "popular":    result.sort((a, b) => b.likes - a.likes); break;
    default:           result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return result;
}

export default function ExploreClient({
  properties,
  listingType: initialListingType,
  propertyType: initialPropertyType,
  heading,
}: {
  properties: PropertyCard[];
  /** Hub pages (e.g. /for-sale) seed the initial filter. URL `?type=` wins if present. */
  listingType?: ListingType;
  /** Hub pages (e.g. /condos) seed the initial property type. URL `?propertyType=` wins if present. */
  propertyType?: PropertyType;
  /** Hub pages pass a custom H1 / eyebrow for SEO. Falls back to dynamic title. */
  heading?: { eyebrow?: string; title?: string };
}) {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<ExploreFilters>(() => {
    const fromParams = filtersFromParams(searchParams);
    const updated = { ...fromParams };
    // Seed from the hub's listing type only if no type was provided in the URL.
    if (initialListingType && fromParams.listingType === "all") {
      updated.listingType = initialListingType;
    }
    if (initialPropertyType && fromParams.propertyType === "all") {
      updated.propertyType = initialPropertyType;
    }
    return updated;
  });

  // Re-sync if URL params change (clicking Buy → Rent in nav)
  useEffect(() => {
    Promise.resolve().then(() => {
      setFilters((prev) => {
        const next = filtersFromParams(searchParams);
        // Hub's listing type acts as the default when the URL has no type param.
        if (initialListingType && next.listingType === "all") {
          next.listingType = initialListingType;
        }
        return { ...prev, ...next };
      });
    });
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Write filters back to the URL (two-way sync) ──
  // Whenever the user changes a filter, reflect it in the address bar via
  // router.replace (no extra history entries). We skip the very first run so
  // we don't push a redundant entry matching the entry URL.
  const didMountSync = useRef(false);
  useEffect(() => {
    if (!didMountSync.current) {
      didMountSync.current = true;
      return;
    }
    const nextParams = filtersToParams(filters);
    const current = searchParams.toString();
    // Avoid a no-op replace when the URL already matches (prevents loops with the read effect).
    if (nextParams.toString() === current) return;
    router.replace(`${pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`, {
      scroll: false,
    });
  }, [filters, router, pathname, searchParams]);

  const filtered = useMemo(() => applyFilters(properties, filters), [properties, filters]);
  const update = (patch: Partial<ExploreFilters>) => setFilters((p) => ({ ...p, ...patch }));

  const [visibleCount, setVisibleCount] = useState(12);

  // Reset visible count when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(12);
  }, [filters]);

  const dynamicTitle = useMemo(() => {
    if (filters.area) {
      if (lang === "th") {
        if (filters.area === "Other") {
          return "ค้นหาอสังหาริมทรัพย์ในพื้นที่อื่นในกรุงเทพฯ";
        }
        return `ค้นหาอสังหาริมทรัพย์ในกรุงเทพฯ ย่าน ${filters.area}`;
      }
      if (lang === "zh") {
        const areaMap: Record<string, string> = {
          "Sukhumvit": "素坤逸",
          "Sathorn": "沙吞",
          "Thong Lo": "通罗",
          "Asok": "阿索克",
          "Ekkamai": "伊卡迈",
          "Silom": "是隆",
          "On Nut": "安努",
          "Ari": "阿里",
          "Rama 9": "拉玛九世",
          "Bang Na": "邦纳",
          "Huai Khwang": "怀匡",
          "Phaya Thai": "帕亚泰",
          "Other": "其他地区",
        };
        const localized = areaMap[filters.area] || filters.area;
        return `探索曼谷${localized}的房产`;
      }
      if (filters.area === "Other") {
        return "Explore properties in Other Bangkok Areas";
      }
      return `Explore properties in Bangkok ${filters.area}`;
    }
    if (filters.nearBts) {
      if (lang === "th") return "ค้นหาอสังหาริมทรัพย์ใกล้รถไฟฟ้าในกรุงเทพฯ";
      if (lang === "zh") return "探索曼谷近轻轨与地铁的房产";
      return "Explore properties near BTS in Bangkok";
    }
    if (filters.petFriendly) {
      if (lang === "th") return "ค้นหาอสังหาริมทรัพย์ที่เลี้ยงสัตว์ได้ในกรุงเทพฯ";
      if (lang === "zh") return "探索曼谷允许宠物的房产";
      return "Explore pet friendly properties in Bangkok";
    }
    return t.explore.title;
  }, [filters, lang, t]);

  const localizedHeading = useMemo(() => {
    if (filters.listingType === "sale") {
      return {
        eyebrow: lang === "th" ? "ซื้ออสังหาฯ ในกรุงเทพฯ" : lang === "zh" ? "曼谷买房" : "Buy in Bangkok",
        title: lang === "th" ? "อสังหาริมทรัพย์สำหรับขายในกรุงเทพฯ" : lang === "zh" ? "曼谷出售房产" : "Property For Sale in Bangkok"
      };
    }
    if (filters.listingType === "rent") {
      return {
        eyebrow: lang === "th" ? "เช่าอสังหาฯ ในกรุงเทพฯ" : lang === "zh" ? "曼谷长租" : "Rent in Bangkok",
        title: lang === "th" ? "อสังหาริมทรัพย์สำหรับเช่าในกรุงเทพฯ" : lang === "zh" ? "曼谷出租房产" : "Property For Rent in Bangkok"
      };
    }
    if (filters.listingType === "short_stay") {
      return {
        eyebrow: lang === "th" ? "เช่าระยะสั้นในกรุงเทพฯ" : lang === "zh" ? "曼谷短租" : "Short Stay in Bangkok",
        title: lang === "th" ? "อสังหาริมทรัพย์สำหรับเช่าระยะสั้นในกรุงเทพฯ" : lang === "zh" ? "曼谷短租房产" : "Short-Stay Property in Bangkok"
      };
    }
    if (filters.propertyType === "condo") {
      return {
        eyebrow: lang === "th" ? "คอนโดในกรุงเทพฯ" : lang === "zh" ? "曼谷公寓" : "Condos in Bangkok",
        title: lang === "th" ? "คอนโดสำหรับขายและเช่าในกรุงเทพฯ" : lang === "zh" ? "曼谷精选公寓" : "Condos For Sale & Rent in Bangkok"
      };
    }
    if (filters.propertyType === "apartment") {
      return {
        eyebrow: lang === "th" ? "อพาร์ทเม้นท์ในกรุงเทพฯ" : lang === "zh" ? "曼谷出租公寓" : "Apartments in Bangkok",
        title: lang === "th" ? "อพาร์ทเม้นท์สำหรับขายและเช่าในกรุงเทพฯ" : lang === "zh" ? "曼谷精选公寓/套房" : "Apartments For Sale & Rent in Bangkok"
      };
    }
    if (filters.propertyType === "villa" || filters.propertyType === "house") {
      return {
        eyebrow: lang === "th" ? "วิลล่าและบ้านในกรุงเทพฯ" : lang === "zh" ? "曼谷别墅与独栋" : "Villas in Bangkok",
        title: lang === "th" ? "วิลล่าและบ้านสำหรับขายและเช่าในกรุงเทพฯ" : lang === "zh" ? "曼谷精选别墅与豪宅" : "Villas & Houses For Sale & Rent in Bangkok"
      };
    }
    return null;
  }, [filters.listingType, filters.propertyType, lang]);

  return (
    <>
      {/* Forest header — moved from server layout to client component for instant translation */}
      <div className="px-6 py-8" style={{ background: "#1C3A2F" }}>
        <div
          className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-2"
          style={{ color: "#C9A84C" }}
        >
          {localizedHeading?.eyebrow ?? (lang === "en" ? heading?.eyebrow : undefined) ?? t.explore.allProperties}
        </div>
        <h1
          className="text-[26px] font-bold leading-[1.25] mb-2"
          style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}
        >
          {localizedHeading?.title ?? (lang === "en" ? heading?.title : undefined) ?? dynamicTitle}
        </h1>
        <p className="text-[13px] font-light" style={{ color: "rgba(255,255,255,0.6)" }}>
          {filtered.length} {t.explore.subtitle}
        </p>
      </div>

      <ExploreFiltersBar filters={filters} total={filtered.length} onChange={update} onReset={() => setFilters(DEFAULT_FILTERS)} />

      <div className="px-4 md:px-6 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[16px] font-semibold mb-2" style={{ color: "#1C3A2F" }}>{t.explore.noResult}</p>
            <p className="text-[13px] font-light mb-5" style={{ color: "#999" }}>{t.explore.noSub}</p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="px-5 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none"
              style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
            >
              {t.explore.clearAll}
            </button>
          </div>
        ) : (
          <>
            {/* 1 col → 2 col → 3 col → 4 col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.slice(0, visibleCount).map((p, i) => (
                <ExplorePropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="flex justify-center mt-10 mb-6">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-6 py-3 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 cursor-pointer shadow-sm hover:shadow"
                  style={{
                    background: "#1C3A2F",
                    color: "#FFFFFF",
                    border: "1px solid #1C3A2F",
                    fontFamily: "inherit",
                  }}
                >
                  {lang === "th" ? "โหลดเพิ่มเติม" : lang === "zh" ? "加载更多" : "Load More Properties"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
