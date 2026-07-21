"use client";

import { useState } from "react";
import Image from "next/image";
import { useSaved } from "@/contexts/SavedContext";
import { stripEmojis } from "@/lib/emoji";
import { useLanguage } from "@/contexts/LanguageContext";
import { PropertyCard } from "@/types/property";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Heart,
  MapPin,
  Bed,
  Maximize2
} from "lucide-react";

import { generatePropertyAltTag } from "@/lib/seoEnricher";

function badgeStyle(t: string) {
  if (t === "sale") return { background: "#1C3A2F", color: "#E2C97E" };
  if (t === "rent") return { background: "#C9A84C", color: "#1C3A2F" };
  return { background: "rgba(255,255,255,0.9)", color: "#1C3A2F" };
}

function MagCard({
  property,
  large = false,
  allProperties = [],
}: {
  property: PropertyCard;
  large?: boolean;
  allProperties?: PropertyCard[];
}) {
  const { isSaved, toggle } = useSaved();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const saved = isSaved(property.id);
  const [imgErr, setImgErr] = useState(false);

  const getBadgeLabel = (type: string) => {
    if (type === "sale") return t.property.forSale;
    if (type === "rent") return t.property.longRent;
    return t.property.shortStay;
  };

  const baseSlug = property.slug.replace(/-(?:sale|rent|short_stay)$/, "");
  const siblings = allProperties.filter((p) => {
    const pBase = p.slug.replace(/-(?:sale|rent|short_stay)$/, "");
    return pBase === baseSlug;
  });
  const typesToShow = siblings.length > 0
    ? Array.from(new Set(siblings.map((s) => s.listingType)))
    : [property.listingType];

  return (
    <a
      href={`/property/${property.slug}`}
      className="relative overflow-hidden rounded-2xl block no-underline group w-full h-full"
    >
      {property.coverImage && !imgErr ? (
        <Image
          src={property.coverImage}
          alt={generatePropertyAltTag(property)}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          quality={65}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#254D3E,#1C3A2F)" }} />
      )}

      {/* Gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, transparent 35%, rgba(0,0,0,0.72) 100%)" }}
      />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none z-10">
        {typesToShow.map((type) => (
          <span
            key={type}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.5px]"
            style={badgeStyle(type)}
          >
            {getBadgeLabel(type)}
          </span>
        ))}

        {property.featured && (
          <span
            className="px-2.5 py-1 rounded-full text-[9px] font-semibold uppercase tracking-[0.8px]"
            style={{ background: "#C9A84C", color: "#1C3A2F" }}
          >
            {t.property.featured}
          </span>
        )}
      </div>

      {/* Save */}
      <button
        onClick={(e) => { e.preventDefault(); toggle(property.id); }}
        suppressHydrationWarning
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer border-none"
        style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}
      >
        <Heart className={`w-4 h-4 ${saved ? "fill-emerald-500 text-emerald-500" : "text-white"}`} />
      </button>

      {/* Bottom info — overflow-hidden prevents text escaping the card */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ padding: large ? "14px 14px 14px" : "10px 10px 10px" }}>
        {/* Price — single line, truncated */}
        <div
          className={`font-bold leading-none mb-1 truncate ${large ? "text-[20px] md:text-[22px]" : "text-[14px] md:text-[17px]"}`}
          style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}
        >
          {formatPrice(Number(property.priceTHB))}
          {property.listingType === "sale" ? "" : (property.priceLabel ?? "")}
        </div>
        {/* Name — single line, truncated */}
        <div
          className={`font-semibold leading-tight truncate ${large ? "text-[13px] md:text-[14px] mb-1.5" : "text-[11px] md:text-[12px] mb-0"}`}
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          {stripEmojis(property.name)}
        </div>
        {/* Specs — hidden on small mobile cards to prevent crowding */}
        <div className={`items-center gap-2 flex-wrap ${large ? "flex" : "hidden md:flex"}`}>
          <span className="text-[10px] truncate flex items-center gap-0.5" style={{ color: "rgba(255,255,255,0.6)" }}><MapPin className="w-3 h-3" /> {stripEmojis(property.area)}</span>
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Bed className="w-3.5 h-3.5" /> {property.bedrooms === 0 ? t.property.studio : `${property.bedrooms} ${t.property.beds}`}
          </span>
          {property.sqm && (
            <span className="text-[10px] flex items-center gap-0.5" style={{ color: "rgba(255,255,255,0.5)" }}><Maximize2 className="w-3.5 h-3.5" /> {property.sqm}m²</span>
          )}
        </div>
      </div>
    </a>
  );
}

export default function LatestProperties({
  properties,
  allProperties = [],
}: {
  properties?: PropertyCard[];
  allProperties?: PropertyCard[];
}) {
  const { t } = useLanguage();

  const displayProperties = properties ?? [];
  if (displayProperties.length === 0) {
    return (
      <section className="py-12 px-4 md:px-6 text-center animate-fade-in" style={{ background: "#F7F3EC" }}>
        <div className="max-w-md mx-auto py-8">
          <h2 className="text-[20px] font-bold leading-[1.3] mb-1.5" style={{ color: "#1C3A2F" }}>
            {t.latest.title}
          </h2>
          <p className="text-[14px] text-gray-500 font-light">No properties listed yet.</p>
        </div>
      </section>
    );
  }

  const [hero, ...rest] = displayProperties;
  const side   = rest.slice(0, 2);
  const bottom = rest.slice(2, 4);

  return (
    <section className="py-8 px-4 md:px-6" style={{ background: "#F7F3EC" }}>
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5" style={{ color: "#C9A84C" }}>
            {t.latest.label}
          </div>
          <h2 className="text-[20px] font-bold leading-[1.3]" style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}>
            {t.latest.title}
          </h2>
        </div>
        <a
          href="/explore"
          className="text-[12px] font-medium no-underline pb-px"
          style={{ color: "#1C3A2F", borderBottom: "1px solid #1C3A2F" }}
        >
          {t.latest.seeAll}
        </a>
      </div>

      {/* ── Desktop magazine grid (md+) ── */}
      <div className="hidden md:block">
        {/* Top row: hero (2/3) + two stacked (1/3) */}
        <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <div style={{ height: 400 }}>
            <MagCard property={hero} large allProperties={allProperties} />
          </div>
          <div className="flex flex-col gap-3">
            {side.map((p) => (
              <div key={p.id} style={{ height: 193 }}>
                <MagCard property={p} allProperties={allProperties} />
              </div>
            ))}
          </div>
        </div>
        {/* Bottom row: 2 equal */}
        <div className="grid grid-cols-2 gap-3">
          {bottom.map((p) => (
            <div key={p.id} style={{ height: 210 }}>
              <MagCard property={p} allProperties={allProperties} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile: magazine grid matching desktop hierarchy ── */}
      <div className="md:hidden flex flex-col gap-2.5">
        {/* Row 1: hero card — full width, tall */}
        <div style={{ height: 240 }}>
          <MagCard property={hero} large allProperties={allProperties} />
        </div>

        {/* Row 2: two side cards — landscape */}
        <div className="grid grid-cols-2 gap-2.5">
          {side.map((p) => (
            <div key={p.id} style={{ height: 155 }}>
              <MagCard property={p} allProperties={allProperties} />
            </div>
          ))}
        </div>

        {/* Row 3: two bottom cards — landscape */}
        <div className="grid grid-cols-2 gap-2.5">
          {bottom.map((p) => (
            <div key={p.id} style={{ height: 155 }}>
              <MagCard property={p} allProperties={allProperties} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
