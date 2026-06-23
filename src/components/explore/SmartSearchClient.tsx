"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { PropertyCard } from "@/types/property";
import { NEIGHBORHOODS, Neighborhood } from "@/data/neighborhoods";
import SmartPropertyCard from "./SmartPropertyCard";
import { Search, Map, AlertCircle, Save } from "lucide-react";

const MapComponent = dynamic(() => import("./SmartMapComponent"), { ssr: false });

interface Props {
  properties: PropertyCard[];
}

interface ParsedRequirements {
  area: string | null;
  petFriendly: "Yes" | "No" | "Not Specified";
  nearBts: "Walking Distance" | "Yes" | "No" | "Not Specified";
  propertyType: string;
  budget: number | null;
  lifestyle: string;
  bedrooms: number | null;
  amenities: string[];
}

// Similar neighborhoods data for "You Might Also Like"
const SIMILAR_NEIGHBORHOODS: Record<string, { name: string; why: string }[]> = {
  "On Nut": [
    { name: "Phra Khanong", why: "Similar laid-back lifestyle, BTS access, and excellent rental value." },
    { name: "Bang Chak", why: "Just one stop further, quieter local residential vibe, and cheaper rentals." },
    { name: "Ekkamai", why: "A few stops north, richer cafe culture and premium expat amenities." }
  ],
  "Ari": [
    { name: "Phaya Thai", why: "Excellent transit hub connecting BTS and Airport Link, student-friendly." },
    { name: "Huai Khwang", why: "MRT connection, Chinatown food strip, highly affordable condo rents." },
    { name: "Rama 9", why: "High-rise CBD living, great coworking access, and modern apartments." }
  ],
  "Thong Lo": [
    { name: "Ekkamai", why: "Directly adjacent, quieter residential tree-lined streets, craft beer hubs." },
    { name: "Phrom Phong", why: "One stop away, Japanese expat supermarkets, luxury malls, and park." },
    { name: "Sukhumvit", why: "Phrom Phong area core expat living, highly walkable, upscale environment." }
  ],
  "Sukhumvit": [
    { name: "Thong Lo", why: "Elite nightlife, premium cafes, and trendy boutique community malls." },
    { name: "Ekkamai", why: "Slightly quieter, boutique shops, and very pet-friendly condos." },
    { name: "Asok", why: "Core transit intersection (BTS/MRT), office hub, and Terminal 21 mall." }
  ],
  "Sathorn": [
    { name: "Silom", why: "Adjacent business district, Patpong entertainment, and Lumpini Park access." },
    { name: "Sukhumvit", why: "Global expat strip with superior western food options and family malls." },
    { name: "Rama 9", why: "Modern city commuter lifestyle with new, budget-friendly high-rises." }
  ]
};

const DEFAULT_RECOMMENDATIONS = [
  { name: "Ari", why: "Trendy creative zone with tree-lined streets, cafes, and great walkability." },
  { name: "On Nut", why: "Extremely popular expat area offering excellent value near the BTS." },
  { name: "Thong Lo", why: "Bangkok's premium lifestyle district featuring world-class dining and bars." }
];

