import { NextRequest, NextResponse } from "next/server";
import { NEIGHBORHOODS, Neighborhood } from "@/data/neighborhoods";

interface MatchResult {
  slug: string;
  matchPercentage: number;
  fitLabel: "Excellent Fit" | "Strong Match" | "Good Alternative";
  explanation: string;
  whyWeChose: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { reason, preferences, criticalPreferences, avoidances, budget, workplace } = await req.json();

    const cleanReason = reason || "Just Exploring Bangkok";
    const selectedPrefs = Array.isArray(preferences)
      ? preferences.map((p: string) => p.replace(/^[^a-zA-Z0-9\s]+/, "").trim())
      : [];
    const selectedCriticals = Array.isArray(criticalPreferences)
      ? criticalPreferences.map((p: string) => p.replace(/^[^a-zA-Z0-9\s]+/, "").trim())
      : [];
    const selectedAvoidances = Array.isArray(avoidances) ? avoidances : [];
    const maxBudget = Number(budget) || 50000;
    const cleanWorkplace = (workplace || "").trim();

    // Calculate matches locally and deterministically
    const rankedNeighborhoods = calculateRelocationMatches(
      cleanReason,
      selectedPrefs,
      selectedCriticals,
      selectedAvoidances,
      maxBudget,
      cleanWorkplace
    );

    const matches: MatchResult[] = rankedNeighborhoods.map((n) => ({
      slug: n.slug,
      matchPercentage: n.matchPercentage,
      fitLabel: n.fitLabel,
      explanation: n.explanation,
      whyWeChose: n.whyWeChose,
    }));

    return NextResponse.json({ success: true, matches });
  } catch (err) {
    console.error("Matchmaking error:", err);
    return NextResponse.json({ error: "Failed to process matchmaking request" }, { status: 500 });
  }
}

