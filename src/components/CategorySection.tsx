"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, ThumbsUp, ThumbsDown, Users } from "lucide-react";
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

interface CategorySectionProps {
  properties?: PropertyCard[];
}

export default function CategorySection({ properties = [] }: CategorySectionProps) {
  const { t } = useLanguage();
  const [vibeCheckCard, setVibeCheckCard] = useState<VibeCheckCard | null>(null);

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
        <a href="/explore" className="hidden md:block text-[12px] font-medium no-underline pb-px" style={{ color: "#1C3A2F", borderBottom: "1px solid #1C3A2F" }}>
          {t.category.all}
        </a>
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
    </section>
  );
}