// Helper row for Neighborhood ratings
const RatingRow = ({ label, score }: { label: string; score: number }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="flex justify-between text-[11px] font-bold text-gray-700 uppercase tracking-wide">
      <span>{label}</span>
      <span className="text-[#C9A84C]">{score}/10</span>
    </div>
    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-[#1C3A2F]" style={{ width: `${score * 10}%` }} />
    </div>
  </div>
);

export default function SmartSearchClient({ properties }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const initialQuery = searchParams.get("q") || "";

  // State Management
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<"best" | "low_price" | "high_price" | "newest" | "closest_bts">("best");
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSavingSearch, setIsSavingSearch] = useState(false);

  const handleSaveSearchClick = async () => {
    if (!session?.user?.email) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setIsSavingSearch(true);
    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: activeQuery,
          filters: parsed,
        }),
      });

      if (res.ok) {
        setToastMessage("✓ Search saved to your dashboard!");
        setTimeout(() => setToastMessage(""), 3000);
      } else {
        setToastMessage("Failed to save search.");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch {
      setToastMessage("Error saving search.");
      setTimeout(() => setToastMessage(""), 3000);
    } finally {
      setIsSavingSearch(false);
    }
  };

  // Handle suggested chips click
  const handleChipClick = (queryText: string) => {
    setSearchInput(queryText);
    setActiveQuery(queryText);
  };

  // Perform search submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveQuery(searchInput);
  };

  // Natural Language Parsing Logic
  const parsed = useMemo<ParsedRequirements>(() => {
    const q = activeQuery.toLowerCase();
    if (!q) {
      return {
        area: null,
        petFriendly: "Not Specified",
        nearBts: "Not Specified",
        propertyType: "Condo / Apartment",
        budget: null,
        lifestyle: "Not Specified",
        bedrooms: null,
        amenities: [],
      };
    }

    // Area Detection
    let area: string | null = null;
    if (q.includes("other") || q.includes("พื้นที่อื่น") || q.includes("其他地区") || q.includes("其他区域")) {
      area = "Other";
    } else {
      const uniqueAreas = Array.from(new Set(properties.map((p) => p.area).filter(Boolean)));
      const aliases: Record<string, string[]> = {
        "On Nut": ["onnut"],
        "Thong Lo": ["thonglo"],
        "Bang Na": ["bangna"],
        "Rama 9": ["rama9", "ratchada"],
        "Huai Khwang": ["huaikhwang"],
        "Phaya Thai": ["phayathai"],
        "Chatuchak": ["chatuchak", "jatujak"],
        "Rama 4": ["rama4"],
        "Sukhumvit": ["phrom phong", "phromphong", "ekkamai"],
      };

      const sortedAreas = [...uniqueAreas].sort((a, b) => b.length - a.length);

      for (const areaName of sortedAreas) {
        const lowerName = areaName.toLowerCase();
        if (q.includes(lowerName)) {
          area = areaName;
          break;
        }
        const areaAliases = aliases[areaName] || [];
        if (areaAliases.some(alias => q.includes(alias))) {
          area = areaName;
          break;
        }
      }
    }

    // Pet Friendly
    let petFriendly: "Yes" | "No" | "Not Specified" = "Not Specified";
    if (q.includes("pet") || q.includes("dog") || q.includes("cat") || q.includes("animal")) {
      petFriendly = "Yes";
    }

    // Near BTS
    let nearBts: "Walking Distance" | "Yes" | "No" | "Not Specified" = "Not Specified";
    if (
      q.includes("bts") ||
      q.includes("mrt") ||
      q.includes("train") ||
      q.includes("transit") ||
      q.includes("station") ||
      q.includes("walkable") ||
      q.includes("walk to")
    ) {
      nearBts = "Walking Distance";
    }

    // Property Type
    let propertyType = "Condo / Apartment";
    if (q.includes("condo")) propertyType = "Condo";
    else if (q.includes("apartment")) propertyType = "Apartment";
    else if (q.includes("house")) propertyType = "House";
    else if (q.includes("villa")) propertyType = "Villa";
    else if (q.includes("townhouse")) propertyType = "Townhouse";
    else if (q.includes("studio")) propertyType = "Studio";

    // Budget
    let budget: number | null = null;
    const kMatch = q.match(/(?:under|below|max|maximum|budget|price|limit|\<)\s*(\d+)\s*k/i);
    if (kMatch) {
      budget = parseInt(kMatch[1]) * 1000;
    } else {
      const numMatch = q.match(/(?:under|below|max|maximum|budget|price|limit|\<)\s*([\d,]+)\s*(?:baht|thb)?/i);
      if (numMatch) {
        budget = parseInt(numMatch[1].replace(/,/g, ""));
      }
    }

    // Lifestyle
    let lifestyle = "Not Specified";
    const lifestyles: string[] = [];
    if (q.includes("remote") || q.includes("work") || q.includes("freelance")) lifestyles.push("Remote Work");
    if (q.includes("cafe") || q.includes("coffee") || q.includes("brunch")) lifestyles.push("Cafe Culture");
    if (q.includes("school") || q.includes("family") || q.includes("kids")) lifestyles.push("Family & School Proximity");
    if (q.includes("luxury") || q.includes("penthouse") || q.includes("view") || q.includes("views"))
      lifestyles.push("Luxury Lifestyle");
    if (q.includes("pool") || q.includes("gym") || q.includes("fitness")) lifestyles.push("Wellness & Fitness");
    if (q.includes("nightlife") || q.includes("bars") || q.includes("clubs")) lifestyles.push("Nightlife");

    if (lifestyles.length > 0) {
      lifestyle = lifestyles.join(" & ");
    }

    // Bedrooms
    let bedrooms: number | null = null;
    const bedMatch = q.match(/(\d+)\s*(?:bed|br|bedroom)/i);
    if (bedMatch) {
      bedrooms = parseInt(bedMatch[1]);
    } else if (q.includes("studio")) {
      bedrooms = 0;
    } else if (q.includes("one bed")) {
      bedrooms = 1;
    } else if (q.includes("two bed")) {
      bedrooms = 2;
    } else if (q.includes("three bed")) {
      bedrooms = 3;
    }

    // Amenities
    const amenities: string[] = [];
    if (q.includes("pool")) amenities.push("pool");
    if (q.includes("gym") || q.includes("fitness")) amenities.push("gym");
    if (q.includes("security")) amenities.push("security");
    if (q.includes("parking")) amenities.push("parking");
    if (q.includes("garden")) amenities.push("garden");
    if (q.includes("sauna")) amenities.push("sauna");
    if (q.includes("cowork") || q.includes("co-work")) amenities.push("coworking");

    return { area, petFriendly, nearBts, propertyType, budget, lifestyle, bedrooms, amenities };
  }, [activeQuery, properties]);

  // Scoring Logic & Item Formatting
  const scoredProperties = useMemo(() => {
    return properties.map((property) => {
      let score = 100;
      const reasons: string[] = [];

      // 1. Area matching
      if (parsed.area) {
        if (property.area.toLowerCase() === parsed.area.toLowerCase()) {
          reasons.push(`Located in your target area: ${property.area}`);
        } else {
          // Check if adjacent
          const nearby: Record<string, string[]> = {
            "On Nut": ["Sukhumvit", "Ekkamai"],
            "Sukhumvit": ["Thong Lo", "Ekkamai", "Asok"],
            "Thong Lo": ["Ekkamai", "Sukhumvit"],
            "Asok": ["Sukhumvit", "Rama 9"],
            "Silom": ["Sathorn"],
            "Sathorn": ["Silom"],
            "Ari": ["Phaya Thai"],
            "Phaya Thai": ["Ari"],
            "Ekkamai": ["Thong Lo", "On Nut"],
            "Rama 9": ["Asok", "Huai Khwang"],
            "Huai Khwang": ["Rama 9"],
            "Bang Na": ["On Nut"],
          };
          const similar = nearby[parsed.area] || [];
          if (similar.some((s) => property.area.toLowerCase() === s.toLowerCase())) {
            score -= 30; // Deduct more for adjacent areas so they rank lower
            reasons.push(`Located in adjacent high-value area: ${property.area}`);
          } else {
            score -= 60; // Unrelated location gets heavy deduction, dropping it below threshold
          }
        }
      }

      // 2. Property Type matching
      if (parsed.propertyType && parsed.propertyType !== "Condo / Apartment") {
        if (property.propertyType.toLowerCase() === parsed.propertyType.toLowerCase()) {
          reasons.push(`Matches preferred type: ${parsed.propertyType}`);
        } else {
          score -= 45; // Penalize mismatched property types (e.g. house vs condo)
        }
      }

      // 3. Bedrooms matching
      if (parsed.bedrooms !== null) {
        if (property.bedrooms === parsed.bedrooms) {
          reasons.push(`Matches room count: ${parsed.bedrooms} Bed`);
        } else {
          score -= 45; // Penalize mismatched bedroom counts
        }
      }

      // 4. Pet Friendly matching
      if (parsed.petFriendly === "Yes") {
        if (property.petFriendly) {
          reasons.push("Pet-friendly condominium building");
        } else {
          score -= 50; // Heavy penalty for non-pet-friendly listings
        }
      }

      // 5. Budget matching
      if (parsed.budget) {
        if (property.priceTHB <= parsed.budget) {
          reasons.push(`Within your budget of ฿${parsed.budget.toLocaleString()}`);
        } else if (property.priceTHB <= parsed.budget * 1.15) {
          score -= 20;
          reasons.push(`Slightly above budget (+15% buffer)`);
        } else {
          score -= 50; // Exceeding budget gets heavily penalized
        }
      }

      // 6. Transit matching
      if (parsed.nearBts === "Walking Distance") {
        if (property.nearBts) {
          const walk = property.btsWalkMin || property.mrtWalkMin || 5;
          const station = property.btsStation || property.mrtStation || "BTS";
          reasons.push(`${walk} min walk to ${station} station`);
        } else {
          score -= 15;
        }
      }

      // 7. Amenities matching
      if (parsed.amenities.length > 0) {
        parsed.amenities.forEach((amenity) => {
          let hasAmenity = false;
          const propAmenities = property.amenities || [];
          if (amenity === "pool") {
            hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("pool"));
            if (hasAmenity) reasons.push("Features a swimming pool");
          } else if (amenity === "gym") {
            hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("gym") || a.toLowerCase().includes("fitness"));
            if (hasAmenity) reasons.push("Equipped with fitness center/gym");
          } else if (amenity === "security") {
            hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("security"));
            if (hasAmenity) reasons.push("24h security protection");
          } else if (amenity === "parking") {
            hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("parking") || a.toLowerCase().includes("garage"));
            if (hasAmenity) reasons.push("Includes resident parking");
          } else if (amenity === "garden") {
            hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("garden"));
            if (hasAmenity) reasons.push("Features shared gardens");
          } else if (amenity === "sauna") {
            hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("sauna") || a.toLowerCase().includes("jacuzzi"));
            if (hasAmenity) reasons.push("Access to sauna/jacuzzi facilities");
          } else if (amenity === "coworking") {
            hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("cowork") || a.toLowerCase().includes("co-work") || a.toLowerCase().includes("space"));
            if (hasAmenity) reasons.push("Includes on-site co-working spaces");
          }

          if (!hasAmenity) {
            score -= 15; // Deduct per missing requested amenity
          }
        });
      }

      // Add default if empty
      if (reasons.length === 0) {
        reasons.push("General lifestyle match in Bangkok");
      }

      // Name-matching boost
      let matchesName = false;
      if (activeQuery) {
        const queryClean = activeQuery.toLowerCase().replace(/condo|apartment|house|villa|townhouse/g, "").trim();
        const propNameClean = property.name.toLowerCase();
        
        // If the query contains the property name, or the property name contains the query (min 3 chars)
        if (queryClean.length >= 3 && (propNameClean.includes(queryClean) || queryClean.includes(propNameClean))) {
          matchesName = true;
          reasons.unshift(`Matches property name: "${property.name}"`);
        } else {
          // Check if key words from property name are in the query
          const nameWords = propNameClean.split(/\s+/).filter(w => w.length > 2 && w !== "the" && w !== "condo");
          const queryWords = queryClean.split(/\s+/).filter(w => w.length > 2);
          const matchingWords = nameWords.filter(w => queryClean.includes(w) || queryWords.some(qw => qw.includes(w) || w.includes(qw)));
          
          if (matchingWords.length >= 2 || (nameWords.length === 1 && matchingWords.length === 1 && nameWords[0] === queryWords[0])) {
            matchesName = true;
            reasons.unshift(`Matches property name: "${property.name}"`);
          }
        }
      }

      if (matchesName) {
        score = Math.max(50, Math.min(99, score)) + 100;
      } else {
        score = Math.max(50, Math.min(99, score));
      }

      return {
        property,
        score,
        reasons,
      };
    });
  }, [properties, parsed, activeQuery]);

  // Filters & Sorting logic
  const filteredAndSortedProperties = useMemo(() => {
    let items = [...scoredProperties];

    if (activeQuery) {
      // Apply strict filtering
      items = items.filter((item) => {
        // If it matches by name, bypass standard strict filters to show it
        if (item.score >= 150) {
          return true;
        }

        const p = item.property;

        // 1. Area matching (strict)
        if (parsed.area) {
          if (p.area.toLowerCase() !== parsed.area.toLowerCase()) {
            return false;
          }
        }

        // 2. Property Type matching (strict)
        if (parsed.propertyType && parsed.propertyType !== "Condo / Apartment") {
          if (p.propertyType.toLowerCase() !== parsed.propertyType.toLowerCase()) {
            return false;
          }
        }

        // 3. Bedrooms matching (strict)
        if (parsed.bedrooms !== null) {
          if (p.bedrooms !== parsed.bedrooms) {
            return false;
          }
        }

        // 4. Pet Friendly matching (strict)
        if (parsed.petFriendly === "Yes") {
          if (!p.petFriendly) {
            return false;
          }
        }

        // 5. Budget matching (strict)
        if (parsed.budget) {
          if (p.priceTHB > parsed.budget) {
            return false;
          }
        }

        // 6. Near BTS matching (strict)
        if (parsed.nearBts === "Walking Distance") {
          if (!p.nearBts) {
            return false;
          }
        }

        // 7. Amenities matching (strict)
        if (parsed.amenities.length > 0) {
          const propAmenities = p.amenities || [];
          for (const amenity of parsed.amenities) {
            let hasAmenity = false;
            if (amenity === "pool") {
              hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("pool"));
            } else if (amenity === "gym") {
              hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("gym") || a.toLowerCase().includes("fitness"));
            } else if (amenity === "security") {
              hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("security"));
            } else if (amenity === "parking") {
              hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("parking") || a.toLowerCase().includes("garage"));
            } else if (amenity === "garden") {
              hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("garden"));
            } else if (amenity === "sauna") {
              hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("sauna") || a.toLowerCase().includes("jacuzzi"));
            } else if (amenity === "coworking") {
              hasAmenity = propAmenities.some((a) => a.toLowerCase().includes("cowork") || a.toLowerCase().includes("co-work") || a.toLowerCase().includes("space"));
            }
            if (!hasAmenity) {
              return false;
            }
          }
        }

        return true;
      });
    }

    // Sort items
    items.sort((a, b) => {
      if (sortBy === "best") {
        return b.score - a.score;
      }
      if (sortBy === "low_price") {
        return a.property.priceTHB - b.property.priceTHB;
      }
      if (sortBy === "high_price") {
        return b.property.priceTHB - a.property.priceTHB;
      }
      if (sortBy === "newest") {
        const dateA = new Date(a.property.createdAt).getTime();
        const dateB = new Date(b.property.createdAt).getTime();
        return dateB - dateA;
      }
      if (sortBy === "closest_bts") {
        // Properties near BTS first
        const btsA = a.property.nearBts ? 1 : 0;
        const btsB = b.property.nearBts ? 1 : 0;
        if (btsA !== btsB) return btsB - btsA;
        // tie-breaker: closest walk min
        const walkA = a.property.btsWalkMin || 99;
        const walkB = b.property.btsWalkMin || 99;
        return walkA - walkB;
      }
      return 0;
    });

    return items;
  }, [scoredProperties, sortBy, activeQuery, parsed]);

  // Scores map for Map Component
  const propertyScores = useMemo(() => {
    const scoresMap: Record<number, number> = {};
    scoredProperties.forEach((item) => {
      scoresMap[item.property.id] = item.score;
    });
    return scoresMap;
  }, [scoredProperties]);

  // Get detected neighborhood model for Insight Card
  const detectedNeighborhood = useMemo<Neighborhood | null>(() => {
    if (!parsed.area) return null;
    return NEIGHBORHOODS.find((n) => n.name.toLowerCase() === parsed.area!.toLowerCase()) || null;
  }, [parsed.area]);

  // Recommendations
  const recommendations = useMemo(() => {
    if (parsed.area && SIMILAR_NEIGHBORHOODS[parsed.area]) {
      return SIMILAR_NEIGHBORHOODS[parsed.area];
    }
    return DEFAULT_RECOMMENDATIONS;
  }, [parsed.area]);



  const editSearchButtonHandler = () => {
    const el = document.getElementById("smart-search-input");
    if (el) el.focus();
  };



  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-8 flex flex-col gap-5 sm:gap-8">
      {/* ── TOP SECTION: NLP Search Input ── */}
      <div className="flex flex-col gap-3 w-full bg-[#1C3A2F] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl text-[#F7F3EC]">
        <span className="text-[10px] font-bold uppercase tracking-[3px] text-[#C9A84C]">
          <span className="hidden sm:inline">Premium AI Concierge Search</span>
          <span className="inline sm:hidden">Premium Smart Search</span>
        </span>
        <h2 className="text-sm sm:text-lg lg:text-3xl font-bold font-outfit truncate w-full block" style={{ letterSpacing: "-0.5px" }}>
          Describe your perfect Bangkok home
        </h2>

        <form onSubmit={handleSearchSubmit} className="flex flex-row items-center gap-2 mt-2 w-full max-w-[700px]">
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center px-3 py-2.5 sm:px-4 sm:py-3">
            <Search size={16} className="text-[#C9A84C] mr-2 sm:mr-3 flex-shrink-0" />
            <input
              id="smart-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="I'm looking for a pet-friendly condo in On Nut near BTS under 35,000 baht."
              className="bg-transparent border-none outline-none text-[16px] lg:text-[13.5px] w-full placeholder-white/50 font-sans"
              style={{ color: "#F7F3EC", WebkitTextFillColor: "#F7F3EC" }}
            />
          </div>
          <button
            type="submit"
            className="bg-[#C9A84C] hover:bg-[#D4B665] text-[#1C3A2F] font-bold px-3.5 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl border-none cursor-pointer transition-colors text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap shadow-md active:scale-95"
          >
            Find Matches
          </button>
        </form>

        {/* Suggested Searches chips */}
        <div className="flex flex-row sm:flex-wrap gap-1.5 sm:gap-2 items-center mt-3 overflow-x-auto sm:overflow-x-visible no-scrollbar pb-1 sm:pb-0 w-full">
          <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium whitespace-nowrap">Try searching:</span>
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
              onClick={() => handleChipClick(chip)}
              type="button"
              className="text-[10px] sm:text-[11px] px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-white/10 text-[#E2C97E] hover:bg-white/5 cursor-pointer transition-colors whitespace-nowrap flex-shrink-0"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN (Sidebar) ── */}
        <div className="lg:col-span-3 order-2 lg:order-1 lg:sticky lg:bottom-6 lg:self-end w-full bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden flex flex-col">
          {/* Section 1: Your Search Understood */}
          <div className="hidden lg:flex p-5 flex-col gap-4">
            {/* Desktop View Title */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="font-bold text-[14px] text-[#1C3A2F] uppercase tracking-wider">
                Your Search Understood
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-1 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Area:</span>
                <span className="font-bold text-[#1C3A2F]">{parsed.area || "Bangkok (Any)"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Pet Friendly:</span>
                <span className="font-bold text-[#1C3A2F]">
                  {parsed.petFriendly === "Yes" ? "✓ Yes" : "Not Specified"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Near BTS:</span>
                <span className="font-bold text-[#1C3A2F]">
                  {parsed.nearBts === "Walking Distance" ? "✓ Walking Distance" : "Not Specified"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Property Type:</span>
                <span className="font-bold text-[#1C3A2F]">{parsed.propertyType}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Budget:</span>
                <span className="font-bold text-[#1C3A2F]">
                  {parsed.budget ? `Under ฿${parsed.budget.toLocaleString()}` : "Not Specified"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold">Lifestyle:</span>
                <span className="font-bold text-[#1C3A2F]">{parsed.lifestyle}</span>
              </div>

              <button
                onClick={editSearchButtonHandler}
                className="mt-3 w-full py-2.5 rounded-xl border border-[#C9A84C] text-[#C9A84C] font-bold text-xs uppercase tracking-wider bg-transparent hover:bg-amber-50 cursor-pointer transition-colors active:scale-95"
              >
                Edit Search
              </button>
            </div>
          </div>

          {/* Divider between Section 1 and Section 2: Only visible on desktop */}
          <div className="hidden lg:block border-t border-[#E5E0D8]" />

          {/* Section 2: Neighborhood Insight */}
          {detectedNeighborhood ? (
            <div className="hidden lg:flex p-5 flex-col gap-4 animate-fadeIn">
              <div className="pb-2 border-b border-gray-100">
                <span className="font-bold text-[14px] text-[#1C3A2F] uppercase tracking-wider block">
                  About {detectedNeighborhood.name}
                </span>
              </div>

              <p className="text-[12px] text-gray-500 leading-relaxed font-light font-outfit">
                {detectedNeighborhood.description}
              </p>

              <div className="flex flex-col gap-3 mt-1">
                <RatingRow label="BTS Access" score={detectedNeighborhood.scores.walkability} />
                <RatingRow label="Walkability" score={detectedNeighborhood.scores.walkability} />
                <RatingRow label="Cafe Culture" score={detectedNeighborhood.scores.cafeCulture} />
                <RatingRow label="Nightlife" score={detectedNeighborhood.scores.nightlife} />
                <RatingRow label="Community Feel" score={detectedNeighborhood.scores.expatCommunity} />
              </div>

              <div className="mt-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block mb-2">
                  Good For:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detectedNeighborhood.residentTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="text-[10.5px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex p-5 flex-col gap-3">
              <span className="font-bold text-[14px] text-[#1C3A2F] uppercase tracking-wider pb-2 border-b border-gray-100">
                Neighborhood Insight
              </span>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Enter a search query specifying a target neighborhood (e.g. &quot;On Nut&quot;) to see customized local insights, ratings, and lifestyle recommendations.
              </p>
            </div>
          )}

          {/* Divider between Section 2 and Section 3 */}
          <div className="border-t border-[#E5E0D8]" />

          {/* Section 3: Explore on Map */}
          <div className="p-5 flex flex-col gap-3 animate-fadeIn">
            <div className="flex justify-between items-center pb-1">
              <span className="font-bold text-[14px] text-[#1C3A2F] uppercase tracking-wider">
                Explore on Map
              </span>
              <button
                onClick={() => setShowMobileMap(true)}
                className="lg:hidden text-xs text-[#C9A84C] font-bold flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <Map size={14} /> Full Map
              </button>
            </div>

            {/* Desktop Map container */}
            <div className="hidden lg:block rounded-xl overflow-hidden h-[300px] border border-gray-200">
              <MapComponent
                properties={filteredAndSortedProperties.map((p) => p.property)}
                scores={propertyScores}
                selectedPropertyId={hoveredPropertyId}
                onSelectProperty={setHoveredPropertyId}
                detectedArea={parsed.area}
              />
            </div>
            <p className="hidden lg:block text-[10.5px] text-gray-400 font-light m-0">
              Hovering property card centers pin. Hovering marker highlights card.
            </p>
          </div>
        </div>

        {/* ── CENTER COLUMN (Main Area - Property Grid) ── */}
        <div className="lg:col-span-9 order-1 lg:order-2 flex flex-col gap-6">
          {/* Mobile-only: Joined Your Search Understood + Match Results Header */}
          <div className="lg:hidden bg-white p-5 rounded-2xl border border-[#E5E0D8] shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="font-bold text-[13px] text-[#1C3A2F] uppercase tracking-wider">
                Your Search Understood
              </span>
              <button
                onClick={editSearchButtonHandler}
                className="text-[11px] font-bold text-[#C9A84C] bg-transparent border-none cursor-pointer uppercase tracking-wider"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Area:</span>
                <span className="font-bold text-[#1C3A2F]">{parsed.area || "Bangkok (Any)"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Property Type:</span>
                <span className="font-bold text-[#1C3A2F]">{parsed.propertyType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Pet Friendly:</span>
                <span className="font-bold text-[#1C3A2F]">
                  {parsed.petFriendly === "Yes" ? "✓ Yes" : "Not Specified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Budget:</span>
                <span className="font-bold text-[#1C3A2F]">
                  {parsed.budget ? `Under ฿${parsed.budget.toLocaleString()}` : "Not Specified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Near BTS:</span>
                <span className="font-bold text-[#1C3A2F]">
                  {parsed.nearBts === "Walking Distance" ? "✓ Yes" : "Not Specified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Lifestyle:</span>
                <span className="font-bold text-[#1C3A2F] truncate max-w-[100px]" title={parsed.lifestyle}>
                  {parsed.lifestyle}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E5E0D8] my-1" />

            {/* Part 2: Matches Found + Sort By */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#1C3A2F]">
                    We found {filteredAndSortedProperties.length} matches
                  </h3>
                  <p className="text-[11px] text-gray-400 font-light mt-0.5">
                    These properties best fit your search parameters.
                  </p>
                </div>
                {activeQuery && (
                  <button
                    onClick={handleSaveSearchClick}
                    disabled={isSavingSearch}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-[#E5E0D8] bg-transparent text-[#1C3A2F] cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-all uppercase tracking-wider"
                    style={{ fontFamily: "inherit" }}
                  >
                    <Save className="w-3.5 h-3.5" /> Save Search
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "best" | "low_price" | "high_price" | "newest" | "closest_bts")}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-white outline-none cursor-pointer focus:border-[#1C3A2F]"
                >
                  <option value="best">Best Match</option>
                  <option value="low_price">Lowest Price</option>
                  <option value="high_price">Highest Price</option>
                  <option value="newest">Newest</option>
                  <option value="closest_bts">Closest to BTS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop-only: Match Results Header */}
          <div className="hidden lg:flex bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-sm flex-row items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-extrabold text-[#1C3A2F]">
                  We found {filteredAndSortedProperties.length} matches
                </h3>
                {activeQuery && (
                  <button
                    onClick={handleSaveSearchClick}
                    disabled={isSavingSearch}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-[#E5E0D8] bg-transparent text-[#1C3A2F] cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-all uppercase tracking-wider"
                    style={{ fontFamily: "inherit" }}
                  >
                    <Save className="w-3.5 h-3.5" /> Save Search
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 font-light mt-0.5">
                These properties best fit your search parameters.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "best" | "low_price" | "high_price" | "newest" | "closest_bts")}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-white outline-none cursor-pointer focus:border-[#1C3A2F]"
              >
                <option value="best">Best Match</option>
                <option value="low_price">Lowest Price</option>
                <option value="high_price">Highest Price</option>
                <option value="newest">Newest</option>
                <option value="closest_bts">Closest to BTS</option>
              </select>
            </div>
          </div>

          {/* Property Grid / List */}
          {filteredAndSortedProperties.length === 0 ? (
            /* Empty State */
            <div className="bg-white p-8 rounded-3xl border border-[#E5E0D8] shadow-sm text-center flex flex-col items-center gap-4 py-12">
              <AlertCircle size={40} className="text-[#C9A84C]" />
              <div className="flex flex-col gap-1.5">
                <span className="font-extrabold text-[#1C3A2F] text-lg">No exact matches found</span>
                <p className="text-xs text-gray-500 max-w-[320px] mx-auto leading-relaxed">
                  Try adjusting your search query parameters or considering one of our alternative recommendations.
                </p>
              </div>

              <div className="mt-2 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100 w-full max-w-[400px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Suggestions:
                </span>
                <ul className="text-xs text-gray-700 flex flex-col gap-2 list-none p-0 m-0">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500">✦</span>
                    <span>Increase budget limit (e.g. &quot;under 60k&quot;)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500">✦</span>
                    <span>Expand acceptable BTS walking distance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500">✦</span>
                    <span>Consider adjacent neighborhoods (e.g. Phra Khanong or Ekkamai)</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredAndSortedProperties.map((item, idx) => (
                <SmartPropertyCard
                  key={item.property.id}
                  property={item.property}
                  score={item.score}
                  matchReasons={item.reasons}
                  index={idx}
                  onHover={(hovered) => {
                    if (hovered) setHoveredPropertyId(item.property.id);
                    else setHoveredPropertyId(null);
                  }}
                  isHighlighted={hoveredPropertyId === item.property.id}
                />
              ))}
            </div>
          )}

          {/* About Neighborhood (Mobile Only) */}
          {detectedNeighborhood && (
            <div className="lg:hidden bg-white p-5 rounded-3xl border border-[#E5E0D8] shadow-sm flex flex-col gap-4 animate-fadeIn">
              <div className="pb-2 border-b border-gray-100">
                <span className="font-bold text-[14px] text-[#1C3A2F] uppercase tracking-wider block">
                  About {detectedNeighborhood.name}
                </span>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed font-light font-outfit">
                {detectedNeighborhood.description}
              </p>
              <div className="flex flex-col gap-3 mt-1">
                <RatingRow label="BTS Access" score={detectedNeighborhood.scores.walkability} />
                <RatingRow label="Walkability" score={detectedNeighborhood.scores.walkability} />
                <RatingRow label="Cafe Culture" score={detectedNeighborhood.scores.cafeCulture} />
                <RatingRow label="Nightlife" score={detectedNeighborhood.scores.nightlife} />
                <RatingRow label="Community Feel" score={detectedNeighborhood.scores.expatCommunity} />
              </div>
              <div className="mt-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block mb-2">
                  Good For:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detectedNeighborhood.residentTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="text-[10.5px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* You Might Also Like section */}
          <div className="bg-[#FAF9F6] p-5 rounded-3xl border border-[#E5E0D8] shadow-sm flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-1.5 pb-2 border-b border-[#EADFCF]">
              <span className="text-sm font-extrabold text-[#1C3A2F] uppercase tracking-wider">
                You Might Also Like
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  onClick={() => handleChipClick(rec.name)}
                  className="bg-white p-4 rounded-2xl border border-[#EDE8DF] hover:border-[#C9A84C] hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-[#1C3A2F]">{rec.name}</span>
                    <span className="text-[10px] text-[#C9A84C] font-semibold">Explore →</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                    {rec.why}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Button for Map Drawer */}
      <button
        onClick={() => setShowMobileMap(true)}
        className="lg:hidden fixed bottom-6 right-6 z-[999] bg-[#1C3A2F] text-[#E2C97E] font-bold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border-none cursor-pointer active:scale-95"
      >
        <Map size={16} /> View Map ({filteredAndSortedProperties.length})
      </button>

      {/* Mobile Bottom Sheet Map Drawer */}
      {showMobileMap && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-slideUp lg:hidden">
          <div className="flex justify-between items-center px-4 py-4 border-b border-[#E5E0D8] bg-[#1C3A2F] text-white">
            <div className="flex items-center gap-2">
              <Map size={16} className="text-[#E2C97E]" />
              <span className="font-bold text-sm uppercase tracking-wider text-[#E2C97E]">Map Explorer</span>
            </div>
            <button
              onClick={() => setShowMobileMap(false)}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 cursor-pointer active:scale-95"
            >
              Close
            </button>
          </div>
          <div className="flex-1 w-full h-full relative">
            <MapComponent
              properties={filteredAndSortedProperties.map((p) => p.property)}
              scores={propertyScores}
              selectedPropertyId={hoveredPropertyId}
              onSelectProperty={(id) => {
                setHoveredPropertyId(id);
                // Highlight the card if visible or scroll to it
                if (id) {
                  const el = document.getElementById(`property-card-${id}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              detectedArea={parsed.area}
            />
          </div>
        </div>
      )}

      {toastMessage && (
        <div
          className="fixed bottom-6 left-6 z-[9999] px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border"
          style={{ background: "#1C3A2F", color: "#E2C97E", borderColor: "#C9A84C" }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
