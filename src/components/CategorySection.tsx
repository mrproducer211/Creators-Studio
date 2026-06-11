"use client";

import { useState } from "react";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function CategorySection() {
  const { t } = useLanguage();
  const [vibeCheckCard, setVibeCheckCard] = useState<VibeCheckCard | null>(null);

  const SECTIONS = [
    {
      anchor: {
        slug:  "near-bts",
        label: t.category.lookingIn,
        name:  t.category.nearBts,
        image: "/images/neighborhoods/near_bts_anchor.png",
        href:  "/explore?bts=true",
      },
      cards: [
        { slug: "sukhumvit", name: t.category.areas.sukhumvit, count: MOCK_PROPERTIES.filter(p => p.area === "Sukhumvit").length + 18, image: "/images/neighborhoods/sukhumvit.png", href: "/neighborhood/sukhumvit" },
        { slug: "sathorn",   name: t.category.areas.sathorn,   count: MOCK_PROPERTIES.filter(p => p.area === "Sathorn").length + 14,   image: "/images/neighborhoods/sathorn.png", href: "/neighborhood/sathorn" },
        { slug: "thong-lo",  name: t.category.areas.thongLo,    count: MOCK_PROPERTIES.filter(p => p.area === "Thong Lo").length + 12,  image: "/images/neighborhoods/thong_lo.png", href: "/neighborhood/thong-lo" },
        { slug: "asok",      name: t.category.areas.asok,       count: MOCK_PROPERTIES.filter(p => p.area === "Asok").length + 9,       image: "/images/neighborhoods/asok.png", href: "/neighborhood/asok" },
      ],
    },
    {
      anchor: {
        slug:  "pet-friendly",
        label: t.category.lookingIn,
        name:  t.category.petFriendly,
        image: "/images/neighborhoods/pet_friendly_anchor.png",
        href:  "/explore?pets=true",
      },
      cards: [
        { slug: "ekkamai",  name: t.category.areas.ekkamai, count: MOCK_PROPERTIES.filter(p => p.area === "Ekkamai").length + 11, image: "/images/neighborhoods/ekkamai.png", href: "/neighborhood/ekkamai" },
        { slug: "silom",    name: t.category.areas.silom,   count: 16, image: "/images/neighborhoods/silom.png", href: "/neighborhood/silom" },
        { slug: "on-nut",   name: t.category.areas.onNut,   count: MOCK_PROPERTIES.filter(p => p.area === "On Nut").length + 9,   image: "/images/neighborhoods/on_nut.png", href: "/neighborhood/on-nut" },
        { slug: "ari",      name: t.category.areas.ari,     count: 13, image: "/images/neighborhoods/ari.png", href: "/neighborhood/ari" },
      ],
    },
    {
      anchor: {
        slug:  "new-hubs",
        label: t.category.lookingIn,
        name:  t.category.newHubs,
        image: "/images/neighborhoods/new_hubs_anchor.png",
        href:  "/explore?newHubs=true",
      },
      cards: [
        { slug: "rama-9",      name: t.category.areas.rama9,      count: MOCK_PROPERTIES.filter(p => p.area === "Rama 9").length + 12,      image: "/images/neighborhoods/rama_9.png", href: "/neighborhood/rama-9" },
        { slug: "bang-na",     name: t.category.areas.bangNa,     count: MOCK_PROPERTIES.filter(p => p.area === "Bang Na").length + 15,     image: "/images/neighborhoods/bang_na.png", href: "/neighborhood/bang-na" },
        { slug: "huai-khwang",  name: t.category.areas.huaiKhwang,  count: MOCK_PROPERTIES.filter(p => p.area === "Huai Khwang").length + 10,  image: "/images/neighborhoods/huai_khwang.png", href: "/neighborhood/huai-khwang" },
        { slug: "phaya-thai",  name: t.category.areas.phayaThai,  count: MOCK_PROPERTIES.filter(p => p.area === "Phaya Thai").length + 8,   image: "/images/neighborhoods/phaya_thai.png", href: "/neighborhood/phaya-thai" },
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
                <img
                  src={section.anchor.image}
                  alt={section.anchor.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                    <img
                      src={card.image}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
        <div className="flex pb-3" style={{ gap: 16 }}>
          {SECTIONS.map((section) => (
            <div
              key={section.anchor.slug}
              className="flex items-stretch flex-shrink-0"
              style={{ width: "calc(100vw - 44px)", gap: 10 }}
            >
              {/* Tall anchor card — wider and taller */}
              <a
                href={section.anchor.href}
                className="relative overflow-hidden rounded-2xl no-underline flex-shrink-0 group"
                style={{ width: 110 }}
              >
                <img
                  src={section.anchor.image}
                  alt={section.anchor.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 pb-4 px-2.5 flex flex-col items-center text-center">
                  <p className="text-[10px] font-light mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {section.anchor.label}
                  </p>
                  <h3 className="text-[14px] font-bold leading-tight" style={{ color: "#FFFFFF", letterSpacing: "-0.2px" }}>
                    {section.anchor.name}
                  </h3>
                </div>
              </a>

              {/* 2×2 landscape grid */}
              <div
                className="flex-1 grid grid-cols-2"
                style={{ gap: 10 }}
              >
                {section.cards.map((card) => (
                  <a
                    key={card.slug}
                    href={card.href}
                    className="relative overflow-hidden rounded-2xl no-underline group"
                    style={{ aspectRatio: "1.33 / 1" }}
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }}
                    />
                    <div className="absolute bottom-0 left-0 p-3 w-full text-left">
                      <h4 className="text-[12px] font-bold leading-tight mb-0.5 truncate" style={{ color: "#FFFFFF" }}>
                        {card.name}
                      </h4>
                      <p className="text-[10px] opacity-80 truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
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
                <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#C9A84C] block mb-0.5">🌿 Vibe Check</span>
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
                  <span className="text-[9px] font-bold uppercase tracking-[1px] text-emerald-600 block mb-0.5">👍 Pros</span>
                  <p className="font-light text-[#555]">{vibeCheckCard.pros}</p>
                </div>
                <div className="p-3 rounded-xl bg-white" style={{ border: "1px solid #E5E0D8" }}>
                  <span className="text-[9px] font-bold uppercase tracking-[1px] text-rose-500 block mb-0.5">👎 Cons</span>
                  <p className="font-light text-[#555]">{vibeCheckCard.cons}</p>
                </div>
              </div>

              {/* Who loves it */}
              <div className="p-3 rounded-xl bg-white" style={{ border: "1px solid #E5E0D8" }}>
                <span className="text-[9px] font-bold uppercase tracking-[1px] text-[#C9A84C] block mb-0.5">👥 Who Lives Here</span>
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
