"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Building2, Search, MapPin, Dog, ChevronRight, ChevronDown, SlidersHorizontal, Layers, X, Star, TrainFront } from "lucide-react";
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
  minRentPrice?: number;
  minSalePrice?: number;
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
  const [listingType, setListingType] = useState<"all" | "rent" | "sale">("all");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [topRated, setTopRated] = useState<boolean>(false);
  const [statusOpen, setStatusOpen] = useState<boolean>(false);
  const [areaOpen, setAreaOpen] = useState<boolean>(false);
  const [budgetOpen, setBudgetOpen] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  // Track broken cover images per building slug so we can fall back to the
  // hero image. Next.js <Image> doesn't reliably honour runtime src swaps, so
  // we key the rendered <Image> and swap to the fallback explicitly.
  const [imgErr, setImgErr] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const areaFromQuery = searchParams.get("area");
    if (areaFromQuery && areaFromQuery !== selectedArea) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setSelectedArea(areaFromQuery);
    }
  }, [searchParams, selectedArea]);

  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
        setAreaOpen(false);
        setBudgetOpen(false);
        setMobileFiltersOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  const moreFiltersActiveCount = useMemo(() => {
    let count = 0;
    if (minPrice > 0 || maxPrice > 0) count++;
    if (btsOnly) count++;
    if (petOnly) count++;
    if (topRated) count++;
    return count;
  }, [minPrice, maxPrice, btsOnly, petOnly, topRated]);

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

      // Listing type match
      if (listingType === "rent" && b.rentCount === 0 && b.shortStayCount === 0) {
        return false;
      }
      if (listingType === "sale" && b.saleCount === 0) {
        return false;
      }

      // Starting Budget match
      if (minPrice > 0 || maxPrice > 0) {
        const priceToCompare = listingType === "rent"
          ? (b.minRentPrice || b.minPrice)
          : listingType === "sale"
            ? (b.minSalePrice || b.minPrice)
            : b.minPrice;
        if (priceToCompare === 0) {
          return false;
        }
        if (minPrice > 0 && priceToCompare < minPrice) {
          return false;
        }
        if (maxPrice > 0 && priceToCompare > maxPrice) {
          return false;
        }
      }

      // Top Rated match
      if (topRated && (!b.ratingValue || b.ratingValue < 4.0)) {
        return false;
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
  }, [buildingProjects, selectedArea, petOnly, btsOnly, searchTerm, listingType, minPrice, maxPrice, topRated]);

  return (
    <div className="w-full pb-4 sm:pb-8 bg-[#FAF8F3]">
      {/* Backdrop overlay to close open dropdowns */}
      {(statusOpen || areaOpen || budgetOpen || mobileFiltersOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => { setStatusOpen(false); setAreaOpen(false); setBudgetOpen(false); setMobileFiltersOpen(false); }} 
        />
      )}
      {/* ── BRAND DEEP GREEN HERO BANNER & SEARCH BAR ── */}
      <div className="bg-gradient-to-b from-[#F5F0E6] via-[#FAF8F3] to-[#FAF8F3] text-[#1C3A2F] py-5 sm:py-12 md:py-14 px-4 sm:px-5 border-b border-[#EDE8DF] relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#1C3A2F] bg-[#C9A84C]/10 border border-[#C9A84C]/35 mb-2 sm:mb-3">
            <Building2 size={12} /> {t.buildings.heroTag}
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-outfit tracking-tight mb-1.5 sm:mb-2 text-[#1C3A2F] leading-tight">
            {t.buildings.heroTitle.includes(" & ") ? (
              <>
                {t.buildings.heroTitle.split(" & ")[0]} <span className="bg-gradient-to-r from-[#C9A84C] to-[#AA7C11] bg-clip-text text-transparent">& {t.buildings.heroTitle.split(" & ")[1]}</span>
              </>
            ) : (
              t.buildings.heroTitle
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#5F6B65] max-w-2xl font-light leading-relaxed mb-4 sm:mb-8 line-clamp-2 sm:line-clamp-none">
            {t.buildings.heroSub}
          </p>

          {/* ── SEGMENTED SEARCH CAPSULE (Airbnb Style) ── */}
          <div className="bg-white p-1.5 sm:p-2 rounded-full border border-[#EDE8DF] max-w-xl shadow-[0_12px_32px_rgba(28,58,47,0.05)] flex items-center gap-2 mt-3 sm:mt-6">
            {/* Search Input */}
            <div className="relative flex-1 w-full flex items-center">
              <Search size={16} className="absolute left-3.5 sm:left-4 text-[#1C3A2F]" />
              <input
                type="text"
                placeholder="Search building or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-transparent text-[#1C3A2F] text-xs font-medium placeholder-gray-400 outline-none border-none focus:ring-0 sm:hidden"
              />
              <input
                type="text"
                placeholder={t.buildings.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-8 py-3 bg-transparent text-[#1C3A2F] text-sm font-medium placeholder-gray-400 outline-none border-none focus:ring-0 hidden sm:block"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 text-gray-400 hover:text-[#1C3A2F] cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Suggestions Chips: Single-row horizontal swipe on mobile */}
          <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] overflow-x-auto no-scrollbar whitespace-nowrap max-w-xl px-1 py-1">
            <span className="font-semibold text-[#1C3A2F] flex items-center gap-1 shrink-0">
              <TrainFront size={11} className="text-[#C9A84C]" /> {t.buildings.btsMrtLocations}
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
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 cursor-pointer border shrink-0 ${
                  searchTerm.toLowerCase() === tag.toLowerCase()
                    ? "bg-[#1C3A2F] text-[#C9A84C] border-[#1C3A2F]"
                    : "bg-white hover:bg-[#FAF8F3] hover:border-[#1C3A2F]/40 text-gray-700 border-[#EDE8DF]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEIGHBORHOOD FILTER & STATUS STICKY BAR ── */}
      <div ref={filterBarRef} className="bg-white border-b border-[#EDE8DF] sticky top-14 z-30 shadow-xs px-4 py-2 sm:py-2.5">
        <div className="max-w-6xl mx-auto text-left relative">
          
          {/* DESKTOP VIEW (md+): Horizontal layout */}
          <div className="hidden md:flex items-center gap-2.5 relative">
            
            {/* Status Dropdown */}
            <div className="relative inline-block text-left font-outfit">
              <select
                value={listingType}
                onChange={(e) => {
                  setListingType(e.target.value as "all" | "rent" | "sale");
                  setMinPrice(0);
                  setMaxPrice(0);
                }}
                className={`appearance-none px-4 py-2 text-xs font-semibold tracking-wide rounded-full border cursor-pointer transition-all duration-200 outline-none pr-8 font-outfit ${
                  listingType !== "all" 
                    ? "bg-[#FAF8F3] text-[#1C3A2F] border-[#1C3A2F] shadow-xs" 
                    : "bg-white text-[#1C3A2F] border-gray-300 hover:border-black"
                }`}
              >
                <option value="all" className="font-outfit text-xs font-medium py-1">All Status</option>
                <option value="rent" className="font-outfit text-xs font-medium py-1">For Rent</option>
                <option value="sale" className="font-outfit text-xs font-medium py-1">For Sale</option>
              </select>
              <ChevronDown size={12} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Area Dropdown */}
            <div className="relative inline-block text-left font-outfit">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className={`appearance-none px-4 py-2 text-xs font-semibold tracking-wide rounded-full border cursor-pointer transition-all duration-200 outline-none pr-8 font-outfit max-w-[160px] truncate ${
                  selectedArea 
                    ? "bg-[#FAF8F3] text-[#1C3A2F] border-[#1C3A2F] shadow-xs" 
                    : "bg-white text-[#1C3A2F] border-gray-300 hover:border-black"
                }`}
              >
                <option value="" className="font-outfit text-xs font-medium py-1">{t.buildings.allLocations}</option>
                {NEIGHBORHOODS.map((n) => {
                  const count = buildingProjects.filter((b) => getCanonicalArea(b.area) === n.slug).length;
                  return (
                    <option key={n.slug} value={n.slug} className="font-outfit text-xs font-medium py-1">
                      {n.name} {count > 0 ? `(${count})` : ""}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={12} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Budget Dropdown */}
            <div className="relative inline-block text-left font-outfit">
              <select
                value={`${minPrice}-${maxPrice}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split("-").map(Number);
                  setMinPrice(min || 0);
                  setMaxPrice(max || 0);
                }}
                className={`appearance-none px-4 py-2 text-xs font-semibold tracking-wide rounded-full border cursor-pointer transition-all duration-200 outline-none pr-8 font-outfit ${
                  (minPrice > 0 || maxPrice > 0)
                    ? "bg-[#FAF8F3] text-[#1C3A2F] border-[#1C3A2F] shadow-xs" 
                    : "bg-white text-[#1C3A2F] border-gray-300 hover:border-black"
                }`}
              >
                <option value="0-0" className="font-outfit text-xs font-medium py-1">Any Budget</option>
                {listingType !== "sale" ? (
                  <>
                    <option value="0-20000" className="font-outfit text-xs font-medium py-1">Under ฿20k/mo</option>
                    <option value="20000-35000" className="font-outfit text-xs font-medium py-1">฿20k – ฿35k/mo</option>
                    <option value="35000-50000" className="font-outfit text-xs font-medium py-1">฿35k – ฿50k/mo</option>
                    <option value="50000-80000" className="font-outfit text-xs font-medium py-1">฿50k – ฿80k/mo</option>
                    <option value="80000-0" className="font-outfit text-xs font-medium py-1">฿80k+/mo</option>
                  </>
                ) : (
                  <>
                    <option value="0-5000000" className="font-outfit text-xs font-medium py-1">Under ฿5M</option>
                    <option value="5000000-10000000" className="font-outfit text-xs font-medium py-1">฿5M – ฿10M</option>
                    <option value="10000000-20000000" className="font-outfit text-xs font-medium py-1">฿10M – ฿20M</option>
                    <option value="20000000-40000000" className="font-outfit text-xs font-medium py-1">฿20M – ฿40M</option>
                    <option value="40000000-0" className="font-outfit text-xs font-medium py-1">฿40M+</option>
                  </>
                )}
              </select>
              <ChevronDown size={12} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Near Transit Toggle Button */}
            <button
              onClick={() => setBtsOnly(!btsOnly)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border flex items-center gap-1.5 cursor-pointer transition-all duration-200 z-50 font-outfit ${
                btsOnly
                  ? "bg-[#1C3A2F] text-white border-[#1C3A2F] shadow-xs"
                  : "bg-white text-[#1C3A2F] border-gray-300 hover:border-black"
              }`}
            >
              <TrainFront size={12} className={btsOnly ? "text-[#C9A84C]" : "text-gray-400"} />
              <span>Near Transit</span>
            </button>

            {/* Pet Friendly Toggle Button */}
            <button
              onClick={() => setPetOnly(!petOnly)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border flex items-center gap-1.5 cursor-pointer transition-all duration-200 z-50 font-outfit ${
                petOnly
                  ? "bg-[#1C3A2F] text-white border-[#1C3A2F] shadow-xs"
                  : "bg-white text-[#1C3A2F] border-gray-300 hover:border-black"
              }`}
            >
              <Dog size={12} className={petOnly ? "text-[#C9A84C]" : "text-gray-400"} />
              <span>Pet Friendly</span>
            </button>

            {/* Top Rated Toggle Button */}
            <button
              onClick={() => setTopRated(!topRated)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border flex items-center gap-1.5 cursor-pointer transition-all duration-200 z-50 font-outfit ${
                topRated
                  ? "bg-[#1C3A2F] text-white border-[#1C3A2F] shadow-xs"
                  : "bg-white text-[#1C3A2F] border-gray-300 hover:border-black"
              }`}
            >
              <Star size={12} className={topRated ? "text-[#C9A84C] fill-[#C9A84C]" : "text-gray-400"} />
              <span>Top Rated</span>
            </button>
          </div>

          {/* MOBILE VIEW (< md): Scrollable row of capsule pills */}
          <div className="md:hidden w-full relative flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5 px-0.5 text-left font-outfit">
            
            {/* 1. Status Dropdown button for mobile */}
            <div className="relative inline-block text-left shrink-0 font-outfit">
              <select
                value={listingType}
                onChange={(e) => {
                  setListingType(e.target.value as "all" | "rent" | "sale");
                  setMinPrice(0);
                  setMaxPrice(0);
                }}
                className={`appearance-none px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-full border cursor-pointer transition-all duration-200 outline-none pr-7 font-outfit ${
                  listingType !== "all" 
                    ? "bg-[#FAF8F3] text-[#1C3A2F] border-[#1C3A2F] shadow-xs" 
                    : "bg-white text-[#1C3A2F] border-gray-300 hover:border-gray-400"
                }`}
              >
                <option value="all" className="font-outfit text-xs font-medium py-1">Status</option>
                <option value="rent" className="font-outfit text-xs font-medium py-1">For Rent</option>
                <option value="sale" className="font-outfit text-xs font-medium py-1">For Sale</option>
              </select>
              <ChevronDown size={11} className="text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 2. Area Dropdown button for mobile */}
            <div className="relative inline-block text-left shrink-0 font-outfit">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className={`appearance-none px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-full border cursor-pointer transition-all duration-200 outline-none pr-7 font-outfit max-w-[115px] truncate ${
                  selectedArea 
                    ? "bg-[#FAF8F3] text-[#1C3A2F] border-[#1C3A2F] shadow-xs" 
                    : "bg-white text-[#1C3A2F] border-gray-300 hover:border-gray-400"
                }`}
              >
                <option value="" className="font-outfit text-xs font-medium py-1">Area</option>
                {NEIGHBORHOODS.map((n) => {
                  const count = buildingProjects.filter((b) => getCanonicalArea(b.area) === n.slug).length;
                  return (
                    <option key={n.slug} value={n.slug} className="font-outfit text-xs font-medium py-1">
                      {n.name} {count > 0 ? `(${count})` : ""}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={11} className="text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 3. More Filters button for mobile */}
            <div className="relative inline-block text-left shrink-0">
              <button
                onClick={() => {
                  setMobileFiltersOpen(!mobileFiltersOpen);
                  setAreaOpen(false);
                  setStatusOpen(false);
                  setBudgetOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all duration-200 z-50 ${
                  moreFiltersActiveCount > 0 
                    ? "bg-[#1C3A2F] text-white border-[#1C3A2F] shadow-xs font-semibold text-[12px]" 
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 font-medium text-[12px]"
                }`}
              >
                <SlidersHorizontal size={11} className={moreFiltersActiveCount > 0 ? "text-[#C9A84C]" : "text-gray-400"} />
                <span>Filters {moreFiltersActiveCount > 0 ? `(${moreFiltersActiveCount})` : ""}</span>
              </button>

              {mobileFiltersOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-[#EDE8DF] rounded-2xl p-4 shadow-[0_16px_36px_rgba(28,58,47,0.15)] z-50 flex flex-col gap-4 max-h-[60vh] overflow-y-auto text-left whitespace-normal">
                  
                  {/* Min/Max Budget Fields */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Price Budget</span>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <select
                          value={minPrice}
                          onChange={(e) => setMinPrice(Number(e.target.value))}
                          className="w-full px-2 py-2 text-xs font-semibold rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-gray-700 outline-none cursor-pointer"
                        >
                          <option value={0}>No Min</option>
                          {listingType !== "sale" ? (
                            <>
                              <option value={10000}>฿10k/mo</option>
                              <option value={20000}>฿20k/mo</option>
                              <option value={35000}>฿35k/mo</option>
                              <option value={50000}>฿50k/mo</option>
                            </>
                          ) : (
                            <>
                              <option value={3000000}>฿3M</option>
                              <option value={5000000}>฿5M</option>
                              <option value={10000000}>฿10M</option>
                              <option value={20000000}>฿20M</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full px-2 py-2 text-xs font-semibold rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-gray-700 outline-none cursor-pointer"
                        >
                          <option value={0}>No Max</option>
                          {listingType !== "sale" ? (
                            <>
                              <option value={20000}>฿20k/mo</option>
                              <option value={35000}>฿35k/mo</option>
                              <option value={50000}>฿50k/mo</option>
                              <option value={80000}>฿80k/mo</option>
                              <option value={120000}>฿120k/mo</option>
                            </>
                          ) : (
                            <>
                              <option value={5000000}>฿5M</option>
                              <option value={10000000}>฿10M</option>
                              <option value={20000000}>฿20M</option>
                              <option value={40000000}>฿40M</option>
                              <option value={80000000}>฿80M</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Amenities & Specs Toggles */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Amenities & Specs</span>
                    <div className="flex flex-col gap-2">
                      {/* Near Transit */}
                      <button
                        onClick={() => setBtsOnly(!btsOnly)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-between cursor-pointer transition-all ${
                          btsOnly
                            ? "bg-[#1C3A2F] text-white border-[#1C3A2F]"
                            : "bg-white text-gray-700 border-[#EDE8DF]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <TrainFront size={14} className={btsOnly ? "text-[#C9A84C]" : "text-gray-400"} />
                          <span>Near Transit</span>
                        </div>
                        {btsOnly && <span className="text-[10px] text-[#C9A84C]">Active</span>}
                      </button>

                      {/* Pet Friendly */}
                      <button
                        onClick={() => setPetOnly(!petOnly)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-between cursor-pointer transition-all ${
                          petOnly
                            ? "bg-[#1C3A2F] text-white border-[#1C3A2F]"
                            : "bg-white text-gray-700 border-[#EDE8DF]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Dog size={14} className={petOnly ? "text-[#C9A84C]" : "text-gray-400"} />
                          <span>Pet Friendly</span>
                        </div>
                        {petOnly && <span className="text-[10px] text-[#C9A84C]">Active</span>}
                      </button>

                      {/* Top Rated */}
                      <button
                        onClick={() => setTopRated(!topRated)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-between cursor-pointer transition-all ${
                          topRated
                            ? "bg-[#1C3A2F] text-white border-[#1C3A2F]"
                            : "bg-white text-gray-700 border-[#EDE8DF]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Star size={14} className={topRated ? "text-[#C9A84C] fill-[#C9A84C]" : "text-gray-400"} />
                          <span>Top Rated (4.0★+)</span>
                        </div>
                        {topRated && <span className="text-[10px] text-[#C9A84C]">Active</span>}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Footer Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                    <button
                      onClick={() => {
                        setSelectedArea("");
                        setMinPrice(0);
                        setMaxPrice(0);
                        setBtsOnly(false);
                        setPetOnly(false);
                        setTopRated(false);
                        setMobileFiltersOpen(false);
                      }}
                      className="text-xs font-bold text-red-500 hover:underline cursor-pointer bg-transparent border-none"
                    >
                      Reset All
                    </button>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="px-6 py-2 bg-[#1C3A2F] text-white text-xs font-bold rounded-xl cursor-pointer border-none hover:opacity-90"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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

          {(selectedArea || searchTerm || petOnly || btsOnly || listingType !== "all" || minPrice > 0 || maxPrice > 0 || topRated) && (
            <button
              onClick={() => {
                setSelectedArea("");
                setSearchTerm("");
                setPetOnly(false);
                setBtsOnly(false);
                setListingType("all");
                setMinPrice(0);
                setMaxPrice(0);
                setTopRated(false);
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
                setListingType("all");
                setMinPrice(0);
                setMaxPrice(0);
                setTopRated(false);
              }}
              className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1C3A2F] text-white border-none cursor-pointer"
            >
              {t.buildings.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredBuildings.map((b) => (
              <Link
                key={b.slug}
                href={`/building/${b.slug}`}
                className="group block bg-transparent no-underline transition-all duration-300 flex flex-col justify-between"
              >
                {/* Building Cover Image */}
                <div className="relative h-44 sm:h-48 md:h-52 w-full bg-[#1C3A2F] overflow-hidden rounded-2xl border border-[#EDE8DF]/60 shadow-xs">
                  <Image
                    key={imgErr[b.slug] ? "fallback" : "cover"}
                    src={imgErr[b.slug] || !b.coverImage ? "/images/homepage_hero_v2.webp" : b.coverImage}
                    alt={b.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                    onError={() => setImgErr((prev) => (prev[b.slug] ? prev : { ...prev, [b.slug]: true }))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C3A2F]/80 via-transparent to-transparent" />

                  {/* Top Badges: active units only. Rating is shown once in the card body to avoid duplication. */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#1C3A2F]/90 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                      <Layers size={10} className="text-[#C9A84C]" /> {b.unitCount} {b.unitCount === 1 ? t.buildings.unit : t.buildings.units} {t.buildings.activeUnits}
                    </span>

                    {b.petFriendly && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Dog size={10} /> {t.buildings.petFriendlyToggle}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] bg-[#1C3A2F] px-2 py-0.5 rounded border border-[#C9A84C]/30">
                      {b.area}
                    </span>

                    {/* Star Rating Badge (single source of truth for rating on the image) */}
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
                </div>

                {/* Building Details */}
                <div className="pt-3 pb-1 px-1 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] transition-colors leading-tight font-outfit">
                        {b.name}
                      </h3>
                    </div>

                    <p className="text-xs text-[#5F6B65] flex items-center gap-1 mb-1.5">
                      <MapPin size={12} className="text-[#C9A84C]" />
                      {b.district ? `${b.district}, ` : ""}{b.area}, Bangkok
                    </p>

                    {/* Transit Badge. Rating is shown once on the cover image. */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {b.nearestTransit ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#1C3A2F] bg-white px-2 py-0.5 rounded-md border border-[#EDE8DF] shrink-0">
                          <TrainFront size={11} className="text-[#C9A84C]" />
                          {b.nearestTransit}
                        </span>
                      ) : (
                        <span />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-gray-600 bg-white p-2 rounded-xl border border-[#EDE8DF]">
                      <span>{b.rentCount > 0 ? `${b.rentCount} ${t.buildings.rentUnits}` : ""}</span>
                      {b.rentCount > 0 && b.saleCount > 0 && <span>·</span>}
                      <span>{b.saleCount > 0 ? `${b.saleCount} ${t.buildings.saleUnits}` : ""}</span>
                      {b.shortStayCount > 0 && <span>· {b.shortStayCount} {t.buildings.shortStayUnits}</span>}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#EDE8DF] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#5F6B65]/80 block">{t.buildings.startingPrice}</span>
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