function getWorkplaceCoords(workplaceName: string): [number, number] | null {
  if (!workplaceName) return null;
  if (workplaceName.toLowerCase() === "one bangkok") return [13.7265, 100.5445];
  if (workplaceName.toLowerCase() === "sathorn") return [13.7242, 100.5284];
  if (workplaceName.toLowerCase() === "silom") return [13.7285, 100.5342];
  if (workplaceName.toLowerCase() === "asoke" || workplaceName.toLowerCase() === "asok") return [13.7369, 100.5604];
  if (workplaceName.toLowerCase() === "chulalongkorn university" || workplaceName.toLowerCase() === "chula") return [13.7384, 100.5321];
  
  const n = NEIGHBORHOODS.find(item => item.name.toLowerCase() === workplaceName.toLowerCase());
  if (n) return [n.lat, n.lng];
  return null;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getCommuteMinutes(n: Neighborhood, workplaceName: string): number {
  if (n.commuteMinutes && n.commuteMinutes[workplaceName] !== undefined) {
    return n.commuteMinutes[workplaceName];
  }
  const wCoords = getWorkplaceCoords(workplaceName);
  if (wCoords) {
    const [wLat, wLng] = wCoords;
    const dist = getDistance(n.lat, n.lng, wLat, wLng);
    return Math.round(dist * 3.5 + (dist > 0 ? 2 : 0));
  }
  return 15;
}

interface InternalRanked extends Neighborhood {
  matchPercentage: number;
  fitLabel: "Excellent Fit" | "Strong Match" | "Good Alternative";
  explanation: string;
  whyWeChose: string[];
}

function calculateRelocationMatches(
  reason: string,
  preferences: string[],
  criticalPreferences: string[] = [],
  avoidances: string[],
  budget: number,
  workplace: string
): InternalRanked[] {
  const hasWorkplace = !!workplace;
  const isPetRequired = reason === "Pet-Friendly Lifestyle" || 
                        preferences.some(p => p.toLowerCase().includes("pet")) ||
                        criticalPreferences.some(p => p.toLowerCase().includes("pet"));

  // Weights
  const wLifestyle = hasWorkplace ? 0.40 : 0.60;
  const wBudget    = 0.25;
  const wCommute   = hasWorkplace ? 0.20 : 0.00;
  const wCommunity = 0.15;

  return NEIGHBORHOODS.map((n): InternalRanked => {
    // Hard Binary Filter 1: Pet-Friendly
    if (isPetRequired && n.scores.petFriendly < 5) {
      return {
        ...n,
        matchPercentage: 35,
        fitLabel: "Good Alternative" as const,
        explanation: `${n.name} is a vibrant district, but has very limited pet-friendly condo options and green spaces.`,
        whyWeChose: ["Central location", "Good transport access"],
      };
    }

    // 1. Lifestyle Compatibility (40% or 60%)
    let lifestyleScore = 70;
    if (preferences.length > 0) {
      let totalMatch = 0;
      let totalWeight = 0;
      preferences.forEach((pref) => {
        const isCritical = criticalPreferences.includes(pref);
        const weight = isCritical ? 2.0 : 1.0;
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
        totalMatch += scoreVal * 10 * weight;
        totalWeight += weight;
      });
      lifestyleScore = totalWeight > 0 ? totalMatch / totalWeight : 70;
    }

    // 2. Budget Compatibility (25%)
    let budgetScore = 100;
    if (budget < n.averageRentMin) {
      const diff = n.averageRentMin - budget;
      budgetScore = Math.max(20, 100 - (diff / 250));
    } else if (budget >= n.averageRentMax) {
      budgetScore = 100;
    } else {
      const range = n.averageRentMax - n.averageRentMin;
      const progress = range > 0 ? (budget - n.averageRentMin) / range : 1;
      budgetScore = 70 + progress * 30;
    }

    // 3. Commute Compatibility (20% or 0%)
    let commuteScore = 100;
    let mins = 0;
    if (hasWorkplace) {
      mins = getCommuteMinutes(n, workplace);
      if (mins === 0) commuteScore = 100;
      else if (mins <= 10) commuteScore = 95;
      else if (mins <= 20) commuteScore = 85;
      else if (mins <= 30) commuteScore = 60;
      else if (mins <= 45) commuteScore = 30;
      else commuteScore = 10;
    }

    // 4. Community & Environment Score (15%)
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

    // 5. Apply Avoidance Deductions (Up to 15 points per avoidance)
    let avoidanceDeduction = 0;
    if (avoidances.length > 0) {
      avoidances.forEach((av) => {
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
    const matchPercentage = Math.min(99, Math.max(45, finalScore));

    // Determine fit label
    let fitLabel: "Excellent Fit" | "Strong Match" | "Good Alternative" = "Good Alternative";
    if (matchPercentage >= 88) {
      fitLabel = "Excellent Fit";
    } else if (matchPercentage >= 75) {
      fitLabel = "Strong Match";
    }

    // Fallback explanations mapping
    const localExplanations: Record<string, { desc: string; bullets: string[] }> = {
      ari: {
        desc: `We recommended Ari because it fits your desire for a creative, quiet expat enclave. Boasting Bangkok's finest cafe culture, it offers a tranquil environment that easily accommodates remote work within your housing budget.`,
        bullets: [
          "Strong cafe culture",
          "Quiet atmosphere",
          "Popular among remote workers",
          "Good value for your budget",
          "Close community feel"
        ]
      },
      sathorn: {
        desc: `Sathorn is our top recommendation for corporate professionals seeking elite housing. Close to Lumphini Park, it hosts top-tier international communities, luxury high-rises, and direct business transit nodes.`,
        bullets: [
          "Upscale corporate professional hub",
          "Leafy, quiet residential sub-sois",
          "Convenient business transit access",
          "Great schools and family infrastructure",
          "Fits executive rental budgets"
        ]
      },
      "thong-lo": {
        desc: `Thong Lo is chosen for your stay because it is Bangkok's premier lifestyle core. Highly popular with expats, it is perfect if you value premium nightlife, dining, Japanese community ties, and modern residences.`,
        bullets: [
          "Epicenter of style and nightlife",
          "Vibrant Japanese community hubs",
          "Luxury dining and high-end cafes",
          "Premium luxury condominiums",
          "Fast-paced active environment"
        ]
      },
      asok: {
        desc: `Asok is selected due to its absolute transit centrality. Connecting the MRT and BTS lines, it is perfect for active professionals wanting easy commutes, direct shopping mall access, and versatile workspaces.`,
        bullets: [
          "Ultimate BTS & MRT interchange core",
          "Walkover access to Terminal 21 mall",
          "High density of workspaces and offices",
          "Fast-paced urban center",
          "Highly walkable central environment"
        ]
      },
      silom: {
        desc: `Silom offers a dynamic city center environment. Blending high-density business districts with close proximity to Chulalongkorn University and Lumphini park, it serves as a robust home base for active urbanites.`,
        bullets: [
          "Direct access to Lumphini Park",
          "Energetic business and market center",
          "Walking distance to Chula campus",
          "Vibrant nightlife and shopping malls",
          "Highly walkable community roads"
        ]
      },
      "on-nut": {
        desc: `On Nut is a budget-friendly residential sanctuary. It provides comfortable, modern high-rises with strong expat communities and local Thai food markets, making it the most cost-effective location on the BTS line.`,
        bullets: [
          "Value-for-money rental costs",
          "Direct access to On Nut BTS station",
          "Supermarkets and local food markets",
          "Relaxed expat community",
          "Highly popular residential feel"
        ]
      },
      ekkamai: {
        desc: `Ekkamai is recommended as a elegant, peaceful sanctuary just minutes from Thong Lo. Offering premium craft breweries and cozy cafes, it is a highly popular residential retreat for families and digital nomads.`,
        bullets: [
          "Quiet, boutique residential sub-sois",
          "Cozy cafes and craft beer pubs",
          "Adjacent to Thong Lo hubs",
          "Excellent pet-friendly condo options",
          "Relaxed, modern expat lifestyle"
        ]
      },
      sukhumvit: {
        desc: `Sukhumvit (Phrom Phong core) represents the pinnacle of international expat luxury. Centered around major parks and the EmDistrict retail malls, it offers top-class cafes and family-friendly environments.`,
        bullets: [
          "EmQuartier and EmSphere luxury malls",
          "Direct access to Benjasiri Park",
          "Highly walkable expat center",
          "Strong international community feel",
          "Premium luxury condominiums"
        ]
      }
    };

    const details = localExplanations[n.slug] || {
      desc: `We recommended ${n.name} because it matches your target budget, provides excellent walkability, and fits your requested lifestyle parameters.`,
      bullets: [
        `Suitable for ${reason}`,
        "Convenient transit access",
        "Great community environment",
        "Comfortable neighborhood feel",
        "Excellent local amenities"
      ]
    };

    return {
      ...n,
      matchPercentage,
      fitLabel,
      explanation: details.desc,
      whyWeChose: details.bullets,
    };
  })
  .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
