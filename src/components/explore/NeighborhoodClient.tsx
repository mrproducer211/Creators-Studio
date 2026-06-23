"use client";

import { useState, useMemo } from "react";
import { PropertyCard } from "@/types/property";
import { Neighborhood, NEIGHBORHOODS } from "@/data/neighborhoods";
import { NEIGHBORHOOD_GUIDES } from "@/data/neighborhoodGuides";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSaved } from "@/contexts/SavedContext";
import { T_NEIGHBORHOOD } from "@/data/neighborhoodTranslations";
import Link from "next/link";
import { Building2, Train, Plane, Sparkles, ThumbsUp, Coffee, Footprints, Heart, Check, ArrowUpRight, Bed, ShowerHead, Maximize2, TrainFront, Home } from "lucide-react";
import { stripEmojis } from "@/lib/emoji";



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
  lifestyleDesc?: string;
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
      "Perfect for remote work and creative lifestyle",
      "Leafy side streets with minimal high-rise traffic",
      "Charming local markets alongside modern supermarkets"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Excellent", image: "/images/lifestyles/ari_cafe.webp" },
      { title: "Dining", subtitle: "Great variety", image: "/images/lifestyles/ari_dining.webp" },
      { title: "Nightlife", subtitle: "Relaxed", image: "/images/lifestyles/ari_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Abundant", image: "/images/lifestyles/ari_parks.webp" }
    ],
    lifestyleDesc: "A charming residential enclave that has evolved into one of Bangkok's trendiest creative hubs. Ari maintains a laid-back, community-centric atmosphere, blending mid-century modern homes with leafy streets, pocket parks, and artisanal spaces. The neighborhood is celebrated for its thriving specialty coffee culture, independent bakeries, cozy bistros, and locally-owned boutiques. It attracts a mix of local creatives, tech founders, digital nomads, and young families who value a slower pace of life with urban conveniences."
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
      "High concentration of international schools nearby",
      "Quiet, tree-lined residential side-streets (sois)",
      "Convenient tollway access and multi-lane roads",
      "Top-tier healthcare centers and embassies within reach"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "High Quality", image: "/images/lifestyles/sathorn_cafe.webp" },
      { title: "Dining", subtitle: "World-class", image: "/images/lifestyles/sathorn_dining.webp" },
      { title: "Nightlife", subtitle: "Sophisticated", image: "/images/lifestyles/sathorn_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Lumpini Park close", image: "/images/lifestyles/sathorn_parks.webp" }
    ],
    lifestyleDesc: "A perfect blend of premium corporate lifestyle and serene residential comfort. Sathorn is defined by its towering glass skyscrapers, corporate headquarters, and luxury condominium developments, contrasted with quiet, tree-lined side streets (sois). It is home to upscale Michelin-starred dining, exclusive rooftop bars, and tranquil green spaces like Lumphini Park. By day, it is a bustling financial hub; by evening, it transforms into an elegant dining, networking, and wellness sanctuary for working professionals, expatriates, and modern families."
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
      "Excellent Japanese food and sushi culture",
      "Prestige address with high capital appreciation",
      "Close to elite international hospitals and schools"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Artisanal", image: "/images/lifestyles/thong_lo_cafe.webp" },
      { title: "Dining", subtitle: "Fine Dining", image: "/images/lifestyles/thong_lo_dining.webp" },
      { title: "Nightlife", subtitle: "Elite Speakeasies", image: "/images/lifestyles/thong_lo_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Benjasiri nearby", image: "/images/lifestyles/thong_lo_parks.webp" }
    ],
    lifestyleDesc: "Bangkok's undisputed epicenter of fashion, high-end dining, and vibrant nightlife. Thong Lo (Sukhumvit 55) is a glamorous and energetic neighborhood lined with luxury lifestyle malls, designer boutiques, speakeasy bars, and world-class culinary concepts. It is highly popular among Japanese expats, affluent locals, and global travelers who seek a sophisticated urban lifestyle. Beyond the main road, its quiet sub-sois hide high-end residential towers, wellness spas, and hidden cafes, offering an oasis of calm amidst the excitement."
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
      "Walkable distance to Benjakitti Forest Park",
      "Thriving business district with corporate offices",
      "Diverse dining options ranging from street food to fine dining"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Fast-paced", image: "/images/lifestyles/asok_cafe.webp" },
      { title: "Dining", subtitle: "Global Food Court", image: "/images/lifestyles/asok_dining.webp" },
      { title: "Nightlife", subtitle: "High Energy", image: "/images/lifestyles/asok_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Benjakitti Park", image: "/images/lifestyles/asok_parks.webp" }
    ],
    lifestyleDesc: "The ultimate commercial crossroads of Bangkok, where business, retail, and convenience meet. Asok is a high-energy urban transit hub where the BTS Skytrain and MRT Subway systems intersect, making commute effortless. The area is dominated by towering office plazas, co-working spaces, luxury hotels, and the landmark Terminal 21 shopping mall. It is a highly active neighborhood that caters to fast-paced professionals and urbanites who want everything—from fitness centers to international dining—right at their doorstep, with Benjakitti Forest Park just a short walk away."
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
      "Quick access to Lumphini Park trails",
      "Dual transit connectivity via BTS and MRT",
      "Proximity to upscale shopping and retail core"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Cozy Corners", image: "/images/lifestyles/silom_cafe.webp" },
      { title: "Dining", subtitle: "Legendary Street", image: "/images/lifestyles/silom_dining.webp" },
      { title: "Nightlife", subtitle: "Vibrant & Late", image: "/images/lifestyles/silom_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Lumphini Adjacent", image: "/images/lifestyles/silom_parks.webp" }
    ],
    lifestyleDesc: "A dynamic neighborhood of contrasts, blending Bangkok's historic commerce with modern financial power. Often referred to as the 'Wall Street of Thailand' by day, Silom is home to major banking headquarters and multinational corporations. By night, it morphs into a vibrant, inclusive, and diverse entertainment district. The neighborhood boasts some of the city's best street food lanes, historic heritage buildings, and the expansive greenery of Lumphini Park at its eastern edge. It is perfect for those who thrive in a high-energy, walk-friendly environment."
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
      "Excellent BTS connections to central districts",
      "Thriving community of digital nomads and expats",
      "Abundant street food and local retail options"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Community Cafes", image: "/images/lifestyles/on_nut_cafe.webp" },
      { title: "Dining", subtitle: "Local Food Courts", image: "/images/lifestyles/on_nut_dining.webp" },
      { title: "Nightlife", subtitle: "Beer Gardens", image: "/images/lifestyles/on_nut_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Pocket Parks", image: "/images/lifestyles/on_nut_parks.webp" }
    ],
    lifestyleDesc: "A relaxed, value-oriented residential neighborhood that offers a perfect entry point to Sukhumvit living. On Nut has become a favorite among digital nomads and budget-conscious expats due to its affordable modern condos, local food markets, and hypermarkets like Lotus's and Big C. The vibe is laid-back and local, with a growing number of community malls, cozy cafes, and co-working spots popping up. It provides easy BTS access to the downtown core while offering a quieter, cost-effective base to live and work."
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
      "Right next to Thong Lo without the high congestion",
      "Excellent community centers and lifestyle shopping",
      "Great connection to the Eastern Bus Terminal and expressways"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Specialty Roasters", image: "/images/lifestyles/ekkamai_cafe.webp" },
      { title: "Dining", subtitle: "Fusion & Brunch", image: "/images/lifestyles/ekkamai_dining.webp" },
      { title: "Nightlife", subtitle: "Craft Beer Pubs", image: "/images/lifestyles/ekkamai_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Garden Cafes", image: "/images/lifestyles/ekkamai_parks.webp" }
    ],
    lifestyleDesc: "A leafy, upscale residential neighborhood that seamlessly blends chic lifestyle venues with quiet family living. Ekkamai runs parallel to Thong Lo, sharing much of its trendy appeal but with a slightly more relaxed, residential feel. It is known for its spacious garden villas, specialty coffee roasters, independent bookshops, and family-friendly community spaces. It is a highly walkable area with a strong focus on high-quality leisure, making it incredibly popular with pet owners, long-term expat families, and coffee connoisseurs."
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
      "Top concentration of global restaurants and grocers",
      "Premium high-rise residences with city skyline views",
      "Excellent wellness centers and luxury day spas"
    ],
    vibeCards: [
      { title: "Cafe Culture", subtitle: "Boutique Bakeries", image: "/images/lifestyles/sukhumvit_cafe.webp" },
      { title: "Dining", subtitle: "International Fine", image: "/images/lifestyles/sukhumvit_dining.webp" },
      { title: "Nightlife", subtitle: "Rooftop lounges", image: "/images/lifestyles/sukhumvit_nightlife.webp" },
      { title: "Parks & Green", subtitle: "Benjasiri Park", image: "/images/lifestyles/sukhumvit_parks.webp" }
    ],
    lifestyleDesc: "The prestigious retail and lifestyle heart of downtown Bangkok. Centered around Phrom Phong, this neighborhood represents international luxury, defined by the world-class EmDistrict shopping malls (EmPorium, EmQuartier, EmSphere). The area is exceptionally cosmopolitan, home to a large international expat community, upscale Japanese supermarkets, and premium international schools. With Benjasiri Park providing a lush green escape in the middle of the retail action, it offers an unmatched combination of luxury convenience and urban lifestyle."
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
  ],
  lifestyleDesc: "A perfect blend of lifestyle and local culture. The neighborhood is known for its tree-lined alleys, artisanal community spaces, independent shops, and some of the best specialty cafe options in Bangkok."
};

