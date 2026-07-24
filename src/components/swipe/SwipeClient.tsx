"use client";

import { useState, useEffect, useCallback } from "react";
import { PropertyCard, ListingType } from "@/types/property";
import { SlidersHorizontal, X, Heart, MapPin, Undo2, PartyPopper, Bed, ShowerHead, Maximize2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { stripEmojis } from "@/lib/emoji";
import { getLocalizedPropertySummary } from "@/lib/seoEnricher";
import SwipeCard from "./SwipeCard";
import SavedPanel from "./SavedPanel";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { T_SWIPE } from "@/data/swipeTranslations";

type Filter = ListingType | "all";

const FILTER_TABS: { labelKey: "tabAll" | "tabSale" | "tabRent" | "tabShort"; value: Filter }[] = [
  { labelKey: "tabAll",   value: "all" },
  { labelKey: "tabSale",  value: "sale" },
  { labelKey: "tabRent",  value: "rent" },
  { labelKey: "tabShort", value: "short_stay" },
];

export default function SwipeClient({ properties }: { properties: PropertyCard[] }) {
  const { formatPrice: formatPriceFn } = useCurrency();
  const { lang, t } = useLanguage();
  const ts = T_SWIPE[lang] || T_SWIPE.en;
  
  const [filter, setFilter]       = useState<Filter>("all");
  const [petFriendly, setPetFriendly] = useState(false);
  const [nearBts, setNearBts] = useState(false);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [searchLocation, setSearchLocation] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [stack, setStack]         = useState<PropertyCard[]>([]);
  const [saved, setSaved]         = useState<PropertyCard[]>([]);
  const [skipped, setSkipped]     = useState<PropertyCard[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [matchCard, setMatchCard] = useState<PropertyCard | null>(null);

  useEffect(() => {
    const f = properties.filter((p) => {
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
    Promise.resolve().then(() => {
      setStack([...f]);
      setSkipped([]);
    });
  }, [filter, petFriendly, nearBts, minPrice, maxPrice, searchLocation, properties]);

  const current = stack[stack.length - 1] ?? null;

  const doSwipe = useCallback((dir: "left" | "right") => {
    setStack((prev) => {
      const card = prev[prev.length - 1];
      if (!card) return prev;
      if (dir === "right") {
        setSaved((s) => (s.find((x) => x.id === card.id) ? s : [...s, card]));
        setMatchCard(card);
        setTimeout(() => setMatchCard(null), 1800);
      } else {
        setSkipped((s) => [...s, card]);
      }
      return prev.slice(0, -1);
    });
  }, []);

  const rewind = useCallback(() => {
    if (skipped.length === 0) return;
    const last = skipped[skipped.length - 1];
    setSkipped((s) => s.slice(0, -1));
    setStack((prev) => [...prev, last]);
  }, [skipped]);


  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (showSaved) return;
      if (e.key === "ArrowLeft")  doSwipe("left");
      if (e.key === "ArrowRight") doSwipe("right");
      if (e.key === "ArrowUp")    rewind();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [doSwipe, showSaved, rewind]);

  const visibleStack = stack.slice(-3);

  return (
    <div className="fixed inset-0 flex" style={{ background: "#0f1f18" }}>

      {/* ─── DESKTOP LEFT SIDEBAR ─────────────────── */}
      <div className="hidden md:flex flex-col justify-between px-8 py-8 flex-shrink-0" style={{ width: 260, background: "rgba(0,0,0,0.3)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <Link href="/" className="flex items-center gap-2 no-underline mb-8">
            <Image
              src="/images/nhp-logo.webp"
              alt="NHP Logo"
              width={36}
              height={36}
              className="object-contain rounded-xl"
            />
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#FFFFFF" }}>{ts.swipe}</div>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Bangkok Properties</div>
            </div>
          </Link>

          {/* Search location */}
          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>{ts.searchLocation}</p>
          <div className="relative mb-6">
            <input
              type="text"
              placeholder={ts.searchLocation}
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

          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>{ts.filters}</p>
          <div className="flex flex-col gap-1.5 mb-8">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className="text-left px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all"
                style={
                  filter === tab.value
                    ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", fontFamily: "inherit" }
                }
              >
                {t.filters[tab.labelKey]}
              </button>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>{ts.mustHave}</p>
          <div className="flex flex-col gap-1.5 mb-8">
            <button
              onClick={() => setPetFriendly((v) => !v)}
              className="text-left px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all"
              style={
                petFriendly
                  ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", fontFamily: "inherit" }
              }
            >
              {ts.petFriendly}
            </button>
            <button
              onClick={() => setNearBts((v) => !v)}
              className="text-left px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all"
              style={
                nearBts
                  ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", fontFamily: "inherit" }
              }
            >
              {ts.nearBts}
            </button>
          </div>

          <p className="text-[10px] uppercase tracking-[1.5px] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>{ts.priceRange}</p>
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

          <div className="px-4 py-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="text-[11px] uppercase tracking-[1px] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>Session</div>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{ts.remaining}</span>
              <span className="font-semibold" style={{ color: "#FFFFFF" }}>{stack.length}</span>
            </div>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{ts.saved}</span>
              <span className="font-semibold" style={{ color: "#C9A84C" }}>{saved.length}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{ts.skipped}</span>
              <span className="font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{skipped.length}</span>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="text-[11px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.2)" }}>
          <p>← {ts.skipped} · → {ts.saved}</p>
          <p>↑ {ts.undoLastSkip}</p>
        </div>
      </div>

      {/* ─── MAIN SWIPE AREA ─────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-between py-4 px-4 md:py-8">

        {/* Top bar (mobile) */}
        <div className="w-full flex items-center justify-between md:justify-end mb-3 max-w-[420px] mx-auto md:max-w-none">
          {/* Mobile logo and search location badge */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <Image
                src="/images/nhp-logo.webp"
                alt="NHP Logo"
                width={32}
                height={32}
                className="object-contain rounded-lg"
              />
              <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{ts.swipe}</span>
            </Link>
            {searchLocation && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-lg" style={{ background: "rgba(255,255,255,0.1)", color: "#C9A84C", border: "1px solid rgba(255,255,255,0.15)" }}>
                <MapPin size={10} className="shrink-0" />
                <span>{searchLocation}</span>
                <button onClick={() => setSearchLocation("")} className="ml-1 cursor-pointer border-none bg-transparent text-[#C9A84C] hover:text-white p-0" style={{ fontFamily: "inherit" }}>✕</button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterSheet(true)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-all"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#C9A84C",
                fontFamily: "inherit",
              }}
              aria-label="Filter"
            >
              <SlidersHorizontal size={16} />
            </button>
            <button
              onClick={rewind}
              disabled={skipped.length === 0}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none transition-all"
              style={{
                background: skipped.length > 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                color: skipped.length > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                fontFamily: "inherit",
              }}
              aria-label="Rewind"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={() => setShowSaved(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full cursor-pointer border-none transition-all"
              style={{ background: saved.length > 0 ? "#C9A84C" : "rgba(255,255,255,0.08)", color: saved.length > 0 ? "#1C3A2F" : "rgba(255,255,255,0.6)", fontFamily: "inherit" }}
            >
              <Heart className={`w-4 h-4 ${saved.length > 0 ? "fill-current" : ""}`} />
              <span className="text-[13px] font-semibold">{saved.length}</span>
            </button>
          </div>
        </div>

        {/* Card area */}
        <div className="w-full max-w-[420px] mx-auto flex-1 relative min-h-0">
          {stack.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <PartyPopper className="w-12 h-12 mb-4 text-[#C9A84C] mx-auto" />
              <p className="text-[18px] font-bold mb-2" style={{ color: "#FFFFFF" }}>{ts.seenAllTitle}</p>
              <p className="text-[13px] font-light mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                {saved.length > 0 ? ts.savedSummary.replace("{count}", String(saved.length)) : ts.seenAllDesc}
              </p>
              <div className="flex flex-col gap-2.5 w-full max-w-[280px]">
                {saved.length > 0 && (
                  <button onClick={() => setShowSaved(true)} className="py-3 rounded-2xl text-sm font-semibold cursor-pointer border-none flex items-center justify-center gap-1.5" style={{ background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }}>
                    {ts.viewSaved.replace("{count}", String(saved.length))} <Heart className="w-4 h-4 fill-current" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setFilter("all");
                    setPetFriendly(false);
                    setNearBts(false);
                    setMinPrice("");
                    setMaxPrice("");
                    setSearchLocation("");
                    setStack([...properties]);
                    setSkipped([]);
                  }}
                  className="py-3 rounded-2xl text-sm font-semibold cursor-pointer border-2"
                  style={{ background: "transparent", color: "#FFFFFF", borderColor: "rgba(255,255,255,0.3)", fontFamily: "inherit" }}
                >
                  {ts.browseAllAgain}
                </button>
              </div>
            </div>
          ) : (
            visibleStack.map((p, visIdx) => (
              <SwipeCard key={p.id} property={p} index={visibleStack.length - 1 - visIdx} total={stack.length} onSwipe={doSwipe} />
            ))
          )}
        </div>

        {/* Action buttons */}
        {stack.length > 0 && (
          <div className="flex flex-col items-center gap-3 pb-2 mt-4 w-full max-w-[420px] mx-auto">
            <div className="flex items-center justify-center gap-5">
              <button onClick={() => doSwipe("left")} className="w-14 h-14 rounded-full flex items-center justify-center text-2xl cursor-pointer border-2 transition-all active:scale-90" style={{ borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)", fontFamily: "inherit" }}>✕</button>


              {/* Info button directing to property details */}
              {current && (
                <a
                  href={`/property/${current.slug}`}
                  className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all active:scale-90 no-underline"
                  style={{
                    borderColor: "rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                  aria-label="Details"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </a>
              )}

              <button onClick={() => doSwipe("right")} className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all active:scale-90" style={{ borderColor: "#C9A84C", background: "rgba(201,168,76,0.12)", color: "#C9A84C", fontFamily: "inherit" }} aria-label="Save">
                <Heart className="w-7 h-7 fill-current" />
              </button>
            </div>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>{ts.keyboardControls}</p>
          </div>
        )}
      </div>

      {/* ─── DESKTOP RIGHT PANEL (current card info) ── */}
      {current && (
        <div className="hidden md:flex flex-col justify-center px-8 py-8 flex-shrink-0" style={{ width: 300, background: "rgba(0,0,0,0.2)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="relative h-40 rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {current.coverImage ? (
              <Image
                src={current.coverImage}
                alt={current.name}
                fill
                sizes="300px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#254D3E,#1C3A2F)" }}>
                <span className="text-3xl font-black" style={{ color: "rgba(255,255,255,0.06)" }}>NHP</span>
              </div>
            )}
          </div>
          <div className="text-[22px] font-bold mb-1" style={{ color: "#E2C97E", letterSpacing: "-0.5px" }}>
            {formatPriceFn(Number(current.priceTHB))}
            {current.listingType === "sale" ? "" : (current.priceLabel ?? "")}
          </div>
          <div className="text-[14px] font-semibold mb-1 leading-tight" style={{ color: "#FFFFFF" }}>{stripEmojis(current.name)}</div>
          <div className="text-[12px] mb-3 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            <MapPin size={12} className="shrink-0" />
            <span>{stripEmojis(current.area)}</span>
          </div>
          <div className="flex flex-col gap-1.5 mb-4 text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
            <span className="flex items-center gap-1"><Bed size={14} className="shrink-0" /> {current.bedrooms === 0 ? "Studio" : `${current.bedrooms}BR`}</span>
            <span className="flex items-center gap-1"><ShowerHead size={14} className="shrink-0" /> {current.bathrooms}Ba</span>
            {current.sqm && <span className="flex items-center gap-1"><Maximize2 size={14} className="shrink-0" /> {current.sqm}m²</span>}
          </div>
          <p className="text-[12px] leading-[1.6] font-light mb-5 line-clamp-4" style={{ color: "rgba(255,255,255,0.4)" }}>{stripEmojis(getLocalizedPropertySummary(current, lang))}</p>
          <a href={`/property/${current.slug}`} className="text-center py-2.5 rounded-xl text-[12px] font-semibold no-underline" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}>
            {ts.viewDetails} →
          </a>
        </div>
      )}

      {/* Match flash */}
      {matchCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" style={{ background: "rgba(15,31,24,0.75)" }}>
          <div className="text-center">
            <Heart className="w-16 h-16 text-[#4ADE80] fill-current animate-bounce mb-3 mx-auto" />
            <p className="text-[22px] font-bold" style={{ color: "#E2C97E" }}>{ts.savedToast}</p>
            <p className="text-[14px] font-light mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{stripEmojis(matchCard.name)}</p>
          </div>
        </div>
      )}

      {showSaved && <SavedPanel saved={saved} onClose={() => setShowSaved(false)} onRemove={(id) => setSaved((s) => s.filter((p) => p.id !== id))} />}

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
              <span className="text-base font-bold">{ts.filters}</span>
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
                <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5 text-[#999]">{ts.searchLocation}</p>
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
                <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5 text-[#999]">{ts.browseByType}</p>
                <div className="grid grid-cols-2 gap-2">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setFilter(tab.value)}
                      className="px-4 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border-none transition-all"
                      style={
                        filter === tab.value
                          ? { background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }
                          : { background: "#EDE8DF", color: "#1C3A2F", fontFamily: "inherit" }
                      }
                    >
                      {t.filters[tab.labelKey]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Must Have */}
              <div>
                <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5 text-[#999]">{ts.mustHave}</p>
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
                    {ts.petFriendly}
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
                    {ts.nearBts}
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-[11px] uppercase tracking-[1px] font-semibold mb-2.5 text-[#999]">{ts.priceRange}</p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                    className="flex-1 w-full min-w-0 px-3 py-3 rounded-xl text-[13px] outline-none border-[1.5px]"
                    style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                    className="flex-1 w-full min-w-0 px-3 py-3 rounded-xl text-[13px] outline-none border-[1.5px]"
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
                {t.filters.clearAll}
              </button>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold cursor-pointer border-none"
                style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
              >
                {ts.showResults.replace("{count}", String(stack.length))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
