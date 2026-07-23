"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  X,
  ChevronDown,
  Building2,
  ShieldCheck,
  Search as SearchIcon,
  CalendarCheck,
  CircleDollarSign,
  MapPin,
  MessageCircle,
  ArrowRight,
  UserCheck,
  Camera,
  User,
  Grid,
} from "lucide-react";

// --- RENTER FAQ DATA ---
export const FAQ_CATEGORIES = [
  {
    id: "understanding",
    label: "Understanding how NHP works",
    icon: Building2,
    faqs: [
      {
        q: "Is New Homes Property a free service for renters?",
        a: "Yes, entirely. We're paid by landlords and developers when a lease or purchase closes — never by the renter. You won't be asked for a finder's fee or listing fee at any point.",
      },
      {
        q: "Who runs New Homes Property and are you based in Bangkok?",
        a: "NHP was built by a dedicated team of Bangkok real estate specialists. Our advisory team operates out of central Bangkok and works with verified Bangkok inventory exclusively.",
      },
      {
        q: "How is New Homes Property different from other Bangkok portals?",
        a: "We start with how you actually want to live — commute preferences, noise sensitivity, nightlife or quiet, walkability — and use that to narrow recommendations.\n\nThat's what Neighbourhood Match is for: it's a filter for fit, price, and lifestyle suitability.",
      },
    ],
  },
  {
    id: "verifying",
    label: "Verifying listings & availability",
    icon: ShieldCheck,
    faqs: [
      {
        q: "How do you verify that listings are real and currently available?",
        a: "Every listing on NHP is confirmed directly with the landlord or verified agent before going live, and we re-check availability on a rolling basis to ensure active inventory.",
      },
      {
        q: "Are the photos on listings real and up to date?",
        a: "We require current photos from the actual unit, not generic stock shots. If developer renderings are used, they are clearly labeled.",
      },
      {
        q: "Can I trust the price shown on a listing?",
        a: "The price shown is quoted directly by the landlord. Prices are transparent, accurate, and open to negotiation for qualified tenants.",
      },
    ],
  },
  {
    id: "finding",
    label: "Finding your ideal condo",
    icon: SearchIcon,
    faqs: [
      {
        q: "How do I search for properties that match my exact needs?",
        a: "You can browse and filter normally under Rent or Buy, or use Neighbourhood Match — a short quiz that narrows the city down to top matching areas for your lifestyle.",
      },
      {
        q: "I don't know Bangkok well — how do I choose the right neighbourhood?",
        a: "Selecting the right area is key to long-term comfort in Bangkok.\n\nTake the Neighbourhood Match quiz first or message an advisor directly — we'll tailor recommendations based on your work location, commute preference, and lifestyle routine.",
      },
      {
        q: "Can you help me find off-market properties?",
        a: "Yes. A meaningful share of our inventory includes direct landlord relationships not listed publicly. Share your criteria with an advisor to access upcoming listings.",
      },
    ],
  },
  {
    id: "booking",
    label: "Booking viewings & moving in",
    icon: CalendarCheck,
    faqs: [
      {
        q: "How do I arrange a viewing for a property I like?",
        a: "Click 'Request Viewing' on any listing, or message an advisor directly if you're comparing multiple units — we can bundle same-day viewings in nearby buildings.",
      },
      {
        q: "Can I do a virtual video tour before arriving in Thailand?",
        a: "Yes. For clients relocating from abroad, we arrange live video walkthroughs with the landlord or agent so you can inspect room condition, views, and noise levels prior to arrival.",
      },
      {
        q: "What is the typical timeline from viewing to moving in?",
        a: "Standard leases typically run 3 to 7 days from viewing to signed contract, with move-in available as soon as your deposit clears.",
      },
      {
        q: "What documents do I need to sign a lease?",
        a: "A valid passport is standard for most Bangkok leases. Some landlords may also request proof of employment or local references for premium residences.",
      },
    ],
  },
  {
    id: "managing",
    label: "Managing deposits & rent",
    icon: CircleDollarSign,
    faqs: [
      {
        q: "How much deposit do Bangkok landlords require?",
        a: "Two months' security deposit plus one month's advance rent is standard across Bangkok residential leases.",
      },
      {
        q: "Can I negotiate the monthly rent price?",
        a: "Yes. Monthly rent is often negotiable on 12-month+ contracts, off-peak periods, or vacant units. Your advisor will guide you on realistic target offers.",
      },
      {
        q: "What happens to my deposit when I move out?",
        a: "Security deposits are returned at lease end according to contract terms. We assist with move-in condition reports to ensure smooth refund processing.",
      },
    ],
  },
  {
    id: "choosing",
    label: "Choosing the right area & commute",
    icon: MapPin,
    faqs: [
      {
        q: "Which Bangkok neighbourhood is best for expats?",
        a: "Lower Sukhumvit offers density and nightlife; Thonglor and Ekkamai offer upscale dining; Ari provides a relaxed café culture. Neighbourhood Match helps identify your ideal area.",
      },
      {
        q: "How important is being near a BTS or MRT station?",
        a: "Proximity to BTS or MRT (ideally within 10 minutes on foot) significantly improves daily commute convenience during peak traffic hours.",
      },
    ],
  },
];

