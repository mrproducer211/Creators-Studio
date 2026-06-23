"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCard, ExploreFilters, ListingType } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home } from "lucide-react";
import ExploreFiltersBar from "./ExploreFilters";
import ExplorePropertyCard from "./ExplorePropertyCard";

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

function applyFilters(props: PropertyCard[], f: ExploreFilters): PropertyCard[] {
  let result = [...props];
  if (f.search) {
    const queryClean = f.search.toLowerCase().trim();
    const searchTerms = queryClean.split(/\s+/).filter(Boolean);
    
    result = result.filter((p) => {
      const nameLower = p.name.toLowerCase();
      const areaLower = p.area.toLowerCase();
      const districtLower = p.district?.toLowerCase() || "";
      
      // 1. Direct name, area or district match
      if (queryClean.length >= 3 && (nameLower.includes(queryClean) || queryClean.includes(nameLower))) {
        return true;
      }
      if (queryClean.length >= 3 && (areaLower.includes(queryClean) || queryClean.includes(areaLower))) {
        return true;
      }
      if (queryClean.length >= 3 && districtLower && (districtLower.includes(queryClean) || queryClean.includes(districtLower))) {
        return true;
      }
      
      // 2. Word-by-word matching
      const searchableText = `${p.name} ${p.area} ${p.district || ""} ${p.description} ${p.btsStation || ""} ${p.mrtStation || ""}`.toLowerCase();
      const stopWords = ["in", "at", "on", "near", "under", "for", "with", "a", "an", "the", "และ", "ใน", "ที่", "ใกล้", "คอนโด", "condo", "apartment"];
      const keyTerms = searchTerms.filter((t) => !stopWords.includes(t));
      
      if (keyTerms.length === 0) {
        return searchTerms.every((term) => searchableText.includes(term));
      }
      
      return keyTerms.every((term) => searchableText.includes(term));
    });
  }
  if (f.listingType !== "all") result = result.filter((p) => p.listingType === f.listingType);
  if (f.propertyType !== "all") result = result.filter((p) => p.propertyType === f.propertyType);
  if (f.area) {
    if (f.area === "Other") {
      const standardAreas = ["Sukhumvit", "Sathorn", "Thong Lo", "Asok", "Silom", "On Nut", "Ekkamai", "Ari", "Rama 9", "Bang Na", "Huai Khwang", "Phaya Thai"];
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

export default function ExploreClient({ properties }: { properties: PropertyCard[] }) {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ExploreFilters>(() => filtersFromParams(searchParams));

  // Re-sync if URL params change (clicking Buy → Rent in nav)
  useEffect(() => {
    Promise.resolve().then(() => {
      setFilters((prev) => ({ ...prev, ...filtersFromParams(searchParams) }));
    });
  }, [searchParams]);

  const filtered = useMemo(() => applyFilters(properties, filters), [properties, filters]);
  const update = (patch: Partial<ExploreFilters>) => setFilters((p) => ({ ...p, ...patch }));

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

  return (
    <>
      {/* Forest header — moved from server layout to client component for instant translation */}
      <div className="px-6 py-8" style={{ background: "#1C3A2F" }}>
        <div
          className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-2"
          style={{ color: "#C9A84C" }}
        >
          {t.explore.allProperties}
        </div>
        <h1
          className="text-[26px] font-bold leading-[1.25] mb-2"
          style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}
        >
          {dynamicTitle}
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
              {filtered.map((p, i) => (
                <ExplorePropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
