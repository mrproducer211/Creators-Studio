import { NextRequest, NextResponse } from "next/server";
import { NEIGHBORHOODS, Neighborhood } from "@/data/neighborhoods";

interface MatchResult {
  slug: string;
  matchPercentage: number;
  explanation: string;
  whyWeChose: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { reason, preferences, budget, stayDuration, workplace } = await req.json();

    const cleanReason = reason || "Just Exploring Bangkok";
    const selectedPrefs = Array.isArray(preferences) ? preferences : [];
    const maxBudget = Number(budget) || 50000;
    const cleanDuration = stayDuration || "6-12 Months";
    const cleanWorkplace = (workplace || "").trim();

    // 1. Calculate Scores Locally for absolute mathematical precision
    const rankedNeighborhoods = calculateRelocationMatches(
      cleanReason,
      selectedPrefs,
      maxBudget,
      cleanWorkplace
    );

    const topMatches = rankedNeighborhoods.slice(0, 3);
    const apiKey = process.env.GEMINI_API_KEY;

    let matches: MatchResult[] = [];

    if (apiKey) {
      // Use Gemini to generate high-fidelity relocation consultant advice and bullet points
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const systemPrompt = `
You are a premium, seasoned expat relocation consultant in Bangkok. 
Given the user's details and our calculated top 3 neighborhood matches, write a personalized, highly professional relocation consultant explanation and 5 specific bullet points explaining "Why We Chose" this neighborhood.

User Inputs:
- Reason for coming: "${cleanReason}"
- Preferences: ${JSON.stringify(selectedPrefs)}
- Monthly Budget: ${maxBudget} THB
- Length of Stay: "${cleanDuration}"
- Workplace/Destination: "${cleanWorkplace || "None specified"}"

Your Top 3 Matched Neighborhoods (with calculated match percentages):
${JSON.stringify(
  topMatches.map((t) => ({
    name: t.name,
    slug: t.slug,
    matchPercentage: t.matchPercentage,
    description: t.description,
    scores: t.scores,
  })),
  null,
  2
)}

Return a JSON object matching this exact schema:
{
  "matches": [
    {
      "slug": "neighborhood-slug", // e.g. "ari"
      "explanation": "A beautiful 2-3 sentence personalized paragraph written in the warm, authoritative voice of a relocation advisor explaining how this area fits their duration, purpose, and lifestyle.",
      "whyWeChose": [
        "First short reason (e.g. Excellent cafe culture)",
        "Second short reason",
        "Third short reason",
        "Fourth short reason",
        "Fifth short reason"
      ]
    }
  ]
}
`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textResponse) {
            const parsed = JSON.parse(textResponse);
            if (parsed.matches && Array.isArray(parsed.matches)) {
              matches = topMatches.map((m) => {
                const apiMatch = parsed.matches.find((item: any) => item.slug === m.slug);
                return {
                  slug: m.slug,
                  matchPercentage: m.matchPercentage,
                  explanation: apiMatch?.explanation || m.explanation,
                  whyWeChose: apiMatch?.whyWeChose || m.whyWeChose,
                };
              });
            }
          }
        }
      } catch (err) {
        console.warn("Gemini matchmaker generation failed, using local templates:", err);
      }
    }

    // Fallback to local advisor templates if no API key or API fails
    if (matches.length === 0) {
      matches = topMatches;
    }

    return NextResponse.json({ success: true, matches });
  } catch (err) {
    console.error("Matchmaking error:", err);
    return NextResponse.json({ error: "Failed to process matchmaking request" }, { status: 500 });
  }
}

