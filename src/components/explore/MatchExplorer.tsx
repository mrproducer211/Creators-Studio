"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { PropertyCard } from "@/types/property";
import { NEIGHBORHOODS, Neighborhood, DESTINATIONS } from "@/data/neighborhoods";
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
  whyWeChose: string[];
}

const REASONS = [
  { id: "vacation", label: "Vacation / Long Stay", icon: "🏖️" },
  { id: "nomad", label: "Remote Work / Digital Nomad", icon: "💻" },
  { id: "job", label: "New Job / Relocation", icon: "💼" },
  { id: "business", label: "Business / Entrepreneur", icon: "🏢" },
  { id: "study", label: "Study", icon: "🎓" },
  { id: "family", label: "Family Relocation", icon: "👨‍👩‍👧" },
  { id: "pets", label: "Pet-Friendly Living", icon: "🐶" },
  { id: "luxury", label: "Luxury Lifestyle", icon: "🌃" },
  { id: "exploring", label: "Just Exploring Bangkok", icon: "❤️" },
];

const PREFERENCES = [
  "☕ Cafe Culture",
  "🌳 Quiet & Peaceful",
  "🚆 Easy Public Transport",
  "🏙️ City Center",
  "🍸 Nightlife & Entertainment",
  "🛍️ Shopping & Malls",
  "💻 Coworking Spaces",
  "👨‍👩‍👧 Family Friendly",
  "🐶 Pet Friendly",
  "🏃 Fitness & Active Lifestyle",
  "🌍 International Community",
  "🇯🇵 Japanese Community",
  "🇨🇳 Chinese Community",
  "🌿 Parks & Green Space",
  "🏖️ Relaxed Lifestyle",
  "🍜 Local Thai Culture",
  "🏆 Luxury Living",
];

const DURATIONS = [
  "1-3 Months",
  "3-6 Months",
  "6-12 Months",
  "1 Year+",
  "Permanent Relocation",
];

const DESTINATIONS_LIST = [
  "None / Not working",
  "One Bangkok",
  "Sathorn",
  "Silom",
  "Asoke",
  "Chulalongkorn University",
  "Custom Location",
];

