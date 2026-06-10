"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { PropertyCard, ListingType } from "@/types/property";
import { NEIGHBORHOODS, Neighborhood, DESTINATIONS } from "@/data/neighborhoods";
import POSTS from "@/data/blogPosts";
import ExplorePropertyCard from "./ExplorePropertyCard";
import { 
  Palmtree, 
  Laptop, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  Users, 
  Heart, 
  Crown, 
  Compass,
  Car,
  Volume2,
  Wine,
  Clock,
  Coins,
  Building,
  Activity
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

interface Props {
  properties: PropertyCard[];
}

interface MatchResult {
  slug: string;
  matchPercentage: number;
  fitLabel: "Excellent Fit" | "Strong Match" | "Good Alternative";
  explanation: string;
  whyWeChose: string[];
}

const REASONS = [
  { label: "Vacation / Long Stay", icon: "🏖️" },
  { label: "Remote Work", icon: "💻" },
  { label: "New Job", icon: "💼" },
  { label: "Business / Entrepreneur", icon: "🏢" },
  { label: "Study", icon: "🎓" },
  { label: "Family Relocation", icon: "👨‍👩‍👧" },
  { label: "Pet-Friendly Lifestyle", icon: "🐶" },
  { label: "Luxury Lifestyle", icon: "🌃" },
  { label: "Just Exploring Bangkok", icon: "❤️" },
];

const PREFERENCES = [
  "☕ Cafe Culture",
  "🌳 Quiet & Peaceful",
  "🚆 Excellent Public Transport",
  "🏙 City Center",
  "🍸 Nightlife",
  "🛍 Shopping",
  "💻 Coworking Spaces",
  "👨‍👩‍👧 Family Friendly",
  "🐶 Pet Friendly",
  "🏃 Fitness Lifestyle",
  "🌍 International Community",
  "🇯🇵 Japanese Community",
  "🇨🇳 Chinese Community",
  "🌿 Parks & Green Spaces",
  "🍜 Local Thai Culture",
  "🏆 Luxury Living",
  "🚶 Walkability",
  "🏖 Relaxed Lifestyle",
];

const AVOIDANCES = [
  { label: "Heavy Traffic", icon: "🚗" },
  { label: "Noise", icon: "🔊" },
  { label: "Nightlife", icon: "🍸" },
  { label: "Tourist Crowds", icon: "👥" },
  { label: "Long Commutes", icon: "🚆" },
  { label: "Expensive Areas", icon: "💰" },
  { label: "Dense High-Rise Areas", icon: "🏢" },
  { label: "Busy City Centers", icon: "🌃" },
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

const renderReasonIcon = (label: string) => {
  const iconSize = 22;
  const strokeWidth = 1.75;

  switch (label) {
    case "Vacation / Long Stay":
      return <Palmtree size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Remote Work":
      return <Laptop size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "New Job":
      return <Briefcase size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Business / Entrepreneur":
      return <Building2 size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Study":
      return <GraduationCap size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Family Relocation":
      return <Users size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Pet-Friendly Lifestyle":
      return <Heart size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Luxury Lifestyle":
      return <Crown size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Just Exploring Bangkok":
    default:
      return <Compass size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
  }
};

const renderAvoidanceIcon = (label: string) => {
  const iconSize = 20;
  const strokeWidth = 1.75;

  switch (label) {
    case "Heavy Traffic":
      return <Car size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Noise":
      return <Volume2 size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Nightlife":
      return <Wine size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Tourist Crowds":
      return <Users size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Long Commutes":
      return <Clock size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Expensive Areas":
      return <Coins size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Dense High-Rise Areas":
      return <Building size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
    case "Busy City Centers":
    default:
      return <Activity size={iconSize} strokeWidth={strokeWidth} className="transition-transform duration-300" />;
  }
};

export default function MatchExplorer({ properties }: Props) {
  const { formatPrice } = useCurrency();

  // Wizard States
  const [step, setStep] = useState<number>(0); // Step 0 is Landing Hero
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [selectedAvoids, setSelectedAvoids] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(60000);
  const [stayDuration, setStayDuration] = useState<string>("6-12 Months");
  const [workplaceOption, setWorkplaceOption] = useState<string>("None / Not working");
  const [customWorkplace, setCustomWorkplace] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isImmersive, setIsImmersive] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<string>("match");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Matched Results
  const [matchedResults, setMatchedResults] = useState<MatchResult[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>("asok");

  // Comparison Tool State
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  const matchedSlugs = useMemo(() => matchedResults.map((r) => r.slug), [matchedResults]);
  const maxCommute = 20;



  // Selected neighborhood object
  const selectedNeighborhood = useMemo(() => {
    return NEIGHBORHOODS.find((n) => n.slug === selectedSlug) || NEIGHBORHOODS[0];
  }, [selectedSlug]);

  // Recommended condos for current immersive neighborhood, filtered by user budget, listing type, and lifestyle attributes
  const recommendedCondos = useMemo(() => {
    if (!selectedNeighborhood) return [];
    
    // Determine target listing type based on stay duration
    // Short durations -> short_stay, long durations -> rent
    const isShortStay = stayDuration === "1-3 Months" || stayDuration === "3-6 Months";
    const targetListingTypes: ListingType[] = isShortStay 
      ? ["short_stay", "rent"] 
      : ["rent"]; // default to rent for longer stays

    // Check if pet friendly is required
    const requiresPetFriendly = selectedReasons.includes("Pet-Friendly Lifestyle") || 
                                selectedPrefs.includes("🐶 Pet Friendly");

    const filtered = properties.filter((p) => {
      // 1. Must match neighborhood area name
      if (p.area.toLowerCase() !== selectedNeighborhood.name.toLowerCase()) return false;
      
      // 2. Filter by budget (with a 15% buffer for flexibility)
      if (p.priceTHB > budget * 1.15) return false;

      return true;
    });

    // Sort matching properties: prioritize those matching specific lifestyle flags
    filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Prioritize correct listing type
      if (targetListingTypes.includes(a.listingType)) scoreA += 5;
      if (targetListingTypes.includes(b.listingType)) scoreB += 5;

      // Prioritize pet friendly if requested
      if (requiresPetFriendly) {
        if (a.petFriendly) scoreA += 10;
        if (b.petFriendly) scoreB += 10;
      }

      // Prioritize near BTS if transit public transport is preferred
      const prefersTransit = selectedPrefs.includes("🚆 Excellent Public Transport");
      if (prefersTransit) {
        if (a.nearBts) scoreA += 5;
        if (b.nearBts) scoreB += 5;
      }

      // Prioritize properties closer to budget (closer to budget is better, but under budget is best)
      const diffA = Math.abs(a.priceTHB - budget);
      const diffB = Math.abs(b.priceTHB - budget);
      if (diffA < diffB) scoreA += 2;
      else if (diffB < diffA) scoreB += 2;

      return scoreB - scoreA;
    });

    return filtered.slice(0, 4);
  }, [selectedNeighborhood, properties, budget, stayDuration, selectedReasons, selectedPrefs]);

  // Find relevant blog posts/guides from database for the selected neighborhood
  const relevantArticles = useMemo(() => {
    if (!selectedNeighborhood) return [];
    
    const slug = selectedNeighborhood.slug.toLowerCase();
    const name = selectedNeighborhood.name.toLowerCase();

    // Filter posts that reference this neighborhood in keywords, title, or excerpt
    let matched = POSTS.filter((post) => {
      const inKeywords = post.keywords.some((k) => k.toLowerCase().includes(slug) || k.toLowerCase().includes(name));
      const inTitle = post.title.toLowerCase().includes(slug) || post.title.toLowerCase().includes(name);
      const inExcerpt = post.excerpt.toLowerCase().includes(slug) || post.excerpt.toLowerCase().includes(name);
      return inKeywords || inTitle || inExcerpt;
    });

    // Fallback to top guides if no specific post matches
    if (matched.length === 0) {
      matched = POSTS.slice(0, 3);
    }

    return matched.slice(0, 3);
  }, [selectedNeighborhood]);

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

  // Workplace Coordinates Lookup
  const getWorkplaceCoords = useCallback((wName: string): [number, number] | null => {
    if (!wName) return null;
    const dest = DESTINATIONS.find(d => d.name.toLowerCase() === wName.toLowerCase());
    if (dest) return [dest.lat, dest.lng];

    const n = NEIGHBORHOODS.find(item => item.name.toLowerCase() === wName.toLowerCase());
    if (n) return [n.lat, n.lng];

    const p = properties.find(item => item.area.toLowerCase() === wName.toLowerCase() && item.latitude && item.longitude);
    if (p && p.latitude && p.longitude) return [Number(p.latitude), Number(p.longitude)];

    return null;
  }, [properties]);

  const workplaceCoords = useMemo(() => {
    return getWorkplaceCoords(activeWorkplaceName);
  }, [activeWorkplaceName, getWorkplaceCoords]);

  // Client-side real-time compatibility scoring for all neighborhoods
  const liveScores = useMemo(() => {
    const reason = selectedReasons[0] || "Just Exploring Bangkok";
    
    // Clean emojis from preferences for accurate matching (matching the API behavior)
    const cleanedPrefs = selectedPrefs.map((p) => p.replace(/^[^a-zA-Z0-9\s]+/, "").trim());
    const cleanedAvoids = selectedAvoids;
    const maxBudget = budget;
    const workplace = activeWorkplaceName;
    const hasWorkplace = !!workplace;

    // Weights
    const wLifestyle = hasWorkplace ? 0.40 : 0.60;
    const wBudget    = 0.25;
    const wCommute   = hasWorkplace ? 0.20 : 0.00;
    const wCommunity = 0.15;

    const scoresMap: Record<string, number> = {};

    // Helper to calculate distance in km using Haversine formula
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

    const getCommuteMinutes = (n: Neighborhood, workplaceName: string): number => {
      if (n.commuteMinutes && n.commuteMinutes[workplaceName] !== undefined) {
        return n.commuteMinutes[workplaceName];
      }
      if (workplaceCoords) {
        const [wLat, wLng] = workplaceCoords;
        const dist = getDistance(n.lat, n.lng, wLat, wLng);
        return Math.round(dist * 3.5 + (dist > 0 ? 2 : 0));
      }
      return 15;
    };

    NEIGHBORHOODS.forEach((n) => {
      // 1. Lifestyle Compatibility
      let lifestyleScore = 70;
      if (cleanedPrefs.length > 0) {
        let totalMatch = 0;
        cleanedPrefs.forEach((pref) => {
          let scoreVal = 7;
          switch (pref) {
            case "Cafe Culture":
              scoreVal = n.scores.cafeCulture;
              break;
            case "Quiet & Peaceful":
              scoreVal = 10 - n.scores.nightlife;
              break;
            case "Excellent Public Transport":
            case "City Center":
            case "Fitness Lifestyle":
            case "Walkability":
              scoreVal = n.scores.walkability;
              break;
            case "Nightlife":
              scoreVal = n.scores.nightlife;
              break;
            case "Shopping":
              scoreVal = Math.round((n.scores.walkability + n.scores.luxury) / 2);
              break;
            case "Coworking Spaces":
              scoreVal = n.scores.remoteWork;
              break;
            case "Family Friendly":
              scoreVal = n.scores.familyFriendly;
              break;
            case "Pet Friendly":
              scoreVal = n.scores.petFriendly;
              break;
            case "International Community":
              scoreVal = n.scores.expatCommunity;
              break;
            case "Japanese Community":
              scoreVal = n.scores.japaneseCommunity;
              break;
            case "Chinese Community":
              scoreVal = n.scores.chineseCommunity;
              break;
            case "Parks & Green Spaces":
              scoreVal = Math.round((n.scores.walkability + n.scores.familyFriendly) / 2);
              break;
            case "Relaxed Lifestyle":
              scoreVal = 10 - n.scores.nightlife;
              break;
            case "Local Thai Culture":
              scoreVal = 10 - n.scores.luxury;
              break;
            case "Luxury Living":
              scoreVal = n.scores.luxury;
              break;
          }
          totalMatch += scoreVal * 10;
        });
        lifestyleScore = totalMatch / cleanedPrefs.length;
      }

      // 2. Budget Compatibility
      let budgetScore = 100;
      if (maxBudget < n.averageRentMin) {
        const diff = n.averageRentMin - maxBudget;
        budgetScore = Math.max(20, 100 - (diff / 250));
      } else if (maxBudget >= n.averageRentMax) {
        budgetScore = 100;
      } else {
        const range = n.averageRentMax - n.averageRentMin;
        const progress = range > 0 ? (maxBudget - n.averageRentMin) / range : 1;
        budgetScore = 70 + progress * 30;
      }

      // 3. Commute Compatibility
      let commuteScore = 100;
      if (hasWorkplace) {
        const mins = getCommuteMinutes(n, workplace);
        if (mins === 0) commuteScore = 100;
        else if (mins <= 10) commuteScore = 95;
        else if (mins <= 20) commuteScore = 85;
        else if (mins <= 30) commuteScore = 60;
        else if (mins <= 45) commuteScore = 30;
        else commuteScore = 10;
      }

      // 4. Community & Environment Score
      let communityScore = 80;
      switch (reason) {
        case "Vacation / Long Stay":
        case "Just Exploring Bangkok":
          communityScore = n.scores.walkability * 10;
          break;
        case "Remote Work":
        case "New Job":
        case "Business / Entrepreneur":
          communityScore = n.scores.remoteWork * 10;
          break;
        case "Study":
          communityScore = n.scores.studentSuitability * 10;
          break;
        case "Family Relocation":
          communityScore = n.scores.familyFriendly * 10;
          break;
        case "Pet-Friendly Lifestyle":
          communityScore = n.scores.petFriendly * 10;
          break;
        case "Luxury Lifestyle":
          communityScore = n.scores.luxury * 10;
          break;
      }

      // Weighted Score
      let finalScore = Math.round(
        lifestyleScore * wLifestyle +
        budgetScore * wBudget +
        commuteScore * wCommute +
        communityScore * wCommunity
      );

      // 5. Apply Avoidance Deductions
      let avoidanceDeduction = 0;
      if (cleanedAvoids.length > 0) {
        cleanedAvoids.forEach((av) => {
          let deduction = 0;
          switch (av) {
            case "Heavy Traffic":
              deduction = n.avoidanceStats.traffic * 1.5;
              break;
            case "Noise":
              deduction = n.avoidanceStats.noise * 1.5;
              break;
            case "Nightlife":
              deduction = n.scores.nightlife * 1.5;
              break;
            case "Tourist Crowds":
              deduction = n.avoidanceStats.touristCrowds * 1.5;
              break;
            case "Long Commutes":
              if (hasWorkplace) {
                const mins = getCommuteMinutes(n, workplace);
                if (mins > 20) {
                  deduction = Math.min(15, (mins - 20) * 0.8);
                }
              }
              break;
            case "Expensive Areas":
              if (n.averageRentMin > 25000) {
                deduction = Math.min(15, ((n.averageRentMin - 25000) / 1000) * 1.5);
              }
              break;
            case "Dense High-Rise Areas":
              deduction = n.avoidanceStats.density * 1.5;
              break;
            case "Busy City Centers":
              deduction = n.avoidanceStats.busyness * 1.5;
              break;
          }
          avoidanceDeduction += deduction;
        });
      }

      finalScore = Math.max(40, finalScore - Math.round(avoidanceDeduction));
      scoresMap[n.slug] = Math.min(99, Math.max(45, finalScore));
    });

    return scoresMap;
  }, [selectedReasons, selectedPrefs, selectedAvoids, budget, activeWorkplaceName, workplaceCoords]);

  // Default initial matches on load
  useEffect(() => {
    setTimeout(() => {
      setMatchedResults([
        { 
          slug: "asok", 
          matchPercentage: 95,
          fitLabel: "Excellent Fit",
          explanation: "Perfect transit hub match. Placed directly at the BTS/MRT intersection core with abundant urban conveniences.",
          whyWeChose: [
            "Walkover access to Terminal 21 mall",
            "High density of workspaces and offices",
            "Ultimate BTS & MRT interchange core",
            "Excellent coworking density",
            "Highly walkable city center"
          ]
        },
        { 
          slug: "sukhumvit", 
          matchPercentage: 88,
          fitLabel: "Excellent Fit",
          explanation: "Upscale residential lifestyle. Proximity to luxury malls and pristine green spaces like Benjasiri Park.",
          whyWeChose: [
            "Close to luxury EmDistrict malls",
            "Direct access to Benjasiri Park",
            "Highly walkable expat center",
            "Elite, secure condominium options",
            "Strong international community feel"
          ]
        },
        { 
          slug: "thong-lo", 
          matchPercentage: 82,
          fitLabel: "Strong Match",
          explanation: "Premier lifestyle hotspot. Host to Bangkok's boutique restaurants, craft coffee bars, and active socialites.",
          whyWeChose: [
            "Epicenter of style and nightlife",
            "Vibrant Japanese community hubs",
            "Luxury dining and high-end cafes",
            "Premium luxury condominiums",
            "Active, trendy environment"
          ]
        }
      ]);
    }, 0);
  }, []);

  const handleReasonToggle = (label: string) => {
    if (selectedReasons.includes(label)) {
      setSelectedReasons(selectedReasons.filter(r => r !== label));
    } else {
      setSelectedReasons([...selectedReasons, label]);
    }
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

  const handleAvoidToggle = (av: string) => {
    if (selectedAvoids.includes(av)) {
      setSelectedAvoids(selectedAvoids.filter((a) => a !== av));
    } else {
      if (selectedAvoids.length < 3) {
        setSelectedAvoids([...selectedAvoids, av]);
      }
    }
  };

  // Generate динамические бейджи стиля жизни (Spotify Wrapped style)
  const lifestyleProfileBadges = useMemo(() => {
    const badges: string[] = [];
    if (selectedPrefs.includes("☕ Cafe Culture")) badges.push("☕ Cafe Explorer");
    if (selectedPrefs.includes("💻 Coworking Spaces") || selectedReasons.includes("Remote Work")) badges.push("💻 Flexible Worker");
    if (selectedPrefs.includes("🌳 Quiet & Peaceful") || selectedAvoids.includes("Noise")) badges.push("🤫 Quiet Environment Seeker");
    if (selectedPrefs.includes("🐶 Pet Friendly") || selectedReasons.includes("Pet-Friendly Lifestyle")) badges.push("🐶 Pet Companion");
    if (selectedPrefs.includes("🏆 Luxury Living") || selectedReasons.includes("Luxury Lifestyle")) badges.push("👑 Premium Connoisseur");
    if (selectedPrefs.includes("🚶 Walkability") || selectedAvoids.includes("Heavy Traffic")) badges.push("🚶 Walkability Advocate");
    if (selectedPrefs.includes("👨‍👩‍👧 Family Friendly") || selectedReasons.includes("Family Relocation")) badges.push("👨‍👩‍👧 Family Centered");
    if (selectedReasons.includes("Study")) badges.push("🎓 Academic Resident");
    if (selectedReasons.includes("New Job")) badges.push("💼 Career Professional");
    
    // Add default if empty
    if (badges.length === 0) {
      badges.push("🧭 Bangkok Explorer");
      badges.push("🌱 Lifestyle Discoverer");
    }
    return badges.slice(0, 4);
  }, [selectedPrefs, selectedReasons, selectedAvoids]);

  const handleCalculateMatches = async () => {
    // Move to Profile Generation Report step first (Step 7)
    setStep(7);
    
    try {
      const response = await fetch("/api/matchmaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReasons[0] || "Just Exploring Bangkok",
          preferences: selectedPrefs.map((p) => p.replace(/^[^a-zA-Z0-9\s]+/, "").trim()),
          avoidances: selectedAvoids,
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
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const revealMatches = () => {
    setHasSearched(true);
    setIsImmersive(false);
  };

  const handleReset = () => {
    setStep(0);
    setHasSearched(false);
    setIsImmersive(false);
    setSelectedReasons([]);
    setSelectedPrefs([]);
    setSelectedAvoids([]);
    setCompareSlugs([]);
    setIsComparing(false);
  };

  // Compare Neighborhoods logic
  const handleToggleCompare = (slug: string) => {
    if (compareSlugs.includes(slug)) {
      setCompareSlugs(compareSlugs.filter(s => s !== slug));
    } else {
      if (compareSlugs.length < 2) {
        setCompareSlugs([...compareSlugs, slug]);
      } else {
        // Swap out the first one
        setCompareSlugs([compareSlugs[1], slug]);
      }
    }
  };

  const compareNeighborhoods = useMemo(() => {
    return compareSlugs.map(slug => NEIGHBORHOODS.find(n => n.slug === slug)).filter(Boolean) as Neighborhood[];
  }, [compareSlugs]);

  return (
    <div 
      className="flex-1 flex flex-col lg:grid lg:grid-cols-12 mt-14" 
      style={{ 
        background: "#F7F3EC",
        minHeight: isMobile ? "0px" : "calc(100vh - 56px)"
      }}
    >
      
      {/* LEFT COLUMN: Premium relocation wizard or matched results */}
      <div
        id="match-explorer-left-column"
        className="lg:col-span-5 flex flex-col relative w-full lg:flex"
        style={{
          maxHeight: isMobile ? "none" : "calc(100vh - 56px)",
          overflowY: isMobile ? "visible" : "auto",
          borderRight: isMobile ? "none" : "1px solid #E5E0D8",
          padding: step === 0 ? "0px" : (isMobile ? "20px 16px" : "32px 24px"),
        }}
      >
        
        {/* Step 0: Premium Hero Section Landing */}
        {step === 0 && !hasSearched && (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-[#1C3A2F] text-[#F7F3EC] min-h-[500px]">
            <span className="text-[10px] font-bold uppercase tracking-[3px] text-[#C9A84C] mb-3">
              New Home Property Premium
            </span>
            <h1 className="text-[34px] font-bold leading-tight mb-4 max-w-[320px] font-outfit" style={{ letterSpacing: "-1px" }}>
              Where Would You Belong In Bangkok?
            </h1>
            <p className="text-[13.5px] text-[#D5CDBE] max-w-[280px] leading-relaxed mb-8 font-light">
              Discover the neighborhoods that match your lifestyle, personality, budget, and goals.
            </p>
            <button
              onClick={() => setStep(1)}
              className="px-8 py-4 rounded-full font-bold text-[13px] bg-[#C9A84C] text-[#1C3A2F] cursor-pointer border-none shadow-lg transition-transform hover:scale-105"
              style={{ fontFamily: "inherit" }}
            >
              Start Auto Finder →
            </button>
          </div>
        )}

        {/* Wizard Form View (Steps 1 to 6) */}
        {step > 0 && step <= 6 && !hasSearched && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Header progress line */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] mb-2">
                <span>Auto Finder</span>
                <span>Step {step} of 6</span>
              </div>
              <div className="w-full h-[3px] bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#1C3A2F] transition-all duration-300" style={{ width: `${step * 16.66}%` }} />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {/* Step 1: Why Are You Coming To Bangkok? */}
              {step === 1 && (
                <div>
                  <h2 className="text-[22px] font-bold mb-1 text-[#1C3A2F] leading-tight">Why are you coming to Bangkok?</h2>
                  <p className="text-[12.5px] text-[#666] mb-5 font-light">Select all reasons that apply to save as your relocation intent.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {REASONS.map((r) => {
                      const isSelected = selectedReasons.includes(r.label);
                      return (
                        <button
                          key={r.label}
                          onClick={() => handleReasonToggle(r.label)}
                          className="flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all bg-[#FFFFFF] hover:border-[#C9A84C] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group duration-300"
                          style={{
                            borderColor: isSelected ? "#C9A84C" : "#E5E0D8",
                            borderWidth: isSelected ? "2px" : "1.5px",
                            background: isSelected ? "linear-gradient(135deg, #FFFFFF 0%, #FAF7F2 100%)" : "#FFFFFF",
                            boxShadow: isSelected ? "0 10px 25px rgba(201, 168, 76, 0.12)" : "0 4px 12px rgba(0, 0, 0, 0.02)",
                          }}
                        >
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3"
                            style={{
                              background: isSelected ? "#1C3A2F" : "#F7F3EC",
                              color: isSelected ? "#C9A84C" : "#1C3A2F",
                              boxShadow: isSelected ? "0 4px 12px rgba(28, 58, 47, 0.2)" : "none",
                              border: isSelected ? "1.5px solid #C9A84C" : "1.5px solid transparent",
                            }}
                          >
                            {renderReasonIcon(r.label)}
                          </div>
                          <span className="text-[12.5px] font-bold text-[#1C3A2F] font-outfit tracking-wide transition-colors duration-300">{r.label}</span>
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#1C3A2F] text-[#C9A84C] flex items-center justify-center text-[10px] font-extrabold shadow-sm border border-[#C9A84C]">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: What Kind Of Life Do You Want? */}
              {step === 2 && (
                <div>
                  <h2 className="text-[22px] font-bold mb-1 text-[#1C3A2F] leading-tight">What kind of life do you want?</h2>
                  <p className="text-[12.5px] text-[#666] mb-5 font-light">Select up to 5 features that match your positive lifestyle preferences.</p>
                  
                  <div className="flex flex-wrap gap-1.5 max-h-[350px] overflow-y-auto pr-1">
                    {PREFERENCES.map((pref) => {
                      const isSelected = selectedPrefs.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => handlePreferenceToggle(pref)}
                          className="px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none"
                          style={{
                            background: isSelected ? "#1C3A2F" : "#FFFFFF",
                            color: isSelected ? "#FFFFFF" : "#1C3A2F",
                            border: isSelected ? "1.5px solid #1C3A2F" : "1.5px solid #E5E0D8",
                          }}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: What Do You Want To Avoid? */}
              {step === 3 && (
                <div>
                  <h2 className="text-[22px] font-bold mb-1 text-[#1C3A2F] leading-tight font-outfit">What do you want to avoid?</h2>
                  <p className="text-[12.5px] text-[#666] mb-5 font-light">Select up to 3 parameters. Negative preferences shape matching scores significantly.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {AVOIDANCES.map((av) => {
                      const isSelected = selectedAvoids.includes(av.label);
                      return (
                        <button
                          key={av.label}
                          onClick={() => handleAvoidToggle(av.label)}
                          className="flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all bg-[#FFFFFF] hover:border-[#EF4444] hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group duration-300"
                          style={{
                            borderColor: isSelected ? "#EF4444" : "#E5E0D8",
                            borderWidth: isSelected ? "2px" : "1.5px",
                            background: isSelected ? "linear-gradient(135deg, #FFFFFF 0%, #FFFDFD 100%)" : "#FFFFFF",
                            boxShadow: isSelected ? "0 8px 20px rgba(239, 68, 68, 0.08)" : "0 4px 12px rgba(0, 0, 0, 0.01)",
                          }}
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 shrink-0"
                            style={{
                              background: isSelected ? "#EF4444" : "#F7F3EC",
                              color: isSelected ? "#FFFFFF" : "#1C3A2F",
                              boxShadow: isSelected ? "0 4px 10px rgba(239, 68, 68, 0.2)" : "none",
                              border: isSelected ? "1.5px solid #EF4444" : "1.5px solid transparent",
                            }}
                          >
                            {renderAvoidanceIcon(av.label)}
                          </div>
                          <span className="text-[12.5px] font-bold text-[#1C3A2F] font-outfit tracking-wide transition-colors duration-300 pr-4">{av.label}</span>
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full bg-[#EF4444] text-white flex items-center justify-center text-[9px] font-extrabold shadow-sm">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Budget */}
              {step === 4 && (
                <div>
                  <h2 className="text-[22px] font-bold mb-1 text-[#1C3A2F] leading-tight">Monthly housing budget</h2>
                  <p className="text-[12.5px] text-[#666] mb-8 font-light">Select your budget limit. Budget compatibility forms 25% of the overall match.</p>
                  
                  <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5E0D8] text-center shadow-sm mb-6">
                    <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block mb-1">Affordable Range Target</span>
                    <span className="text-[28px] font-bold text-[#1C3A2F] block">
                      {formatPrice(budget)} <span className="text-xs font-semibold text-[#888]">/ month</span>
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

              {/* Step 5: Length of Stay */}
              {step === 5 && (
                <div>
                  <h2 className="text-[22px] font-bold mb-1 text-[#1C3A2F] leading-tight">Length of stay in Bangkok</h2>
                  <p className="text-[12.5px] text-[#666] mb-5 font-light">Lease durations adjust recommended resident types and available properties.</p>
                  
                  <div className="flex flex-col gap-2.5">
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
                        <span className="text-[13px] font-bold text-[#1C3A2F]">{dur}</span>
                        {stayDuration === dur && <span className="text-xs text-[#1C3A2F]">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Workplace or Destination */}
              {step === 6 && (
                <div>
                  <h2 className="text-[22px] font-bold mb-1 text-[#1C3A2F] leading-tight">Workplace or frequent destination</h2>
                  <p className="text-[12.5px] text-[#666] mb-5 font-light">Commute calculations form 20% of matching score. (Optional - will not penalize you if left empty).</p>
                  
                  <div className="flex flex-col gap-3">
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
                        placeholder="E.g. Lumphini MRT Station..."
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

            {/* Next/Previous Controls */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-xl border border-gray-300 font-semibold cursor-pointer text-[#1C3A2F] bg-[#FFFFFF]"
                style={{ fontFamily: "inherit" }}
              >
                Back
              </button>
              {step < 6 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 py-3 rounded-xl font-bold cursor-pointer border-none bg-[#1C3A2F] text-[#FFFFFF]"
                  style={{ fontFamily: "inherit" }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleCalculateMatches}
                  className="flex-1 py-3 rounded-xl font-bold cursor-pointer border-none bg-[#1C3A2F] text-[#FFFFFF]"
                  style={{ fontFamily: "inherit" }}
                >
                  Generate Profile →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 7: Generated Bangkok Lifestyle Profile Report (Spotify Wrapped style) */}
        {step === 7 && !hasSearched && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#C9A84C] block mb-2">Analysis Complete</span>
              <h2 className="text-[26px] font-bold text-[#1C3A2F] leading-tight mb-4 font-outfit">Your Bangkok Lifestyle Profile</h2>
              
              <div className="bg-[#1C3A2F] text-[#F7F3EC] p-6 rounded-3xl shadow-lg border border-white/10 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A84C]/10 rounded-full blur-2xl" />
                <span className="text-[9px] uppercase font-bold text-[#C9A84C] tracking-widest block mb-4">Resident Identity Card</span>
                
                <div className="flex flex-col gap-3.5 mb-6">
                  {lifestyleProfileBadges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                      <span className="text-[13px] font-semibold tracking-wide">{badge}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[10.5px] text-[#D5CDBE]">
                  <span>Stay: {stayDuration}</span>
                  <span>Budget limit: {formatPrice(budget)}</span>
                </div>
              </div>

              <p className="text-[12.5px] text-[#666] font-light leading-relaxed">
                Our relocation engine matched this lifestyle blueprint against Bangkok&apos;s neighborhoods to find where you belong.
              </p>
            </div>

            <button
              onClick={revealMatches}
              className="w-full py-4 rounded-xl font-bold text-[13px] bg-[#1C3A2F] text-white cursor-pointer border-none hover:bg-opacity-95 transition-all mt-6"
              style={{ fontFamily: "inherit" }}
            >
              Reveal Neighborhood Matches →
            </button>
          </div>
        )}

        {/* Step 8: Redesigned Results Page */}
        {hasSearched && !isImmersive && !isComparing && (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleReset}
                className="text-[#C9A84C] font-bold text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                ← Restart Survey
              </button>

              {compareSlugs.length > 0 && (
                <button
                  onClick={() => setIsComparing(true)}
                  disabled={compareSlugs.length < 2}
                  className="px-4 py-2 rounded-full font-bold text-[10.5px] border-none bg-[#C9A84C] text-[#1C3A2F] cursor-pointer disabled:opacity-50"
                  style={{ fontFamily: "inherit" }}
                >
                  ⚖️ Compare Selected ({compareSlugs.length}/2)
                </button>
              )}
            </div>

            <h1 className="text-[26px] font-bold text-[#1C3A2F] leading-tight mb-2">
              Your Best Bangkok Neighborhoods
            </h1>
            <p className="text-[13px] text-[#666] font-light mb-6">
              We identified the top communities matching your personality, budget constraints, and avoided attributes.
            </p>

            <div className="flex flex-col gap-6">
              {matchedResults.map((match, idx) => {
                const n = NEIGHBORHOODS.find((item) => item.slug === match.slug);
                if (!n) return null;
                const isSelected = selectedSlug === match.slug;
                const isStagedForCompare = compareSlugs.includes(match.slug);

                return (
                  <div
                    key={match.slug}
                    onClick={() => setSelectedSlug(match.slug)}
                    className="p-6 rounded-3xl transition-all cursor-pointer bg-[#FFFFFF]"
                    style={{
                      border: isSelected ? "2.5px solid #C9A84C" : "1.5px solid #E5E0D8",
                      boxShadow: isSelected ? "0 8px 24px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.01)",
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        {/* Qualitative Fit Labels instead of raw percentages */}
                        <span className="px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider text-white mr-1.5" style={{ background: match.fitLabel === "Excellent Fit" ? "#10B981" : match.fitLabel === "Strong Match" ? "#C9A84C" : "#888" }}>
                          {match.fitLabel}
                        </span>
                        <span className="text-[11px] font-bold text-[#888] uppercase tracking-wider">Choice #{idx + 1}</span>
                        <h3 className="text-[20px] font-bold text-[#1C3A2F] mt-1.5">
                          {n.name}
                        </h3>
                        <span className="text-[11px] font-bold italic text-[#C9A84C]">
                          &quot;{n.personality}&quot;
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompare(match.slug);
                        }}
                        className="p-2 rounded-full border border-gray-200 bg-transparent text-xs hover:border-[#C9A84C] cursor-pointer"
                        title="Compare Area"
                      >
                        {isStagedForCompare ? "⚖️ Staged" : "⚖️ Compare"}
                      </button>
                    </div>

                    <p className="text-[12.5px] text-[#444] font-light leading-relaxed mb-4 border-l-2 pl-3 border-[#EDE8DF]">
                      {match.explanation}
                    </p>

                    <div className="mb-5">
                      <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block mb-2">Why Fits You:</span>
                      <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                        {match.whyWeChose.slice(0, 3).map((bullet, index) => (
                          <li key={index} className="text-[12px] font-medium text-[#1C3A2F] flex items-center gap-1.5">
                            <span className="text-[#C9A84C]">✓</span> {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlug(match.slug);
                          setIsImmersive(true);
                        }}
                        className="flex-1 py-3 rounded-xl text-center font-bold text-[12.5px] cursor-pointer border-none bg-[#1C3A2F] text-white hover:bg-opacity-95 transition-all"
                        style={{ fontFamily: "inherit" }}
                      >
                        Explore {n.name} Area
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlug(match.slug);
                          setIsImmersive(true);
                          // Delay scroll to condos at bottom
                          setTimeout(() => {
                            document.getElementById("condo-recommendations-list")?.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }}
                        className="py-3 px-4 rounded-xl text-center font-bold text-[12.5px] cursor-pointer border border-[#E5E0D8] bg-white text-[#1C3A2F] hover:border-[#1C3A2F] transition-all"
                        style={{ fontFamily: "inherit" }}
                      >
                        View Condos
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 12: Area Comparison Tool Side-by-Side View */}
        {isComparing && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setIsComparing(false)}
              className="text-[#C9A84C] font-bold text-xs uppercase tracking-wider mb-6 text-left bg-transparent border-none cursor-pointer flex items-center gap-1"
            >
              ← Back to Neighborhood List
            </button>

            <h1 className="text-[24px] font-bold text-[#1C3A2F] leading-tight mb-2">
              Neighborhood Comparison
            </h1>
            <p className="text-[12.5px] text-[#666] font-light mb-6">
              Compare your selected locations side-by-side on lifestyle parameters, rent rates, and environment traits.
            </p>

            {compareNeighborhoods.length === 2 && (
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E5E0D8] overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-left text-[12.5px]">
                  <thead>
                    <tr style={{ background: "#1C3A2F", color: "#FFFFFF" }}>
                      <th className="p-3 font-bold border-b border-white/10">Feature</th>
                      <th className="p-3 font-bold border-b border-white/10">{compareNeighborhoods[0].name}</th>
                      <th className="p-3 font-bold border-b border-white/10">{compareNeighborhoods[1].name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-bold text-[#888]">Personality</td>
                      <td className="p-3 font-semibold text-[#1C3A2F] italic">&quot;{compareNeighborhoods[0].personality}&quot;</td>
                      <td className="p-3 font-semibold text-[#1C3A2F] italic">&quot;{compareNeighborhoods[1].personality}&quot;</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="p-3 font-bold text-[#888]">Avg Rent</td>
                      <td className="p-3 font-bold text-[#C9A84C]">{formatPrice(compareNeighborhoods[0].averageRentMin)} - {formatPrice(compareNeighborhoods[0].averageRentMax)}</td>
                      <td className="p-3 font-bold text-[#C9A84C]">{formatPrice(compareNeighborhoods[1].averageRentMin)} - {formatPrice(compareNeighborhoods[1].averageRentMax)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-bold text-[#888]">Transit Hub</td>
                      <td className="p-3 font-medium text-[#1C3A2F]">{compareNeighborhoods[0].nearestTransit}</td>
                      <td className="p-3 font-medium text-[#1C3A2F]">{compareNeighborhoods[1].nearestTransit}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="p-3 font-bold text-[#888]">☕ Cafe Culture</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[0].scores.cafeCulture}/10</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[1].scores.cafeCulture}/10</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-bold text-[#888]">Nightlife</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[0].scores.nightlife}/10</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[1].scores.nightlife}/10</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="p-3 font-bold text-[#888]">Pet Friendliness</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[0].scores.petFriendly}/10</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[1].scores.petFriendly}/10</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-bold text-[#888]">Family Suitability</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[0].scores.familyFriendly}/10</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[1].scores.familyFriendly}/10</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="p-3 font-bold text-[#888]">Walk Score</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[0].scores.walkability}/10</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[1].scores.walkability}/10</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-bold text-[#888]">Luxury Level</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[0].scores.luxury}/10</td>
                      <td className="p-3 font-bold text-[#1C3A2F]">{compareNeighborhoods[1].scores.luxury}/10</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="p-3 font-bold text-[#888]">Traffic Noise</td>
                      <td className="p-3 font-bold text-red-500">{compareNeighborhoods[0].avoidanceStats.noise}/10</td>
                      <td className="p-3 font-bold text-red-500">{compareNeighborhoods[1].avoidanceStats.noise}/10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Step 10 & 13: Area Explorer & Day Preview Immersive View */}
        {hasSearched && isImmersive && selectedNeighborhood && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <button
              onClick={() => setIsImmersive(false)}
              className="text-[#C9A84C] font-bold text-xs uppercase tracking-wider mb-6 text-left bg-transparent border-none cursor-pointer flex items-center gap-1"
            >
              ← Back to Recommendations
            </button>

            {/* Hero Banner with Personality */}
            <div className="rounded-3xl overflow-hidden relative mb-6 shadow-sm border border-[#E5E0D8]" style={{ height: "220px" }}>
              <img
                src={selectedNeighborhood.heroImage}
                alt={selectedNeighborhood.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end p-6">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#C9A84C] text-[#1C3A2F] block w-fit mb-1.5">
                    {selectedNeighborhood.personality}
                  </span>
                  <h1 className="text-[30px] font-bold text-[#FFFFFF] leading-none mb-1 font-outfit">
                    {selectedNeighborhood.name}
                  </h1>
                  <p className="text-[11.5px] text-white/80 font-medium">
                    🚇 Nearby Station: <span className="font-bold text-white">{selectedNeighborhood.nearestTransit}</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[13.5px] text-[#444] font-light leading-relaxed mb-6 font-sans">
              {selectedNeighborhood.description}
            </p>

            {/* Resident Reviews (Step 10 Quote) */}
            {selectedNeighborhood.reviews && selectedNeighborhood.reviews.length > 0 && (
              <div className="mb-6 p-5 rounded-2xl bg-[#EDE8DF]/40 border border-[#E5E0D8]/60 relative italic">
                <span className="text-[32px] text-[#C9A84C] font-serif absolute -top-2 left-2 leading-none">“</span>
                <p className="text-[12.5px] text-[#1C3A2F] font-light pl-4 pr-2 mb-2 leading-relaxed">
                  {selectedNeighborhood.reviews[0].quote}
                </p>
                <div className="text-right text-[10.5px] font-bold text-[#888] pr-2">
                  — {selectedNeighborhood.reviews[0].author}, <span className="font-medium">{selectedNeighborhood.reviews[0].role}</span>
                </div>
              </div>
            )}

            {/* Lifestyle Scores */}
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
                        <div className="h-full rounded-full" style={{ width: `${s.val * 10}%`, background: s.val >= 8 ? "#10B981" : "#C9A84C" }}></div>
                      </div>
                      <span className="text-[11px] font-bold text-[#1C3A2F]">{s.val}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 13: One-Day Life Preview */}
            {selectedNeighborhood.dayItinerary && selectedNeighborhood.dayItinerary.length > 0 && (
              <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E5E0D8] mb-6">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-4 pb-2 border-b border-gray-100">
                  📅 A Day in {selectedNeighborhood.name}
                </h3>
                <div className="flex flex-col gap-4">
                  {selectedNeighborhood.dayItinerary.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase bg-[#EDE8DF] px-2 py-0.5 rounded text-[#1C3A2F] tracking-wide whitespace-nowrap">
                          {item.time}
                        </span>
                        {idx < selectedNeighborhood.dayItinerary.length - 1 && (
                          <div className="w-[1.5px] flex-1 bg-[#E5E0D8] my-1" style={{ minHeight: "20px" }} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[12.5px] font-bold text-[#1C3A2F] mb-0.5">{item.title}</h4>
                        <p className="text-[12px] text-[#666] font-light leading-relaxed">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demographics & Demands */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5E0D8]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block mb-1">Avg Rent</span>
                <span className="text-[14px] font-bold text-[#C9A84C]">
                  {formatPrice(selectedNeighborhood.averageRentMin)} - {formatPrice(selectedNeighborhood.averageRentMax)}
                </span>
              </div>
              <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5E0D8]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block mb-1">Transit station</span>
                <span className="text-[14px] font-bold text-[#1C3A2F] truncate block">
                  {selectedNeighborhood.nearestTransit}
                </span>
              </div>
            </div>

            {/* Neighborhood Highlights lists */}
            <div className="flex flex-col gap-5 bg-[#FFFFFF] p-5 rounded-3xl border border-[#E5E0D8] mb-6">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#1C3A2F] pb-2 border-b border-gray-100">
                ✨ Local Area Highlights
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

            {/* Deep Dive Relocation Guides */}
            {relevantArticles.length > 0 && (
              <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#E5E0D8] mb-6">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-3 pb-2 border-b border-gray-100 flex items-center gap-1.5 font-outfit">
                  📖 Deep Dive Relocation Guides
                </h3>
                <p className="text-[11.5px] text-[#666] mb-4 font-light leading-relaxed">
                  Read our premium editorial guides to understand more about the lifestyle, transit, and rental pricing in the {selectedNeighborhood.name} area.
                </p>
                <div className="flex flex-col gap-2.5">
                  {relevantArticles.map((article) => (
                    <a
                      key={article.slug}
                      href={`/blog/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-[#F7F3EC]/50 hover:bg-[#EDE8DF] border border-[#E5E0D8] transition-all flex items-center justify-between group no-underline text-inherit"
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="text-[12.5px] font-bold text-[#1C3A2F] group-hover:text-[#C9A84C] transition-colors mb-1 font-outfit">
                          {article.title}
                        </h4>
                        <p className="text-[11px] text-[#666] font-light line-clamp-1 m-0">
                          {article.excerpt}
                        </p>
                      </div>
                      <span className="text-[#C9A84C] font-bold text-sm group-hover:translate-x-1 transition-transform ml-2 shrink-0">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Step 14: Condo Recommendations (Gated at the very end) */}
            <div id="condo-recommendations-list" className="pt-6 border-t border-[#E5E0D8]">
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C9A84C] block mb-1">Result of Auto Finder</span>
              <h3 className="text-[15px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-4">
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
      <div 
        className="hidden lg:flex lg:col-span-7 h-full flex-col relative" 
        style={{ height: "calc(100vh - 56px)" }}
      >
        
        {/* Dynamic Map Layers selector floating at top */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-lg z-10 flex flex-wrap gap-1.5 items-center justify-between" style={{ border: "1px solid #E5E0D8" }}>
          <div>
            <h4 className="text-[10.5px] font-bold uppercase tracking-wider font-outfit" style={{ color: "#1C3A2F" }}>
              Bangkok Neighborhood Explorer™
            </h4>
            <span className="text-[9px] font-medium text-[#888]">Select a layer to view suitability overlays</span>
          </div>
 
          <div className="flex flex-wrap gap-1">
            {[
              { id: "match", label: "My Match Fit ⚡" },
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
                className="px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold cursor-pointer transition-all border-none"
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
 
        {!isMobile && (
          <MapComponent
            neighborhoods={NEIGHBORHOODS}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
            workplace={activeWorkplaceName}
            workplaceCoords={workplaceCoords}
            maxCommute={maxCommute}
            matchedSlugs={matchedSlugs}
            selectedLayer={activeLayer}
            liveScores={liveScores}
          />
        )}
        
        {/* Floating Neighborhood Quick Preview Card (visible during wizard or results) */}
        {selectedNeighborhood && (
          <div 
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-3xl shadow-xl z-20 flex flex-col gap-2.5 transition-all max-w-[280px]"
            style={{ border: "1px solid #E5E0D8", width: "calc(100% - 32px)", zIndex: 1010 }}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9A84C]">
                  {selectedNeighborhood.personality}
                </span>
                <h4 className="text-[15px] font-bold text-[#1C3A2F] leading-tight mt-0.5 font-outfit">
                  {selectedNeighborhood.name}
                </h4>
              </div>
              <div 
                className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-white whitespace-nowrap"
                style={{ 
                  background: (liveScores[selectedNeighborhood.slug] || 50) >= 85 ? "#10B981" : (liveScores[selectedNeighborhood.slug] || 50) >= 65 ? "#F59E0B" : "#EF4444" 
                }}
              >
                {liveScores[selectedNeighborhood.slug] || 50}% Fit
              </div>
            </div>
 
            <p className="text-[11.5px] text-[#555] font-light leading-relaxed m-0 line-clamp-2">
              {selectedNeighborhood.description}
            </p>
 
            <div className="flex justify-between items-center text-[10px] font-bold text-[#888] pt-1.5 border-t border-gray-100">
              <span>🚇 {selectedNeighborhood.nearestTransit}</span>
              <span>💰 {formatPrice(selectedNeighborhood.averageRentMin).replace(/\.00$/, '')} - {formatPrice(selectedNeighborhood.averageRentMax).replace(/\.00$/, '')}</span>
            </div>
 
            <div className="flex gap-1.5 mt-0.5">
              {!hasSearched ? (
                <>
                  <button
                    onClick={() => {
                      setWorkplaceOption("Custom Location");
                      setCustomWorkplace(selectedNeighborhood.name);
                      setStep(6); // Go to workplace step
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg text-[9px] font-bold bg-[#EDE8DF] text-[#1C3A2F] border-none cursor-pointer hover:bg-opacity-95 transition-all"
                    style={{ fontFamily: "inherit" }}
                  >
                    📍 Set as Workplace
                  </button>
                  <button
                    onClick={() => {
                      alert(`Complete the survey to unlock the deep 24-hour itinerary, guides, and condo matches for ${selectedNeighborhood.name}!`);
                    }}
                    className="py-1.5 px-2 rounded-lg text-[9px] font-bold bg-[#1C3A2F] text-white border-none cursor-pointer hover:bg-opacity-95 transition-all"
                    style={{ fontFamily: "inherit" }}
                  >
                    Quick Guide
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsImmersive(true);
                    document.getElementById("match-explorer-left-column")?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full py-2 rounded-xl text-center font-bold text-[10.5px] cursor-pointer border-none bg-[#1C3A2F] text-white hover:bg-opacity-95 transition-all"
                  style={{ fontFamily: "inherit" }}
                >
                  Explore Area Guide & Condos →
                </button>
              )}
            </div>
          </div>
        )}
 
        {/* Map Legend */}
        <div 
          className={`absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-lg z-10 animate-fadeIn ${
            selectedNeighborhood ? "hidden sm:block" : "block"
          }`} 
          style={{ border: "1px solid #E5E0D8" }}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#1C3A2F" }}>
            Suitability Legend
          </h4>
          <div className="flex flex-col gap-1.5 text-[11px] font-medium">
            {activeLayer === "match" ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#10B981" }} />
                  <span>🟢 High Compatibility (85% - 99%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#F59E0B" }} />
                  <span>🟡 Moderate Compatibility (65% - 84%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#EF4444" }} />
                  <span>🔴 Low Compatibility (45% - 64%)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#10B981" }} />
                  <span>🟢 High Fit Score (8-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#F59E0B" }} />
                  <span>🟡 Moderate Fit Score (5-7)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#EF4444" }} />
                  <span>🔴 Low Fit Score (1-4)</span>
                </div>
              </>
            )}
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
