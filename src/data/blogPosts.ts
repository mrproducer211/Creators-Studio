export interface BlogSection {
  heading: string;
  body: string[];        // paragraphs
}

export interface BlogPost {
  slug:        string;
  category:    string;
  tags:        string[];
  title:       string;
  metaTitle:   string;
  metaDesc:    string;
  excerpt:     string;
  image:       string;
  readTime:    string;
  publishedAt: string;
  updatedAt?:  string;
  trending?:   boolean;
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

import { NEIGHBORHOOD_GUIDES } from "./blog/neighbourhoodGuides";
import { HIDDEN_BANGKOK } from "./blog/hiddenBangkok";
import { EXPAT_LIFE } from "./blog/expatLife";
import { RETIREMENT } from "./blog/retirement";
import { NOMAD_FAMILY } from "./blog/nomadFamily";
import { ACTIVITIES } from "./blog/activities";

const STATIC_POSTS: BlogPost[] = [
  /* ─────────────────────────────── POST 1 ─────────────────────────────── */
  {
    slug:        "thong-lo-vs-on-nut",
    category:    "Neighbourhood Guide",
    tags:        ["Sukhumvit", "Compare", "Renting", "Lifestyle"],
    title:       "Thong Lo vs On Nut: Which Bangkok Neighbourhood Suits You?",
    metaTitle:   "Thong Lo vs On Nut Bangkok 2026 — Which Is Right for You? | NHP",
    metaDesc:    "Comparing Thong Lo and On Nut for expats and digital nomads in Bangkok. Prices, lifestyle, commute and vibe — everything you need to choose the right neighbourhood.",
    excerpt:     "Both are BTS-connected, expat-friendly and full of great food — but the vibe, price and lifestyle are worlds apart. Here's how to choose.",
    image:       "/images/blog/thong-lo-vs-on-nut.webp",
    readTime:    "11 min read",
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
        heading: "Dining & Culinary Scene: Fine Dining vs Local Street Food",
        body: [
          "Thong Lo is widely regarded as the culinary capital of Bangkok, particularly for Japanese cuisine due to its high concentration of Japanese expat residents. Here, you will find some of the best sushi, ramen, and izakaya spots outside Tokyo. In addition, the neighbourhood is home to trendy brunch spots, European bistros, and high-end cocktail bars where mixologists curate bespoke drinks. The food scene is expensive but premium, designed for gourmands who don't mind spending ฿500–฿1,500 per meal.",
          "On Nut offers a much more down-to-earth and affordable dining experience. While it has international restaurants located inside community malls like Century The Movie Plaza and Habito, its true strength lies in its local Thai eateries and street food markets. The outdoor food courts near the BTS serve everything from hotpot and grilled meats to fresh papaya salad for under ฿100. It is a haven for food lovers who appreciate authentic Thai flavors and affordable everyday dining."
        ]
      },
      {
        heading: "Remote Work & Cafe Culture",
        body: [
          "For digital nomads and remote workers, both neighbourhoods have excellent setups, but the vibes are distinct. Thong Lo offers design-forward, specialty coffee shops where you can work with high-speed internet, though some spots can be loud on weekends. Modern co-working facilities are available near the main roads, providing professional networking hubs.",
          "On Nut is highly favored by long-term remote workers for its relaxed, residential work cafes. Habito Mall in the T77 community offers peaceful working areas, and smaller coffee shops along Sukhumvit 77 and Sukhumvit 50 are perfect for putting on headphones and focusing on work. It is less about showing off and more about everyday productivity."
        ]
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
];

const POSTS: BlogPost[] = [
  ...STATIC_POSTS,
  ...NEIGHBORHOOD_GUIDES,
  ...HIDDEN_BANGKOK,
  ...EXPAT_LIFE,
  ...RETIREMENT,
  ...NOMAD_FAMILY,
  ...ACTIVITIES
];

export default POSTS;

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
