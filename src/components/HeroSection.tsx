"use client";

import { useState, useEffect } from "react";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { useLanguage } from "@/contexts/LanguageContext";
import { PropertyCard } from "@/types/property";
import { useCurrency } from "@/contexts/CurrencyContext";

const FEATURED_FALLBACK = MOCK_PROPERTIES.find((p) => p.featured) ?? MOCK_PROPERTIES[0];

/* ─────────────────────────────────────────────
   DESKTOP HERO  —  faithful port of nhp-v3.html
───────────────────────────────────────────── */
function DesktopHero({
  activeTab, setActiveTab, query, setQuery, featured, handleSearch,
}: {
  activeTab: number;
  setActiveTab: (i: number) => void;
  query: string;
  setQuery: (v: string) => void;
  featured: PropertyCard;
  handleSearch: () => void;
}) {
  const { t }                    = useLanguage();
  const { formatPrice }          = useCurrency();
  const TABS                     = [t.hero.tabBuy, t.hero.tabRent, t.hero.tabShort];
  const [activeDot, setActiveDot] = useState(0);
  const DOTS = 4;

  useEffect(() => {
    const id = setInterval(() => setActiveDot((d) => (d + 1) % DOTS), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="hidden lg:grid"
      style={{
        gridTemplateColumns: "1fr 1fr",
        alignItems: "stretch",
        minHeight: "90vh",
        padding: 0,
        gap: 0,
        background: "#1C3A2F",
      }}
    >
      {/* ── LEFT: content (matches .hero-inner desktop) ── */}
      <div
        style={{
          padding: "52px 64px 52px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#1C3A2F",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Tag */}
        <div
          className="inline-flex items-center gap-1.5 self-start mb-[10px]"
          style={{
            background: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.3)",
            color: "#E2C97E",
            fontSize: 11,
            fontWeight: 500,
            padding: "5px 12px",
            borderRadius: 100,
            letterSpacing: "0.5px",
          }}
        >
          <span
            style={{ width: 5, height: 5, background: "#C9A84C", borderRadius: "50%", display: "inline-block" }}
          />
          {t.hero.tag}
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.13,
            marginBottom: 12,
            letterSpacing: "-1.2px",
          }}
        >
          {t.hero.h1a}<br />
          <span style={{ color: "#E2C97E" }}>{t.hero.h1b}</span>
        </h1>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 26, fontWeight: 300, maxWidth: 420 }}>
          {t.hero.sub}
        </p>

        {/* ── SEARCH INTENT TABS — sit above the capsule, flush left ── */}
        <div style={{ display: "flex", gap: 28, marginBottom: 16 }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === i ? "2px solid #C9A84C" : "2px solid transparent",
                padding: "0 0 8px 0",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeTab === i ? 600 : 400,
                color: activeTab === i ? "#FFFFFF" : "rgba(255,255,255,0.38)",
                letterSpacing: "0.3px",
                transition: "color 0.2s, border-color 0.2s",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== i) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
              }}
              onMouseLeave={(e) => {
                if (activeTab !== i) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.38)";
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── CAPSULE SEARCH BAR ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(247,243,236,0.97)",
            borderRadius: 9999,
            padding: "6px 6px 6px 22px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.08)",
            maxWidth: 480,
            marginBottom: activeTab === 2 ? 14 : 22,
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={activeTab === 2 ? "I'm looking for a pet-friendly condo in On Nut near BTS under 35,000 baht." : t.hero.placeholder}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              color: "#1A1A1A",
              fontFamily: "inherit",
              minWidth: 0,
            }}
          />

          {/* Gold pill search button */}
          <button
            suppressHydrationWarning
            onClick={handleSearch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "#C9A84C",
              border: "none",
              borderRadius: 9999,
              padding: "11px 22px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 700,
              color: "#1C3A2F",
              letterSpacing: "0.1em",
              flexShrink: 0,
              whiteSpace: "nowrap",
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#D4B665")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#C9A84C")}
          >
            {/* Magnifying glass SVG */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            {t.hero.search.toUpperCase()}
          </button>
        </div>

        {/* Suggested Searches chips */}
        {activeTab === 2 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxWidth: "480px", marginBottom: "20px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", width: "100%", marginBottom: "4px" }}>
              Suggested Searches:
            </span>
            {[
              "Pet-friendly condo near BTS under 35k",
              "2-bedroom condo in Thonglor with pool",
              "Family home near schools in Bang Na",
              "Luxury condo in Phrom Phong",
              "Studio in Ari under 20k",
              "Remote-work friendly condo with cafes nearby"
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setQuery(chip)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "100px",
                  padding: "5px 12px",
                  fontSize: "11px",
                  color: "#E2C97E",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.borderColor = "#E2C97E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Stats row — left-aligned, pulled close to search bar */}
        <div style={{ display: "flex", gap: 32, paddingTop: 4 }}>
          {[
            { num: "120+", label: t.hero.listings },
            { num: "฿5M",  label: t.hero.from },
            { num: "24h",  label: t.hero.response },
          ].map((s) => (
            <div key={s.label}>
              <span style={{ display: "block", fontSize: 20, fontWeight: 700, color: "#E2C97E", lineHeight: 1, marginBottom: 4, letterSpacing: "-0.5px" }}>
                {s.num}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: image col (matches .hero-image-col) ── */}
      <div style={{ position: "relative", overflow: "hidden", minHeight: "100vh" }}>
        {/* Background photo */}
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85&auto=format&fit=crop"
          alt="Premium Bangkok Condo"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />

        {/* Left-edge overlay — blends into forest green (matches ::before) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(28,58,47,0.35) 0%, transparent 50%)",
            zIndex: 1,
          }}
        />

        {/* Verified badge — top right (matches .hero-img-verified) */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            borderRadius: 100,
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            color: "#1C3A2F",
            display: "flex",
            alignItems: "center",
            gap: 5,
            zIndex: 2,
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              background: "#1C3A2F",
              color: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
            }}
          >
            ✓
          </span>
          {t.hero.verifiedListings || "Verified Listings"}
        </div>

        {/* Image dots — top centre (matches .hero-img-dots) */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 6,
            zIndex: 2,
          }}
        >
          {Array.from({ length: DOTS }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 6,
                borderRadius: i === activeDot ? 3 : "50%",
                background: i === activeDot ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                width: i === activeDot ? 20 : 6,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Floating property card — bottom (matches .hero-img-card) */}
        <a
          href={`/property/${featured.slug}`}
          style={{
            position: "absolute",
            bottom: 48,
            left: 32,
            right: 32,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            borderRadius: 16,
            padding: "18px 20px",
            zIndex: 2,
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            textDecoration: "none",
          }}
        >
          {/* Thumbnail */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 10,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {featured.coverImage ? (
              <img
                src={featured.coverImage}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg,#254D3E,#1C3A2F)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(201,168,76,0.6)",
                  letterSpacing: 1,
                }}
              >
                NHP
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1C3A2F", letterSpacing: "-0.3px", marginBottom: 2 }}>
              {formatPrice(Number(featured.priceTHB))}
              {featured.priceLabel && (
                <span style={{ fontSize: 12, fontWeight: 400, color: "#999", marginLeft: 3 }}>
                  {featured.priceLabel}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#1A1A1A",
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {featured.name}
            </div>
            <div style={{ fontSize: 11, color: "#999" }}>
              📍 {featured.area}{featured.district ? `, ${featured.district}` : ""}
              {featured.bedrooms === 0 ? ` · ${t.property.studio}` : ` · ${featured.bedrooms} ${t.property.beds}`}
              {featured.sqm && ` · ${featured.sqm} m²`}
            </div>
          </div>

          {/* Badge */}
          <div
            style={{
              background: "#1C3A2F",
              color: "#E2C97E",
              fontSize: 10,
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: 100,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {featured.listingType === "sale" ? t.property.forSale : featured.listingType === "rent" ? t.property.longRent : t.property.shortStay}
          </div>
        </a>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function HeroSection({ featured }: { featured?: PropertyCard }) {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery]         = useState("");
  const { t }                     = useLanguage();
  const MOBILE_TABS               = [t.hero.tabBuy, t.hero.tabRent, t.hero.tabShort];

  const featuredVal = featured || FEATURED_FALLBACK;

  const handleSearch = () => {
    if (activeTab === 2) {
      window.location.href = `/explore/smart?q=${encodeURIComponent(query)}`;
    } else {
      const map: Record<number, string> = { 0: "sale", 1: "rent" };
      const params = new URLSearchParams({ type: map[activeTab] });
      if (query) params.set("search", query);
      window.location.href = `/explore?${params.toString()}`;
    }
  };

  return (
    <>
      {/* Desktop (lg+) — v3 design */}
      <DesktopHero
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        query={query}
        setQuery={setQuery}
        featured={featuredVal}
        handleSearch={handleSearch}
      />

      {/* Mobile (< lg) — original forest hero, unchanged */}
      <section
        className="lg:hidden pt-[72px] pb-8 px-4 relative overflow-hidden"
        style={{ background: "#1C3A2F" }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-10 rounded-t-3xl"
          style={{ background: "#F7F3EC" }}
        />

        <div className="max-w-[480px] mx-auto relative z-10">
          <div
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-[5px] rounded-full mb-[18px]"
            style={{
              background: "rgba(201,168,76,0.15)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#E2C97E",
              letterSpacing: "0.5px",
            }}
          >
            <span className="w-[5px] h-[5px] rounded-full inline-block" style={{ background: "#C9A84C" }} />
            {t.hero.tag}
          </div>

          <h1
            className="text-[28px] font-bold leading-[1.25] mb-2.5"
            style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}
          >
            {t.hero.h1a}<br />
            <span style={{ color: "#E2C97E" }}>{t.hero.h1b}</span>
          </h1>

          <p className="text-sm leading-[1.65] mb-6 font-light" style={{ color: "rgba(255,255,255,0.65)" }}>
            {t.hero.sub}
          </p>

          <div className="rounded-2xl p-1.5 mb-6" style={{ background: "#FFFFFF", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div className="flex gap-[3px] rounded-xl p-[3px] mb-2" style={{ background: "#EDE8DF" }}>
              {MOBILE_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className="flex-1 text-center py-[7px] px-1 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 border-none"
                  style={activeTab === i ? { background: "#1C3A2F", color: "#FFFFFF" } : { background: "transparent", color: "#555" }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-1 pb-1">
              <input
                type="text"
                placeholder={activeTab === 2 ? "I'm looking for a pet-friendly condo in On Nut near BTS under 35,000 baht." : t.hero.placeholder}
                className="flex-1 border-none outline-none text-[13px] bg-transparent px-1.5 py-1"
                style={{ color: "#1A1A1A", fontFamily: "inherit" }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                suppressHydrationWarning
                className="px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors duration-150 border-none whitespace-nowrap"
                style={{ background: "#C9A84C", color: "#1C3A2F" }}
                onClick={handleSearch}
              >
                {t.hero.search}
              </button>
            </div>

            {/* Suggested Searches chips on mobile */}
            {activeTab === 2 && (
              <div className="mt-3 px-1 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-black opacity-40 block mb-2 font-semibold">
                  Suggested Searches
                </span>
                <div className="flex flex-wrap gap-1.5 animate-fadeIn">
                  {[
                    "Pet-friendly condo near BTS under 35k",
                    "2-bedroom condo in Thonglor with pool",
                    "Family home near schools in Bang Na",
                    "Luxury condo in Phrom Phong",
                    "Studio in Ari under 20k",
                    "Remote-work friendly condo with cafes nearby"
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setQuery(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-gray-300 text-[#1C3A2F] cursor-pointer font-medium"
                      style={{ background: "#F7F3EC" }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex mb-3">
            {[
              { num: "120+", label: t.hero.listings },
              { num: "฿5M",  label: t.hero.from },
              { num: "24h",  label: t.hero.response },
            ].map((s, i) => (
              <div
                key={s.label}
                className="flex-1 text-center px-2 py-3"
                style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}
              >
                <span className="block text-[20px] font-bold leading-none mb-1" style={{ color: "#E2C97E" }}>
                  {s.num}
                </span>
                <span className="text-[10px] uppercase tracking-[0.8px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