// --- LANDLORD FAQ DATA ---
export const LANDLORD_FAQ_CATEGORIES = [
  {
    id: "listing",
    label: "Listing Your Property with NHP",
    icon: Building2,
    faqs: [
      {
        q: "How do I list my condo or house on New Homes Property?",
        a: "You can submit your property details via our Owner Listing Form or message us directly on LINE or WhatsApp. Our team will verify details, arrange professional photography if needed, and publish your listing within 48 hours.",
      },
      {
        q: "What fees do landlords pay when renting through NHP?",
        a: "We work on a standard success-based commission model: 1 month's rent for a 12-month lease. You pay zero upfront costs — fees are only due after a lease is signed and deposit received.",
      },
    ],
  },
  {
    id: "tenants",
    label: "Tenant Screening & Verification",
    icon: UserCheck,
    faqs: [
      {
        q: "What kind of tenants use New Homes Property?",
        a: "Our audience consists primarily of verified expats, international professionals, digital nomads, and embassy staff looking for 1-year+ quality rentals in central Bangkok.",
      },
      {
        q: "How do you screen prospective renters before viewings?",
        a: "We verify move-in dates, budget, employment status, and visa types prior to booking viewings so you only meet qualified candidates.",
      },
    ],
  },
  {
    id: "media",
    label: "Photography & Marketing Services",
    icon: Camera,
    faqs: [
      {
        q: "Do you offer professional property photography?",
        a: "Yes! For exclusive listings or premium units in Sukhumvit, Sathorn, and Ari, our media team provides complimentary high-resolution photography and video walkthroughs.",
      },
    ],
  },
];

export const HOMEPAGE_FAQ_IDS = [
  { category: "understanding", q: "Is New Homes Property a free service for renters?" },
  { category: "verifying", q: "How do you verify that listings are real and currently available?" },
  { category: "booking", q: "How do I arrange a viewing for a property I like?" },
  { category: "choosing", q: "Which Bangkok neighbourhood is best for expats?" },
  { category: "finding", q: "Can you help me find off-market properties?" },
];

const POPULAR_TAGS = [
  { label: "Security Deposit", term: "deposit" },
  { label: "Agent Fees", term: "fee" },
  { label: "BTS & MRT Distance", term: "bts" },
  { label: "Virtual Viewing", term: "virtual" },
  { label: "Negotiate Rent", term: "negotiat" },
  { label: "Expats & Nomads", term: "expat" },
  { label: "List My Condo", term: "list" },
];

function renderFormattedTextWithInternalLinks(text: string) {
  const linkMappings = [
    { phrase: "Neighbourhood Match quiz", href: "/swipe" },
    { phrase: "Neighbourhood Match", href: "/swipe" },
    { phrase: "Owner Listing Form", href: "/agent/register" },
    { phrase: "Thonglor and Ekkamai", href: "/explore?area=Thong%20Lo" },
    { phrase: "Sukhumvit", href: "/explore?area=Sukhumvit" },
    { phrase: "Ari", href: "/explore?area=Ari" },
    { phrase: "Rent", href: "/explore?type=rent" },
    { phrase: "Buy", href: "/explore?type=sale" },
  ];

  let parts: (string | React.ReactNode)[] = [text];

  linkMappings.forEach(({ phrase, href }) => {
    const nextParts: (string | React.ReactNode)[] = [];
    parts.forEach((part) => {
      if (typeof part !== "string") {
        nextParts.push(part);
        return;
      }

      const index = part.indexOf(phrase);
      if (index === -1) {
        nextParts.push(part);
        return;
      }

      const before = part.substring(0, index);
      const after = part.substring(index + phrase.length);

      if (before) nextParts.push(before);
      nextParts.push(
        <Link
          key={`${phrase}-${index}`}
          href={href}
          className="text-[#0F2A20] font-bold underline underline-offset-2 hover:text-[#C9A233] transition-colors"
        >
          {phrase}
        </Link>
      );
      if (after) nextParts.push(after);
    });
    parts = nextParts;
  });

  return <>{parts}</>;
}

