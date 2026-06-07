import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth-helpers";
import { createPost } from "@/lib/store/blog";
import { createAuditLog } from "@/lib/db/dbLoader";

interface BlogSection {
  heading: string;
  body: string[];
}

interface BlogPost {
  slug:        string;
  category:    string;
  title:       string;
  metaTitle:   string;
  metaDesc:    string;
  excerpt:     string;
  image:       string;
  readTime:    string;
  publishedAt: string;
  author:      string;
  keywords:    string[];
  intro:       string;
  sections:    BlogSection[];
  cta: {
    heading: string;
    body:    string;
    href:    string;
    label:   string;
  };
}

export async function POST(req: NextRequest) {
  // Check authorization
  const authCheck = await requireAdminApi();
  if ("error" in authCheck) {
    return authCheck.error;
  }
  const adminUser = authCheck.user;

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const topic = prompt.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    let blogPost: BlogPost;

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemPrompt = `
You are a professional Bangkok real estate copywriter for NHP Bangkok, a premium property platform.
Write a comprehensive, premium, and detailed blog post or neighborhood guide about: "${topic}".
Return a JSON object conforming EXACTLY to the following TypeScript interface structure:

{
  "slug": "url-friendly-slug", // e.g. "living-in-sathorn"
  "category": "Neighbourhood Guide" | "Expat Tips" | "Property Insights" | "Family Living",
  "title": "...", // Catchy headline
  "metaTitle": "...", // SEO Google Title (under 60 chars)
  "metaDesc": "...", // SEO Google Description (under 160 chars)
  "excerpt": "...", // Short 1-2 sentence hook
  "image": "...", // A high-quality Unsplash image URL matching the topic, e.g. "https://images.unsplash.com/photo-..."
  "readTime": "...", // e.g. "6 min read"
  "publishedAt": "YYYY-MM-DD", // Current date
  "author": "NHP Bangkok Team",
  "keywords": ["keyword1", "keyword2"], // 4-5 relevant SEO search terms
  "intro": "...", // Detailed 3-4 sentence introduction paragraph
  "sections": [
     { "heading": "Section Heading", "body": ["paragraph1", "paragraph2"] }
  ],
  "cta": {
     "heading": "Browse Bangkok properties",
     "body": "See what fits your budget right now.",
     "href": "/explore",
     "label": "Browse Properties"
  }
}

Ensure the writing is engaging, detailed, contains specific Bangkok context (BTS/MRT stations, streets, condos, costs), and conforms to valid JSON.
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

      if (!response.ok) {
        const errText = await response.text();
        console.warn("Gemini API call failed, using fallback mock generator:", errText);
        blogPost = generateMockBlogPost(topic);
      } else {
        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) {
          throw new Error("Empty response from AI");
        }
        blogPost = JSON.parse(textResponse) as BlogPost;
      }
    } else {
      console.log("No GEMINI_API_KEY set, generating high-quality mock blog post instead.");
      blogPost = generateMockBlogPost(topic);
    }

    // Save generated post
    const created = await createPost(blogPost);

    // Audit log
    await createAuditLog(
      adminUser.email,
      "generate_blog",
      `AI generated blog post: "${created.title}" (slug: ${created.slug})`
    );

    return NextResponse.json({ success: true, post: created, isMock: !apiKey });
  } catch (err) {
    console.error("AI blog generation error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to generate blog post" }, { status: 500 });
  }
}

function generateMockBlogPost(topic: string): BlogPost {
  const cleanTopic = topic.trim();
  const slug = cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  
  // Choose a nice default photo based on keywords
  let photo = "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&q=80"; // general bangkok
  if (topic.toLowerCase().includes("food") || topic.toLowerCase().includes("restaurant")) {
    photo = "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&auto=format&q=80"; // street food
  } else if (topic.toLowerCase().includes("condo") || topic.toLowerCase().includes("rent") || topic.toLowerCase().includes("apartment")) {
    photo = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&q=80"; // home interior
  } else if (topic.toLowerCase().includes("school") || topic.toLowerCase().includes("family") || topic.toLowerCase().includes("kids")) {
    photo = "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&q=80"; // study / classroom
  } else if (topic.toLowerCase().includes("nomad") || topic.toLowerCase().includes("work") || topic.toLowerCase().includes("cafe")) {
    photo = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&q=80"; // laptop cafe
  }

  return {
    slug,
    category: "Neighbourhood Guide",
    title: `The Ultimate Guide to ${cleanTopic} in Bangkok`,
    metaTitle: `Living in ${cleanTopic} Bangkok Guide | NHP`,
    metaDesc: `Find out what it's like to live, rent, and commute in ${cleanTopic}, Bangkok. Learn about local food, cafes, and condos.`,
    excerpt: `Discover the vibe, transit convenience, housing options, and lifestyle amenities in ${cleanTopic}.`,
    image: photo,
    readTime: "5 min read",
    publishedAt: new Date().toISOString().split("T")[0],
    author: "NHP Bangkok Team",
    keywords: [cleanTopic.toLowerCase(), "bangkok guide", "expat living", "bangkok rent"],
    intro: `Welcome to our comprehensive guide on ${cleanTopic}. As one of Bangkok's key areas, it offers a unique blend of local Thai culture, premium condominium projects, and accessible transportation links. Whether you are an expat relocating or a remote worker looking for a new base, this guide covers everything you need to know about setting up your life here.`,
    sections: [
      {
        heading: "The Local Vibe & Lifestyle",
        body: [
          `Living in ${cleanTopic} provides a highly authentic Bangkok experience combined with modern conveniences. You will find a bustling street food scene right next to premium coffee shops, making daily life vibrant and convenient.`,
          "Expats and locals mingle in the daily markets and nearby shopping complexes, creating a friendly and welcoming neighborhood atmosphere."
        ]
      },
      {
        heading: "Transportation & Commuting",
        body: [
          `Commuting from ${cleanTopic} is extremely convenient thanks to nearby BTS Skytrain and MRT subway stations. During peak hours, these transit links save you from Bangkok's famous road traffic, keeping the entire city accessible within 20–30 minutes.`,
          "Motorcycle taxis and local songthaews are also plentiful, offering quick and cheap transit for short trips inside the local streets."
        ]
      },
      {
        heading: "Condominiums & Rental Value",
        body: [
          `From a housing perspective, ${cleanTopic} offers exceptional value. High-rise developments here feature resort-style swimming pools, modern sky fitness centers, and 24-hour security at a fraction of the cost of CBD areas.`,
          "A typical 1-bedroom condominium ranges from ฿15,000 to ฿25,000 per month, depending on the building age and proximity to the main transit line."
        ]
      }
    ],
    cta: {
      heading: `Find a Home in ${cleanTopic}`,
      body: `Browse our hand-picked properties in and around ${cleanTopic} today.`,
      href: "/explore",
      label: "Browse Listings"
    }
  };
}
