"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyCard } from "@/types/property";
import { useSaved } from "@/contexts/SavedContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg,#254D3E,#1C3A2F)",
  "linear-gradient(135deg,#8B6914,#C9A84C)",
  "linear-gradient(135deg,#1A1A1A,#2E6150)",
  "linear-gradient(135deg,#2E6150,#7A5C12)",
  "linear-gradient(135deg,#1C3A2F,#111)",
  "linear-gradient(135deg,#C9A84C,#1C3A2F)",
];

interface SmartPropertyCardProps {
  property: PropertyCard;
  score: number;
  matchReasons: string[];
  index: number;
  onHover?: (hovered: boolean) => void;
  isHighlighted?: boolean;
}

export default function SmartPropertyCard({
  property,
  score,
  matchReasons,
  index,
  onHover,
  isHighlighted = false,
}: SmartPropertyCardProps) {
  const router = useRouter();
  const { isSaved, toggle } = useSaved();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const saved = isSaved(property.id);
  const [liked, setLiked] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const mainPrice = formatPrice(Number(property.priceTHB));
  const priceLabel = property.listingType === "sale" ? "" : (property.priceLabel ?? "");
  const fallbackGradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const href = `/property/${property.slug}`;
  const [commutes, setCommutes] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nhp_commute_hubs");
      if (stored && property.latitude && property.longitude) {
        const hubs = JSON.parse(stored);
        const pLat = Number(property.latitude);
        const pLng = Number(property.longitude);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          const list = hubs.map((h: any) => {
            const hLat = Number(h.latitude);
            const hLng = Number(h.longitude);
            const R = 6371;
            const dLat = ((hLat - pLat) * Math.PI) / 180;
            const dLon = ((hLng - pLng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((pLat * Math.PI) / 180) *
                Math.cos((hLat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;

            let mins = 15;
            if (h.transitMode === "walking") {
              mins = Math.round(dist * 12);
            } else if (h.transitMode === "driving") {
              mins = Math.round(dist * 3 + 5);
            } else {
              mins = Math.round(dist * 2.5 + 8);
            }
            return {
              name: h.name,
              minutes: Math.max(1, mins),
              distance: dist,
              transitMode: h.transitMode,
            };
          });
          setCommutes(list);
        }
      }
    } catch {}
  }, [property]);

  // Get BTS / MRT walk info
  const transitText = (() => {
    if (property.btsStation && property.btsWalkMin) {
      return `🚇 ${property.btsWalkMin} min walk to BTS ${property.btsStation}`;
    }
    if (property.mrtStation && property.mrtWalkMin) {
      return `🚇 ${property.mrtWalkMin} min walk to MRT ${property.mrtStation}`;
    }
    if (property.nearBts) {
      return "🚇 Near BTS Station";
    }
    return null;
  })();

  const badgeStyle = (type: string) => {
    if (type === "sale") return { background: "#1C3A2F", color: "#E2C97E" };
    if (type === "rent") return { background: "#C9A84C", color: "#1C3A2F" };
    return { background: "#FFFFFF", color: "#1C3A2F", border: "1px solid #E5E0D8" };
  };

  const badgeLabel = (type: string) => {
    if (type === "sale") return t.property.forSale;
    if (type === "rent") return t.property.longRent;
    return t.property.shortStay;
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`View ${property.name}`}
      onClick={() => router.push(href)}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      onMouseEnter={() => onHover && onHover(true)}
      onMouseLeave={() => onHover && onHover(false)}
      className={`rounded-2xl overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 ${
        isHighlighted ? "scale-[1.02] ring-2 ring-[#C9A84C] shadow-xl" : "hover:scale-[1.01] hover:shadow-lg"
      }`}
      style={{
        background: "#FFFFFF",
        border: isHighlighted ? "1px solid transparent" : "1px solid #E5E0D8",
        boxShadow: isHighlighted ? "0 12px 36px rgba(201,168,76,0.2)" : "none",
      }}
    >
      {/* Upper Media Section */}
      <div className="relative h-[180px] sm:h-[135px] overflow-hidden flex-shrink-0">
        {property.coverImage && !imgErr ? (
          <img
            src={property.coverImage}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: fallbackGradient }}>
            <span className="text-[36px] font-black select-none opacity-10 text-white">NHP</span>
          </div>
        )}

        {/* Match Score Badge (Gold Premium Styling) */}
        <div
          className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 z-10"
          style={{
            background: "linear-gradient(135deg, #F5D061 0%, #C9A84C 100%)",
            color: "#1C3A2F",
          }}
        >
          ✨ {score}% Match
        </div>

        {/* Listing Type Badge */}
        <span
          className="absolute top-2 right-10 px-2 py-[2.5px] rounded-full text-[8.5px] font-bold uppercase tracking-[0.5px]"
          style={badgeStyle(property.listingType)}
        >
          {badgeLabel(property.listingType)}
        </span>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(property.id);
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs cursor-pointer border-none transition-transform active:scale-95 shadow-md"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)" }}
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? "💚" : "🤍"}
        </button>

        {property.featured && (
          <span
            className="absolute bottom-2 left-2 px-2 py-[2px] rounded-full text-[8.5px] font-semibold uppercase tracking-[0.8px]"
            style={{ background: "#1C3A2F", color: "#E2C97E" }}
          >
            {t.property.featured}
          </span>
        )}

        {property.hasVideo && (
          <span
            className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-[2px] rounded-full text-[9px] font-medium"
            style={{ background: "rgba(0,0,0,0.55)", color: "#FFFFFF", backdropFilter: "blur(4px)" }}
          >
            ▶ Tour
          </span>
        )}
      </div>

      {/* Body Details */}
      <div className="p-3.5 flex flex-col flex-1">
        <div className="flex items-baseline justify-between mb-0.5">
          <div className="text-[17px] font-extrabold" style={{ color: "#1C3A2F", letterSpacing: "-0.5px" }}>
            {mainPrice}
            {priceLabel && <span className="text-[10px] font-normal ml-1 text-gray-500">{priceLabel}</span>}
          </div>
        </div>

        <div className="text-[13px] font-bold mb-0.5 leading-tight line-clamp-1 text-gray-900">
          {property.name}
        </div>

        <div className="text-[10px] text-gray-400 mb-1.5 flex items-center gap-1">
          📍 {property.district ? `${property.district}, ` : ""}{property.area}
        </div>

        {/* Commute Times */}
        {commutes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {commutes.map((c: any) => (
              <span
                key={c.name}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5"
                style={{ background: "#F4EFE6", color: "#1C3A2F", border: "1px solid #E5DCCB" }}
                title={`${c.distance.toFixed(1)} km away`}
              >
                {c.transitMode === "walking" ? "🚶" : c.transitMode === "driving" ? "🚗" : "🚆"}{" "}
                {c.minutes}m to {c.name}
              </span>
            ))}
          </div>
        )}

        {transitText && (
          <div className="text-[10px] text-emerald-700 font-semibold mb-2 flex items-center gap-1">
            {transitText}
          </div>
        )}

        {/* Specs Row */}
        <div
          className="flex gap-3 py-1.5 mb-2.5"
          style={{ borderTop: "1px solid #EDE8DF", borderBottom: "1px solid #EDE8DF" }}
        >
          <span className="text-[10px] flex items-center gap-1 text-gray-600">
            🛏️ {property.bedrooms === 0 ? t.property.studio : `${property.bedrooms} ${t.property.beds}`}
          </span>
          <span className="text-[10px] flex items-center gap-1 text-gray-600">
            🚿 {property.bathrooms} {t.property.bath}
          </span>
          {property.sqm && (
            <span className="text-[10px] flex items-center gap-1 text-gray-600">
              📐 {property.sqm} m²
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[11.5px] leading-[1.4] text-gray-500 font-light line-clamp-1 mb-2.5">
          {property.description}
        </p>

        {/* Match Explanation Section (concierge styling) */}
        {matchReasons.length > 0 && (
          <div
            className="mb-2.5 p-2 rounded-xl flex flex-col gap-1"
            style={{ background: "#F4EFE6", border: "1px solid #EADFCF" }}
          >
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#1C3A2F] mb-0.5">
              Why we matched this home
            </div>
            {matchReasons.slice(0, 2).map((reason, rIdx) => (
              <div key={rIdx} className="text-[10px] text-[#1C3A2F] flex items-start gap-1 font-medium leading-tight">
                <span className="text-emerald-700 font-extrabold">✓</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: "1px dashed #E5E0D8" }}>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!liked) {
                setLiked(true);
                try {
                  await fetch(`/api/properties/${property.id}/track`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "like" }),
                  });
                } catch (err) {
                  console.error("Failed to persist property like:", err);
                }
              }
            }}
            className="flex items-center gap-1.5 text-[11px] font-semibold bg-transparent border-none p-0 cursor-pointer transition-colors"
            style={{ color: liked ? "#10B981" : "#bbb", fontFamily: "inherit" }}
            aria-label="Like publicly"
          >
            💚 {property.likes + (liked ? 1 : 0)}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${href}?enquiry=true`);
            }}
            className="px-3.5 py-1.5 rounded-xl text-[10.5px] font-bold cursor-pointer border-none transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
          >
            {t.property.interested}
          </button>
        </div>
      </div>
    </div>
  );
}
