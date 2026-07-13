import { readJson, writeJson } from "./store/fileStore";
import { BlogPost } from "@/data/blogPosts";

export interface BlogDraft extends BlogPost {
  id: string;
  imagePrompt: string;
  createdAt: string;
}

/**
 * Scrapes daily trending search terms in Thailand from Google Trends RSS feed.
 */
export async function fetchThailandTrends(): Promise<string[]> {
  try {
    const res = await fetch("https://trends.google.com/trends/trendingsearches/daily/rss?geo=TH");
    if (!res.ok) throw new Error(`Google Trends RSS responded with status: ${res.status}`);
    const xml = await res.text();
    
    const matches = xml.match(/<title>([^<]+)<\/title>/g) || [];
    const titles = matches
      .map(m => m.replace(/<\/?title>/g, "").trim())
      .filter(t => t && t !== "Daily Search Trends" && t.toLowerCase() !== "thailand");
      
    // Return unique titles, up to 15 items
    return Array.from(new Set(titles)).slice(0, 15);
  } catch (err) {
    console.error("Error fetching Thailand trends:", err);
    return [];
  }
}

/**
 * Calls Gemini API to write a structured blog post based on a topic or script.
 * Enforces a natural, helpful, human-like advising tone and extracts SEO metadata.
 */
export async function generateBlogDraft(promptOrScript: string): Promise<{ post: BlogPost; imagePrompt: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env.local.");
  }

  const systemInstruction = `
You are an expert real estate blogger and expat guide living in Bangkok. 
Your job is to write a highly engaging, SEO-optimized blog post in a warm, helpful, conversational, human-like tone. 
Act like a local friend offering advice to someone moving to or living in Thailand. 

CRITICAL STYLING RULES:
- Write in a natural, human voice. Avoid robotic/AI sounding phrases like "delve", "testament", "in conclusion", "furthermore", "lastly", "it's important to note".
- Use simple, direct sentences. Be honest and practical.
- Incorporate keywords naturally without stuffing them.
- Format headings with markdown in the sections.

You MUST respond strictly with a JSON object that matches this TypeScript interface:
interface BlogSection {
  heading: string;
  body: string[]; // 2 to 4 paragraphs per section, containing descriptive advisory text
}

interface BlogPost {
  slug: string;        // URL-friendly slug, e.g., "mrt-yellow-line-guide"
  category: string;    // e.g. "Neighbourhood Guide", "Expat Tips", "Market Report"
  tags: string[];      // 3-4 simple tags like "Budget", "Ekkamai", etc.
  title: string;       // Catchy, click-worthy SEO title
  metaTitle: string;   // SEO title tag under 60 chars ending in " | NHP"
  metaDesc: string;    // SEO meta description under 160 chars
  excerpt: string;     // 1-2 sentence hook summarizing the article
  readTime: string;    // e.g., "5 min read"
  publishedAt: string; // Current date in "YYYY-MM-DD"
  author: string;      // "NHP Bangkok Team"
  keywords: string[];  // 4-6 SEO keywords
  intro: string;       // Engaging intro paragraph welcoming the reader
  sections: BlogSection[]; // 3 to 5 sections detailing the topic
  cta: {
    heading: string;   // Call to action heading, e.g., "Looking for a home near the MRT?"
    body: string;      // Quick call to action description
    href: string;      // "/explore"
    label: string;     // e.g., "Browse Condos Now"
  };
  imagePrompt: string; // A descriptive prompt for a cover image. It should describe a realistic scene in Bangkok corresponding to this blog topic.
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate a blog post based on this topic or script:\n\n"${promptOrScript}"`
        }]
      }],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty response from Gemini API.");
  }

  const payload = JSON.parse(rawText.trim());
  const imagePrompt = payload.imagePrompt || `Bangkok street view near BTS, real photo`;
  
  // Create natural photorealistic iPhone shot URL using Pollinations
  const cleanImagePrompt = `candid real-life photo shot on iPhone camera, natural daylight, real photograph of ${imagePrompt}, Bangkok street or building scenery, raw camera quality, warm realistic colors, no digital rendering, no CGI digital art, no illustration`;
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(cleanImagePrompt)}?width=1200&height=800&nologo=true&seed=${seed}`;

  const post: BlogPost = {
    slug: payload.slug,
    category: payload.category || "Expat Tips",
    tags: payload.tags || [],
    title: payload.title,
    metaTitle: payload.metaTitle,
    metaDesc: payload.metaDesc,
    excerpt: payload.excerpt,
    image: imageUrl,
    readTime: payload.readTime || "5 min read",
    publishedAt: payload.publishedAt || new Date().toISOString().split("T")[0],
    author: payload.author || "NHP Bangkok Team",
    keywords: payload.keywords || [],
    intro: payload.intro,
    sections: payload.sections || [],
    cta: payload.cta || {
      heading: "Ready to explore Bangkok?",
      body: "Find your ideal home with our curated property search.",
      href: "/explore",
      label: "Browse Properties"
    }
  };

  return { post, imagePrompt: payload.imagePrompt };
}

/**
 * Saves a blog draft to drafts.json
 */
export async function saveBlogDraft(draft: BlogDraft): Promise<void> {
  const drafts = await readJson<BlogDraft[]>("drafts.json", []);
  const next = drafts.filter(d => d.id !== draft.id);
  next.push(draft);
  await writeJson("drafts.json", next);
}

/**
 * Gets a blog draft from drafts.json
 */
export async function getBlogDraft(id: string): Promise<BlogDraft | null> {
  const drafts = await readJson<BlogDraft[]>("drafts.json", []);
  return drafts.find(d => d.id === id) || null;
}

/**
 * Deletes a blog draft from drafts.json
 */
export async function deleteBlogDraft(id: string): Promise<void> {
  const drafts = await readJson<BlogDraft[]>("drafts.json", []);
  const next = drafts.filter(d => d.id !== id);
  await writeJson("drafts.json", next);
}
