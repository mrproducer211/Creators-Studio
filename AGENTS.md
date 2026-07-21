<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NHP Real Estate — Executive Visibility & SEO Strategy Memory

## Key Directives & Business Goals
- **CRITICAL USER APPROVAL RULE**: You MUST ALWAYS propose plans, outline exact changes, and wait for explicit user approval BEFORE making any code edits, running terminal commands, or making commits.
- **Domain**: `https://newhomesproperty.com` (Canonical non-www domain)
- **Target Audience**: Expats, Digital Nomads, Remote Workers, Diplomats, Foreign Buyers in Bangkok.
- **Traffic Goal**: 1,000 organic monthly visitors through High-Intent SEO, AI Search Integration (Perplexity, ChatGPT, Claude), and Expat Community Distribution.

## SEO & AI Crawl Protocols
1. **Robots & Canonical Standard**:
   - `robots.ts` explicitly permits `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended` to access `/`, `/llms.txt`, `/llms-full.txt`, and `/api/public/`.
   - Parameter search strings (`/explore?*`), `/auth/`, `/dashboard/`, `/swipe`, `/saved`, and `/admin/` are disallowed from crawling to preserve crawl budget and prevent duplicate content flags.
2. **AI Discoverability Standard**:
   - Standard `/llms.txt` and `/llms-full.txt` are maintained in `public/` for zero-latency LLM context ingestion.
   - Public JSON endpoint `/api/public/properties` provides structured listing data for AI agents.
3. **Neighborhood Guide Fallbacks**:
   - Any unlisted neighborhood slug route in `neighborhood/[slug]/page.tsx` must 301-redirect to `/explore` instead of returning 404 Not Found.
4. **Duplicate Variant Handling**:
   - Multiple property durations (`-rent`, `-short_stay`, `-sale`) point their canonical tag to the primary rental/sale property slug to prevent duplicate content penalties.

