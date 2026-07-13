import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/store/blog";
import { writeJson } from "@/lib/store/fileStore";
import { BlogPost } from "@/data/blogPosts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured in .env.local" }, { status: 500 });
  }

  const posts = await getAllPosts();

  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter. Use ?slug=all or ?slug=specific-slug" }, { status: 400 });
  }

  const targetPosts = slug === "all" ? posts : posts.filter(p => p.slug === slug);
  if (targetPosts.length === 0) {
    return NextResponse.json({ error: `No post found matching slug: ${slug}` }, { status: 404 });
  }

  let expandedCount = 0;

  for (const post of targetPosts) {
    console.log(`Expanding post: ${post.slug}...`);

    const prompt = `
      Expand this blog post:
      Title: ${post.title}
      Category: ${post.category}
      Excerpt: ${post.excerpt}
      Intro: ${post.intro}
      
      Sections:
      ${post.sections.map((s, i) => `${i + 1}. Heading: ${s.heading}\nBody: ${s.body.join("\n")}`).join("\n\n")}
    `;

    const systemInstruction = `
      You are an expert real estate editor and long-term expat writer living in Bangkok.
      Your job is to expand the provided blog post into an extremely detailed, comprehensive 9-to-12 minute read (around 2,000 to 2,500 words).
      The final post must sound like it was written by a local friend offering street-smart, highly practical advice.

      CRITICAL INSTRUCTIONS:
      1. EXPAND CONTENT: Add detailed descriptions, sub-headings, step-by-step guides, lists, and deep-dive comparisons. Make it extremely complete and comprehensive.
      2. DETAILED COST OF LIVING: If the topic covers costs, money, budgets, renting, or lifestyle, you must include a highly detailed pricing table in Thai Baht (฿) with estimated costs for utilities, food, transport, lease deposits, and entertainment.
      3. CONVERSATIONAL TONE: Keep the warm, expat-voice tone. Avoid generic AI writing filler words (like "delve", "testament", "lastly", "furthermore").
      4. INTERNAL BLOG LINKING: You MUST check the other articles on our site and naturally weave inline markdown links to them using their exact paths.
         Here are the target guides you should link to:
         - For cost of living, link to: [Cost of Living Guide](/blog/cost-of-living-bangkok-2026)
         - For visa guides, link to: [Thailand Visa Guide](/blog/thailand-visa-guide-2026)
         - For first week survival, link to: [First Week Survival Guide](/blog/first-week-bangkok-survival-guide)
         - For Ari guide, link to: [Ari Neighbourhood Guide](/blog/ultimate-ari-guide-bangkok)
         - For Phrom Phong vs Ekkamai, link to: [Sukhumvit Mid-Section Guide](/blog/phrom-phong-vs-ekkamai-sukhumvit)
         - For LTR remote work visa, link to: [LTR Visa Guide](/blog/thailand-ltr-visa-remote-workers)
         - For banking setup, link to: [Thai Bank Account Guide](/blog/how-to-open-bank-account-thailand-2026)
         - For driving licence, link to: [Thai Driving Licence Guide](/blog/getting-thai-driving-licence)
         - For retirement visa, link to: [Thailand Retirement Visa Guide](/blog/thailand-retirement-visa-guide-2026)
         - For school guides, link to: [Bangkok International Schools Guide](/blog/international-schools-bangkok)

      You must respond strictly with a JSON object matching this schema:
      {
        "title": "string",
        "intro": "string", 
        "readTime": "9-12 min read",
        "sections": [
          {
            "heading": "string",
            "body": ["string", "string", "string"] 
          }
        ],
        "cta": {
          "heading": "string",
          "body": "string",
          "href": "string",
          "label": "string"
        }
      }
    `;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini response error: ${response.status}`);
      }

      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        
        post.title = parsed.title;
        post.intro = parsed.intro;
        post.readTime = parsed.readTime || "10 min read";
        post.sections = parsed.sections;
        post.cta = parsed.cta;
        post.updatedAt = new Date().toISOString().split("T")[0]; // Mark as updated today

        const allPosts = await getAllPosts();
        const idx = allPosts.findIndex(p => p.slug === post.slug);
        if (idx !== -1) {
          allPosts[idx] = post;
        } else {
          allPosts.push(post);
        }
        await writeJson("blog.json", allPosts);
        expandedCount++;
      }
    } catch (err) {
      console.error(`Failed to expand ${post.slug}:`, err);
      if (slug !== "all") {
        return NextResponse.json({ error: `Failed to expand: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ success: true, expandedCount, message: `Successfully expanded ${expandedCount} posts.` });
}
