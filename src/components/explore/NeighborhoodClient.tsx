"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { PropertyCard } from "@/types/property";
import { Neighborhood } from "@/data/neighborhoods";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSaved } from "@/contexts/SavedContext";
import Link from "next/link";

// Dynamically load Map component to prevent window SSR errors
const NeighborhoodMap = dynamic(() => import("./NeighborhoodMap"), { ssr: false });

interface Props {
  neighborhood: Neighborhood;
  initialProperties: PropertyCard[];
}

const NEIGHBORHOOD_METADATA: Record<string, {
  district: string;
  btsCode: string;
  airportTime: string;
  vibe: string;
  bestFor: string;
  pros: string[];
  vibeCards: { title: string; subtitle: string; image: string }[];
}> = {
  ari: {
    district: "Phaya Thai",
    btsCode: "Ari (N5)",
    airportTime: "30–40 min",
    vibe: "Trendy, Friendly, Local",
    bestFor: "Remote Workers, Couples, Young Professionals",
    pros: [
      "Walkable neighborhood with a strong community feel",
      "Amazing cafes, bakeries and local restaurants",
      "Easy access to BTS and main roads",
      "Perfect for remote work and creative lifestyle"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Excellent", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&q=80" },
      { title: "Dining", subtitle: "Great variety", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&q=80" },
      { title: "Nightlife", subtitle: "Relaxed", image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&auto=format&q=80" },
      { title: "Parks & Green", subtitle: "Abundant", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&q=80" }
    ]
  },
  sathorn: {
    district: "Sathon",
    btsCode: "Chong Nonsi (S3)",
    airportTime: "35–45 min",
    vibe: "Sleek, Corporate, Upscale",
    bestFor: "Corporate Executives, Families, Expatriates",
    pros: [
      "Heart of the financial district with top-class towers",
      "Proximity to Lumphini Park for outdoor recreation",
      "Prestigious dining venues and rooftop bars",
      "High concentration of international schools nearby"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "High Quality", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&q=80" },
      { title: "Dining", subtitle: "World-class", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&auto=format&q=80" },
      { title: "Nightlife", subtitle: "Sophisticated", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&q=80" },
      { title: "Parks & Green", subtitle: "Lumpini Park close", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&q=80" }
    ]
  },
  "thong-lo": {
    district: "Watthana",
    btsCode: "Thong Lo (E6)",
    airportTime: "25–35 min",
    vibe: "Vibrant, Fashionable, Prestige",
    bestFor: "Socialites, Trendsetters, Japanese Expats",
    pros: [
      "Epicenter of Bangkok's trendy dining & nightlife",
      "Beautiful high-end community malls and plazas",
      "Very walkable sub-sois with premium shopping",
      "Excellent Japanese food and sushi culture"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Artisanal", image: "https://images.unsplash.com/photo-1469957761103-55928d17208d?w=500&auto=format&q=80" },
      { title: "Dining", subtitle: "Fine Dining", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&q=80" },
      { title: "Nightlife", subtitle: "Elite Speakeasies", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&auto=format&q=80" },
      { title: "Parks & Green", subtitle: "Benjasiri nearby", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&q=80" }
    ]
  },
  asok: {
    district: "Watthana",
    btsCode: "Asok (E4) / Sukhumvit (BL22)",
    airportTime: "25–35 min",
    vibe: "Busy, Central, Commuter-Friendly",
    bestFor: "Young Professionals, Commuters, Urbanites",
    pros: [
      "Ultimate transit hub linking BTS Skytrain & MRT Subway",
      "Direct access to Terminal 21 shopping mall",
      "Superb collection of co-working spaces and gyms",
      "Walkable distance to Benjakitti Forest Park"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Fast-paced", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&q=80" },
      { title: "Dining", subtitle: "Global Food Court", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&q=80" },
      { title: "Nightlife", subtitle: "High Energy", image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=500&auto=format&q=80" },
      { title: "Parks & Green", subtitle: "Benjakitti Park", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&q=80" }
    ]
  },
  silom: {
    district: "Bang Rak",
    btsCode: "Sala Daeng (S2) / Si Lom (BL26)",
    airportTime: "35–45 min",
    vibe: "Energetic, Inclusive, Diverse",
    bestFor: "Business Travelers, Foodies, Solo Adventurers",
    pros: [
      "Fantastic mix of financial center and historic lanes",
      "Legendary street food and night markets",
      "Inclusive community and vibrant nightlife scene",
      "Quick access to Lumphini Park trails"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Cozy Corners", image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=500&auto=format&q=80" },
      { title: "Dining", subtitle: "Legendary Street", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&auto=format&q=80" },
      { title: "Nightlife", subtitle: "Vibrant & Late", image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=500&auto=format&q=80" },
      { title: "Parks & Green", subtitle: "Lumphini Adjacent", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&q=80" }
    ]
  },
  "on-nut": {
    district: "Phra Khanong",
    btsCode: "On Nut (E9)",
    airportTime: "30–40 min",
    vibe: "Value, Local, Relaxed",
    bestFor: "Digital Nomads, Value Seekers, Long-term Expats",
    pros: [
      "Incredible value-for-money rental properties",
      "Massive supermarkets and local food courts",
      "Quieter environment away from downtown noise",
      "Excellent BTS connections to central districts"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Community Cafes", image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500&auto=format&q=80" },
      { title: "Dining", subtitle: "Local Food Courts", image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500&auto=format&q=80" },
      { title: "Nightlife", subtitle: "Beer Gardens", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&q=80" },
      { title: "Parks & Green", subtitle: "Pocket Parks", image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=500&auto=format&q=80" }
    ]
  },
  ekkamai: {
    district: "Watthana",
    btsCode: "Ekkamai (E7)",
    airportTime: "25–35 min",
    vibe: "Leafy, Residential, Cozy",
    bestFor: "Families, Pet Owners, Specialty Coffee Lovers",
    pros: [
      "Quieter, leafy residential sub-sois and lanes",
      "Outstanding specialty coffee roasters and brunch spots",
      "Pet-friendly spaces and rental compounds",
      "Right next to Thong Lo without the high congestion"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Specialty Roasters", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&q=80" },
      { title: "Dining", subtitle: "Fusion & Brunch", image: "https://images.unsplash.com/photo-1513442542250-854d436a49f2?w=500&auto=format&q=80" },
      { title: "Nightlife", subtitle: "Craft Beer Pubs", image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=500&auto=format&q=80" },
      { title: "Parks & Green", subtitle: "Garden Cafes", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&auto=format&q=80" }
    ]
  },
  sukhumvit: {
    district: "Watthana",
    btsCode: "Phrom Phong (E5)",
    airportTime: "25–35 min",
    vibe: "Global, Retail Core, Premium",
    bestFor: "High-earners, Families, Shopping Lovers",
    pros: [
      "Access to luxury EmDistrict malls (EmQuartier, EmSphere)",
      "Vibrant international community and service teams",
      "Beautiful Benjasiri Park directly next to BTS station",
      "Top concentration of global restaurants and grocers"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Boutique Bakeries", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&q=80" },
      { title: "Dining", subtitle: "International Fine", image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=500&auto=format&q=80" },
      { title: "Nightlife", subtitle: "Rooftop lounges", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&auto=format&q=80" },
      { title: "Parks & Green", subtitle: "Benjasiri Park", image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=500&auto=format&q=80" }
    ]
  }
};

const DEFAULT_METADATA = {
  district: "Bangkok District",
  btsCode: "BTS Station",
  airportTime: "30–40 min",
  vibe: "Friendly, Local, Residential",
  bestFor: "Expats, Professionals, Families",
  pros: [
    "Convenient transit connections to CBD areas",
    "Good assortment of local dining and supermarkets",
    "Great walkability and friendly atmosphere",
    "Suitable for families and active remote workers"
  ],
  vibeCards: [
    { title: "Cafe Culture", subtitle: "Great variety", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&q=80" },
    { title: "Dining", subtitle: "Excellent options", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&q=80" },
    { title: "Nightlife", subtitle: "Cozy & Relaxed", image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&auto=format&q=80" },
    { title: "Parks & Green", subtitle: "Accessible spaces", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&q=80" }
  ]
};

export default function NeighborhoodClient({ neighborhood, initialProperties }: Props) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isSaved: isPropertySaved, toggle: togglePropertySave } = useSaved();

  const [copied, setCopied] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);

  const meta = NEIGHBORHOOD_METADATA[neighborhood.slug.toLowerCase()] || DEFAULT_METADATA;

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Percentage Match metrics computed from neighborhood scores
  const matchMetrics = useMemo(() => {
    const scores = neighborhood.scores;
    return [
      { label: "Remote Work", score: Math.min(98, (scores.remoteWork ?? 8) * 9 + 2) },
      { label: "Lifestyle", score: Math.min(98, (scores.cafeCulture ?? 8) * 8 + 10) },
      { label: "Commute", score: Math.min(98, (scores.walkability ?? 8) * 8 + 13) },
      { label: "Nightlife", score: Math.min(98, (scores.nightlife ?? 5) * 10 + 15) },
    ];
  }, [neighborhood.scores]);

  // Featured Properties Filtered + Backfilled to 5 elements exactly
  const displayProperties = useMemo(() => {
    const filtered = initialProperties.filter(
      (p) => p.area.toLowerCase() === neighborhood.name.toLowerCase()
    );
    const list = [...filtered];

    if (list.length < 5) {
      const needed = 5 - list.length;
      const names = [
        `Noble Around ${neighborhood.name}`,
        `The Line ${neighborhood.name} Park`,
        `Noble ${neighborhood.name} Reform`,
        `Cozy Studio — ${neighborhood.name}`,
        `Noble Around ${neighborhood.name} II`
      ];
      const types = ["condo", "condo", "condo", "apartment", "condo"];
      const listingTypes = ["rent", "rent", "rent", "short_stay", "rent"];
      const prices = [28000, 35000, 45000, 1800, 60000];
      const labels = ["/month", "/month", "/month", "/night", "/month"];
      const beds = [1, 2, 2, 0, 2];
      const baths = [1, 2, 2, 1, 2];
      const sqms = [35, 55, 70, 28, 75];
      const transits = [5, 3, 7, 6, 5];

      const images = [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&q=80"
      ];

      for (let i = 0; i < needed; i++) {
        const idx = i % 5;
        list.push({
          id: 1000 + i,
          slug: `mock-${neighborhood.slug}-${i}`,
          name: names[idx],
          description: `Premium property located in the prime area of ${neighborhood.name}.`,
          listingType: listingTypes[idx] as "sale" | "rent" | "short_stay",
          propertyType: types[idx] as PropertyCard["propertyType"],
          priceTHB: prices[idx],
          priceLabel: labels[idx],
          bedrooms: beds[idx],
          bathrooms: baths[idx],
          sqm: sqms[idx],
          area: neighborhood.name,
          district: neighborhood.name,
          coverImage: images[idx],
          images: [images[idx]],
          likes: 12 + i * 4,
          saves: 4 + i * 3,
          featured: false,
          hasVideo: false,
          petFriendly: neighborhood.scores.petFriendly > 6,
          nearBts: true,
          createdAt: "2026-06-01",
          updatedAt: "2026-06-01",
          transit: [`BTS ${neighborhood.name} ${transits[idx]} min walk`]
        } as PropertyCard);
      }
    }
    return list;
  }, [initialProperties, neighborhood]);

  // Local guides specific to this neighborhood
  const localGuides = useMemo(() => {
    const images = [
      "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=500&auto=format&q=80",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&auto=format&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&q=80"
    ];

    return [
      { title: `${neighborhood.name}: The Complete Neighborhood Guide`, category: "NEIGHBORHOOD GUIDE", readTime: "6 min read", image: images[0] },
      { title: `10 Best Cafes in ${neighborhood.name} You Must Try`, category: "LIFESTYLE", readTime: "4 min read", image: images[1] },
      { title: `Cost of Living in ${neighborhood.name} for Expats`, category: "LIVING IN BANGKOK", readTime: "5 min read", image: images[2] },
      { title: `Getting Around ${neighborhood.name} Made Easy`, category: "TRANSPORTATION", readTime: "3 min read", image: images[3] },
      { title: `Is ${neighborhood.name} Right for You? A Complete Review`, category: "EXPAT TIPS", readTime: "5 min read", image: images[4] }
    ];
  }, [neighborhood.name]);

  return (
    <div className="flex flex-col w-full pb-10" style={{ background: "#FAF8F3" }}>
      {/* ── HERO BANNER ── */}
      <section
        className="relative w-full text-white overflow-hidden pt-6 pb-20 md:py-14 px-4 md:px-8 flex flex-col justify-end"
        style={{ minHeight: "380px" }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={neighborhood.heroImage}
            alt={neighborhood.name}
            className="w-full h-full object-cover"
          />
          {/* Shaded overlay */}
          <div className="absolute inset-0 hero-gradient-overlay" />
        </div>

        {/* Share Alert Toast */}
        {copied && (
          <div
            className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg animate-fade-in border"
            style={{ background: "#1C3A2F", color: "#E2C97E", borderColor: "#C9A84C" }}
          >
            ✓ Link copied to clipboard!
          </div>
        )}

        {/* Top Header Row: Breadcrumbs & Buttons */}
        <div className="w-full max-w-[1440px] mx-auto z-10 flex items-center justify-between gap-4 mb-3 md:mb-5">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-white/60 font-light">
            <Link href="/" className="hover:text-white no-underline">Home</Link>
            <span>&gt;</span>
            <span className="font-semibold text-[#E2C97E]">{neighborhood.name} Neighborhood</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-white/20 transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "#FFFFFF" }}
            >
              <span>Share ↗</span>
            </button>
          </div>
        </div>

        {/* Main Hero Row: Content on Left, Scorecard on Right */}
        <div className="w-full max-w-[1440px] mx-auto z-10 flex flex-row items-end justify-between gap-6 md:gap-8 hero-content-row">
          {/* Left Hero Content */}
          <div className="flex-1 flex flex-col items-start text-left">
            {/* Guide Badge */}
            <span
              className="px-2.5 py-0.5 rounded text-[9px] font-bold tracking-[1.5px] uppercase mb-3"
              style={{ background: "rgba(201, 168, 76, 0.18)", border: "1px solid rgba(201, 168, 76, 0.3)", color: "#E2C97E" }}
            >
              Neighborhood Guide
            </span>

            {/* Neighborhood Name */}
            <h1 className="text-3xl md:text-5xl font-bold mb-1 leading-tight hero-title" style={{ color: "#FFFFFF" }}>
              {neighborhood.name}
            </h1>

            {/* Personality Tagline */}
            <p className="text-base md:text-xl font-medium italic text-[#E2C97E] mb-3 hero-tagline">
              {neighborhood.personality}
            </p>

            {/* Description */}
            <p className="text-xs md:text-sm leading-relaxed text-white/80 max-w-xl font-light mb-5">
              {neighborhood.description}
            </p>

            {/* Transit Badges Row (Mobile only) */}
            <div className="flex flex-col gap-2 text-[10px] md:hidden w-full">
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                🚇 {neighborhood.nearestTransit} (5 min walk)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                🚇 Sukhumvit Line (Easy access)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                ☕ Cafe Culture (Excellent)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                🚶 Walkability ({neighborhood.scores.walkability}/10)
              </span>
            </div>

            {/* Transit Badges Row (Desktop only) */}
            <div className="hidden md:flex md:flex-wrap gap-2 text-[10.5px]">
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                🚇 {neighborhood.nearestTransit} (5 min walk)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                🚇 Sukhumvit Line (Easy access)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                ☕ Cafe Culture (Excellent)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                🚶 Walkability ({neighborhood.scores.walkability}/10)
              </span>
            </div>
          </div>

          {/* Right Hero Card - How Area Matches You */}
          <div className="w-[180px] sm:w-[240px] md:w-[280px] lg:w-[320px] flex-shrink-0 text-left scorecard-container mb-8 md:mb-0">
            {/* Scorecard Card */}
            <div
              className="rounded-2xl p-4 sm:p-5 border flex flex-col gap-3 sm:gap-4 shadow-xl"
              style={{ background: "#10231D", borderColor: "rgba(201, 168, 76, 0.3)" }}
            >
              <div>
                <h3 className="text-[10px] sm:text-xs font-bold text-[#E2C97E] tracking-wider uppercase mb-0.5">How {neighborhood.name} matches you</h3>
                <p className="text-[9px] sm:text-[10px] text-white/50">Based on active neighborhood parameters</p>
              </div>

              {/* Gauges list */}
              <div className="flex flex-col gap-2 sm:gap-3">
                {matchMetrics.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-white/90">
                      <span>{item.label}</span>
                      <span className="font-semibold" style={{ color: "#E2C97E" }}>{item.score}%</span>
                    </div>
                    {/* Gauge bar */}
                    <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.score}%`, background: "#C9A84C" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Match CTA button */}
              <a
                href={`/explore/match`}
                className="w-full py-2 sm:py-2.5 rounded-xl text-center text-[10px] sm:text-xs font-bold no-underline mt-1 transition-all block"
                style={{ background: "#C9A84C", color: "#1C3A2F" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#D4B665")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#C9A84C")}
              >
                See My Matches in {neighborhood.name} →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHITE CARD CONTAINER SECTION ── */}
      <section className="px-4 md:px-8 -mt-5 relative z-20">
        <div
          className="w-full max-w-[1440px] mx-auto rounded-3xl p-6 md:p-8 shadow-md border"
          style={{ background: "#FFFFFF", borderColor: "#EDE8DF" }}
        >
          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 white-card-grid gap-8 items-start">
            
            {/* Column 1: AT A GLANCE (at-a-glance-col) */}
            <div className="flex flex-col gap-4 text-left at-a-glance-col">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                At a Glance
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF]">
                  <span className="text-gray-500 font-light">🏢 Area</span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{meta.district}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF]">
                  <span className="text-gray-500 font-light">🚉 BTS Station</span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{meta.btsCode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF]">
                  <span className="text-gray-500 font-light">🚇 Travel to Asoke</span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{neighborhood.commuteMinutes["Asok"]} min</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF]">
                  <span className="text-gray-500 font-light">🚇 Travel to Silom</span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{neighborhood.commuteMinutes["Silom"]} min</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF]">
                  <span className="text-gray-500 font-light">✈️ Airport (BKK)</span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{meta.airportTime}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF]">
                  <span className="text-gray-500 font-light">✨ Vibe</span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{meta.vibe}</span>
                </div>
                <div className="flex flex-col py-1.5">
                  <span className="text-gray-500 font-light mb-1">👍 Best For</span>
                  <span className="font-medium leading-relaxed" style={{ color: "#1C3A2F" }}>{meta.bestFor}</span>
                </div>
              </div>
            </div>

            {/* Column 2: LIFESTYLE & VIBE (lifestyle-col) */}
            <div className="flex flex-col gap-4 text-left lifestyle-col">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                Lifestyle & Vibe
              </h3>
              <p className="text-xs md:text-sm leading-relaxed text-gray-600 font-light">
                A perfect blend of lifestyle and local culture. {neighborhood.name} is known for its tree-lined alleys, artisanal community spaces, independent shops, and some of the best specialty cafe options in Bangkok.
              </p>
              
              {/* Vibe cards row */}
              <div className="flex overflow-x-auto no-scrollbar gap-3 mt-2 -mx-4 px-4 scroll-smooth md:grid md:grid-cols-4 md:mx-0 md:px-0">
                {meta.vibeCards.map((card) => (
                  <div
                    key={card.title}
                    className="relative rounded-xl overflow-hidden shadow-sm aspect-[4/3] group cursor-pointer w-[160px] min-w-[160px] flex-shrink-0 md:w-auto md:min-w-0 md:flex-shrink"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }}
                    />
                    {/* Bottom-left text */}
                    <div className="absolute bottom-0 left-0 p-3 text-left w-full">
                      <span className="text-[11px] font-bold text-white block leading-tight truncate">{card.title}</span>
                      <span className="text-[9px] text-white/80 block mt-0.5 font-light truncate">{card.subtitle}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: WHY PEOPLE LOVE & Map (love-map-col) */}
            <div className="flex flex-col gap-4 text-left w-full love-map-col">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                Why People Love {neighborhood.name}
              </h3>
              <div className="love-map-grid gap-6 w-full items-start">
                <ul className="flex flex-col gap-2.5 text-xs text-gray-600 font-light pl-0 list-none">
                  {meta.pros.map((pro) => (
                    <li key={pro} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-600">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>

                {/* Dynamic Map container - Desktop Only */}
                <div className="hidden md:flex w-full flex-col gap-2">
                  <div className="w-full h-[155px] relative rounded-xl overflow-hidden border border-[#EDE8DF] shadow-inner">
                    <NeighborhoodMap lat={neighborhood.lat} lng={neighborhood.lng} name={neighborhood.name} />
                    
                    {/* View on Map floating button */}
                    <button
                      onClick={() => setShowFullMap(true)}
                      className="absolute bottom-2.5 right-2.5 z-10 px-3 py-1.5 rounded-lg text-[9.5px] font-bold shadow-md cursor-pointer border border-[#EDE8DF]"
                      style={{ background: "rgba(255,255,255,0.9)", color: "#1C3A2F" }}
                    >
                      View on Map
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MAP OVERLAY MODAL ── */}
      {showFullMap && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowFullMap(false)}
        >
          <div
            className="w-full max-w-[800px] h-[500px] rounded-2xl bg-white shadow-2xl p-4 flex flex-col gap-3 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#EDE8DF]">
              <h3 className="font-bold text-base text-[#1C3A2F]">{neighborhood.name} Location Map</h3>
              <button
                onClick={() => setShowFullMap(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border-none text-sm cursor-pointer"
                style={{ background: "#EDE8DF", color: "#1C3A2F" }}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden">
              <NeighborhoodMap lat={neighborhood.lat} lng={neighborhood.lng} name={neighborhood.name} />
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURED PROPERTIES ROW ── */}
      <section className="w-full px-4 md:px-8 mt-12 text-left">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-5">
          {/* Header row */}
          <div className="flex items-end justify-between border-b border-[#EDE8DF] pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                Featured Properties in {neighborhood.name}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-tight mt-0.5 section-heading" style={{ color: "#1C3A2F" }}>
                Condos & Rentals
              </h2>
            </div>
            <a
              href={`/explore?area=${neighborhood.name}`}
              className="text-[12px] font-semibold no-underline pb-px transition-colors duration-150 flex items-center gap-1 hover:text-[#C9A84C]"
              style={{ color: "#1C3A2F" }}
            >
              View all properties →
            </a>
          </div>

          {/* Properties Grid / Scroll Container */}
          <div className="properties-container no-scrollbar">
            {displayProperties.map((prop) => {
              const isSaved = isPropertySaved(prop.id);
              return (
                <div
                  key={prop.id}
                  className="property-card-item w-full min-w-0 h-[140px] md:w-[320px] md:min-w-[320px] md:h-[240px] rounded-2xl overflow-hidden relative border shadow-sm group hover:shadow-md transition-shadow"
                  style={{ borderColor: "#EDE8DF", background: "#1C3A2F" }}
                >
                  <img
                    src={prop.coverImage}
                    alt={prop.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* shading */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(0,0,0,0.85) 100%)" }}
                  />

                  {/* Top Listing type Badges */}
                  <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded text-[8px] font-bold tracking-[0.5px] uppercase text-white"
                      style={{
                        background: prop.listingType === "sale" ? "#1C3A2F" : prop.listingType === "rent" ? "#C9A84C" : "#555",
                        color: prop.listingType === "rent" ? "#1C3A2F" : "#FFFFFF"
                      }}
                    >
                      {prop.listingType === "sale" ? t.property.forSale : prop.listingType === "rent" ? t.property.longRent : t.property.shortStay}
                    </span>
                  </div>

                  {/* Save Heart icon button */}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePropertySave(prop.id); }}
                    className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm border-none shadow-md cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                  >
                    {isSaved ? "💚" : "🤍"}
                  </button>

                  {/* Bottom Text Info */}
                  <a
                    href={`/property/${prop.slug}`}
                    className="absolute inset-0 z-10 flex flex-col justify-end p-2.5 md:p-4 text-white no-underline"
                  >
                    <div className="text-xs md:text-base font-bold leading-none mb-0.5 md:mb-1">
                      {formatPrice(Number(prop.priceTHB))}
                      <span className="text-[8.5px] md:text-[10px] font-light opacity-80">{prop.priceLabel}</span>
                    </div>
                    <div className="text-[10px] md:text-xs font-semibold truncate leading-tight opacity-90 mb-0.5 md:mb-1">
                      {prop.name}
                    </div>
                    <div className="text-[8.5px] md:text-[10px] opacity-70 font-light flex items-center gap-1 md:gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      <span>🛏 {prop.bedrooms === 0 ? t.property.studio : `${prop.bedrooms} Bed`}</span>
                      <span>·</span>
                      <span>🛁 {prop.bathrooms} Bath</span>
                      <span>·</span>
                      <span>📐 {prop.sqm} m²</span>
                      {prop.transit && prop.transit[0] && (
                        <>
                          <span>·</span>
                          <span>🚇 {prop.transit[0].replace("BTS", "").replace("min walk", "").trim()} min</span>
                        </>
                      )}
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LOCAL GUIDE TO AREA ROW ── */}
      <section className="w-full px-4 md:px-8 mt-12 text-left">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-5">
          {/* Header row */}
          <div className="flex items-end justify-between border-b border-[#EDE8DF] pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                Local Guide to {neighborhood.name}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-tight mt-0.5 section-heading" style={{ color: "#1C3A2F" }}>
                Guides & Articles
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-[12px] font-semibold no-underline pb-px transition-colors duration-150 hover:text-[#C9A84C]"
              style={{ color: "#1C3A2F" }}
            >
              View all guides →
            </Link>
          </div>

          {/* Guides horizontal scroll */}
          <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 -mx-4 px-4 md:-mx-0 md:px-0">
            {localGuides.map((guide) => (
              <Link
                key={guide.title}
                href="/blog"
                className="w-[200px] min-w-[200px] md:w-[220px] md:min-w-[220px] flex flex-col rounded-2xl overflow-hidden shadow-sm border group hover:shadow-md transition-shadow no-underline text-left"
                style={{ background: "#FFFFFF", borderColor: "#EDE8DF" }}
              >
                {/* Image */}
                <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100 relative">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Text Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8.5px] font-bold tracking-wider uppercase text-[#C9A84C]">
                      {guide.category}
                    </span>
                    <h4 className="text-[12.5px] font-bold leading-snug line-clamp-2 text-gray-800 group-hover:text-[#C9A84C]">
                      {guide.title}
                    </h4>
                  </div>
                  <div className="text-[9.5px] text-gray-400 font-light">
                    {guide.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        .hero-gradient-overlay {
          background: linear-gradient(to right, rgba(28, 58, 47, 0.95) 0%, rgba(28, 58, 47, 0.8) 50%, rgba(0, 0, 0, 0.15) 100%);
        }
        
        /* Default mobile typography */
        .hero-title, .hero-tagline, .section-heading {
          font-family: var(--font-inter), Inter, sans-serif !important;
        }

        /* Default mobile properties layout */
        .properties-container {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 12px !important;
        }
        .property-card-item {
          height: 140px !important;
          width: 100% !important;
          min-width: 0 !important;
        }
        .property-card-item:nth-child(n+5) {
          display: none !important;
        }
        
        /* Default mobile stacked view (< 480px) */
        .hero-content-row {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        .scorecard-container {
          width: 100% !important;
        }
        .white-card-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }
        .love-map-grid {
          display: grid !important;
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          gap: 16px !important;
        }

        /* 2-Column Side-by-Side layout (>= 480px) */
        @media (min-width: 480px) {
          .hero-content-row {
            flex-direction: row !important;
            align-items: flex-end !important;
          }
          .scorecard-container {
            width: 220px !important;
          }
          .white-card-grid {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          }
          .at-a-glance-col {
            grid-column: span 5 / span 5 !important;
          }
          .lifestyle-col {
            grid-column: span 7 / span 7 !important;
          }
          .love-map-col {
            grid-column: span 12 / span 12 !important;
          }
        }

        /* Tablet/Desktop Viewports (>= 768px) */
        @media (min-width: 768px) {
          .hero-title, .hero-tagline, .section-heading {
            font-family: Georgia, serif !important;
          }
          .properties-container {
            display: flex !important;
            overflow-x: auto !important;
            gap: 16px !important;
            padding-bottom: 16px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .property-card-item {
            height: 240px !important;
            width: 320px !important;
            min-width: 320px !important;
          }
          .property-card-item:nth-child(n+5) {
            display: block !important;
          }
          .love-map-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 24px !important;
          }
        }

        /* Desktop Grid Override (>= 1024px) */
        @media (min-width: 1024px) {
          .scorecard-container {
            width: 320px !important;
          }
          .white-card-grid {
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          }
          .at-a-glance-col {
            grid-column: span 3 / span 3 !important;
          }
          .lifestyle-col {
            grid-column: span 5 / span 5 !important;
          }
          .love-map-col {
            grid-column: span 4 / span 4 !important;
          }
        }
      `}</style>
    </div>
  );
}
