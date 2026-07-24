"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Building2, Search, MapPin, Dog, ChevronRight, Layers, X, Star, TrainFront } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NEIGHBORHOODS } from "@/data/neighborhoods";
import { getCanonicalArea } from "@/lib/area";

export interface BuildingProjectInfo {
  slug: string;
  name: string;
  area: string;
  district?: string;
  coverImage?: string;
  minPrice: number;
  unitCount: number;
  rentCount: number;
  saleCount: number;
  shortStayCount: number;
  petFriendly: boolean;
  nearBts?: boolean;
  nearestTransit?: string;
  btsStation?: string;
  mrtStation?: string;
  ratingValue?: number;
  reviewCount?: number;
}

interface Props {
  buildingProjects: BuildingProjectInfo[];
}

export default function BuildingsDirectoryClient({ buildingProjects }: Props) {
  const searchParams = useSearchParams();
  const initialArea = searchParams.get("area") || "";
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const [selectedArea, setSelectedArea] = useState<string>(initialArea);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [petOnly, setPetOnly] = useState<boolean>(false);
  const [btsOnly, setBtsOnly] = useState<boolean>(false);

  useEffect(() => {
    const areaFromQuery = searchParams.get("area");
    if (areaFromQuery && areaFromQuery !== selectedArea) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setSelectedArea(areaFromQuery);
    }
  }, [searchParams, selectedArea]);

  const filteredBuildings = useMemo(() => {
    return buildingProjects.filter((b) => {
      // Area match
      if (selectedArea) {
        const canonicalSelected = getCanonicalArea(selectedArea);
        const canonicalBuilding = getCanonicalArea(b.area);
        if (canonicalSelected && canonicalBuilding !== canonicalSelected) {
          return false;
        }
      }

      // Pet friendly match
      if (petOnly && !b.petFriendly) {
        return false;
      }

      // BTS / MRT Near match
      if (btsOnly && !b.nearBts && !b.nearestTransit && !b.btsStation && !b.mrtStation) {
        return false;
      }

      // Comprehensive text search match across:
      // 1. Building Name
      // 2. Location / Area
      // 3. District
      // 4. BTS / MRT Station
      // 5. Nearest Transit text
      if (searchTerm.trim()) {
        const rawTerm = searchTerm.toLowerCase().trim();
        const cleanTerm = rawTerm.replace(/^(bts|mrt)\s+/, "").trim();

        const matchesName = b.name.toLowerCase().includes(rawTerm);
        const matchesArea = b.area.toLowerCase().includes(rawTerm) || (cleanTerm.length > 1 && b.area.toLowerCase().includes(cleanTerm));
        const matchesDistrict = b.district ? (b.district.toLowerCase().includes(rawTerm) || (cleanTerm.length > 1 && b.district.toLowerCase().includes(cleanTerm))) : false;
        const matchesTransit = b.nearestTransit ? (b.nearestTransit.toLowerCase().includes(rawTerm) || (cleanTerm.length > 1 && b.nearestTransit.toLowerCase().includes(cleanTerm))) : false;
        const matchesBts = b.btsStation ? (b.btsStation.toLowerCase().includes(rawTerm) || (cleanTerm.length > 1 && b.btsStation.toLowerCase().includes(cleanTerm))) : false;
        const matchesMrt = b.mrtStation ? (b.mrtStation.toLowerCase().includes(rawTerm) || (cleanTerm.length > 1 && b.mrtStation.toLowerCase().includes(cleanTerm))) : false;

        const isBtsQuery = rawTerm === "bts";
        const isMrtQuery = rawTerm === "mrt";
        const matchesGenericBts = isBtsQuery && (b.nearBts || (b.nearestTransit && b.nearestTransit.toLowerCase().includes("bts")) || Boolean(b.btsStation));
        const matchesGenericMrt = isMrtQuery && ((b.nearestTransit && b.nearestTransit.toLowerCase().includes("mrt")) || Boolean(b.mrtStation));

        if (
          !matchesName &&
          !matchesArea &&
          !matchesDistrict &&
          !matchesTransit &&
          !matchesBts &&
          !matchesMrt &&
          !matchesGenericBts &&
          !matchesGenericMrt
        ) {
          return false;
        }
      }

      return true;
    });
  }, [buildingProjects, selectedArea, petOnly, btsOnly, searchTerm]);

  return (
    <div className="w-full pb-4 sm:pb-8 bg-[#FAF8F3]">
      {/* ── BRAND DEEP GREEN HERO BANNER & SEARCH BAR ── */}
      <div className="bg-gradient-to-b from-[#1C3A2F] via-[#162E25] to-[#11241C] text-white py-8 sm:py-12 md:py-14 px-4 sm:px-5 border-b border-[#2A332E] relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] bg-white/10 backdrop-blur-md border border-[#C9A84C]/30 mb-2 sm:mb-3">
            <Building2 size={12} /> {t.buildings.heroTag}
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-outfit tracking-tight mb-2 text-white leading-tight">
            {t.buildings.heroTitle}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-light leading-relaxed mb-6 sm:mb-8">
            {t.buildings.heroSub}
          </p>

          {/* ── ENHANCED SEARCH & FILTER BAR (Mobile Friendly) ── */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 max-w-3xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-3 sm:top-3.5 text-[#C9A84C]" />
                <input
                  type="text"
                  placeholder={t.buildings.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 sm:py-3 rounded-xl bg-white text-[#1C3A2F] text-xs sm:text-sm font-medium placeholder-gray-400 outline-none border border-[#EDE8DF] focus:border-[#C9A84C] shadow-inner"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Toggle Buttons Grid on Mobile / Flex Row on Desktop */}
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
                {/* Near BTS/MRT Toggle Button */}
                <button
                  onClick={() => setBtsOnly(!btsOnly)}
                  className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shadow-xs ${
                    btsOnly
                      ? "bg-[#C9A84C] text-[#1C3A2F] border-[#C9A84C]"
                      : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                  }`}
                >
                  <TrainFront size={14} className={btsOnly ? "text-[#1C3A2F]" : "text-[#C9A84C]"} />
                  <span>{btsOnly ? t.buildings.nearBtsToggleActive : t.buildings.nearBtsToggle}</span>
                </button>

                {/* Pet Friendly Toggle Button */}
                <button
                  onClick={() => setPetOnly(!petOnly)}
                  className={`w-full sm:w-auto px-3.5 py-2.5 sm:py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap shadow-xs ${
                    petOnly
                      ? "bg-[#C9A84C] text-[#1C3A2F] border-[#C9A84C]"
                      : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                  }`}
                >
                  <Dog size={14} className={petOnly ? "text-[#1C3A2F]" : "text-[#C9A84C]"} />
                  <span>{petOnly ? t.buildings.petFriendlyToggleActive : t.buildings.petFriendlyToggle}</span>
                </button>
              </div>
            </div>

            {/* Quick Suggestions Chips: BTS/MRT & Locations (Max 6 on Mobile) */}
            <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center gap-1.5 text-[10px] sm:text-[11px] flex-wrap">
              <span className="font-semibold text-[#C9A84C] flex items-center gap-1">
                <TrainFront size={11} /> {t.buildings.btsMrtLocations}
              </span>
              {[
                "BTS Phrom Phong",
                "BTS Thong Lo",
                "BTS Asok",
                "BTS Ekkamai",
                "BTS Ari",
                "BTS On Nut",
                "MRT Rama 9",
                "MRT Sukhumvit",
                "Sathorn",
              ].map((tag, idx) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border ${
                    idx >= 6 ? "hidden sm:inline-flex" : "inline-flex"
                  } ${
                    searchTerm.toLowerCase() === tag.toLowerCase()
                      ? "bg-[#C9A84C] text-[#1C3A2F] border-[#C9A84C]"
                      : "bg-white/10 hover:bg-white/20 text-gray-200 border-white/15"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── NEIGHBORHOOD FILTER PILLS BAR ── */}
      <div className="bg-white border-b border-[#EDE8DF] sticky top-14 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-2.5 sm:py-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedArea("")}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold border whitespace-nowrap cursor-pointer transition-all ${
              !selectedArea
                ? "bg-[#1C3A2F] text-white border-[#1C3A2F] shadow-xs"
                : "bg-[#FAF8F3] text-gray-700 border-[#EDE8DF] hover:border-gray-400"
            }`}
          >
            {t.buildings.allLocations} ({buildingProjects.length})
          </button>

          {NEIGHBORHOODS.map((n) => {
            const isSelected = selectedArea.toLowerCase() === n.slug.toLowerCase() || selectedArea.toLowerCase() === n.name.toLowerCase();
            const count = buildingProjects.filter((b) => getCanonicalArea(b.area) === n.slug).length;

            return (
              <button
                key={n.slug}
                onClick={() => setSelectedArea(n.slug)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold border whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#1C3A2F] text-[#C9A84C] border-[#1C3A2F] shadow-xs"
                    : "bg-[#FAF8F3] text-gray-700 border-[#EDE8DF] hover:border-gray-400"
                }`}
              >
                {n.name} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN BUILDING CARDS GRID (With Review Ratings Badges) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-5 mt-6 sm:mt-8 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1C3A2F] font-outfit">
              {selectedArea ? `${selectedArea} ${t.buildings.heroTitle}` : t.buildings.heroTitle}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredBuildings.length} {filteredBuildings.length === 1 ? t.buildings.unit : t.buildings.units}
            </p>
          </div>

          {(selectedArea || searchTerm || petOnly || btsOnly) && (
            <button
              onClick={() => {
                setSelectedArea("");
                setSearchTerm("");
                setPetOnly(false);
                setBtsOnly(false);
              }}
              className="text-xs font-bold text-[#C9A84C] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
            >
              {t.buildings.clearFilterOptions}
            </button>
          )}
        </div>

        {filteredBuildings.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-[#EDE8DF]">
            <Building2 size={32} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-base font-bold text-[#1C3A2F]">{t.buildings.noBuildingsFound}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {t.buildings.noBuildingsSub}
            </p>
            <button
              onClick={() => {
                setSelectedArea("");
                setSearchTerm("");
                setPetOnly(false);
                setBtsOnly(false);
              }}
              className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1C3A2F] text-white border-none cursor-pointer"
            >
              {t.buildings.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredBuildings.map((b) => (
              <Link
                key={b.slug}
                href={`/building/${b.slug}`}
                className="group block bg-white rounded-2xl border border-[#EDE8DF] overflow-hidden no-underline transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              >
                {/* Building Cover Image */}
                <div className="relative h-44 sm:h-48 md:h-52 w-full bg-[#1C3A2F] overflow-hidden">
                  <Image
                    src={b.coverImage || "/images/homepage_hero_v2.webp"}
                    alt={b.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/homepage_hero_v2.webp";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C3A2F]/80 via-transparent to-transparent" />

                  {/* Top Badges (Units Active & Review Rating) */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#1C3A2F]/90 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                      <Layers size={10} className="text-[#C9A84C]" /> {b.unitCount} {b.unitCount === 1 ? t.buildings.unit : t.buildings.units} {t.buildings.activeUnits}
                    </span>

                    {/* Star Rating Badge */}
                    {b.reviewCount && b.reviewCount > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#1C3A2F]/90 backdrop-blur-md text-[#C9A84C] border border-[#C9A84C]/40 flex items-center gap-1 shadow-xs">
                        <Star size={10} className="fill-[#C9A84C] text-[#C9A84C]" /> {b.ratingValue} ({b.reviewCount})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-black/60 backdrop-blur-md text-gray-300 border border-white/20 flex items-center gap-1">
                        <Star size={10} className="text-gray-400" /> {t.buildings.new}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] bg-[#1C3A2F] px-2 py-0.5 rounded border border-[#C9A84C]/30">
                      {b.area}
                    </span>

                    {b.petFriendly && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Dog size={10} /> {t.buildings.petFriendlyToggle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Building Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] transition-colors leading-tight font-outfit">
                        {b.name}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1.5">
                      <MapPin size={12} className="text-[#C9A84C]" />
                      {b.district ? `${b.district}, ` : ""}{b.area}, Bangkok
                    </p>

                    {/* Transit Badge (Left) & Green Review Rating Tag (Far Right) */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {b.nearestTransit ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#1C3A2F] bg-[#FAF8F3] px-2 py-0.5 rounded-md border border-[#EDE8DF] shrink-0">
                          <TrainFront size={11} className="text-[#C9A84C]" />
                          {b.nearestTransit}
                        </span>
                      ) : (
                        <span />
                      )}

                      {b.reviewCount && b.reviewCount > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold ml-auto shrink-0">
                          <Star size={11} className="fill-emerald-600 text-emerald-600" />
                          <span>{b.ratingValue}</span>
                          <span className="text-[9px] text-emerald-700 font-normal">({b.reviewCount} {b.reviewCount === 1 ? t.buildings.review : t.buildings.reviews})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50/80 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold ml-auto shrink-0">
                          <Star size={10} className="text-emerald-500" />
                          <span>{t.buildings.noReviewsYet}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-gray-600 bg-[#FAF8F3] p-2 sm:p-2.5 rounded-xl border border-[#EDE8DF]">
                      <span>{b.rentCount > 0 ? `${b.rentCount} ${t.buildings.rentUnits}` : ""}</span>
                      {b.rentCount > 0 && b.saleCount > 0 && <span>·</span>}
                      <span>{b.saleCount > 0 ? `${b.saleCount} ${t.buildings.saleUnits}` : ""}</span>
                      {b.shortStayCount > 0 && <span>· {b.shortStayCount} {t.buildings.shortStayUnits}</span>}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#F5F0E6] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">{t.buildings.startingPrice}</span>
                      <span className="text-xs sm:text-sm font-extrabold text-[#C9A84C]">
                        {b.minPrice > 0 ? `${t.buildings.from} ${formatPrice(b.minPrice)}` : t.buildings.contactAgent}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] inline-flex items-center gap-1 group-hover:translate-x-1 transition-all">
                      {t.buildings.viewBuilding} <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
