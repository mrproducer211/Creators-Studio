"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PropertyCard, ListingType } from "@/types/property";
import { SlidersHorizontal, X } from "lucide-react";
import ReelItem from "./ReelItem";
import Link from "next/link";

type Filter = ListingType | "all";

const FILTER_TABS: { label: string; value: Filter }[] = [
  { label: "All",        value: "all" },
  { label: "For Sale",   value: "sale" },
  { label: "Long Rent",  value: "rent" },
  { label: "Short Stay", value: "short_stay" },
];

export default function ReelsClient({ properties }: { properties: PropertyCard[] }) {
  const [filter, setFilter]      = useState<Filter>("all");
  const [petFriendly, setPetFriendly] = useState(false);
  const [nearBts, setNearBts] = useState(false);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [searchLocation, setSearchLocation] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [activeIndex, setActive] = useState(0);
  const containerRef             = useRef<HTMLDivElement>(null);

  const filtered = properties.filter((p) => {
    if (filter !== "all" && p.listingType !== filter) return false;
    if (petFriendly && !p.petFriendly) return false;
    if (nearBts && !p.nearBts) return false;
    if (minPrice !== "" && p.priceTHB < minPrice) return false;
    if (maxPrice !== "" && p.priceTHB > maxPrice) return false;
    if (searchLocation.trim() !== "") {
      const query = searchLocation.toLowerCase();
      const matchArea = p.area.toLowerCase().includes(query);
      const matchDistrict = p.district?.toLowerCase().includes(query) ?? false;
      const matchName = p.name.toLowerCase().includes(query);
      if (!matchArea && !matchDistrict && !matchName) return false;
    }
    return true;
  });

  useEffect(() => {
    Promise.resolve().then(() => {
      setActive(0);
    });
    containerRef.current?.scrollTo({ top: 0 });
  }, [filter, petFriendly, nearBts, minPrice, maxPrice, searchLocation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: container, threshold: 0.6 }
    );
    container.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered.length]);

  const goNext = useCallback(() => {
    const next = Math.min(activeIndex + 1, filtered.length - 1);
    containerRef.current?.children[next]?.scrollIntoView({ behavior: "smooth" });
  }, [activeIndex, filtered.length]);

  const goPrev = useCallback(() => {
    const prev = Math.max(activeIndex - 1, 0);
    containerRef.current?.children[prev]?.scrollIntoView({ behavior: "smooth" });
  }, [activeIndex]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
      if (e.key === "ArrowUp")   goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  return (
    /* Outer wrapper: dark bg, full screen */
    <div className="fixed inset-0 flex flex-col md:flex-row" style={{ background: "#0a0a0a" }}>

      {/* ─── DESKTOP SIDEBAR ─────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between px-8 py-8 flex-shrink-0" style={{ width: 280, background: "#111" }}>
        {/* Logo */}
        <div>
          <Link href="/" className="flex items-center gap-2 no-underline mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: "#1C3A2F", color: "#C9A84C" }}>NHP</div>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#FFFFFF" }}>Property Reels</div>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Bangkok, Thailand</div>
            </div>
          </Link>

          {/* Search location */}
          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Search Location</p>
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search area or district..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-[12px] outline-none border-none text-white"
              style={{ background: "rgba(255,255,255,0.06)", fontFamily: "inherit" }}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            {searchLocation && (
              <button
                onClick={() => setSearchLocation("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent text-white/40 hover:text-white cursor-pointer p-0"
                style={{ fontSize: "11px", fontFamily: "inherit" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter */}
          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Browse by type</p>
          <div className="flex flex-col gap-1.5 mb-8">
            {FILTER_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className="text-left px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all"
                style={
                  filter === t.value
                    ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontFamily: "inherit" }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Must have</p>
          <div className="flex flex-col gap-1.5 mb-8">
            <button
              onClick={() => setPetFriendly((v) => !v)}
              className="text-left px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all"
              style={
                petFriendly
                  ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontFamily: "inherit" }
              }
            >
              Pet Friendly
            </button>
            <button
              onClick={() => setNearBts((v) => !v)}
              className="text-left px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all"
              style={
                nearBts
                  ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontFamily: "inherit" }
              }
            >
              Near BTS / MRT
            </button>
          </div>

          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Price range (THB)</p>
          <div className="flex gap-2 mb-8">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none border-none text-white"
              style={{ background: "rgba(255,255,255,0.06)", fontFamily: "inherit" }}
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2.5 rounded-xl text-[12px] outline-none border-none text-white"
              style={{ background: "rgba(255,255,255,0.06)", fontFamily: "inherit" }}
            />
          </div>

          {/* Progress dots */}
          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            {activeIndex + 1} / {filtered.length}
          </p>
          <div className="flex flex-col gap-1.5">
            {filtered.map((_, i) => (
              <button
                key={i}
                onClick={() => containerRef.current?.children[i]?.scrollIntoView({ behavior: "smooth" })}
                className="h-1 rounded-full cursor-pointer border-none transition-all"
                style={{
                  background: i === activeIndex ? "#C9A84C" : "rgba(255,255,255,0.12)",
                  width: i === activeIndex ? "100%" : "60%",
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex flex-col gap-2">
          <Link href="/explore" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl no-underline text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span>▦</span> Explore Grid
          </Link>
          <Link href="/swipe" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl no-underline text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span>♥</span> Swipe Mode
          </Link>
          <div className="flex gap-1 mt-2 px-4">
            <button onClick={goPrev} className="flex-1 py-2 rounded-xl text-sm cursor-pointer border-none" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: "inherit" }}>↑</button>
            <button onClick={goNext} className="flex-1 py-2 rounded-xl text-sm cursor-pointer border-none" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: "inherit" }}>↓</button>
          </div>
        </div>
      </div>

      {/* ─── CENTERED TIKTOK-STYLE CONTAINER (desktop centre) ─── */}
      <div className="hidden md:flex flex-1 items-center justify-center py-4">
        <div
          className="relative overflow-hidden shadow-2xl"
          style={{
            width: 420,
            height: "calc(100vh - 32px)",
            borderRadius: 24,
            background: "#000",
            flexShrink: 0,
          }}
        >
          {/* Desktop Mockup Filters button (single icon) */}
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
            {searchLocation && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold shadow-lg" style={{ background: "rgba(0,0,0,0.65)", color: "#C9A84C", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span>📍 {searchLocation}</span>
                <button onClick={() => setSearchLocation("")} className="ml-1 cursor-pointer border-none bg-transparent text-[#C9A84C] hover:text-white p-0" style={{ fontFamily: "inherit" }}>✕</button>
              </div>
            )}
            <button
              onClick={() => setShowFilterSheet(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none shadow-lg transition-transform active:scale-95"
              style={{ background: "rgba(0,0,0,0.5)", color: "#C9A84C", backdropFilter: "blur(8px)" }}
              aria-label="Filter"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Inner scroll */}
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-scroll no-scrollbar"
            style={{ scrollSnapType: "y mandatory" }}
          >
            {filtered.map((p, i) => (
              <div key={p.id} data-index={i} className="w-full h-full" style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
                <ReelItem property={p} index={i} isActive={i === activeIndex} onLocationClick={setSearchLocation} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MOBILE (full-screen, no frame) ─────────────── */}
      <div className="md:hidden w-full h-full relative">
        {/* Mobile top bar */}
        <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 pt-4 pb-2" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)" }}>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(0,0,0,0.5)", color: "#C9A84C", backdropFilter: "blur(6px)" }}>NHP</div>
              <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Reels</span>
            </Link>
            {searchLocation && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-lg" style={{ background: "rgba(0,0,0,0.5)", color: "#C9A84C", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span>📍 {searchLocation}</span>
                <button onClick={() => setSearchLocation("")} className="ml-1 cursor-pointer border-none bg-transparent text-[#C9A84C] hover:text-white p-0" style={{ fontFamily: "inherit" }}>✕</button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowFilterSheet(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none shadow-lg transition-transform active:scale-95"
            style={{ background: "rgba(0,0,0,0.45)", color: "#C9A84C", backdropFilter: "blur(8px)" }}
            aria-label="Filter"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="w-full h-full overflow-y-scroll no-scrollbar"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {filtered.map((p, i) => (
            <div key={p.id} data-index={i} className="w-full h-full" style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
              <ReelItem property={p} index={i} isActive={i === activeIndex} onLocationClick={setSearchLocation} />
            </div>
          ))}
        </div>

        {/* Mobile gold progress bar */}
        <div className="absolute right-1 top-1/4 bottom-1/4 w-0.5 rounded-full pointer-events-none z-40" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="w-full rounded-full transition-all duration-300" style={{ background: "#C9A84C", height: `${filtered.length > 1 ? (activeIndex / (filtered.length - 1)) * 100 : 100}%` }} />
        </div>
    </div>

    {/* Filter Bottom Sheet */}
    {showFilterSheet && (
      <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowFilterSheet(false)}>
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} />
        <div
          className="relative w-full rounded-t-3xl p-5 animate-slide-up"
          style={{ background: "#F7F3EC", maxHeight: "85vh", color: "#1C3A2F", zIndex: 60 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-base font-bold">Filters</span>
            <button
              onClick={() => setShowFilterSheet(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none"
              style={{ background: "#EDE8DF", color: "#1C3A2F" }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Filters Content */}
          <div className="flex flex-col gap-5 overflow-y-auto max-h-[60vh] pr-1">
            {/* Search Location */}
            <div>
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5 text-[#999]">Search Location</p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search area or district..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 rounded-xl text-[13px] outline-none border-[1.5px]"
                  style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                {searchLocation && (
                  <button
                    onClick={() => setSearchLocation("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent text-[#999] hover:text-[#1A1A1A] cursor-pointer p-0"
                    style={{ fontSize: "12px", fontFamily: "inherit" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Type */}
            <div>
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5 text-[#999]">Browse by type</p>
              <div className="grid grid-cols-2 gap-2">
                {FILTER_TABS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setFilter(t.value)}
                    className="px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border-none transition-all"
                    style={
                      filter === t.value
                        ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                        : { background: "#EDE8DF", color: "#1C3A2F", fontFamily: "inherit" }
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Must Have */}
            <div>
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5 text-[#999]">Must have</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPetFriendly((v) => !v)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border-none transition-all"
                  style={
                    petFriendly
                      ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                      : { background: "#EDE8DF", color: "#1C3A2F", fontFamily: "inherit" }
                  }
                >
                  Pet Friendly
                </button>
                <button
                  onClick={() => setNearBts((v) => !v)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border-none transition-all"
                  style={
                    nearBts
                      ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                      : { background: "#EDE8DF", color: "#1C3A2F", fontFamily: "inherit" }
                  }
                >
                  BTS / MRT
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5 text-[#999]">Price range (THB)</p>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                  className="flex-1 px-4 py-3 rounded-xl text-[13px] outline-none border-[1.5px]"
                  style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                  className="flex-1 px-4 py-3 rounded-xl text-[13px] outline-none border-[1.5px]"
                  style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
                />
              </div>
            </div>
          </div>

          {/* Apply & Reset Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-[#E5E0D8]">
            <button
              onClick={() => {
                setFilter("all");
                setPetFriendly(false);
                setNearBts(false);
                setMinPrice("");
                setMaxPrice("");
                setSearchLocation("");
              }}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold cursor-pointer border-none"
              style={{ background: "#EDE8DF", color: "#1C3A2F", fontFamily: "inherit" }}
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilterSheet(false)}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold cursor-pointer border-none"
              style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
            >
              Apply ({filtered.length} listings)
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