// Coordinate lookup for commute compatibility
function getWorkplaceCoords(workplaceName: string): [number, number] | null {
  if (!workplaceName) return null;
  // Check standard locations
  if (workplaceName.toLowerCase() === "one bangkok") return [13.7265, 100.5445];
  if (workplaceName.toLowerCase() === "sathorn") return [13.7242, 100.5284];
  if (workplaceName.toLowerCase() === "silom") return [13.7285, 100.5342];
  if (workplaceName.toLowerCase() === "asoke" || workplaceName.toLowerCase() === "asok") return [13.7369, 100.5604];
  if (workplaceName.toLowerCase() === "chulalongkorn university" || workplaceName.toLowerCase() === "chula") return [13.7384, 100.5321];
  
  // Check neighborhood database names
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
  explanation: string;
  whyWeChose: string[];
}

function calculateRelocationMatches(
  reason: string,
  preferences: string[],
  budget: number,
  workplace: string
): InternalRanked[] {
  const hasWorkplace = !!workplace;

  // Determine weights dynamically
  const wLifestyle = hasWorkplace ? 0.40 : 0.60; // Workplace commute reallocated to lifestyle if not specified
  const wBudget    = 0.25;
  const wCommute   = hasWorkplace ? 0.20 : 0.00;
  const wCommunity = 0.15;

  return NEIGHBORHOODS.map((n) => {
    // 1. Lifestyle Compatibility Score (mapping Step 2 tags to scores out of 100)
    let lifestyleScore = 70; // Base lifestyle score
    if (preferences.length > 0) {
      let totalMatch = 0;
      preferences.forEach((pref) => {
        let scoreVal = 7; // default
        switch (pref) {
          case "Cafe Culture":
            scoreVal = n.scores.cafeCulture;
            break;
          case "Quiet & Peaceful":
            scoreVal = 10 - n.scores.nightlife;
            break;
          case "Easy Public Transport":
          case "City Center":
          case "Fitness & Active Lifestyle":
            scoreVal = n.scores.walkability;
            break;
          case "Nightlife & Entertainment":
            scoreVal = n.scores.nightlife;
            break;
          case "Shopping & Malls":
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
          case "Parks & Green Space":
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
        totalMatch += scoreVal * 10; // Convert 1-10 scale to 0-100
      });
      lifestyleScore = totalMatch / preferences.length;
    }

    // 2. Budget Compatibility Score (25%)
    let budgetScore = 100;
    if (budget < n.averageRentMin) {
      // Too expensive for target budget
      const diff = n.averageRentMin - budget;
      budgetScore = Math.max(20, 100 - (diff / 250)); // scale down based on difference
    } else if (budget >= n.averageRentMax) {
      budgetScore = 100; // Easily affordable
    } else {
      // Mid-range budget
      const range = n.averageRentMax - n.averageRentMin;
      const progress = range > 0 ? (budget - n.averageRentMin) / range : 1;
      budgetScore = 70 + progress * 30; // 70% to 100%
    }

    // 3. Commute Compatibility Score (20% or 0%)
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
    let communityScore = 80; // default
    switch (reason) {
      case "Vacation / Long Stay":
      case "Just Exploring Bangkok":
        communityScore = n.scores.walkability * 10;
        break;
      case "Remote Work / Digital Nomad":
      case "New Job / Relocation":
      case "Business / Entrepreneur":
        communityScore = n.scores.remoteWork * 10;
        break;
      case "Study":
        communityScore = n.scores.studentSuitability * 10;
        break;
      case "Family Relocation":
        communityScore = n.scores.familyFriendly * 10;
        break;
      case "Pet-Friendly Living":
        communityScore = n.scores.petFriendly * 10;
        break;
      case "Luxury Lifestyle":
        communityScore = n.scores.luxury * 10;
        break;
    }

    // Weighted Total Score
    const finalScore = Math.round(
      lifestyleScore * wLifestyle +
      budgetScore * wBudget +
      commuteScore * wCommute +
      communityScore * wCommunity
    );

    const matchPercentage = Math.min(99, Math.max(45, finalScore));

    // Generate local fallback consultant advice & bullets
    const localExplanations: Record<string, { desc: string; bullets: string[] }> = {
      ari: {
        desc: `We recommended Ari because it fits your desire for a creative, quiet expat enclave. Boasting Bangkok's finest cafe culture, it offers a tranquil environment that easily accommodates remote work within your housing budget.`,
        bullets: [
          "Excellent local cafe culture",
          "Highly popular among remote workers",
          "Quiet, tree-lined residential streets",
          "Perfect fit for your monthly budget",
          "Very strong community feel"
        ]
      },
      sathorn: {
        desc: `Sathorn is our top recommendation for corporate professionals seeking elite housing. Close to Lumphini Park, it hosts top-tier international communities, luxury high-rises, and direct business transit nodes.`,
        bullets: [
          "Convenient access to Chong Nonsi transit",
          "Leafy, upscale residential sub-sois",
          "Proximity to Lumphini green space",
          "High concentrations of international schools",
          "Premier corporate business hub"
        ]
      },
      "thong-lo": {
        desc: `Thong Lo is chosen for your stay because it is Bangkok's premier lifestyle core. Highly popular with expats, it is perfect if you value premium nightlife, dining, Japanese community ties, and modern residences.`,
        bullets: [
          "Epicenter of style and nightlife",
          "Premier dining and lifestyle mall spots",
          "Strong Japanese expat community",
          "Abundance of luxury condominiums",
          "Active, trendy environment"
        ]
      },
      asok: {
        desc: `Asok is selected due to its absolute transit centrality. Connecting the MRT and BTS lines, it is perfect for active professionals wanting easy commutes, direct shopping mall access, and versatile workspaces.`,
        bullets: [
          "Ultimate BTS & MRT interchange core",
          "Abundant coworking and office towers",
          "Steps from Terminal 21 shopping hub",
          "Highly walkable city center",
          "Lively, diverse dining scene"
        ]
      },
      silom: {
        desc: `Silom offers a dynamic city center environment. Blending high-density business districts with close proximity to Chulalongkorn University and Lumphini park, it serves as a robust home base for active urbanites.`,
        bullets: [
          "Direct access to Lumphini Park",
          "Very high walkability scores",
          "Vibrant nightlife and shopping malls",
          "Convenient transit connections",
          "Excellent street food and restaurants"
        ]
      },
      "on-nut": {
        desc: `On Nut is a budget-friendly residential sanctuary. It provides comfortable, modern high-rises with strong expat communities and local Thai food markets, making it the most cost-effective location on the BTS line.`,
        bullets: [
          "Extremely budget-friendly rental costs",
          "Direct access to On Nut BTS station",
          "Cozy local markets and supermarkets",
          "Highly relaxed expat residential feel",
          "Excellent value-for-money properties"
        ]
      },
      ekkamai: {
        desc: `Ekkamai is recommended as a elegant, peaceful sanctuary just minutes from Thong Lo. Offering premium craft breweries and cozy cafes, it is a highly popular residential retreat for families and digital nomads.`,
        bullets: [
          "Premium boutique cafes and pubs",
          "Slightly quieter residential vibe",
          "Direct access to Gateway Ekkamai mall",
          "Adjacent to the trendy Thong Lo core",
          "Excellent pet-friendly rental options"
        ]
      },
      sukhumvit: {
        desc: `Sukhumvit (Phrom Phong core) represents the pinnacle of international expat luxury. Centered around major parks and the EmDistrict retail malls, it offers top-class cafes and family-friendly environments.`,
        bullets: [
          "Home to EmQuartier and EmSphere malls",
          "Beautiful Benjasiri park access",
          "Premier Western expat community hub",
          "Excellent dining and cafe selections",
          "Elite, secure condominium options"
        ]
      }
    };

    const details = localExplanations[n.slug] || {
      desc: `We recommended ${n.name} because it matches your target budget, provides excellent walkability, and fits your requested lifestyle parameters.`,
      bullets: [
        `Highly suitable for ${reason}`,
        "Convenient transit access",
        "Great community environment",
        "Comfortable neighborhood feel",
        "Excellent local amenities"
      ]
    };

    return {
      ...n,
      matchPercentage,
      explanation: details.desc,
      whyWeChose: details.bullets,
    };
  })
  .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
