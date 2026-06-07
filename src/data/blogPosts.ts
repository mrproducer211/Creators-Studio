export interface BlogSection {
  heading: string;
  body: string[];        // paragraphs
}

export interface BlogPost {
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
  headerFontFamily?: string;
  fontFamily?:       string;
  cta: {
    heading: string;
    body:    string;
    href:    string;
    label:   string;
  };
}

const POSTS: BlogPost[] = [
  /* ─────────────────────────────── POST 1 ─────────────────────────────── */
  {
    slug:        "thong-lo-vs-on-nut",
    category:    "Neighbourhood Guide",
    title:       "Thong Lo vs On Nut: Which Bangkok Neighbourhood Suits You?",
    metaTitle:   "Thong Lo vs On Nut Bangkok 2026 — Which Is Right for You? | NHP",
    metaDesc:    "Comparing Thong Lo and On Nut for expats and digital nomads in Bangkok. Prices, lifestyle, commute and vibe — everything you need to choose the right neighbourhood.",
    excerpt:     "Both are BTS-connected, expat-friendly and full of great food — but the vibe, price and lifestyle are worlds apart. Here's how to choose.",
    image:       "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&auto=format&q=85",
    readTime:    "5 min read",
    publishedAt: "2026-05-15",
    author:      "NHP Bangkok Team",
    keywords:    ["Thong Lo apartments", "On Nut condos", "Bangkok expat neighbourhood", "Thong Lo vs On Nut", "Bangkok rental guide"],
    intro: "Ask any long-term Bangkok expat which neighbourhood they live in and the answer is almost always Thong Lo or On Nut. Both sit on the BTS Sukhumvit line, both have excellent food scenes, and both attract a high concentration of internationals. But spend a week in each and you'll feel an immediate difference. One is a lifestyle destination; the other is a practical base that happens to be brilliant value. Choosing the right one depends entirely on what you want your daily life in Bangkok to look like.",
    sections: [
      {
        heading: "The Vibe: Boutique vs Value",
        body: [
          "Thong Lo (BTS Thong Lo, Sukhumvit Soi 55) has evolved into Bangkok's most curated neighbourhood. Think independent coffee shops with minimalist interiors, Japanese restaurants that require a reservation, fitness studios, rooftop bars, and concept stores. If you want to feel like you're living in a boutique hotel district every day, Thong Lo delivers. It attracts a mix of Japanese expats, creative professionals and young Thais who treat lifestyle as a priority.",
          "On Nut (BTS On Nut, Sukhumvit Soi 77) is the opposite in the best possible way. It's vibrant, local, and unpretentious. The Or Tor Kor-style fresh market on Sukhumvit 77 is genuinely excellent. Street food is everywhere and honest. Big supermarkets like Tesco Lotus make practical living easy. On Nut attracts digital nomads, teachers, younger expats and anyone who wants Bangkok's energy without paying Thong Lo prices.",
        ],
      },
      {
        heading: "Rental Prices: What Your Budget Gets You",
        body: [
          "This is where the gap becomes most visible. In Thong Lo, a quality 1-bedroom condo in a modern building will cost between ฿30,000 and ฿60,000 per month. A 2-bedroom in a premium development can reach ฿80,000–฿120,000. The premium is real but so is the quality — newer buildings, better finishes, stronger management.",
          "In On Nut, the same ฿35,000 budget that buys you a mid-range 1-bed in Thong Lo will secure a spacious 2-bedroom with a pool in a well-maintained building. Studios start around ฿12,000–฿18,000. For expats working with a fixed relocation allowance, On Nut simply offers more room, better value, and often newer buildings because development has continued more recently.",
        ],
      },
      {
        heading: "Commute & Connectivity",
        body: [
          "Both neighbourhoods are on the BTS Sukhumvit line, which means central Bangkok is always accessible. Thong Lo station puts you 5 stops from Asok (the main interchange) and 7 from Siam. On Nut is 3 stops further east from Thong Lo. Neither commute is punishing, but Thong Lo's slightly more central position makes spontaneous city movement easier.",
          "If you work in the CBD around Silom or Sathorn, On Nut adds roughly 15 minutes to the daily commute versus Thong Lo. For remote workers, the commute is irrelevant — what matters is the quality of co-working spaces and coffee shops. Both neighbourhoods have plenty.",
        ],
      },
      {
        heading: "Who Should Choose Each?",
        body: [
          "Choose Thong Lo if you want to live in Bangkok's most curated expat neighbourhood, you have a higher housing budget (฿40,000+/month), you prioritise nightlife, dining and lifestyle access over space, and you value proximity to the Japanese expat community and its exceptional restaurant scene.",
          "Choose On Nut if you want the best value-for-money in a well-connected area, you need more space for the same budget, you prefer a more local, less touristy atmosphere, you have a family and need practical amenities like large supermarkets and local markets, or you're a first-time Bangkok expat who wants to find their feet without overpaying.",
        ],
      },
      {
        heading: "Final Verdict",
        body: [
          "There is no wrong choice. Thong Lo wins on lifestyle, prestige and curated experience. On Nut wins on value, space and authentic Bangkok living. The smartest move is to rent short-stay in both areas for two weeks before committing to a long-term lease. Use our property reels to get a feel for both neighbourhoods before you book flights.",
        ],
      },
    ],
    cta: {
      heading: "Ready to browse Thong Lo and On Nut properties?",
      body:    "Filter by area and see exactly what your budget unlocks right now.",
      href:    "/explore",
      label:   "Browse Properties",
    },
  },

  /* ─────────────────────────────── POST 2 ─────────────────────────────── */
  {
    slug:        "digital-nomad-guide-sukhumvit",
    category:    "Expat Tips",
    title:       "A Digital Nomad's Complete Guide to Living in Sukhumvit, Bangkok",
    metaTitle:   "Digital Nomad Bangkok 2026: The Complete Sukhumvit Living Guide | NHP",
    metaDesc:    "Everything a digital nomad needs to know before moving to Sukhumvit, Bangkok. SIM cards, co-working, visa, healthcare, best coffee shops with fast WiFi and where to live.",
    excerpt:     "From co-working spaces to SIM cards, health insurance and the best coffee shops with reliable Wi-Fi — everything you need before you land.",
    image:       "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&q=85",
    readTime:    "8 min read",
    publishedAt: "2026-05-22",
    author:      "NHP Bangkok Team",
    keywords:    ["digital nomad Bangkok", "working remotely Sukhumvit", "Bangkok co-working spaces", "digital nomad visa Thailand", "Bangkok expat guide"],
    intro: "Bangkok has been a digital nomad destination for over a decade, but Sukhumvit specifically has evolved into one of the world's most functional bases for remote workers. The infrastructure is serious: 1Gbps fibre is standard in most modern condos, co-working spaces have multiplied, and the cost of living remains dramatically lower than comparable cities in Europe or North America. If you're planning a move to Bangkok, here's everything you need to know before you arrive.",
    sections: [
      {
        heading: "Choosing Your Base in Sukhumvit",
        body: [
          "Sukhumvit stretches from Soi 1 near Ploenchit all the way east past On Nut and beyond. For digital nomads, the sweet spots are Asok/Nana (Soi 3–21) for the most central position, Thong Lo (Soi 55) for lifestyle, Ekkamai (Soi 63) for a quieter but still well-connected base, and On Nut (Soi 77) for maximum value.",
          "The general rule: the further east you go along the BTS line, the lower your rent and the more local the atmosphere. Asok puts you next to the major interchanges and Terminal 21 mall, which is convenient but noisy. On Nut gives you space, value and a surprisingly strong expat community.",
        ],
      },
      {
        heading: "Internet, SIM Cards & Connectivity",
        body: [
          "Getting connected in Bangkok is easy and fast. For a SIM card on arrival, AIS, DTAC and True Move all have counters at Suvarnabhumi Airport's arrivals hall. A 30-day unlimited data plan costs around ฿299–฿399. True Move's 5G coverage in Sukhumvit is excellent.",
          "In your condo, expect building-provided internet between 200Mbps and 1Gbps in newer developments, usually included in the rental or available for ฿500–฿800/month extra. For critical work, confirm the package before signing a lease. Fibre from True Move H, AIS Fibre or NT (formerly NBTC) can be installed independently within a few days.",
        ],
      },
      {
        heading: "Best Co-Working Spaces in Sukhumvit",
        body: [
          "Hubba Thailand near Ekkamai has been a Bangkok co-working institution for years — great community, reliable internet and good coffee. The Commons in Thong Lo has multiple food and coffee options in the same complex. WeWork has a presence on Sukhumvit 21 (Asok) for those who want a corporate-grade setup. For day passes, most coffee shops in Thong Lo and Ekkamai work fine — look for 'laptop-friendly' signage or ask the staff about their WiFi speed.",
          "Monthly co-working memberships in Sukhumvit typically cost ฿3,500–฿7,000, which is significantly cheaper than equivalent facilities in Singapore, Tokyo or European capitals.",
        ],
      },
      {
        heading: "Visa Options for Remote Workers",
        body: [
          "Thailand's Long-Term Resident (LTR) visa introduced in 2022 is now a serious option for remote workers earning above USD 40,000/year, with a 10-year residence permit and various tax benefits. Applications go through the Board of Investment (BOI).",
          "For those not yet qualifying for the LTR, the most common approach remains the Tourist Visa extended every 60 days, combined with border runs. Many digital nomads use back-to-back tourist visas while building Thailand income. The Thailand Elite visa (฿600,000 for 5 years) remains popular for those wanting certainty without income requirements.",
        ],
      },
      {
        heading: "Healthcare: What You Actually Need",
        body: [
          "Bangkok has world-class hospitals. Bumrungrad International and Bangkok Hospital on Sukhumvit 3 see international patients daily and have English-speaking staff throughout. A GP consultation costs ฿800–฿1,500 out of pocket. Most digital nomads carry a basic international health insurance policy (SafetyWing is popular at ~USD 45/month) and pay cash for minor issues.",
          "For dental work — which is extremely good value in Bangkok — no insurance is needed. A basic check and clean runs ฿800–฿1,200 at a reputable private clinic.",
        ],
      },
      {
        heading: "Cost of Living as a Digital Nomad",
        body: [
          "A comfortable but not extravagant digital nomad lifestyle in Sukhumvit breaks down roughly as follows: rent for a 1-bed condo ฿20,000–฿45,000, food (mix of street and restaurants) ฿8,000–฿15,000, transport ฿2,000–฿3,000, co-working ฿0–฿6,000, entertainment and fitness ฿3,000–฿6,000. Total: ฿33,000–฿75,000/month depending on your choices and neighbourhood.",
          "At the current exchange rate that's roughly USD 900–2,100/month all-in, making Bangkok one of the best value major cities for remote workers globally.",
        ],
      },
    ],
    cta: {
      heading: "Find your perfect Sukhumvit base",
      body:    "Browse verified apartments near co-working spaces and BTS stations.",
      href:    "/explore",
      label:   "Browse Sukhumvit",
    },
  },

  /* ─────────────────────────────── POST 3 ─────────────────────────────── */
  {
    slug:        "what-40k-gets-you-bangkok",
    category:    "Property Insights",
    title:       "What ฿40,000/Month Gets You in Bangkok's Top Expat Areas",
    metaTitle:   "Bangkok Rent Guide 2026: What ฿40,000/Month Gets You by Area | NHP",
    metaDesc:    "A detailed breakdown of what a ฿40,000/month rental budget gets you in Sukhumvit, Thong Lo, On Nut, Sathorn and Silom. Real examples with specs.",
    excerpt:     "A studio in Thong Lo, a 2-bed in On Nut, or a penthouse in Ari? We break down exactly what your budget unlocks district by district.",
    image:       "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&q=85",
    readTime:    "6 min read",
    publishedAt: "2026-05-28",
    author:      "NHP Bangkok Team",
    keywords:    ["Bangkok rent 40000 baht", "Bangkok rental prices 2026", "expat apartment Bangkok budget", "Bangkok condo price guide", "how much rent Bangkok"],
    intro: "One of the most common questions we receive from people planning a move to Bangkok is: 'What can I actually afford?' The answer depends enormously on which neighbourhood you choose. Bangkok is not uniformly priced — a ฿40,000/month budget can mean a compact studio in the city's most prestigious addresses, or a generous two-bedroom with a private terrace in an emerging neighbourhood just three BTS stops away. This guide walks you through exactly what that budget unlocks in each of Bangkok's main expat areas.",
    sections: [
      {
        heading: "Thong Lo (BTS Thong Lo): Designer Studio or Small 1-Bed",
        body: [
          "Thong Lo is Bangkok's most expensive non-CBD neighbourhood. At ฿40,000/month you are working with a modest budget here. Expect a well-designed studio of 35–45 sqm in a mid-range building, or a small 1-bedroom of 40–50 sqm in a slightly older development. The buildings will typically have a pool and gym.",
          "What you will not get at this price in Thong Lo: a modern high-rise with hotel-level facilities, a 2-bedroom, or a unit above the 20th floor with views. That bracket starts at ฿60,000+. For Thong Lo, ฿40,000 is an entry point — enough to live in the neighbourhood but not to live lavishly in it.",
        ],
      },
      {
        heading: "Sukhumvit / Asok (BTS Asok + MRT Sukhumvit): Central 1-Bedroom",
        body: [
          "The Asok area — particularly around Sukhumvit 21–23 — offers strong value relative to its central location. At ฿40,000/month you can secure a genuine 1-bedroom of 45–60 sqm in a newer building with good facilities. The trade-off is that the area is dense and busy; it's not the most relaxing residential environment but unbeatable for access.",
          "Buildings like those along Sukhumvit 21 and around the Interchange area consistently offer quality at this price point. Look for buildings completed after 2015 for better spec. You're buying convenience: Asok is the junction of the BTS and MRT, making the entire city accessible.",
        ],
      },
      {
        heading: "On Nut (BTS On Nut): Spacious 2-Bedroom",
        body: [
          "This is where ฿40,000/month becomes genuinely impressive. On Nut is the expat neighbourhood that consistently over-delivers on value. At this budget you can expect a well-maintained 2-bedroom condo of 65–80 sqm in a building with pool, gym and 24h security. Many units will be recently renovated or come furnished to a high standard.",
          "Several newer developments along Sukhumvit 50–77 have been completed in the last three years, which means you're often getting modern finishes at prices that haven't caught up with the quality. On Nut is the clearest example in Bangkok of a neighbourhood where value hasn't been priced out yet.",
        ],
      },
      {
        heading: "Sathorn (BTS Chong Nonsi): CBD-Adjacent 1-Bedroom",
        body: [
          "Sathorn is Bangkok's financial district. At ฿40,000/month you're at the lower end of the market here, but you can still find solid 1-bedroom units of 45–55 sqm in established buildings. The lifestyle benefit is immediate proximity to the CBD, Lumpini Park, and the widest range of international restaurants in any single Bangkok neighbourhood.",
          "The Sathorn market tends toward older stock at ฿40,000; buildings from the early 2000s that are well-maintained but showing age. For newer Sathorn buildings you typically need ฿55,000–฿80,000. That said, many expats prefer the character and larger room sizes of older Sathorn buildings versus the more compact layouts of newer developments.",
        ],
      },
      {
        heading: "Ari (BTS Ari): Characterful 2-Bedroom",
        body: [
          "Ari is the neighbourhood most Bangkok insiders recommend to people who want something genuinely residential and characterful. It has an excellent café and brunch culture, independent boutiques, easy access to major hospitals, and a relaxed pace that the more commercial Sukhumvit areas lack.",
          "At ฿40,000/month in Ari you can expect a 2-bedroom of 60–75 sqm, often in a smaller boutique building. The trade-off is that BTS access requires either a 5–10 minute walk to Ari station or a motorcycle taxi. For people who work remotely, this is a minor inconvenience. For daily CBD commuters it's worth factoring in.",
        ],
      },
      {
        heading: "Summary: ฿40,000/Month by Area",
        body: [
          "Thong Lo: Studio or compact 1-bed (35–50 sqm) — you're buying the address. Sukhumvit/Asok: 1-bedroom (45–60 sqm) — you're buying convenience. On Nut: 2-bedroom (65–80 sqm) — you're buying space and value. Sathorn: 1-bedroom (45–55 sqm) — you're buying CBD proximity. Ari: 2-bedroom (60–75 sqm) — you're buying character and residential quality.",
          "The honest advice: unless your daily commute or lifestyle requires a specific location, On Nut and Ari offer dramatically more apartment for the same money. Visit each area for a day before committing — Bangkok's neighbourhoods have distinct personalities that don't come through in photos.",
        ],
      },
    ],
    cta: {
      heading: "See what ฿40,000 gets you right now",
      body:    "Filter by budget and area to find live listings matching your target.",
      href:    "/explore?type=rent",
      label:   "Browse Rentals",
    },
  },

  /* ─────────────────────────────── POST 4 ─────────────────────────────── */
  {
    slug:        "international-schools-bangkok",
    category:    "Family Living",
    title:       "Top International Schools Near Bangkok's Expat Neighbourhoods",
    metaTitle:   "Best International Schools in Bangkok 2026 — Expat Family Guide | NHP",
    metaDesc:    "A guide to Bangkok's top international schools mapped against the city's best expat neighbourhoods. NIST, ISB, Bromsgrove, VERSO and more — locations, fees and proximity.",
    excerpt:     "Relocating with children? We map the best international schools against the city's most liveable expat areas so the commute never becomes the sacrifice.",
    image:       "/images/blog/bangkok_international_school.png",
    readTime:    "7 min read",
    publishedAt: "2026-06-01",
    author:      "NHP Bangkok Team",
    keywords:    ["international schools Bangkok", "Bangkok family expat", "NIST Bangkok", "ISB Bangkok", "relocating family Bangkok", "schools near Sukhumvit"],
    intro: "For expat families, the school decision often drives everything else — which neighbourhood you live in, what commute you accept, how much rent you're willing to pay. Bangkok has an excellent international school system, but the schools are spread across a large city and the right choice depends as much on curriculum preference and fees as it does on proximity to your home. This guide maps Bangkok's most respected international schools against the city's most liveable expat neighbourhoods.",
    sections: [
      {
        heading: "Schools in and Around Sukhumvit",
        body: [
          "NIST International School (Sukhumvit 15) is one of Bangkok's most respected IB schools with a strong community of diplomats and long-term expat families. Its central Sukhumvit location makes it accessible from Asok, Phrom Phong and Thong Lo without significant commute. Annual fees range from approximately 600,000–900,000 THB.",
          "Bangkok Patana School in On Nut (Sukhumvit 105) is the city's largest international school and follows the British curriculum from Nursery through Year 13. Its On Nut location is a major advantage for families considering that neighbourhood — you can walk or take a short taxi from most On Nut condos. Fees are similar to NIST at the secondary level.",
          "Shrewsbury International School has campuses in both the River Campus (Rama 3) and a newer campus on the east side of Sukhumvit. It follows the British National Curriculum and has a strong academic reputation. The River Campus is better suited to families in Sathorn, while the east campus suits Sukhumvit families.",
        ],
      },
      {
        heading: "Schools in the Northern and Western Areas",
        body: [
          "International School Bangkok (ISB) in Nichada Thani (near Don Mueang) is the largest American curriculum school in Thailand. Nichada Thani is a gated expat community with its own infrastructure — many families who prioritise ISB choose to live within the compound or in Nonthaburi rather than commuting from Sukhumvit.",
          "Ruam Rudee International School near Ploenchit is smaller, less well-known internationally but highly regarded by families who value smaller class sizes and a more personal approach. Its central location suits families in Ploenchit, Wireless Road and the embassy district.",
        ],
      },
      {
        heading: "Newer Schools Worth Considering",
        body: [
          "VERSO International School (Phrom Phong) is a newer IB school that has attracted attention for its modern pedagogy and smaller community. Located steps from BTS Phrom Phong and EmQuartier, it's ideally positioned for Sukhumvit and Thong Lo families.",
          "Bromsgrove International School Thailand (Ekkamai) opened its Bangkok campus and has grown quickly due to its British independent school reputation and facilities. Ekkamai families have a genuine school within reasonable distance.",
        ],
      },
      {
        heading: "Practical Tips for Families Relocating to Bangkok",
        body: [
          "Apply early — Bangkok's top international schools have waiting lists, and popular year groups fill up 12–18 months in advance. If you have flexibility on timing, apply before securing accommodation. The school decision genuinely should come before the neighbourhood decision.",
          "Consider the traffic, not just the distance. Bangkok's traffic during school run hours (7:00–8:30am, 3:00–4:30pm) can turn a 5km journey into a 45-minute commute. Ask the school which areas their families typically live in — this is the most reliable guide to realistic commute times.",
          "Most international schools offer school bus services from key expat neighbourhoods. Request the current bus route map when you enquire — this can significantly expand your neighbourhood options.",
        ],
      },
      {
        heading: "Neighbourhood Recommendations for School Families",
        body: [
          "For NIST and VERSO families: Sukhumvit 15–49, Phrom Phong and Thong Lo all work well with manageable commutes. For Bangkok Patana and Bromsgrove families: On Nut and Ekkamai are the natural base. For ISB families: Nichada Thani itself, or areas in north Bangkok with less Sukhumvit traffic.",
          "The most common family-friendly configuration in Bangkok is a 3-bedroom condo in On Nut or Ekkamai with children at Bangkok Patana or Bromsgrove. You get the space a family needs, value relative to Thong Lo pricing, and a school commute that works. Our team can help you shortlist properties close to your preferred school.",
        ],
      },
    ],
    cta: {
      heading: "Find a family home near Bangkok's best schools",
      body:    "Filter by area to find 2 and 3-bedroom properties close to your preferred school.",
      href:    "/explore",
      label:   "Browse Family Properties",
    },
  },
];

export default POSTS;

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
