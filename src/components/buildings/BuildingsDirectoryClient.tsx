"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Building2, Search, MapPin, Dog, ChevronRight, Layers, X, Star } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
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

  const [selectedArea, setSelectedArea] = useState<string>(initialArea);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [petOnly, setPetOnly] = useState<boolean>(false);

  useEffect(() => {
    const areaFromQuery = searchParams.get("area");
    if (areaFromQuery) {
      setSelectedArea(areaFromQuery);
    }
  }, [searchParams]);

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

      // Text search match
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = b.name.toLowerCase().includes(term);
        const matchesArea = b.area.toLowerCase().includes(term);
        if (!matchesName && !matchesArea) return false;
      }

      return true;
    });
  }, [buildingProjects, selectedArea, petOnly, searchTerm]);

  return (
    <div className="w-full pb-4 sm:pb-8 bg-[#FAF8F3]">
      {/* ── BRAND DEEP GREEN HERO BANNER & SEARCH BAR ── */}
      <div className="bg-gradient-to-b from-[#1C3A2F] via-[#162E25] to-[#11241C] text-white py-8 sm:py-12 md:py-14 px-4 sm:px-5 border-b border-[#2A332E] relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] bg-white/10 backdrop-blur-md border border-[#C9A84C]/30 mb-2 sm:mb-3">
            <Building2 size={12} /> Official Bangkok Condo Directory
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-outfit tracking-tight mb-2 text-white leading-tight">
            Bangkok Condo Buildings & Projects
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-light leading-relaxed mb-6 sm:mb-8">
            Explore Bangkok's top residential condo buildings across prime expat neighborhoods. Browse building specs, verified tenant reviews, and available units for rent & sale.
          </p>

          {/* ── ENHANCED SEARCH & FILTER BAR (Mobile Friendly) ── */}
          <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 max-w-3xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-3 sm:top-3.5 text-[#C9A84C]" />
                <input
                  type="text"
                  placeholder="Search building name or developer..."
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

              {/* Pet Friendly Toggle Button */}
              <button
                onClick={() => setPetOnly(!petOnly)}
                className={`w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap shadow-xs ${
                  petOnly
                    ? "bg-[#C9A84C] text-[#1C3A2F] border-[#C9A84C]"
                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                }`}
              >
                <Dog size={14} className={petOnly ? "text-[#1C3A2F]" : "text-[#C9A84C]"} />
                <span>{petOnly ? "Pet Friendly Only ✓" : "Pet Friendly Buildings"}</span>
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-300">
              <span className="font-medium text-gray-400">Popular:</span>
              {["Siamese", "Sansiri", "Ananda", "Noble", "Whizdom"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 text-[10px] font-semibold transition-colors cursor-pointer border border-white/10"
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
            All Condo Buildings ({buildingProjects.length})
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
              {selectedArea ? `${selectedArea} Condo Buildings` : "Bangkok Condo Buildings"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredBuildings.length} verified condominium project{filteredBuildings.length === 1 ? "" : "s"}
            </p>
          </div>

          {(selectedArea || searchTerm || petOnly) && (
            <button
              onClick={() => {
                setSelectedArea("");
                setSearchTerm("");
                setPetOnly(false);
              }}
              className="text-xs font-bold text-[#C9A84C] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
            >
              Clear Filter Options ×
            </button>
          )}
        </div>

        {filteredBuildings.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-[#EDE8DF]">
            <Building2 size={32} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-base font-bold text-[#1C3A2F]">No Condo Buildings Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No building projects match your selected filters. Try clearing your search term or neighborhood selection.
            </p>
            <button
              onClick={() => {
                setSelectedArea("");
                setSearchTerm("");
                setPetOnly(false);
              }}
              className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1C3A2F] text-white border-none cursor-pointer"
            >
              Reset Filters
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
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C3A2F]/80 via-transparent to-transparent" />

                  {/* Top Badges (Units Active & Review Rating) */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#1C3A2F]/90 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                      <Layers size={10} className="text-[#C9A84C]" /> {b.unitCount} {b.unitCount === 1 ? "Unit" : "Units"} Active
                    </span>

                    {/* Star Rating Badge */}
                    {b.reviewCount && b.reviewCount > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#1C3A2F]/90 backdrop-blur-md text-[#C9A84C] border border-[#C9A84C]/40 flex items-center gap-1 shadow-xs">
                        <Star size={10} className="fill-[#C9A84C] text-[#C9A84C]" /> {b.ratingValue} ({b.reviewCount})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-black/60 backdrop-blur-md text-gray-300 border border-white/20 flex items-center gap-1">
                        <Star size={10} className="text-gray-400" /> New
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] bg-[#1C3A2F] px-2 py-0.5 rounded border border-[#C9A84C]/30">
                      {b.area}
                    </span>

                    {b.petFriendly && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Dog size={10} /> Pet Friendly
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

                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <MapPin size={12} className="text-[#C9A84C]" />
                      {b.district ? `${b.district}, ` : ""}{b.area}, Bangkok
                    </p>

                    {/* PROMINENT REVIEW RATING ROW INSIDE THE CARD BOX */}
                    <div className="mb-3">
                      {b.reviewCount && b.reviewCount > 0 ? (
                        <div className="inline-flex items-center gap-1.5 bg-[#FAF8F3] px-2.5 py-1 rounded-lg border border-[#EDE8DF] text-xs font-bold text-[#1C3A2F]">
                          <Star size={13} className="fill-[#C9A84C] text-[#C9A84C]" />
                          <span>{b.ratingValue}</span>
                          <span className="text-[10px] text-gray-500 font-normal">({b.reviewCount} {b.reviewCount === 1 ? "review" : "reviews"})</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-[#FAF8F3] px-2.5 py-1 rounded-lg border border-[#EDE8DF] text-[11px] font-semibold text-gray-500">
                          <Star size={12} className="text-gray-300" />
                          <span>No reviews yet</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-gray-600 bg-[#FAF8F3] p-2 sm:p-2.5 rounded-xl border border-[#EDE8DF]">
                      <span>{b.rentCount > 0 ? `${b.rentCount} Rent` : ""}</span>
                      {b.rentCount > 0 && b.saleCount > 0 && <span>·</span>}
                      <span>{b.saleCount > 0 ? `${b.saleCount} Sale` : ""}</span>
                      {b.shortStayCount > 0 && <span>· {b.shortStayCount} Short Stay</span>}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#F5F0E6] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">Starting Price</span>
                      <span className="text-xs sm:text-sm font-extrabold text-[#C9A84C]">
                        {b.minPrice > 0 ? `From ${formatPrice(b.minPrice)}` : "Contact Agent"}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] inline-flex items-center gap-1 group-hover:translate-x-1 transition-all">
                      View Building <ChevronRight size={13} />
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