export default function FaqClient() {
  const [audience, setAudience] = useState<"renters" | "landlords">("renters");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const [contacts, setContacts] = useState({
    adminWhatsApp: "+66812345678",
    adminLine: "nhp-line-id",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setContacts({
            adminWhatsApp: data.adminWhatsApp || "+66812345678",
            adminLine: data.adminLine || "nhp-line-id",
          });
        }
      })
      .catch(() => {});
  }, []);

  const waUrl = contacts.adminWhatsApp.startsWith("http")
    ? contacts.adminWhatsApp
    : `https://wa.me/${contacts.adminWhatsApp.replace(/[^0-9]/g, "")}`;

  const lineUrl = contacts.adminLine.startsWith("http")
    ? contacts.adminLine
    : `https://line.me/ti/p/~${contacts.adminLine}`;

  const currentCategories = audience === "renters" ? FAQ_CATEGORIES : LANDLORD_FAQ_CATEGORIES;

  // Filter logic
  const filteredData = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    if (!rawQuery) {
      return currentCategories
        .map((cat) => (activeCategory !== "all" && cat.id !== activeCategory ? { ...cat, faqs: [] } : cat))
        .filter((cat) => cat.faqs.length > 0);
    }

    const words = rawQuery.split(/\s+/).filter((w) => w.length > 1);

    return currentCategories
      .map((category) => {
        if (activeCategory !== "all" && category.id !== activeCategory) {
          return { ...category, faqs: [] };
        }

        const matchingFaqs = category.faqs.filter((faq) => {
          const fullText = (faq.q + " " + faq.a + " " + category.label).toLowerCase();
          return fullText.includes(rawQuery) || words.some((word) => fullText.includes(word));
        });

        return {
          ...category,
          faqs: matchingFaqs,
        };
      })
      .filter((cat) => cat.faqs.length > 0);
  }, [searchQuery, activeCategory, currentCategories]);

  const totalResultsCount = useMemo(() => {
    return filteredData.reduce((acc, cat) => acc + cat.faqs.length, 0);
  }, [filteredData]);

  const totalFaqsCount = useMemo(() => {
    return currentCategories.reduce((acc, cat) => acc + cat.faqs.length, 0);
  }, [currentCategories]);

  const toggleAccordion = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePopularTagClick = (tag: { label: string; term: string }) => {
    if (tag.term === "list" && audience === "renters") {
      setAudience("landlords");
    }
    setActiveCategory("all");
    setSearchQuery(tag.term);
    const el = document.getElementById("faq-start");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Structured JSON-LD schema
  const allFaqs = FAQ_CATEGORIES.concat(LANDLORD_FAQ_CATEGORIES).flatMap((c) => c.faqs);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <Navbar />

      <div className="min-h-screen bg-[#FAF9F6] text-[#1B2620] font-['Plus_Jakarta_Sans',sans-serif] pt-[56px] selection:bg-[#FBF3DC] selection:text-[#0F2A20]">
        
        {/* HERO SECTION MATCHING SCREENSHOT */}
        <section className="bg-[#17372B] text-white py-12 sm:py-16 md:py-20 px-4 sm:px-8 text-center relative">
          <div className="max-w-4xl mx-auto relative z-10">
            
            {/* Renters vs Landlords Hero Pills */}
            <div className="inline-flex flex-row items-center justify-center gap-1 bg-[#1F4638] p-1 rounded-full mb-6 sm:mb-8 border border-[#275645] max-w-full">
              <button
                type="button"
                onClick={() => {
                  setAudience("renters");
                  setActiveCategory("all");
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] xs:text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none whitespace-nowrap ${
                  audience === "renters"
                    ? "bg-[#C9A84C] text-[#1A1A1A] shadow-sm"
                    : "text-white/80 hover:text-white bg-transparent font-medium"
                }`}
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span>For Renters &amp; Expats</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAudience("landlords");
                  setActiveCategory("all");
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] xs:text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none whitespace-nowrap ${
                  audience === "landlords"
                    ? "bg-[#C9A84C] text-[#1A1A1A] shadow-sm font-bold"
                    : "text-white/80 hover:text-white bg-transparent"
                }`}
              >
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span>For Landlords &amp; Owners</span>
              </button>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-3.5 tracking-tight leading-tight px-2">
              How can we help your Bangkok move?
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/80 max-w-xl mx-auto mb-6 sm:mb-8 font-normal leading-relaxed px-2">
              Clear answers on verified listings, deposits, lease contracts, and neighbourhood selection.
            </p>

            {/* Search Shell */}
            <div className="bg-[#F8F9FA] rounded-full px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center gap-2.5 sm:gap-3 shadow-lg max-w-2xl mx-auto border border-white/20 mb-5 sm:mb-6">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#666666] flex-shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Search questions (e.g. deposit, agent fees...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[#1A1A1A] placeholder-[#888888] text-xs sm:text-base focus:outline-none py-0 font-normal border-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Popular Search Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm max-w-3xl mx-auto px-2">
              <span className="text-white/60 font-medium mr-1 text-xs">Popular:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handlePopularTagClick(tag)}
                  className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer border ${
                    searchQuery === tag.term
                      ? "bg-[#C9A84C] text-[#1A1A1A] font-bold border-[#C9A84C]"
                      : "bg-white/10 hover:bg-white/20 text-white/90 border-white/20"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* MOBILE STICKY TOP TOPICS BAR (Mobile Friendly Scrollbar) */}
        <div className="lg:hidden sticky top-[56px] z-30 bg-white border-b border-[#E7E5DF] py-2.5 px-4 shadow-xs overflow-x-auto flex items-center gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 flex items-center gap-1.5 transition-all border-none cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#0F2A20] text-white font-bold shadow-xs"
                : "bg-[#FAF9F6] text-[#6B756E] border border-[#E7E5DF]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>All topics ({totalFaqsCount})</span>
          </button>

          {currentCategories.map((cat) => {
            const IconComp = cat.icon || Building2;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery("");
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 flex items-center gap-1.5 transition-all border-none cursor-pointer ${
                  isActive
                    ? "bg-[#0F2A20] text-white font-bold shadow-xs"
                    : "bg-[#FAF9F6] text-[#6B756E] border border-[#E7E5DF]"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{cat.label} ({cat.faqs.length})</span>
              </button>
            );
          })}
        </div>

        {/* MAIN LAYOUT (DESKTOP SIDEBAR + CONTENT) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 pt-6 sm:pt-8 pb-4 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 sm:gap-10 items-start">
          
          {/* DESKTOP SIDEBAR NAVIGATION */}
          <aside className="hidden lg:block lg:sticky lg:top-24 space-y-2" id="sidebar">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B756E] mb-2.5 px-3">
              Browse topics
            </p>

            <nav className="space-y-1">
              {/* All Topics Item */}
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer border-none ${
                  activeCategory === "all"
                    ? "bg-[#EAF1EC] text-[#0F2A20] font-bold"
                    : "bg-transparent text-[#6B756E] hover:bg-[#FAF9F6] hover:text-[#1B2620]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                      activeCategory === "all"
                        ? "bg-[#0F2A20] text-white"
                        : "bg-[#EAF1EC] text-[#0F2A20]"
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </span>
                  <span>All topics</span>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    activeCategory === "all" ? "text-[#0F2A20]" : "text-[#9CA39C]"
                  }`}
                >
                  {totalFaqsCount}
                </span>
              </button>

              {/* Category Links */}
              {currentCategories.map((cat) => {
                const IconComp = cat.icon || Building2;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer border-none ${
                      isActive
                        ? "bg-[#EAF1EC] text-[#0F2A20] font-bold"
                        : "bg-transparent text-[#6B756E] hover:bg-white hover:text-[#1B2620]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-1">
                      <span
                        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? "bg-[#0F2A20] text-white"
                            : "bg-[#EAF1EC] text-[#0F2A20]"
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span
                      className={`text-xs font-semibold flex-shrink-0 ${
                        isActive ? "text-[#0F2A20]" : "text-[#9CA39C]"
                      }`}
                    >
                      {cat.faqs.length}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar CTA Box */}
            <div className="mt-6 bg-[#FBF3DC] rounded-xl p-4.5 text-left border border-[#C9A233]/20">
              <p className="text-xs sm:text-sm text-[#7A6220] font-medium leading-relaxed mb-3">
                Can&apos;t find it here? Message an advisor directly.
              </p>
              <Link
                href="/about-us"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0F2A20] no-underline hover:underline"
              >
                <span>Contact team</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0F2A20]" />
              </Link>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="min-w-0" id="faq-start">
            {/* Header Title + Count */}
            <div className="flex items-baseline justify-between mb-4 sm:mb-5 flex-wrap gap-2 border-b border-[#E7E5DF] pb-3">
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#0F2A20]">
                {activeCategory === "all"
                  ? "All topics"
                  : currentCategories.find((c) => c.id === activeCategory)?.label}
              </h2>
              <span className="text-xs sm:text-sm text-[#6B756E] font-medium">
                {totalResultsCount} question{totalResultsCount === 1 ? "" : "s"}
              </span>
            </div>

            {/* Accordion Questions List */}
            {totalResultsCount === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4 text-[#6B756E] text-xs sm:text-sm bg-white rounded-xl border border-[#E7E5DF]">
                <p className="mb-4">
                  No matches on file for &ldquo;{searchQuery}&rdquo;. Try a broader term, or message an advisor below.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="px-4 py-2 rounded-full bg-[#EAF1EC] text-[#0F2A20] text-xs font-bold hover:bg-[#144433] hover:text-white transition-colors cursor-pointer border-none"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {filteredData.map((cat) => {
                  const CatIcon = cat.icon || Building2;
                  return (
                    <div key={cat.id} className="space-y-3">
                      {activeCategory === "all" && (
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#EAF1EC] flex items-center justify-center text-[#0F2A20]">
                            <CatIcon className="w-3.5 h-3.5" />
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-[#0F2A20]">
                            {cat.label}
                          </h3>
                        </div>
                      )}

                      <div className="space-y-2.5">
                        {cat.faqs.map((faq) => {
                          const itemKey = `${cat.id}-${faq.q}`;
                          const isOpen = openItems[itemKey] || searchQuery.length > 0;

                          return (
                            <div
                              key={faq.q}
                              className={`bg-white border rounded-xl overflow-hidden transition-all duration-150 ${
                                isOpen
                                  ? "border-[#E7E5DF] shadow-md"
                                  : "border-[#E7E5DF] hover:border-[#144433]/30"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleAccordion(itemKey)}
                                className="w-full text-left p-3.5 sm:p-5 flex items-center justify-between gap-3 cursor-pointer bg-transparent border-none"
                              >
                                <span className="text-xs sm:text-base font-semibold text-[#1B2620] leading-snug flex-1">
                                  {faq.q}
                                </span>
                                <span
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                                    isOpen
                                      ? "bg-[#EAF1EC] text-[#0F2A20] rotate-180"
                                      : "bg-[#FAF9F6] text-[#6B756E]"
                                  }`}
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </span>
                              </button>

                              {isOpen && (
                                <div className="px-3.5 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#6B756E] leading-relaxed border-t border-[#E7E5DF]/60 pt-3.5 space-y-3 font-normal">
                                  {faq.a.split("\n\n").map((para, pIdx) => (
                                    <p key={pIdx} className="m-0">
                                      {renderFormattedTextWithInternalLinks(para)}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* BOTTOM CONTACT CTA CARD */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 mt-2 mb-6">
          <div className="bg-gradient-to-r from-[#144433] via-[#0F2A20] to-[#0F2A20] rounded-2xl text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden shadow-xl">
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />

            <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-[#C9A233]">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-xl font-extrabold text-white mb-0.5 sm:mb-1">
                  Still have unanswered questions?
                </h4>
                <p className="text-xs sm:text-sm text-white/70 m-0">
                  Our Bangkok advisors respond within a few hours on LINE and WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 relative z-10 w-full sm:w-auto">
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/30 text-white text-xs sm:text-sm font-semibold hover:bg-white/10 transition-colors no-underline text-center"
              >
                LINE Official
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/30 text-white text-xs sm:text-sm font-semibold hover:bg-white/10 transition-colors no-underline text-center"
              >
                WhatsApp
              </a>
              <Link
                href="/about-us"
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#C9A233] text-[#0F2A20] text-xs sm:text-sm font-bold hover:bg-[#d8b038] transition-colors no-underline text-center shadow-sm"
              >
                Contact team
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}
