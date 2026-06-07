import { NextRequest, NextResponse } from "next/server";
import { NEIGHBORHOODS, Neighborhood } from "@/data/neighborhoods";

interface MatchResult {
  slug: string;
  matchPercentage: number;
  explanation: string;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, workplace, budget } = await req.json();

    const cleanPrompt = (prompt || "").trim();
    const cleanWorkplace = (workplace || "").trim();
    const maxBudget = Number(budget) || Infinity;

    const apiKey = process.env.GEMINI_API_KEY;
    let matches: MatchResult[] = [];

    if (apiKey && cleanPrompt) {
      // Use Gemini to perform semantic matchmaking
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemPrompt = `
You are an expert expat relocation assistant for NHP Bangkok.
Given the user's search query, preferred workplace location, and monthly rental budget, evaluate the following Bangkok neighborhoods list and rank the top 3 best matching neighborhoods.

User Query: "${cleanPrompt}"
Preferred Workplace: "${cleanWorkplace}"
Monthly Budget: ${maxBudget === Infinity ? "No limit" : maxBudget + " THB"}

Neighborhood Dataset:
${JSON.stringify(NEIGHBORHOODS, null, 2)}

Return a JSON object matching this exact schema:
{
  "matches": [
    {
      "slug": "neighborhood-slug", // e.g. "ari"
      "matchPercentage": 95, // Integer between 0 and 100
      "explanation": "Short 2-sentence explanation of why this area matches their lifestyle, commute, and budget."
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
            matches = parsed.matches;
          }
        }
      }
    }

    // Fallback if no API Key or Gemini call fails / no custom prompt
    if (matches.length === 0) {
      matches = runLocalMatchmaking(cleanPrompt, cleanWorkplace, maxBudget);
    }

    return NextResponse.json({ success: true, matches });
  } catch (err) {
    console.error("Matchmaking error:", err);
    return NextResponse.json({ error: "Failed to process matchmaking request" }, { status: 500 });
  }
}

function getWorkplaceCoords(workplaceName: string): [number, number] | null {
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

function runLocalMatchmaking(prompt: string, workplace: string, budget: number): MatchResult[] {
  const query = prompt.toLowerCase();
  const isPetLover = /pet|dog|cat|animal/i.test(query);
  const isRemoteWorker = /remote|work|nomad|laptop|coworking|coffee|cafe/i.test(query);
  const isFamily = /family|kid|child|school|quiet|calm/i.test(query);
  const isNightlife = /nightlife|bar|club|party|drink|active|young/i.test(query);
  const isWalkable = /walk|transit|near|bts|mrt|station|close/i.test(query);

  const scored = NEIGHBORHOODS.map((n) => {
    let score = 50; // Base score

    // 1. Budget check
    if (budget !== Infinity) {
      if (n.averageRentMin > budget) {
        score -= 40; // Too expensive
      } else if (n.averageRentMax <= budget) {
        score += 15; // Well within budget
      } else {
        score += 5; // Fits minimum budget but max is higher
      }
    }

    // 2. Commute check
    if (workplace) {
      const mins = getCommuteMinutes(n, workplace);
      if (mins === 0) {
        score += 30; // Works in this area
      } else if (mins <= 10) {
        score += 25; // Close commute
      } else if (mins <= 20) {
        score += 15; // Reasonable commute
      } else if (mins <= 30) {
        score += 5; // Long commute
      } else {
        score -= 15; // Too far
      }
    }

    // 3. Lifestyle preferences
    if (isPetLover) {
      score += n.scores.petFriendly * 2.5;
    }
    if (isRemoteWorker) {
      score += (n.scores.remoteWork + n.scores.cafeCulture) * 1.5;
    }
    if (isFamily) {
      score += n.scores.familyFriendly * 2.5;
    }
    if (isNightlife) {
      score += n.scores.nightlife * 2.5;
    }
    if (isWalkable) {
      score += n.scores.walkability * 2.5;
    }

    // Map score to a percentage (cap at 98, floor at 40)
    const matchPercentage = Math.min(98, Math.max(40, Math.round(score)));

    // Generate a simple, friendly explanation
    let explanation = `Great lifestyle match for your search. `;
    if (workplace) {
      const mins = getCommuteMinutes(n, workplace);
      explanation += mins === 0
        ? `Directly situated in your workplace location. `
        : `Convenient commute of just ${mins} mins to ${workplace}. `;
    }
    if (isPetLover && n.scores.petFriendly >= 8) {
      explanation += `Features highly pet-friendly residences and walking paths. `;
    }
    if (isRemoteWorker && n.scores.cafeCulture >= 9) {
      explanation += `Abundant with workspace cafes and excellent Wi-Fi spots. `;
    }

    return {
      slug: n.slug,
      matchPercentage,
      explanation,
    };
  });

  // Sort descending and take top 3
  return scored
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);
}
