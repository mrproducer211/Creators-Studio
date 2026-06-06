"use client";

import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { useLanguage } from "@/contexts/LanguageContext";

// Dimensions — big card + 2×2 grid heights must match
const BIG_W   = 260;  // px — anchor card width
const CARD_W  = 278;  // px — each small landscape card width
const CARD_H  = 210;  // px — each small card height (landscape: 278×210)
const GAP     = 10;   // px — gap between all cards
const BIG_H   = CARD_H * 2 + GAP; // 430px — anchor card height exactly equals 2×grid rows

export default function CategorySection() {
  const { t } = useLanguage();

  const SECTIONS = [
    {
      anchor: {
        slug:  "near-bts",
        label: t.category.lookingIn,
        name:  t.category.nearBts,
        image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=900&auto=format&q=85",
        href:  "/explore",
      },
      cards: [
        { slug: "sukhumvit", name: t.category.areas.sukhumvit, count: MOCK_PROPERTIES.filter(p => p.area === "Sukhumvit").length + 18, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&q=80", href: "/explore" },
        { slug: "sathorn",   name: t.category.areas.sathorn,   count: MOCK_PROPERTIES.filter(p => p.area === "Sathorn").length + 14,   image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&q=80", href: "/explore" },
        { slug: "thong-lo",  name: t.category.areas.thongLo,    count: MOCK_PROPERTIES.filter(p => p.area === "Thong Lo").length + 12,  image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&q=80", href: "/explore" },
        { slug: "asok",      name: t.category.areas.asok,       count: MOCK_PROPERTIES.filter(p => p.area === "Asok").length + 9,       image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&auto=format&q=80", href: "/explore" },
      ],
    },
    {
      anchor: {
        slug:  "pet-friendly",
        label: t.category.lookingIn,
        name:  t.category.petFriendly,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&q=85",
        href:  "/explore",
      },
      cards: [
        { slug: "ekkamai",  name: t.category.areas.ekkamai, count: MOCK_PROPERTIES.filter(p => p.area === "Ekkamai").length + 11, image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&auto=format&q=80", href: "/explore" },
        { slug: "silom",    name: t.category.areas.silom,   count: 16, image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&auto=format&q=80", href: "/explore" },
        { slug: "on-nut",   name: t.category.areas.onNut,   count: MOCK_PROPERTIES.filter(p => p.area === "On Nut").length + 9,   image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&q=80", href: "/explore" },
        { slug: "ari",      name: t.category.areas.ari,     count: 13, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&q=80", href: "/explore" },
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
                    {/* gradient overlay — bg-gradient-to-t from-black/70 via-black/20 to-transparent */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)" }}
                    />
                    {/* text — bottom-left */}
                    <div className="absolute bottom-0 left-0 p-4">
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
        <div className="flex" style={{ gap: 12 }}>
          {SECTIONS.map((section) => (
            <div
              key={section.anchor.slug}
              className="flex items-stretch flex-shrink-0"
              style={{ width: "calc(100vw - 54px)", gap: 8 }}
            >
              {/* Tall anchor card — fixed 95px, stretches to match grid height */}
              <a
                href={section.anchor.href}
                className="relative overflow-hidden rounded-xl no-underline flex-shrink-0"
                style={{ width: 95 }}
              >
                <img
                  src={section.anchor.image}
                  alt={section.anchor.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 pb-3 px-2 flex flex-col items-center text-center">
                  <p className="text-[9px] font-light mb-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {section.anchor.label}
                  </p>
                  <h3 className="text-[12px] font-bold leading-tight" style={{ color: "#FFFFFF" }}>
                    {section.anchor.name}
                  </h3>
                </div>
              </a>

              {/* 2×2 landscape grid — flex-1 fills remaining section width */}
              <div
                className="flex-1 grid grid-cols-2"
                style={{ gap: 8 }}
              >
                {section.cards.map((card) => (
                  <a
                    key={card.slug}
                    href={card.href}
                    className="relative overflow-hidden rounded-xl no-underline"
                    style={{ aspectRatio: "3 / 2" }}
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.08) 60%, transparent 100%)" }}
                    />
                    <div className="absolute bottom-0 left-0 p-2">
                      <h4 className="text-[11px] font-semibold leading-tight truncate" style={{ color: "#FFFFFF" }}>
                        {card.name}
                      </h4>
                      <p className="text-[9px] opacity-70" style={{ color: "#FFFFFF" }}>
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
    </section>
  );
}
