"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, ThumbsUp, ThumbsDown, Users, X, Search, Grid, List } from "lucide-react";
import { PropertyCard } from "@/types/property";
import { getCanonicalArea } from "@/lib/area";

// Dimensions — big card + 2×2 grid heights must match
const BIG_W   = 260;  // px — anchor card width
const CARD_W  = 278;  // px — each small landscape card width
const CARD_H  = 210;  // px — each small card height (landscape: 278×210)
const GAP     = 10;   // px — gap between all cards
const BIG_H   = CARD_H * 2 + GAP; // 430px — anchor card height exactly equals 2×grid rows



interface VibeCheckCard {
  slug: string;
  name: string;
  count: number;
  image: string;
  href: string;
  vibe: string;
  tags: string[];
  bestFor: string;
  pros: string;
  cons: string;
  whoLovesIt: string;
}

interface NeighborhoodItem {
  slug: string;
  name: string;
  image: string;
  href: string;
  category: string;
  isProfileOnly?: boolean;
}

interface CategorySectionProps {
  properties?: PropertyCard[];
}

export default function CategorySection({ properties = [] }: CategorySectionProps) {
  const { t } = useLanguage();
  const [vibeCheckCard, setVibeCheckCard] = useState<VibeCheckCard | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (showAllModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAllModal]);

  const closeModal = () => {
    setShowAllModal(false);
    setSearchQuery("");
    setMobileView("grid");
  };

  const getAreaCount = (slug: string) => {
    const slugMap: Record<string, string> = {
      "sukhumvit": "Sukhumvit",
      "sathorn": "Sathorn",
      "thong-lo": "Thong Lo",
      "asok": "Asok",
      "ekkamai": "Ekkamai",
      "silom": "Silom",
      "on-nut": "On Nut",
      "ari": "Ari",
      "rama-9": "Rama 9",
      "bang-na": "Bang Na",
      "huai-khwang": "Huai Khwang",
      "phaya-thai": "Phaya Thai",
      "chatuchak": "Chatuchak",
      "rama-4": "Rama 4",
      "sam-yan": "Sam Yan",
      "khlong-san": "Khlong San",
      "charoenkrung": "Charoenkrung",
      "phra-khanong": "Phra Khanong",
      "chidlom-ploenchit": "Chit Lom / Ploenchit",
      "nana": "Nana",
      "ladprao": "Ladprao",
      "thonburi": "Thonburi",
    };
    const targetArea = slugMap[slug];
    if (!targetArea) return 0;
    // Return only real live listings from the database — no padding
    return properties.filter(
      (p) => getCanonicalArea(p.area) === targetArea && p.status !== "draft" && p.status !== "unlisted"
    ).length;
  };

  const SECTIONS = [
    {
      anchor: {
        slug:  "near-bts",
        label: t.category.lookingIn,
        name:  t.category.nearBts,
        image: "/images/neighborhoods/near_bts_anchor.webp",
        href:  "/explore?bts=true",
      },
      cards: [
        { slug: "sukhumvit", name: t.category.areas.sukhumvit, count: getAreaCount("sukhumvit"), image: "/images/neighborhoods/sukhumvit.webp", href: "/neighborhood/sukhumvit" },
        { slug: "sathorn",   name: t.category.areas.sathorn,   count: getAreaCount("sathorn"),   image: "/images/neighborhoods/sathorn.webp", href: "/neighborhood/sathorn" },
        { slug: "thong-lo",  name: t.category.areas.thongLo,    count: getAreaCount("thong-lo"),  image: "/images/neighborhoods/thong_lo.webp", href: "/neighborhood/thong-lo" },
        { slug: "asok",      name: t.category.areas.asok,       count: getAreaCount("asok"),      image: "/images/neighborhoods/asok.webp", href: "/neighborhood/asok" },
      ],
    },
    {
      anchor: {
        slug:  "pet-friendly",
        label: t.category.lookingIn,
        name:  t.category.petFriendly,
        image: "/images/neighborhoods/pet_friendly_anchor.webp",
        href:  "/explore?pets=true",
      },
      cards: [
        { slug: "ekkamai",  name: t.category.areas.ekkamai, count: getAreaCount("ekkamai"), image: "/images/neighborhoods/ekkamai.webp", href: "/neighborhood/ekkamai" },
        { slug: "silom",    name: t.category.areas.silom,   count: getAreaCount("silom"),   image: "/images/neighborhoods/silom.webp", href: "/neighborhood/silom" },
        { slug: "on-nut",   name: t.category.areas.onNut,   count: getAreaCount("on-nut"),   image: "/images/neighborhoods/on_nut.webp", href: "/neighborhood/on-nut" },
        { slug: "ari",      name: t.category.areas.ari,     count: getAreaCount("ari"),     image: "/images/neighborhoods/ari.webp", href: "/neighborhood/ari" },
      ],
    },
    {
      anchor: {
        slug:  "other-areas",
        label: t.category.lookingIn,
        name:  t.category.newHubs,
        image: "/images/neighborhoods/new_hubs_anchor.webp",
        href:  "/explore?area=Other",
      },
      cards: [
        { slug: "rama-9",      name: t.category.areas.rama9,      count: getAreaCount("rama-9"),      image: "/images/neighborhoods/rama_9.webp", href: "/neighborhood/rama-9" },
        { slug: "bang-na",     name: t.category.areas.bangNa,     count: getAreaCount("bang-na"),     image: "/images/neighborhoods/bang_na.webp", href: "/neighborhood/bang-na" },
        { slug: "chatuchak",   name: t.category.areas.chatuchak,   count: getAreaCount("chatuchak"),   image: "/images/neighborhoods/chatuchak.webp", href: "/neighborhood/chatuchak" },
        { slug: "rama-4",      name: t.category.areas.rama4,      count: getAreaCount("rama-4"),      image: "/images/neighborhoods/rama_4.webp", href: "/neighborhood/rama-4" },
      ],
    },
  ];

  const allNeighborhoods: NeighborhoodItem[] = [
    { slug: "sukhumvit", name: t.category.areas.sukhumvit, image: "/images/neighborhoods/sukhumvit.webp", href: "/neighborhood/sukhumvit", category: "Central & CBD" },
    { slug: "sathorn", name: t.category.areas.sathorn, image: "/images/neighborhoods/sathorn.webp", href: "/neighborhood/sathorn", category: "Central & CBD" },
    { slug: "asok", name: t.category.areas.asok, image: "/images/neighborhoods/asok.webp", href: "/neighborhood/asok", category: "Central & CBD" },
    { slug: "silom", name: t.category.areas.silom, image: "/images/neighborhoods/silom.webp", href: "/neighborhood/silom", category: "Central & CBD" },
    { slug: "chidlom-ploenchit", name: "Chit Lom / Ploenchit", image: "/images/neighborhoods/chidlom_ploenchit.webp", href: "/neighborhood/chidlom-ploenchit", category: "Central & CBD" },
    { slug: "nana", name: "Nana", image: "/images/neighborhoods/nana.webp", href: "/neighborhood/nana", category: "Central & CBD" },
    { slug: "thong-lo", name: t.category.areas.thongLo, image: "/images/neighborhoods/thong_lo.webp", href: "/neighborhood/thong-lo", category: "Trendy & Lifestyle" },
    { slug: "ekkamai", name: t.category.areas.ekkamai, image: "/images/neighborhoods/ekkamai.webp", href: "/neighborhood/ekkamai", category: "Trendy & Lifestyle" },
    { slug: "ari", name: t.category.areas.ari, image: "/images/neighborhoods/ari.webp", href: "/neighborhood/ari", category: "Trendy & Lifestyle" },
    { slug: "phra-khanong", name: t.category.areas.phraKhanong, image: "/images/neighborhoods/phra_khanong.webp", href: "/neighborhood/phra-khanong", category: "Trendy & Lifestyle" },
    { slug: "rama-9", name: t.category.areas.rama9, image: "/images/neighborhoods/rama_9.webp", href: "/neighborhood/rama-9", category: "Residential & Emerging" },
    { slug: "bang-na", name: t.category.areas.bangNa, image: "/images/neighborhoods/bang_na.webp", href: "/neighborhood/bang-na", category: "Residential & Emerging" },
    { slug: "on-nut", name: t.category.areas.onNut, image: "/images/neighborhoods/on_nut.webp", href: "/neighborhood/on-nut", category: "Residential & Emerging" },
    { slug: "huai-khwang", name: t.category.areas.huaiKhwang, image: "/images/neighborhoods/huai_khwang.webp", href: "/neighborhood/huai-khwang", category: "Residential & Emerging" },
    { slug: "phaya-thai", name: t.category.areas.phayaThai, image: "/images/neighborhoods/phaya_thai.webp", href: "/neighborhood/phaya-thai", category: "Residential & Emerging" },
    { slug: "chatuchak", name: t.category.areas.chatuchak, image: "/images/neighborhoods/chatuchak.webp", href: "/neighborhood/chatuchak", category: "Residential & Emerging" },
    { slug: "rama-4", name: t.category.areas.rama4, image: "/images/neighborhoods/rama_4.webp", href: "/neighborhood/rama-4", category: "Residential & Emerging" },
    { slug: "ladprao", name: "Ladprao", image: "/images/neighborhoods/ladprao.webp", href: "/neighborhood/ladprao", category: "Residential & Emerging" },
    { slug: "charoenkrung", name: t.category.areas.charoenkrung, image: "/images/neighborhoods/charoenkrung.webp", href: "/neighborhood/charoenkrung", category: "Riverside & Historic" },
    { slug: "sam-yan", name: t.category.areas.samYan, image: "/images/neighborhoods/sam_yan.webp", href: "/neighborhood/sam-yan", category: "Riverside & Historic" },
    { slug: "khlong-san", name: t.category.areas.khlongSan, image: "/images/neighborhoods/khlong_san.webp", href: "/neighborhood/khlong-san", category: "Riverside & Historic" },
    { slug: "thonburi", name: "Thonburi", image: "/images/neighborhoods/thonburi.webp", href: "/neighborhood/thonburi", category: "Riverside & Historic" },
  ];

  return (
    <section className="py-8" style={{ background: "#F7F3EC" }}>

      {/* Header */}
      <div className="flex items-end justify-between px-4 md:px-6 mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5" style={{ color: "#C9A84C" }}>
            {t.category.label}
          </p>
          <h2 className="text-[20px] font-bold" style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}>
            {t.category.title}
          </h2>
        </div>
        <button
          onClick={() => setShowAllModal(true)}
          className="text-[12px] font-medium no-underline pb-px bg-transparent border-none cursor-pointer hover:opacity-85 transition-opacity"
          style={{ color: "#1C3A2F", borderBottom: "1px solid #1C3A2F", padding: 0 }}
        >
          {t.category.all}
        </button>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block overflow-x-auto no-scrollbar px-4 md:px-6 pb-1">
        {/* Outer row: two sections side by side */}
        <div className="flex" style={{ gap: GAP * 2, width: "max-content", minWidth: "100%" }}>

          {SECTIONS.map((section) => (
            <div key={section.anchor.slug} className="flex flex-shrink-0" style={{ gap: GAP }}>

              {/* ── ANCHOR CARD — tall portrait ── */}
              <a
                href={section.anchor.href}
                className="relative overflow-hidden rounded-2xl no-underline flex-shrink-0 group"
                style={{ width: BIG_W, height: BIG_H }}
              >
                <Image
                  src={section.anchor.image}
                  alt={section.anchor.name}
                  fill
                  sizes="260px"
                  quality={45}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 45%, transparent 100%)" }}
                />
                {/* text — centred, near bottom */}
                <div className="absolute bottom-0 left-0 right-0 pb-6 flex flex-col items-center text-center px-4">
                  <p className="text-[11px] font-light mb-1.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {section.anchor.label}
                  </p>
                  <h3
                    className="font-bold leading-tight"
                    style={{ fontSize: 22, color: "#FFFFFF", letterSpacing: "-0.3px" }}
                  >
                    {section.anchor.name}
                  </h3>
                </div>
                {/* hover border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ border: "1.5px solid rgba(201,168,76,0.5)" }} />
              </a>

              {/* ── 2×2 LANDSCAPE GRID ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `${CARD_W}px ${CARD_W}px`,
                  gridTemplateRows: `${CARD_H}px ${CARD_H}px`,
                  gap: GAP,
                }}
              >
                {section.cards.map((card) => (
                  <a
                    key={card.slug}
                    href={card.href}
                    className="relative overflow-hidden rounded-xl no-underline group"
                  >
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      sizes="(max-width: 768px) 170px, 278px"
                      quality={45}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)" }}
                    />
                    {/* text — bottom-left */}
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <h4 className="text-[14px] font-semibold leading-tight mb-0.5" style={{ color: "#FFFFFF" }}>
                        {card.name}
                      </h4>

                      <p className="text-[11px] opacity-80" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {card.count.toLocaleString()} {t.category.propsForYou}
                      </p>
                    </div>



                    {/* hover border */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ border: "1.5px solid rgba(201,168,76,0.4)" }} />
                  </a>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ── MOBILE: horizontal scroll ── */}
      <div
        className="md:hidden overflow-x-auto no-scrollbar"
        style={{ paddingLeft: 16 }}
      >
        <div className="flex pb-4" style={{ gap: 20 }}>
          {SECTIONS.map((section) => (
            <div
              key={section.anchor.slug}
              className="flex items-stretch flex-shrink-0"
              style={{ gap: 12, height: 238 }}
            >
              {/* Tall anchor card — 50% larger (95px -> 142px) */}
              <a
                href={section.anchor.href}
                className="relative overflow-hidden rounded-2xl no-underline flex-shrink-0 group"
                style={{ width: 142 }}
              >
                <Image
                  src={section.anchor.image}
                  alt={section.anchor.name}
                  fill
                  sizes="142px"
                  quality={45}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 pb-5 px-3 flex flex-col items-center text-center">
                  <p className="text-[11px] font-light mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {section.anchor.label}
                  </p>
                  <h3 className="text-[16px] font-bold leading-tight" style={{ color: "#FFFFFF", letterSpacing: "-0.2px" }}>
                    {section.anchor.name}
                  </h3>
                </div>
              </a>

              {/* 2×2 landscape grid — 50% larger (aspect ratio 3/2 with W:170px, H:113px) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "170px 170px",
                  gridTemplateRows: "113px 113px",
                  gap: 12,
                }}
              >
                {section.cards.map((card) => (
                  <a
                    key={card.slug}
                    href={card.href}
                    className="relative overflow-hidden rounded-2xl no-underline group"
                  >
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      sizes="170px"
                      quality={45}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }}
                    />
                    <div className="absolute bottom-0 left-0 p-3.5 w-full text-left">
                      <h4 className="text-[13px] font-bold leading-tight mb-0.5 truncate" style={{ color: "#FFFFFF" }}>
                        {card.name}
                      </h4>
                      <p className="text-[11px] opacity-80 truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                        {card.count.toLocaleString()} {t.category.props}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Right breathing room so last section doesn't hug screen edge */}
          <div style={{ width: 16, flexShrink: 0 }} />
        </div>
      </div>

      {/* Vibe Check Bottom Drawer Sheet for Mobile */}
      {vibeCheckCard && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden" onClick={() => setVibeCheckCard(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }} />
          <div
            className="relative w-full rounded-t-3xl p-6 animate-slide-up"
            style={{ background: "#F7F3EC", color: "#1C3A2F", zIndex: 60, maxHeight: "75vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#C9A84C] flex items-center gap-1 mb-0.5">
                  <Compass className="w-3.5 h-3.5" /> Vibe Check
                </span>
                <h3 className="text-[20px] font-bold leading-tight" style={{ color: "#1C3A2F" }}>{vibeCheckCard.name}</h3>
              </div>
              <button
                onClick={() => setVibeCheckCard(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none text-xs"
                style={{ background: "#EDE8DF", color: "#1C3A2F" }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 text-[13px] leading-relaxed">
              <p className="italic font-light" style={{ color: "#555" }}>&quot;{vibeCheckCard.vibe}&quot;</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {vibeCheckCard.tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase" style={{ background: "#EDE8DF", color: "#1C3A2F" }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Best For */}
              <div className="p-3 rounded-xl" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <span className="text-[9px] font-bold uppercase tracking-[1px] text-[#C9A84C] block mb-0.5">Best For</span>
                <p className="font-semibold text-[12px]">{vibeCheckCard.bestFor}</p>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 rounded-xl bg-white" style={{ border: "1px solid #E5E0D8" }}>
                  <span className="text-[9px] font-bold uppercase tracking-[1px] text-emerald-600 flex items-center gap-1 mb-0.5">
                    <ThumbsUp className="w-3.5 h-3.5" /> Pros
                  </span>
                  <p className="font-light text-[#555]">{vibeCheckCard.pros}</p>
                </div>
                <div className="p-3 rounded-xl bg-white" style={{ border: "1px solid #E5E0D8" }}>
                  <span className="text-[9px] font-bold uppercase tracking-[1px] text-rose-500 flex items-center gap-1 mb-0.5">
                    <ThumbsDown className="w-3.5 h-3.5" /> Cons
                  </span>
                  <p className="font-light text-[#555]">{vibeCheckCard.cons}</p>
                </div>
              </div>

              {/* Who loves it */}
              <div className="p-3 rounded-xl bg-white" style={{ border: "1px solid #E5E0D8" }}>
                <span className="text-[9px] font-bold uppercase tracking-[1px] text-[#C9A84C] flex items-center gap-1 mb-0.5">
                  <Users className="w-3.5 h-3.5" /> Who Lives Here
                </span>
                <p className="font-light text-[#555]">{vibeCheckCard.whoLovesIt}</p>
              </div>

              {/* Explore Link */}
              <a
                href={`/neighborhood/${vibeCheckCard.slug}`}
                className="w-full py-3.5 rounded-xl text-center font-bold text-sm no-underline transition-colors mt-2 block"
                style={{ background: "#1C3A2F", color: "#FFFFFF" }}
              >
                Explore {vibeCheckCard.name} Guide →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphic Modal Overlay for all neighborhoods */}
      {showAllModal && (() => {
        const filteredNeighborhoods = allNeighborhoods.filter((item) => {
          const nameMatch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase());
          const slugMatch = item.slug.toLowerCase().includes(searchQuery.toLowerCase());
          const catMatch = item.category.toLowerCase().includes(searchQuery.toLowerCase());
          return nameMatch || slugMatch || catMatch;
        });

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }} onClick={() => closeModal()}>
            <div
              className="relative w-full h-full p-4 md:p-12 lg:p-16 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-300"
              style={{ background: "#F7F3EC", color: "#1C3A2F" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid rgba(28, 58, 47, 0.1)" }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#C9A84C] block md:hidden mb-0.5">Bangkok Guides</span>
                  <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#C9A84C] hidden md:block mb-1">
                    Bangkok Neighborhoods
                  </span>
                  <h3 className="text-[16px] md:text-[26px] font-bold leading-tight" style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}>
                    Explore All Categories & Guides
                  </h3>
                </div>
                <button
                  onClick={() => closeModal()}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center cursor-pointer border-none transition-colors flex-shrink-0"
                  style={{ background: "#EDE8DF", color: "#1C3A2F" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#DCD5C9"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#EDE8DF"}
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Search and Toggle Controls */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-stretch sm:items-center mb-5 z-10">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-xs md:max-w-lg">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1C3A2F]/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search neighborhood or category..."
                    className="w-full pl-8 pr-8 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border border-solid focus:outline-none focus:ring-1 focus:ring-[#C9A84C] text-[12px] md:text-[14px]"
                    style={{
                      background: "#EDE8DF",
                      borderColor: "rgba(28, 58, 47, 0.15)",
                      color: "#1C3A2F"
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[#1C3A2F]/60 hover:text-[#1C3A2F] p-0 flex items-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Toggle Controls (Mobile Only) */}
                <div className="flex items-center gap-2 md:hidden self-end">
                  <span className="text-[12px] font-bold uppercase tracking-[1px] text-[#1C3A2F]/60">
                    View:
                  </span>
                  <div className="flex p-0.5 rounded-lg" style={{ background: "#EDE8DF" }}>
                    <button
                      onClick={() => setMobileView("grid")}
                      className={`p-2 rounded-md border-none cursor-pointer flex items-center justify-center transition-all ${mobileView === "grid" ? "shadow-sm" : "opacity-60"}`}
                      style={{
                        background: mobileView === "grid" ? "#1C3A2F" : "transparent",
                        color: mobileView === "grid" ? "#FFFFFF" : "#1C3A2F",
                      }}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMobileView("list")}
                      className={`p-2 rounded-md border-none cursor-pointer flex items-center justify-center transition-all ${mobileView === "list" ? "shadow-sm" : "opacity-60"}`}
                      style={{
                        background: mobileView === "list" ? "#1C3A2F" : "transparent",
                        color: mobileView === "list" ? "#FFFFFF" : "#1C3A2F",
                      }}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content: scrollable grid/list */}
              <div className="overflow-y-auto pr-2 flex-grow mb-4" style={{ maxHeight: "calc(100vh - 250px)" }}>
                {filteredNeighborhoods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="w-12 h-12 opacity-30 mb-3 text-[#1C3A2F]" />
                    <p className="text-[15px] font-bold" style={{ color: "#1C3A2F" }}>No Neighborhoods Found</p>
                    <p className="text-[13px] opacity-75 mt-1" style={{ color: "#1C3A2F" }}>Try searching for a different area or category</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile List View (rendered only when mobileView is 'list' on md and below) */}
                    {mobileView === "list" && (
                      <div className="flex flex-col gap-4 md:hidden">
                        {filteredNeighborhoods.map((item) => {
                          const count = getAreaCount(item.slug);
                          const isProfileOnly = item.isProfileOnly || count === 0;

                          return (
                            <a
                              key={item.slug}
                              href={item.href}
                              className="relative w-full h-44 rounded-2xl overflow-hidden no-underline block"
                              style={{ transition: "all 0.3s ease" }}
                            >
                              {/* Image */}
                              <Image
                                src={item.image}
                                alt={item.name || item.slug}
                                fill
                                sizes="100vw"
                                quality={45}
                                className={`object-cover ${isProfileOnly ? "grayscale" : ""}`}
                              />

                              {/* Gradient Overlay */}
                              <div
                                className="absolute inset-0"
                                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 65%, transparent 100%)" }}
                              />

                              {/* Category Badge on top-right */}
                              <div className="absolute top-3.5 right-3.5 z-10">
                                <span className="text-[10px] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-md backdrop-blur-md" style={{ background: "rgba(28, 58, 47, 0.75)", color: "#F7F3EC" }}>
                                  {item.category}
                                </span>
                              </div>

                              {/* Text overlay on top of the image */}
                              <div className="absolute bottom-0 left-0 p-4 w-full text-left z-10">
                                <h4 className="text-[18px] font-bold leading-tight mb-1" style={{ color: "#FFFFFF" }}>
                                  {item.name || item.slug}
                                </h4>
                                {isProfileOnly ? (
                                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/25 px-2 py-0.5 rounded backdrop-blur-sm inline-block">
                                    📖 Guide Only
                                  </span>
                                ) : (
                                  <p className="text-[12px] opacity-90 leading-none m-0" style={{ color: "rgba(255,255,255,0.9)" }}>
                                    {count.toLocaleString()} {t.category.propsForYou}
                                  </p>
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* Grid View wrapper: hidden on mobile list, always shown on desktop */}
                    <div className={`${mobileView === "list" ? "hidden md:grid" : "grid"} grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6`}>
                      {filteredNeighborhoods.map((item) => {
                        const count = getAreaCount(item.slug);
                        const isProfileOnly = item.isProfileOnly || count === 0;

                        return (
                          <a
                            key={item.slug}
                            href={item.href}
                            className="relative w-full h-28 md:h-40 rounded-xl md:rounded-2xl overflow-hidden no-underline group block"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "none";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                            style={{ transition: "all 0.3s ease" }}
                          >
                            {/* Image */}
                            <Image
                              src={item.image}
                              alt={item.name || item.slug}
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                              quality={45}
                              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isProfileOnly ? "grayscale group-hover:grayscale-0" : ""}`}
                            />

                            {/* Gradient Overlay */}
                            <div
                              className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)" }}
                            />

                            {/* Category Badge on top-right */}
                            <div className="absolute top-2 right-2 md:top-3.5 md:right-3.5 z-10">
                              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.5px] md:tracking-[1px] px-1.5 py-0.5 md:px-2 rounded-md backdrop-blur-md" style={{ background: "rgba(28, 58, 47, 0.75)", color: "#F7F3EC" }}>
                                {item.category}
                              </span>
                            </div>

                            {/* Text overlay on top of the image */}
                            <div className="absolute bottom-0 left-0 p-3 md:p-4 w-full text-left z-10">
                              <h4 className="text-[13px] md:text-[16px] font-bold leading-tight mb-1 transition-colors group-hover:text-[#C9A84C]" style={{ color: "#FFFFFF" }}>
                                {item.name || item.slug}
                              </h4>
                              {isProfileOnly ? (
                                <span className="text-[9px] md:text-[10px] font-semibold text-amber-300 bg-amber-500/25 px-1.5 py-0.5 rounded backdrop-blur-sm inline-block">
                                  📖 Guide Only
                                </span>
                              ) : (
                                <p className="text-[9px] md:text-[11px] opacity-85 leading-none m-0" style={{ color: "rgba(255,255,255,0.9)" }}>
                                  {count.toLocaleString()} {t.category.propsForYou}
                                </p>
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
