"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PropertyCard, ExploreFilters, ListingType } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
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
    const q = f.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        (p.district?.toLowerCase().includes(q) ?? false) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (f.listingType !== "all") result = result.filter((p) => p.listingType === f.listingType);
  if (f.propertyType !== "all") result = result.filter((p) => p.propertyType === f.propertyType);
  if (f.area) result = result.filter((p) => p.area === f.area);
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
      return lang === "th"
        ? `ค้นหาอสังหาริมทรัพย์ในกรุงเทพฯ ย่าน ${filters.area}`
        : `Explore properties in Bangkok ${filters.area}`;
    }
    if (filters.nearBts) {
      return lang === "th"
        ? "ค้นหาอสังหาริมทรัพย์ใกล้รถไฟฟ้าในกรุงเทพฯ"
        : "Explore properties near BTS in Bangkok";
    }
    if (filters.petFriendly) {
      return lang === "th"
        ? "ค้นหาอสังหาริมทรัพย์ที่เลี้ยงสัตว์ได้ในกรุงเทพฯ"
        : "Explore pet friendly properties in Bangkok";
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
            <span className="text-5xl mb-4">🏠</span>
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