export default function MatchExplorer({ properties }: Props) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Wizard Flow States
  const [step, setStep] = useState<number>(1);
  const [reason, setReason] = useState<string>("Remote Work / Digital Nomad");
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(60000);
  const [stayDuration, setStayDuration] = useState<string>("6-12 Months");
  const [workplaceOption, setWorkplaceOption] = useState<string>("None / Not working");
  const [customWorkplace, setCustomWorkplace] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isImmersive, setIsImmersive] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<string>("lifestyle");

  // Matches States
  const [matchedResults, setMatchedResults] = useState<MatchResult[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>("asok");

  const matchedSlugs = useMemo(() => matchedResults.map((r) => r.slug), [matchedResults]);
  const maxCommute = 20;

  // Selected neighborhood object
  const selectedNeighborhood = useMemo(() => {
    return NEIGHBORHOODS.find((n) => n.slug === selectedSlug) || NEIGHBORHOODS[0];
  }, [selectedSlug]);

  // Recommended condos for current immersive neighborhood
  const recommendedCondos = useMemo(() => {
    if (!selectedNeighborhood) return [];
    return properties
      .filter((p) => p.area.toLowerCase() === selectedNeighborhood.name.toLowerCase())
      .slice(0, 4);
  }, [selectedNeighborhood, properties]);

  // Determine active workplace name string
  const activeWorkplaceName = useMemo(() => {
    if (workplaceOption === "Custom Location") {
      return customWorkplace || "Custom Location";
    }
    if (workplaceOption === "None / Not working") {
      return "";
    }
    return workplaceOption;
  }, [workplaceOption, customWorkplace]);

  // Default initial matches on load
  useEffect(() => {
    setMatchedResults([
      { 
        slug: "asok", 
        matchPercentage: 95, 
        explanation: "Perfect transit hub match. Placed directly at the BTS/MRT intersection core with abundant urban conveniences.",
        whyWeChose: [
          "Perfect BTS & MRT interchange hub",
          "Abundant local and international food options",
          "Highly central shopping malls (Terminal 21)",
          "Excellent coworking density",
          "High walking accessibility score"
        ]
      },
      { 
        slug: "sukhumvit", 
        matchPercentage: 88, 
        explanation: "Upscale residential lifestyle. Proximity to luxury malls and pristine green spaces like Benjasiri Park.",
        whyWeChose: [
          "Centrally located on Phrom Phong BTS line",
          "Close to luxury EmDistrict malls",
          "Direct access to Benjasiri Park",
          "Quiet expat sub-sois",
          "Top-tier western expat community"
        ]
      },
      { 
        slug: "thong-lo", 
        matchPercentage: 82, 
        explanation: "Premier lifestyle hotspot. Host to Bangkok's boutique restaurants, craft coffee bars, and active socialites.",
        whyWeChose: [
          "Epicenter of style and nightlife",
          "Upscale boutique shopping malls",
          "Excellent craft coffee spots",
          "High concentration of luxury condos",
          "Strong Japanese expat community"
        ]
      }
    ]);
  }, []);

  const handleReasonSelect = (val: string) => {
    setReason(val);
    setStep(2);
  };

  const handlePreferenceToggle = (pref: string) => {
    if (selectedPrefs.includes(pref)) {
      setSelectedPrefs(selectedPrefs.filter((p) => p !== pref));
    } else {
      if (selectedPrefs.length < 5) {
        setSelectedPrefs([...selectedPrefs, pref]);
      }
    }
  };

  const handleCalculateMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/matchmaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          preferences: selectedPrefs.map(p => p.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim()),
          budget,
          stayDuration,
          workplace: activeWorkplaceName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.matches && data.matches.length > 0) {
          setMatchedResults(data.matches);
          setSelectedSlug(data.matches[0].slug);
          setHasSearched(true);
          setIsImmersive(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Workplace Coordinates Lookup
  const getWorkplaceCoords = (wName: string): [number, number] | null => {
    if (!wName) return null;
    const dest = DESTINATIONS.find(d => d.name.toLowerCase() === wName.toLowerCase());
    if (dest) return [dest.lat, dest.lng];

    const n = NEIGHBORHOODS.find(item => item.name.toLowerCase() === wName.toLowerCase());
    if (n) return [n.lat, n.lng];

    const p = properties.find(item => item.area.toLowerCase() === wName.toLowerCase() && item.latitude && item.longitude);
    if (p && p.latitude && p.longitude) return [Number(p.latitude), Number(p.longitude)];

    return null;
  };

  const workplaceCoords = useMemo(() => {
    return getWorkplaceCoords(activeWorkplaceName);
  }, [activeWorkplaceName, properties]);

  const handleReset = () => {
    setStep(1);
    setHasSearched(false);
    setIsImmersive(false);
    setSelectedPrefs([]);
  };

  return (
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-[calc(100vh-56px)] mt-14" style={{ background: "#F7F3EC" }}>
      
      {/* LEFT COLUMN: Premium relocation wizard or matched results */}
      <div
        className="lg:col-span-5 flex flex-col overflow-y-auto"
        style={{
          maxHeight: "calc(100vh - 56px)",
          borderRight: "1px solid #E5E0D8",
          padding: "32px 24px",
        }}
      >
        {/* Wizard Form View */}
        {!hasSearched && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Header progress line */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-[#C9A84C] mb-2">
                <span>Relocation Advisor</span>
                <span>Step {step} of 5</span>
              </div>
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1C3A2F] transition-all duration-300" style={{ width: `${step * 20}%` }} />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {/* Step 1: Why coming to Bangkok */}
              {step === 1 && (
                <div>
                  <h2 className="text-[24px] font-bold mb-1.5 text-[#1C3A2F] leading-tight">Why are you coming to Bangkok?</h2>
                  <p className="text-[13px] text-[#666] mb-6 font-light">Select the reason for your relocation to adjust neighborhood parameters.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {REASONS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleReasonSelect(r.label)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all bg-[#FFFFFF] hover:border-[#C9A84C] hover:shadow-md cursor-pointer"
                        style={{
                          borderColor: reason === r.label ? "#1C3A2F" : "#E5E0D8",
                          borderWidth: reason === r.label ? "2px" : "1.5px",
                        }}
                      >
                        <span className="text-[28px] mb-2">{r.icon}</span>
                        <span className="text-[12px] font-semibold text-[#1C3A2F]">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: What neighborhood styles do you like */}
              {step === 2 && (
                <div>
                  <h2 className="text-[24px] font-bold mb-1.5 text-[#1C3A2F] leading-tight">What kind of neighborhood do you like?</h2>
                  <p className="text-[13px] text-[#666] mb-6 font-light">Select up to 5 preferences that define your ideal community surroundings.</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {PREFERENCES.map((pref) => {
                      const isSelected = selectedPrefs.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => handlePreferenceToggle(pref)}
                          className="px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none"
                          style={{
                            background: isSelected ? "#1C3A2F" : "#FFFFFF",
                            color: isSelected ? "#FFFFFF" : "#1C3A2F",
                            border: isSelected ? "1.5px solid #1C3A2F" : "1.5px solid #E5E0D8",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.02)"
                          }}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Monthly Budget */}
              {step === 3 && (
                <div>
                  <h2 className="text-[24px] font-bold mb-1.5 text-[#1C3A2F] leading-tight">Your monthly housing budget</h2>
                  <p className="text-[13px] text-[#666] mb-8 font-light">Set your ideal housing rental range to filter neighborhood averages.</p>
                  
                  <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5E0D8] text-center shadow-sm mb-6">
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block mb-1">Affordable Target</span>
                    <span className="text-[32px] font-bold text-[#1C3A2F] block">
                      {formatPrice(budget)} <span className="text-sm font-medium">/ month</span>
                    </span>
                  </div>

                  <input
                    type="range"
                    min={15000}
                    max={150000}
                    step={5000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer mb-2"
                    style={{ background: "#EDE8DF" }}
                  />
                  <div className="flex justify-between text-[11px] text-[#888] font-bold">
                    <span>15,000 THB</span>
                    <span>75,000 THB</span>
                    <span>150,000+ THB</span>
                  </div>
                </div>
              )}

              {/* Step 4: Length of stay */}
              {step === 4 && (
                <div>
                  <h2 className="text-[24px] font-bold mb-1.5 text-[#1C3A2F] leading-tight">Length of stay in Bangkok</h2>
                  <p className="text-[13px] text-[#666] mb-6 font-light">Your stay duration affects lease options and localized resident recommendations.</p>
                  
                  <div className="flex flex-col gap-3">
                    {DURATIONS.map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setStayDuration(dur)}
                        className="w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all bg-[#FFFFFF] hover:border-[#C9A84C] cursor-pointer"
                        style={{
                          borderColor: stayDuration === dur ? "#1C3A2F" : "#E5E0D8",
                          borderWidth: stayDuration === dur ? "2px" : "1.5px",
                        }}
                      >
                        <span className="text-[13.5px] font-semibold text-[#1C3A2F]">{dur}</span>
                        {stayDuration === dur && <span className="text-sm text-[#1C3A2F]">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Workplace / Frequent Destination */}
              {step === 5 && (
                <div>
                  <h2 className="text-[24px] font-bold mb-1.5 text-[#1C3A2F] leading-tight">Workplace or key destination</h2>
                  <p className="text-[13px] text-[#666] mb-6 font-light">Commutes will be factored into the scores. Leave empty if you work remotely or are vacationing.</p>
                  
                  <div className="flex flex-col gap-4">
                    <select
                      value={workplaceOption}
                      onChange={(e) => setWorkplaceOption(e.target.value)}
                      className="w-full rounded-xl px-3.5 py-3 text-[13.5px] outline-none"
                      style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
                    >
                      {DESTINATIONS_LIST.map((dest) => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>

                    {workplaceOption === "Custom Location" && (
                      <input
                        type="text"
                        placeholder="Type address or subway station name..."
                        value={customWorkplace}
                        onChange={(e) => setCustomWorkplace(e.target.value)}
                        className="w-full rounded-xl px-3.5 py-3 text-[13.5px] outline-none"
                        style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Next/Previous controls */}
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 rounded-xl border border-gray-300 font-semibold cursor-pointer text-[#1C3A2F] bg-[#FFFFFF] transition-opacity hover:opacity-90"
                  style={{ fontFamily: "inherit" }}
                >
                  Back
                </button>
              )}
              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 py-3.5 rounded-xl font-semibold cursor-pointer border-none bg-[#1C3A2F] text-[#FFFFFF] transition-opacity hover:opacity-90"
                  style={{ fontFamily: "inherit" }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleCalculateMatches}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl font-semibold cursor-pointer border-none bg-[#1C3A2F] text-[#FFFFFF] transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ fontFamily: "inherit" }}
                >
                  {loading ? "Calculating Matches..." : "Discover Where I Belong →"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Page */}
        {hasSearched && !isImmersive && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={handleReset}
              className="text-[#C9A84C] font-bold text-xs uppercase tracking-wider mb-6 text-left bg-transparent border-none cursor-pointer flex items-center gap-1.5"
            >
              ← Restart Relocation Survey
            </button>

            <h1 className="text-[26px] font-bold text-[#1C3A2F] leading-tight mb-2">
              Your Best Bangkok Neighborhoods
            </h1>
            <p className="text-[13px] text-[#666] font-light mb-6">
              We analyzed relocation criteria and budget ranges. Here are the top communities suited for your stay.
            </p>

            <div className="flex flex-col gap-6">
              {matchedResults.map((match, idx) => {
                const n = NEIGHBORHOODS.find((item) => item.slug === match.slug);
                if (!n) return null;
                const isSelected = selectedSlug === match.slug;

                return (
                  <div
                    key={match.slug}
                    onClick={() => setSelectedSlug(match.slug)}
                    className="p-6 rounded-3xl transition-all cursor-pointer bg-[#FFFFFF] relative"
                    style={{
                      border: isSelected ? "2.5px solid #C9A84C" : "1.5px solid #E5E0D8",
                      boxShadow: isSelected ? "0 8px 24px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.01)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest block mb-0.5">Recommendation #{idx + 1}</span>
                        <h3 className="text-[20px] font-bold text-[#1C3A2F]">
                          {n.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[18px] font-bold text-[#1C3A2F]">{match.matchPercentage}%</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-[#888]">Compatibility</span>
                      </div>
                    </div>

                    <p className="text-[12.5px] text-[#444] font-light leading-relaxed mb-4 border-l-2 pl-3 border-[#EDE8DF]">
                      {match.explanation}
                    </p>

                    <div className="mb-5">
                      <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block mb-2">Why We Chose {n.name}:</span>
                      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                        {match.whyWeChose.slice(0, 3).map((bullet, index) => (
                          <li key={index} className="text-[12px] font-medium text-[#1C3A2F] flex items-center gap-1.5">
                            <span className="text-[#C9A84C]">✓</span> {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSlug(match.slug);
                        setIsImmersive(true);
                      }}
                      className="w-full py-3 rounded-xl text-center font-bold text-[12.5px] cursor-pointer border-none bg-[#1C3A2F] text-white hover:bg-opacity-95 transition-all"
                      style={{ fontFamily: "inherit" }}
                    >
                      Explore {n.name} Area →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Immersive Neighborhood Page View */}
        {hasSearched && isImmersive && selectedNeighborhood && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setIsImmersive(false)}
              className="text-[#C9A84C] font-bold text-xs uppercase tracking-wider mb-6 text-left bg-transparent border-none cursor-pointer flex items-center gap-1.5"
            >
              ← Back to Recommendations
            </button>

            {/* Hero Banner */}
            <div className="rounded-3xl overflow-hidden relative mb-6 shadow-sm border border-[#E5E0D8]" style={{ height: "200px" }}>
              <img
                src={selectedNeighborhood.heroImage}
                alt={selectedNeighborhood.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                <div>
                  <h1 className="text-[28px] font-bold text-[#FFFFFF] leading-none mb-1">
                    {selectedNeighborhood.name}
                  </h1>
                  <p className="text-xs text-white/90 font-medium flex items-center gap-1.5">
                    🚇 Transit Access: <span className="font-bold">{selectedNeighborhood.nearestTransit}</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-[#444] font-light leading-relaxed mb-6">
              {selectedNeighborhood.description}
            </p>

            {/* Lifestyle Scores dashboard */}
            <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E5E0D8] mb-6">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-4 pb-2 border-b border-gray-100">
                📊 Neighborhood Lifestyle Scores
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "☕ Cafe Culture", val: selectedNeighborhood.scores.cafeCulture },
                  { label: "💻 Remote Work", val: selectedNeighborhood.scores.remoteWork },
                  { label: "🌃 Nightlife", val: selectedNeighborhood.scores.nightlife },
                  { label: "🚶 Walkability", val: selectedNeighborhood.scores.walkability },
                  { label: "🐾 Pet Friendly", val: selectedNeighborhood.scores.petFriendly },
                  { label: "🏆 Luxury Living", val: selectedNeighborhood.scores.luxury },
                  { label: "🌍 Expat Community", val: selectedNeighborhood.scores.expatCommunity },
                  { label: "🎓 Student Suitability", val: selectedNeighborhood.scores.studentSuitability },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[10.5px] text-[#888] font-bold mb-0.5">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#F0EAE1" }}>
                        <div className="h-full rounded-full" style={{ width: `${s.val * 10}%`, background: s.val >= 8 ? "#1C3A2F" : "#C9A84C" }}></div>
                      </div>
                      <span className="text-[11px] font-bold text-[#1C3A2F]">{s.val}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Costs & Demographics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5E0D8] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block mb-1">Avg Housing Cost</span>
                <span className="text-[14px] font-bold text-[#C9A84C]">
                  {formatPrice(selectedNeighborhood.averageRentMin)} - {formatPrice(selectedNeighborhood.averageRentMax)}
                </span>
              </div>
              <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5E0D8] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block mb-1">BTS / MRT Hub</span>
                <span className="text-[14px] font-bold text-[#1C3A2F] truncate block">
                  {selectedNeighborhood.nearestTransit}
                </span>
              </div>
            </div>

            {/* Popular Resident Profiles */}
            <div className="mb-6">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-2.5">
                👥 Who Lives Here?
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedNeighborhood.residentTypes.map((res) => (
                  <span key={res} className="px-3 py-1 rounded-full text-[10.5px] font-bold bg-[#EDE8DF] text-[#1C3A2F]">
                    {res}
                  </span>
                ))}
              </div>
            </div>

            {/* Local Recommendations lists */}
            <div className="flex flex-col gap-5 bg-[#FFFFFF] p-5 rounded-3xl border border-[#E5E0D8] mb-6">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#1C3A2F] pb-2 border-b border-gray-100">
                ✨ Local Relocation Highlights
              </h3>
              
              {selectedNeighborhood.cafes.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C9A84C] mb-1.5">☕ Recommended Cafes</h4>
                  <p className="text-[12px] text-[#555] font-light leading-relaxed">{selectedNeighborhood.cafes.join(" • ")}</p>
                </div>
              )}
              {selectedNeighborhood.coworkingSpaces.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C9A84C] mb-1.5">💻 Coworking & Workspots</h4>
                  <p className="text-[12px] text-[#555] font-light leading-relaxed">{selectedNeighborhood.coworkingSpaces.join(" • ")}</p>
                </div>
              )}
              {selectedNeighborhood.malls.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C9A84C] mb-1.5">🛍️ Retail & Lifestyle Malls</h4>
                  <p className="text-[12px] text-[#555] font-light leading-relaxed">{selectedNeighborhood.malls.join(" • ")}</p>
                </div>
              )}
              {selectedNeighborhood.parks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C9A84C] mb-1.5">🌳 Green Space & Parks</h4>
                  <p className="text-[12px] text-[#555] font-light leading-relaxed">{selectedNeighborhood.parks.join(" • ")}</p>
                </div>
              )}
            </div>

            {/* Condo recommendations */}
            <div className="pt-4 border-t border-[#E5E0D8]">
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-3">
                🏡 Handpicked Condos in {selectedNeighborhood.name}
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

      {/* RIGHT COLUMN: Interactive Leaflet Map Layer Explorer */}
      <div className="lg:col-span-7 h-full flex flex-col relative" style={{ height: "calc(100vh - 56px)" }}>
        
        {/* Dynamic Map Layers selector floating at top */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-lg z-10 flex flex-wrap gap-1.5 items-center justify-between" style={{ border: "1px solid #E5E0D8" }}>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#1C3A2F" }}>
              Bangkok Neighborhood Explorer™
            </h4>
            <span className="text-[9px] font-medium text-[#888]">Visual suitability highlights</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {[
              { id: "lifestyle", label: "Lifestyle" },
              { id: "commute", label: "Commute" },
              { id: "budget", label: "Budget" },
              { id: "expat", label: "Expat" },
              { id: "pet", label: "Pet-Friendly" },
              { id: "luxury", label: "Luxury" },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all border-none"
                style={{
                  background: activeLayer === layer.id ? "#1C3A2F" : "#F7F3EC",
                  color: activeLayer === layer.id ? "#FFFFFF" : "#1C3A2F",
                }}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        <MapComponent
          neighborhoods={NEIGHBORHOODS}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
          workplace={activeWorkplaceName}
          workplaceCoords={workplaceCoords}
          maxCommute={maxCommute}
          matchedSlugs={matchedSlugs}
          selectedLayer={activeLayer}
        />
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-lg z-10" style={{ border: "1px solid #E5E0D8" }}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#1C3A2F" }}>
            Suitability Legend
          </h4>
          <div className="flex flex-col gap-1.5 text-[11px] font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#10B981" }} />
              <span>🟢 High Fit Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#F59E0B" }} />
              <span>🟡 Moderate Fit Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#EF4444" }} />
              <span>🔴 Low Fit Score</span>
            </div>
            {activeWorkplaceName && (
              <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-100">
                <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[7px]" style={{ background: "#2563EB", color: "#FFFFFF" }}>💼</div>
                <span>Workplace: {activeWorkplaceName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