export default function NeighborhoodClient({ neighborhood, initialProperties }: Props) {
  const { t, lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isSaved: isPropertySaved, toggle: togglePropertySave } = useSaved();

  const [copied, setCopied] = useState(false);
  const [selectedLongFormSection, setSelectedLongFormSection] = useState<number | null>(null);

  const trans = T_NEIGHBORHOOD[lang] || T_NEIGHBORHOOD.en;
  const transN = trans.neighborhoods[neighborhood.slug.toLowerCase() as keyof typeof trans.neighborhoods];

  const nName = transN?.name || neighborhood.name;
  const nPersonality = transN?.personality || neighborhood.personality;
  const nDescription = transN?.description || neighborhood.description;
  const nNearestTransit = transN?.nearestTransit || neighborhood.nearestTransit;

  const meta = NEIGHBORHOOD_METADATA[neighborhood.slug.toLowerCase()] || DEFAULT_METADATA;

  const nDistrict = transN?.district || meta.district;
  const nBtsCode = transN?.btsCode || meta.btsCode;
  const nAirportTime = transN?.airportTime || meta.airportTime;
  const nVibe = transN?.vibe || meta.vibe;
  const nBestFor = transN?.bestFor || meta.bestFor;
  const nLifestyleDesc = transN?.lifestyleDesc || meta.lifestyleDesc || `A perfect blend of lifestyle and local culture. ${nName} is known for its tree-lined alleys, artisanal community spaces, independent shops, and some of the best specialty cafe options in Bangkok.`;
  const nPros = transN?.pros || meta.pros;

  const nVibeCards = useMemo(() => {
    return meta.vibeCards.map((card, idx) => {
      const transCard = transN?.vibeCards?.[idx];
      return {
        ...card,
        title: transCard?.title || card.title,
        subtitle: transCard?.subtitle || card.subtitle
      };
    });
  }, [meta.vibeCards, transN]);

  const guide = NEIGHBORHOOD_GUIDES[neighborhood.slug.toLowerCase()];

  const NEARBY_MAP: Record<string, string[]> = {
    ari: ["phaya-thai", "asok", "sukhumvit"],
    sathorn: ["silom", "sukhumvit", "asok"],
    silom: ["sathorn", "sukhumvit", "asok"],
    "thong-lo": ["ekkamai", "on-nut", "sukhumvit"],
    asok: ["sukhumvit", "rama-9", "thong-lo"],
    "on-nut": ["ekkamai", "sukhumvit", "thong-lo"],
    ekkamai: ["thong-lo", "on-nut", "sukhumvit"],
    sukhumvit: ["asok", "thong-lo", "ekkamai"],
    "rama-9": ["huai-khwang", "asok", "sukhumvit"],
    "bang-na": ["on-nut", "ekkamai", "sukhumvit"],
    "huai-khwang": ["rama-9", "asok", "phaya-thai"],
    "phaya-thai": ["ari", "huai-khwang", "asok"],
    chatuchak: ["ari", "phaya-thai", "huai-khwang"],
    "rama-4": ["sathorn", "silom", "sukhumvit"]
  };

  const nearbySlugs = NEARBY_MAP[neighborhood.slug.toLowerCase()] || [];
  const nearbyNeighborhoods = NEIGHBORHOODS.filter(n => nearbySlugs.includes(n.slug.toLowerCase()));

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

  const translatedMetricLabel = (label: string) => {
    if (lang === "th") {
      if (label === "Remote Work") return "ทำงานทางไกล";
      if (label === "Lifestyle") return "ไลฟ์สไตล์";
      if (label === "Commute") return "การเดินทาง";
      if (label === "Nightlife") return "ชีวิตยามค่ำคืน";
    }
    if (lang === "zh") {
      if (label === "Remote Work") return "远程工作";
      if (label === "Lifestyle") return "生活方式";
      if (label === "Commute") return "通勤交通";
      if (label === "Nightlife") return "夜生活";
    }
    return label;
  };

  // Featured Properties — real database listings for this neighbourhood only
  const displayProperties = useMemo(() => {
    return initialProperties.filter(
      (p) => p.area.toLowerCase() === neighborhood.name.toLowerCase()
    );
  }, [initialProperties, neighborhood]);

  // Local guides specific to this neighborhood
  const localGuides = useMemo(() => {
    const list: Array<{
      title: string;
      category: string;
      readTime: string;
      image: string;
      slug: string;
      isLongFormSection: boolean;
      sectionIndex: number;
    }> = [];

    if (guide && guide.longFormSections) {
      const categoryImages: Record<string, string> = {
        "TRANSPORTATION": "/images/neighborhoods/guide_transit.webp",
        "LANDMARKS & MALLS": "/images/neighborhoods/guide_landmarks.webp",
        "WELLNESS & PARKS": "/images/neighborhoods/guide_wellness.webp",
        "DINING & NIGHTLIFE": "/images/neighborhoods/guide_dining.webp",
        "REAL ESTATE": "/images/neighborhoods/guide_real_estate.webp",
        "NEIGHBORHOOD GUIDE": "/images/neighborhoods/guide_general.webp",
        "EXPERT INSIGHTS": "/images/neighborhoods/guide_general.webp"
      };

      guide.longFormSections.forEach((section, index) => {
        let category = "EXPERT INSIGHTS";
        const titleLower = section.heading.toLowerCase();
        if (titleLower.includes("transit") || titleLower.includes("getting around") || titleLower.includes("mrt") || titleLower.includes("bts")) {
          category = "TRANSPORTATION";
        } else if (titleLower.includes("mall") || titleLower.includes("landmark") || titleLower.includes("terminal 21") || titleLower.includes("shopping")) {
          category = "LANDMARKS & MALLS";
        } else if (titleLower.includes("fitness") || titleLower.includes("park") || titleLower.includes("wellness") || titleLower.includes("connection")) {
          category = "WELLNESS & PARKS";
        } else if (titleLower.includes("nightlife") || titleLower.includes("dining") || titleLower.includes("eat") || titleLower.includes("cafe") || titleLower.includes("secret")) {
          category = "DINING & NIGHTLIFE";
        } else if (titleLower.includes("real estate") || titleLower.includes("condo") || titleLower.includes("housing") || titleLower.includes("rent") || titleLower.includes("suite")) {
          category = "REAL ESTATE";
        } else if (titleLower.includes("fast forward") || titleLower.includes("living in")) {
          category = "NEIGHBORHOOD GUIDE";
        }

        // Translate category
        let transCategory = category;
        if (lang === "th") {
          if (category === "EXPERT INSIGHTS") transCategory = "ข้อมูลเชิงลึกจากผู้เชี่ยวชาญ";
          else if (category === "TRANSPORTATION") transCategory = "การเดินทางคมนาคม";
          else if (category === "LANDMARKS & MALLS") transCategory = "แลนด์มาร์ก & ห้างสรรพสินค้า";
          else if (category === "WELLNESS & PARKS") transCategory = "สุขภาพ & สวนสาธารณะ";
          else if (category === "DINING & NIGHTLIFE") transCategory = "อาหาร & ชีวิตยามค่ำคืน";
          else if (category === "REAL ESTATE") transCategory = "อสังหาริมทรัพย์";
          else if (category === "NEIGHBORHOOD GUIDE") transCategory = "คู่มือนำเที่ยวย่าน";
        } else if (lang === "zh") {
          if (category === "EXPERT INSIGHTS") transCategory = "专家洞察";
          else if (category === "TRANSPORTATION") transCategory = "交通出行";
          else if (category === "LANDMARKS & MALLS") transCategory = "地标与商场";
          else if (category === "WELLNESS & PARKS") transCategory = "康养与公园";
          else if (category === "DINING & NIGHTLIFE") transCategory = "餐饮与夜生活";
          else if (category === "REAL ESTATE") transCategory = "房产市场";
          else if (category === "NEIGHBORHOOD GUIDE") transCategory = "社区指南";
        }

        const transSection = transN?.guides?.[index];
        const heading = transSection?.heading || section.heading;

        list.push({
          title: heading,
          category: transCategory,
          readTime: trans.readTime,
          image: section.image || categoryImages[category] || "/images/neighborhoods/guide_general.webp",
          slug: "",
          isLongFormSection: true,
          sectionIndex: index
        });
      });
    }

    return list;
  }, [guide, lang, transN, trans.readTime]);

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
            {trans.linkCopied}
          </div>
        )}

        {/* Top Header Row: Breadcrumbs & Buttons */}
        <div className="w-full max-w-[1440px] mx-auto z-10 flex items-center justify-between gap-4 mb-3 md:mb-5">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-white/60 font-light">
            <Link href="/" className="hover:text-white no-underline">{trans.home}</Link>
            <span>&gt;</span>
            <span className="font-semibold text-[#E2C97E]">{nName} {trans.neighborhoodSuffix}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-white/20 transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "#FFFFFF" }}
            >
              <span className="flex items-center gap-1.5">{trans.share} <ArrowUpRight className="w-3.5 h-3.5" /></span>
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
              {trans.neighborhoodGuide}
            </span>

            {/* Neighborhood Name */}
            <h1 className="text-3xl md:text-5xl font-bold mb-1 leading-tight hero-title" style={{ color: "#FFFFFF" }}>
              {nName}
            </h1>

            {/* Personality Tagline */}
            <p className="text-base md:text-xl font-medium italic text-[#E2C97E] mb-3 hero-tagline">
              {nPersonality}
            </p>

            {/* Description */}
            <p className="text-xs md:text-sm leading-relaxed text-white/80 max-w-xl font-light mb-5">
              {nDescription}
            </p>

            {/* Transit Badges Row (Mobile only) */}
            <div className="flex flex-col gap-2 text-[10px] md:hidden w-full">
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                <Train size={11} className="text-[#E2C97E]" /> {nNearestTransit} (5 {trans.minWalk})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                <Train size={11} className="text-[#E2C97E]" /> Sukhumvit Line ({trans.easyAccess})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                <Coffee size={11} className="text-[#E2C97E]" /> {lang === 'en' ? 'Cafe Culture' : lang === 'th' ? 'วัฒนธรรมคาเฟ่' : '咖啡文化'} ({lang === 'en' ? 'Excellent' : lang === 'th' ? 'ยอดเยี่ยม' : '极佳'})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 justify-start w-fit">
                <Footprints size={11} className="text-[#E2C97E]" /> {lang === 'en' ? 'Walkability' : lang === 'th' ? 'ความสะดวกในการเดิน' : '步行便利度'} ({neighborhood.scores.walkability}/10)
              </span>
            </div>

            {/* Transit Badges Row (Desktop only) */}
            <div className="hidden md:flex md:flex-wrap gap-2 text-[10.5px]">
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <Train size={11} className="text-[#E2C97E]" /> {nNearestTransit} (5 {trans.minWalk})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <Train size={11} className="text-[#E2C97E]" /> Sukhumvit Line ({trans.easyAccess})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <Coffee size={11} className="text-[#E2C97E]" /> {lang === 'en' ? 'Cafe Culture' : lang === 'th' ? 'วัฒนธรรมคาเฟ่' : '咖啡文化'} ({lang === 'en' ? 'Excellent' : lang === 'th' ? 'ยอดเยี่ยม' : '极佳'})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
                <Footprints size={11} className="text-[#E2C97E]" /> {lang === 'en' ? 'Walkability' : lang === 'th' ? 'ความสะดวกในการเดิน' : '步行便利度'} ({neighborhood.scores.walkability}/10)
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
                <h3 className="text-[10px] sm:text-xs font-bold text-[#E2C97E] tracking-wider uppercase mb-0.5">{trans.matchesYou.replace("{name}", nName)}</h3>
                <p className="text-[9px] sm:text-[10px] text-white/50">{trans.basedOnParams}</p>
              </div>

              {/* Gauges list */}
              <div className="flex flex-col gap-2 sm:gap-3">
                {matchMetrics.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-white/90">
                      <span>{translatedMetricLabel(item.label)}</span>
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
                {trans.seeMatches.replace("{name}", nName)}
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
          <div className="grid grid-cols-1 white-card-grid gap-8 items-stretch">
            
            {/* Column 1: AT A GLANCE (at-a-glance-col) */}
            <div className="flex flex-col gap-4 text-left at-a-glance-col">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                {trans.atAGlance}
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Building2 size={13} className="text-[#C9A84C]" /> {trans.area}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{nDistrict}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Train size={13} className="text-[#C9A84C]" /> {trans.btsStation}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{nBtsCode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Train size={13} className="text-[#C9A84C]" /> {lang === 'en' ? 'Travel to Asok' : lang === 'th' ? 'เดินทางไปอโศก' : '前往阿索克'}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{neighborhood.commuteMinutes["Asok"]} {trans.min}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Train size={13} className="text-[#C9A84C]" /> {lang === 'en' ? 'Travel to Silom' : lang === 'th' ? 'เดินทางไปสีลม' : '前往是隆'}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{neighborhood.commuteMinutes["Silom"]} {trans.min}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Plane size={13} className="text-[#C9A84C]" /> {trans.airport}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{nAirportTime}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#EDE8DF] items-center">
                  <span className="text-gray-500 font-light flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#C9A84C]" /> {trans.vibe}
                  </span>
                  <span className="font-medium" style={{ color: "#1C3A2F" }}>{nVibe}</span>
                </div>
                <div className="flex flex-col py-1.5">
                  <span className="text-gray-500 font-light mb-1 flex items-center gap-1.5">
                    <ThumbsUp size={13} className="text-[#C9A84C]" /> {trans.bestFor}
                  </span>
                  <span className="font-medium leading-relaxed" style={{ color: "#1C3A2F" }}>{nBestFor}</span>
                </div>
              </div>
            </div>

            {/* Column 2: LIFESTYLE & VIBE (lifestyle-col) */}
            <div className="flex flex-col gap-4 text-left lifestyle-col md:h-full">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                {trans.lifestyleVibe}
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 font-light md:hidden">
                {nLifestyleDesc}
              </p>
              <p className="text-xs md:text-sm leading-relaxed text-gray-600 font-light hidden md:block">
                {nLifestyleDesc}
              </p>
              
              {/* Vibe cards row */}
              <div className="flex overflow-x-auto no-scrollbar gap-3 mt-2 md:mt-auto -mx-4 px-4 scroll-smooth md:grid md:grid-cols-4 md:mx-0 md:px-0">
                {nVibeCards.map((card) => (
                  <div
                    key={card.title}
                    className="relative rounded-xl overflow-hidden shadow-sm aspect-[4/3] group cursor-pointer w-[160px] min-w-[160px] flex-shrink-0 md:w-auto md:min-w-0 md:flex-shrink"
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes("/images/lifestyles/")) {
                          // Fallback to Unsplash images matching the card type if the local custom image doesn't exist yet
                          if (card.title.toLowerCase().includes("cafe")) {
                            target.src = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&q=80";
                          } else if (card.title.toLowerCase().includes("dining")) {
                            target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&q=80";
                          } else if (card.title.toLowerCase().includes("nightlife")) {
                            target.src = "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&auto=format&q=80";
                          } else {
                            target.src = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&q=80";
                          }
                        }
                      }}
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
            <div className="flex flex-col gap-4 text-left w-full love-map-col md:h-full">
              <h3 className="text-xs font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                {trans.whyPeopleLove.replace("{name}", nName)}
              </h3>
              <div className="love-map-grid gap-6 w-full items-stretch md:h-full md:flex-1">
                <ul className="flex flex-col gap-2.5 text-xs text-gray-600 font-light pl-0 list-none">
                  {nPros.map((pro, index) => (
                    <li
                      key={pro}
                      className={`flex items-start gap-2${index >= 5 ? " hidden md:flex" : ""}`}
                    >
                      <Check size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>

                {/* Dynamic Promo container - Desktop Only */}
                <div className="hidden md:flex w-full flex-col gap-2 md:justify-center">
                  {/* Looking for a place promo box - Desktop Only */}
                  <div className="bg-[#FAF8F3] p-6 rounded-3xl border border-[#EDE8DF] flex flex-col gap-3 text-left">
                    <h4 className="text-sm font-bold text-[#1C3A2F] m-0">{trans.lookingForPlace.replace("{name}", nName)}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-light font-sans m-0">
                      {trans.promoDesc.replace("{name}", nName)}
                    </p>
                    <a
                      href="#properties-section"
                      className="text-xs font-bold text-[#C9A84C] hover:text-[#1C3A2F] transition-colors no-underline"
                    >
                      {trans.viewListings}
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* ── FEATURED PROPERTIES ROW ── */}
      {displayProperties.length > 0 ? (
        <section id="properties-section" className="w-full px-4 md:px-8 mt-12 text-left">
          <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-5">
            {/* Header row */}
            <div className="flex items-end justify-between border-b border-[#EDE8DF] pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                  {trans.featuredProperties.replace("{name}", nName)}
                </span>
                <h2 className="text-xl md:text-2xl font-bold leading-tight mt-0.5 section-heading" style={{ color: "#1C3A2F" }}>
                  {trans.condosRentals}
                </h2>
              </div>
              <a
                href={`/explore?area=${neighborhood.name}`}
                className="text-[12px] font-semibold no-underline pb-px transition-colors duration-150 flex items-center gap-1 hover:text-[#C9A84C]"
                style={{ color: "#1C3A2F" }}
              >
                {trans.viewAllProperties}
              </a>
            </div>

            {/* Properties Grid / Scroll Container */}
            <div
              className="properties-container no-scrollbar"
              data-count={Math.min(displayProperties.length, 8)}
            >
              {displayProperties.slice(0, 8).map((prop) => {
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
                      className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-none shadow-md cursor-pointer transition-colors"
                      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                    >
                      <Heart
                        size={15}
                        className={isSaved ? "fill-[#E11D48] text-[#E11D48]" : "text-white"}
                      />
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
                        {stripEmojis(prop.name)}
                      </div>
                      <div className="text-[8.5px] md:text-[10px] opacity-70 font-light flex items-center gap-1 md:gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                        <span className="inline-flex items-center gap-1"><Bed className="w-3 h-3" /> {prop.bedrooms === 0 ? t.property.studio : `${prop.bedrooms} Bed`}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><ShowerHead className="w-3 h-3" /> {prop.bathrooms} Bath</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><Maximize2 className="w-3 h-3" /> {prop.sqm} m²</span>
                        {prop.transit && prop.transit[0] && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1"><TrainFront className="w-3 h-3" /> {prop.transit[0].replace("BTS", "").replace("min walk", "").trim()} min</span>
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
      ) : (
        <section id="properties-section" className="w-full px-4 md:px-8 mt-12 text-left">
          <div className="w-full max-w-[1440px] mx-auto p-8 rounded-2xl border border-dashed border-[#EDE8DF] bg-[#FAFAF9] flex flex-col items-center justify-center text-center">
            <div className="text-[#C9A84C] mb-3">
              <Home size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-[#1C3A2F] mb-1">{trans.noListings}</h3>
            <p className="text-xs text-gray-500 max-w-sm">{trans.noListingsDesc}</p>
          </div>
        </section>
      )}

      {/* ── LOCAL GUIDE TO AREA ROW ── */}
      <section className="w-full px-4 md:px-8 mt-12 text-left">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-5">
          {/* Header row */}
          <div className="flex items-end justify-between border-b border-[#EDE8DF] pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "#C9A84C" }}>
                {trans.localGuideTo.replace("{name}", nName)}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-tight mt-0.5 section-heading" style={{ color: "#1C3A2F" }}>
                {trans.guidesArticles}
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-[12px] font-semibold no-underline pb-px transition-colors duration-150 hover:text-[#C9A84C]"
              style={{ color: "#1C3A2F" }}
            >
              {trans.viewAllGuides}
            </Link>
          </div>

          {/* Guides horizontal scroll */}
          <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 -mx-4 px-4 md:-mx-0 md:px-0">
            {localGuides.map((item, idx) => {
              if (item.isLongFormSection) {
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedLongFormSection(item.sectionIndex)}
                    className="w-[200px] min-w-[200px] md:w-[220px] md:min-w-[220px] flex flex-col rounded-2xl overflow-hidden shadow-sm border group hover:shadow-md transition-shadow no-underline text-left cursor-pointer p-0"
                    style={{ background: "#FFFFFF", borderColor: "#EDE8DF" }}
                  >
                    {/* Image */}
                    <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {/* Text Content */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 w-full box-border">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8.5px] font-bold tracking-wider uppercase text-[#C9A84C]">
                          {item.category}
                        </span>
                        <h4 className="text-[12.5px] font-bold leading-snug line-clamp-2 text-gray-800 group-hover:text-[#C9A84C] transition-colors m-0">
                          {item.title}
                        </h4>
                      </div>
                      <div className="text-[9.5px] text-gray-400 font-light">
                        {item.readTime}
                      </div>
                    </div>
                  </button>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={`/blog/${item.slug}`}
                  className="w-[200px] min-w-[200px] md:w-[220px] md:min-w-[220px] flex flex-col rounded-2xl overflow-hidden shadow-sm border group hover:shadow-md transition-shadow no-underline text-left"
                  style={{ background: "#FFFFFF", borderColor: "#EDE8DF" }}
                >
                  {/* Image */}
                  <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {/* Text Content */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8.5px] font-bold tracking-wider uppercase text-[#C9A84C]">
                        {item.category}
                      </span>
                      <h4 className="text-[12.5px] font-bold leading-snug line-clamp-2 text-gray-800 group-hover:text-[#C9A84C]">
                        {item.title}
                      </h4>
                    </div>
                    <div className="text-[9.5px] text-gray-400 font-light">
                      {item.readTime}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/* ── NEARBY NEIGHBORHOODS CROSS-LINKS ── */}
      {nearbyNeighborhoods.length > 0 && (
        <section className="w-full px-4 md:px-8 mt-6 text-left mb-8">
          <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6">
            <div className="border-b border-[#EDE8DF] pb-3">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#C9A84C]">
                {trans.exploreBangkok}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-tight mt-0.5 section-heading" style={{ color: "#1C3A2F" }}>
                {trans.nearbyNeighborhoods}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyNeighborhoods.map((n) => {
                const nTrans = trans.neighborhoods[n.slug.toLowerCase() as keyof typeof trans.neighborhoods];
                return (
                  <Link
                    key={n.slug}
                    href={`/neighborhood/${n.slug}`}
                    className="flex flex-col rounded-2xl overflow-hidden shadow-sm border border-[#EDE8DF] group hover:shadow-md transition-shadow no-underline text-left bg-white"
                  >
                    <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100 relative">
                      <img
                        src={n.heroImage}
                        alt={nTrans?.name || n.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex flex-col gap-1 flex-grow">
                      <h4 className="text-sm font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] transition-colors">
                        {nTrans?.name || n.name}
                      </h4>
                      <p className="text-xs text-[#C9A84C] italic mb-1">
                        {nTrans?.personality || n.personality}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {nTrans?.description || n.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── EXPAT GUIDE CHAPTER READER MODAL ── */}
      {selectedLongFormSection !== null && guide && guide.longFormSections[selectedLongFormSection] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
          onClick={() => setSelectedLongFormSection(null)}
        >
          <div
            className="w-full max-w-[650px] max-h-[85vh] rounded-3xl bg-white shadow-2xl p-6 md:p-8 flex flex-col gap-4 relative animate-scale-up overflow-y-auto border border-[#EDE8DF]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            {(() => {
              const transSection = transN?.guides?.[selectedLongFormSection];
              const modalHeading = transSection?.heading || guide.longFormSections[selectedLongFormSection].heading;
              const modalParagraphs = transSection?.paragraphs || guide.longFormSections[selectedLongFormSection].paragraphs;
              return (
                <>
                  <div className="flex justify-between items-start pb-4 border-b border-[#EDE8DF] text-left w-full">
                    <div className="pr-8">
                      <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#C9A84C]">
                        {trans.expertInsights.replace("{name}", nName)}
                      </span>
                      <h3 className="font-bold text-xl md:text-2xl mt-1 leading-snug" style={{ color: "#1C3A2F", fontFamily: "Georgia, serif" }}>
                        {modalHeading}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedLongFormSection(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center border-none text-sm cursor-pointer hover:bg-[#EDE8DF]/50 transition-colors flex-shrink-0"
                      style={{ background: "#EDE8DF", color: "#1C3A2F" }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Paragraph content */}
                  <div className="flex flex-col gap-4 text-gray-700 leading-relaxed text-sm md:text-base font-light text-left my-2">
                    {modalParagraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-gray-600 m-0">
                        {p}
                      </p>
                    ))}
                  </div>
                  
                  {/* Footer / close button */}
                  <div className="pt-4 border-t border-[#EDE8DF] flex justify-end w-full">
                    <button
                      onClick={() => setSelectedLongFormSection(null)}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-colors border-none"
                      style={{ background: "#1C3A2F", color: "#FFFFFF" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#2A5243")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#1C3A2F")}
                    >
                      {trans.closeReader}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

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
          .property-card-item:nth-child(n+9) {
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
          .properties-container {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            grid-auto-rows: 240px !important;
            grid-template-rows: none !important;
            grid-auto-flow: row !important;
            height: auto !important;
            overflow-x: hidden !important;
            gap: 16px !important;
            padding-bottom: 0 !important;
          }
          /* Collapse to 1 row when 4 or fewer properties */
          .properties-container[data-count="1"],
          .properties-container[data-count="2"],
          .properties-container[data-count="3"],
          .properties-container[data-count="4"] {
            grid-template-rows: 240px !important;
            grid-auto-rows: 0px !important;
            max-height: 240px !important;
            overflow: hidden !important;
          }
          .property-card-item {
            width: 100% !important;
            min-width: 0 !important;
            height: 240px !important;
          }
          .property-card-item:nth-child(n+9) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
