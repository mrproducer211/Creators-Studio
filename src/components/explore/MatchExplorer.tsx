"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { PropertyCard } from "@/types/property";
import { NEIGHBORHOODS, Neighborhood } from "@/data/neighborhoods";
import ExplorePropertyCard from "./ExplorePropertyCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

interface Props {
  properties: PropertyCard[];
}

interface MatchResult {
  slug: string;
  matchPercentage: number;
  explanation: string;
}

export default function MatchExplorer({ properties }: Props) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Extract all unique listing areas dynamically from properties
  const uniqueAreas = useMemo(() => {
    const areas = new Set<string>();
    properties.forEach((p) => {
      if (p.area) {
        const formattedArea = p.area.trim();
        if (formattedArea) {
          areas.add(formattedArea);
        }
      }
    });
    if (areas.size === 0) {
      return ["Asok", "Sathorn", "Silom", "Sukhumvit", "Thong Lo", "Ekkamai", "Ari", "On Nut"];
    }
    return Array.from(areas).sort();
  }, [properties]);

  // Wizard States
  const [workplace, setWorkplace] = useState<string>("Asok");
  const [budget, setBudget] = useState<number>(50000);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Default workplace fallback if not in uniqueAreas
  useEffect(() => {
    if (uniqueAreas.length > 0 && !uniqueAreas.includes(workplace)) {
      setWorkplace(uniqueAreas[0]);
    }
  }, [uniqueAreas, workplace]);

  // Coordinates helper for workplace
  const getWorkplaceCoords = (workplaceName: string): [number, number] | null => {
    const n = NEIGHBORHOODS.find(item => item.name.toLowerCase() === workplaceName.toLowerCase());
    if (n) return [n.lat, n.lng];
    
    const p = properties.find(item => item.area.toLowerCase() === workplaceName.toLowerCase() && item.latitude && item.longitude);
    if (p && p.latitude && p.longitude) return [Number(p.latitude), Number(p.longitude)];
    
    return null;
  };

  const workplaceCoords = useMemo(() => {
    return getWorkplaceCoords(workplace);
  }, [workplace, properties]);

  // Distance helper
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Commute minutes helper
  const getCommuteMinutes = (n: Neighborhood, workplaceName: string): number => {
    if (n.commuteMinutes && n.commuteMinutes[workplaceName] !== undefined) {
      return n.commuteMinutes[workplaceName];
    }
    const wCoords = workplaceCoords;
    if (wCoords) {
      const [wLat, wLng] = wCoords;
      const dist = getDistance(n.lat, n.lng, wLat, wLng);
      return Math.round(dist * 3.5 + (dist > 0 ? 2 : 0));
    }
    return 15;
  };

  // Match Results
  const [matchedResults, setMatchedResults] = useState<MatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>("asok");

  // Mobile View Toggle
  const [activeTab, setActiveTab] = useState<"form" | "map">("form");

  const matchedSlugs = useMemo(() => matchedResults.map((r) => r.slug), [matchedResults]);

  // Workplace commute threshold (default 20 mins)
  const maxCommute = 20;

  // Selected neighborhood object
  const selectedNeighborhood = useMemo(() => {
    return NEIGHBORHOODS.find((n) => n.slug === selectedSlug) || NEIGHBORHOODS[0];
  }, [selectedSlug]);

  // Filter properties by selected neighborhood
  const recommendedCondos = useMemo(() => {
    if (!selectedNeighborhood) return [];
    return properties
      .filter((p) => p.area.toLowerCase() === selectedNeighborhood.name.toLowerCase())
      .slice(0, 4);
  }, [selectedNeighborhood, properties]);

  // Default initial matches
  useEffect(() => {
    // Set default initial matches on mount
    setMatchedResults([
      { slug: "asok", matchPercentage: 95, explanation: "Perfect commute match. Located directly at your corporate core hub with excellent transit interchanges." },
      { slug: "sukhumvit", matchPercentage: 88, explanation: "Highly upscale cafe scene and international residences just 2 minutes away from Asok." },
      { slug: "thong-lo", matchPercentage: 82, explanation: "Premier dining and active nightlife just 4 minutes commute from Asok BTS." }
    ]);
  }, []);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/matchmaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, workplace, budget }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.matches && data.matches.length > 0) {
          setMatchedResults(data.matches);
          setSelectedSlug(data.matches[0].slug);
          setHasSearched(true);
          // Auto switch to map/results on mobile
          setActiveTab("map");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-[calc(100vh-56px)] mt-14" style={{ background: "#F7F3EC" }}>
      {/* Mobile Tabs Toggle */}
      <div className="lg:hidden flex border-b" style={{ borderColor: "#E5E0D8", background: "#FFFFFF" }}>
        <button
          onClick={() => setActiveTab("form")}
          className="flex-1 py-3 text-sm font-semibold transition-all"
          style={{
            color: activeTab === "form" ? "#1C3A2F" : "#888",
            borderBottom: activeTab === "form" ? "3px solid #1C3A2F" : "3px solid transparent",
          }}
        >
          🔍 Match Wizard
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className="flex-1 py-3 text-sm font-semibold transition-all"
          style={{
            color: activeTab === "map" ? "#1C3A2F" : "#888",
            borderBottom: activeTab === "map" ? "3px solid #1C3A2F" : "3px solid transparent",
          }}
        >
          🗺️ Neighborhood Map
        </button>
      </div>

      {/* Left Column: Form and Results */}
      <div
        className={`lg:col-span-5 flex flex-col overflow-y-auto ${
          activeTab === "form" ? "flex" : "hidden lg:flex"
        }`}
        style={{
          maxHeight: "calc(100vh - 56px)",
          borderRight: "1px solid #E5E0D8",
          padding: "24px",
        }}
      >
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px]" style={{ color: "#C9A84C" }}>
            AI Assistant
          </span>
          <h1 className="text-[24px] font-bold leading-tight mt-1" style={{ color: "#1C3A2F" }}>
            NHP Lifestyle Matchmaker
          </h1>
          <p className="text-[12.5px] font-light mt-1.5" style={{ color: "#666" }}>
            Tell us how you want to live and work. We will match you with the perfect Bangkok neighborhoods.
          </p>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleMatch} className="flex flex-col gap-4 p-5 rounded-2xl mb-6 shadow-sm" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "#1C3A2F" }}>
              1. Where is your workplace?
            </label>
            <select
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              className="w-full rounded-xl px-3.5 py-3 text-[13.5px] outline-none"
              style={{ border: "1.5px solid #E5E0D8", background: "#FAF8F3", color: "#1A1A1A", fontFamily: "inherit" }}
            >
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area} {
                    area === "Asok" ? "(Central Business Hub)" :
                    area === "Sathorn" ? "(Finance Core)" :
                    area === "Silom" ? "(Retail & Park Area)" :
                    area === "Sukhumvit" ? "(Premium Shopping)" :
                    area === "Thong Lo" ? "(Lifestyle & Nightlife)" :
                    area === "Ekkamai" ? "(Premium Residential)" :
                    area === "Ari" ? "(Creative Expat Enclave)" :
                    area === "On Nut" ? "(Budget-Friendly Sukhumvit)" : ""
                  }
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "#1C3A2F" }}>
              2. Maximum Monthly Budget
            </label>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[12px] font-semibold" style={{ color: "#C9A84C" }}>
                {formatPrice(budget)}
              </span>
            </div>
            <input
              type="range"
              min={15000}
              max={100000}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
              style={{ background: "#EDE8DF" }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase mb-1.5" style={{ color: "#1C3A2F" }}>
              3. Describe your lifestyle (Optional)
            </label>
            <textarea
              placeholder="e.g. I have a cat, love specialty coffee cafes, prefer a quiet neighborhood with local food stalls, and hate long commutes."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none resize-none"
              style={{ border: "1.5px solid #E5E0D8", background: "#FAF8F3", color: "#1A1A1A", fontFamily: "inherit" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
          >
            {loading ? "Analyzing Lifestyles…" : "Calculate Best Matches →"}
          </button>
        </form>

        {/* AI Matches */}
        {matchedResults.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[14px] font-bold uppercase tracking-wider mb-3.5" style={{ color: "#1C3A2F" }}>
              Your Top Neighborhood Matches
            </h2>
            <div className="flex flex-col gap-3">
              {matchedResults.map((match) => {
                const n = NEIGHBORHOODS.find((item) => item.slug === match.slug);
                if (!n) return null;
                const isSelected = selectedSlug === match.slug;

                return (
                  <div
                    key={match.slug}
                    onClick={() => setSelectedSlug(match.slug)}
                    className="p-4 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: isSelected ? "#FFFFFF" : "rgba(28,58,47,0.02)",
                      border: isSelected ? "2px solid #C9A84C" : "1.5px solid #E5E0D8",
                      boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="text-[16px] font-bold" style={{ color: "#1C3A2F" }}>
                        {n.name}
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: isSelected ? "#C9A84C" : "#E5E0D8", color: isSelected ? "#FFFFFF" : "#1C3A2F" }}>
                        {match.matchPercentage}% Match
                      </span>
                    </div>
                    <p className="text-[12px] font-light leading-relaxed" style={{ color: "#555" }}>
                      {match.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Neighborhood Details */}
        {selectedNeighborhood && (
          <div className="mt-4 p-5 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
            <h2 className="text-[18px] font-bold mb-1" style={{ color: "#1C3A2F" }}>
              Explore {selectedNeighborhood.name}
            </h2>
            <p className="text-[12.5px] font-light leading-relaxed mb-4" style={{ color: "#666" }}>
              {selectedNeighborhood.description}
            </p>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
              {[
                { label: "📶 Remote Work", val: selectedNeighborhood.scores.remoteWork },
                { label: "🐾 Pet Friendly", val: selectedNeighborhood.scores.petFriendly },
                { label: "🏫 Family Friendly", val: selectedNeighborhood.scores.familyFriendly },
                { label: "☕ Cafe Culture", val: selectedNeighborhood.scores.cafeCulture },
                { label: "🌃 Nightlife", val: selectedNeighborhood.scores.nightlife },
                { label: "🚶 Walkability", val: selectedNeighborhood.scores.walkability },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-[11px] text-[#888] font-medium">{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EAE1" }}>
                      <div className="h-full rounded-full" style={{ width: `${s.val * 10}%`, background: s.val >= 8 ? "#1C3A2F" : "#C9A84C" }}></div>
                    </div>
                    <span className="text-[11px] font-bold text-[#1C3A2F]">{s.val}/10</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Commute Info */}
            <div className="mb-4 py-3 px-4 rounded-xl" style={{ background: "#FAF8F3", border: "1px solid #EDE8DF" }}>
              <div className="text-[12.5px] font-bold mb-1.5" style={{ color: "#1C3A2F" }}>
                🚇 Commute & Costs
              </div>
              <div className="flex flex-col gap-1.5 text-[12px] font-light text-[#555]">
                <div className="flex justify-between">
                  <span>Transit Station:</span>
                  <span className="font-semibold text-[#1C3A2F]">{selectedNeighborhood.nearestTransit}</span>
                </div>
                {workplace && (
                  <div className="flex justify-between">
                    <span>Commute to {workplace}:</span>
                    <span className="font-semibold text-[#1C3A2F]">
                      {`${getCommuteMinutes(selectedNeighborhood, workplace)} minutes`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Avg Rental Cost:</span>
                  <span className="font-semibold text-[#C9A84C]">
                    {formatPrice(selectedNeighborhood.averageRentMin)} - {formatPrice(selectedNeighborhood.averageRentMax)}
                  </span>
                </div>
              </div>
            </div>

            {/* Condo recommendations */}
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: "#1C3A2F" }}>
                Condos in {selectedNeighborhood.name}
              </h3>
              {recommendedCondos.length === 0 ? (
                <p className="text-[12px] text-[#999] italic">No active listings in this area.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedCondos.map((p, i) => (
                    <ExplorePropertyCard key={p.id} property={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Google Maps Style Leaflet Map */}
      <div
        className={`lg:col-span-7 h-full flex flex-col relative ${
          activeTab === "map" ? "flex" : "hidden lg:flex"
        }`}
        style={{ height: "calc(100vh - 56px)" }}
      >
        <MapComponent
          neighborhoods={NEIGHBORHOODS}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
          workplace={workplace}
          workplaceCoords={workplaceCoords}
          maxCommute={maxCommute}
          matchedSlugs={matchedSlugs}
        />
        
        {/* Map Legend */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-lg z-10" style={{ border: "1px solid #E5E0D8" }}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#1C3A2F" }}>
            Commute Times to {workplace}
          </h4>
          <div className="flex flex-col gap-1.5 text-[11px] font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#10B981" }} />
              <span>🟢 Under 15m (Excellent)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#F59E0B" }} />
              <span>🟡 15m - 20m (Acceptable)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
              <span>🔴 Over 20m (Too far)</span>
            </div>
            <div className="flex items-center gap-2 mt-1 pt-1.5 border-t border-gray-100">
              <div className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center text-[7px]" style={{ background: "#C9A84C", color: "#FFFFFF" }}>★</div>
              <span>Gold Star: Top AI Matches</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
