"use client";
/* eslint-disable react-hooks/set-state-in-effect */

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

interface HubData {
  name: string;
  latitude: number | string;
  longitude: number | string;
  transitMode: string;
}

interface CommuteData {
  name: string;
  minutes: number;
  distance: number;
  transitMode: string;
}

function badgeStyle(t: string) {
  if (t === "sale") return { background: "#1C3A2F", color: "#E2C97E" };
  if (t === "rent") return { background: "#C9A84C", color: "#1C3A2F" };
  return                   { background: "#FFFFFF", color: "#1C3A2F" };
}

export default function ExplorePropertyCard({ property, index }: { property: PropertyCard; index: number }) {
  const router                  = useRouter();
  const { isSaved, toggle }     = useSaved();
  const { t }                   = useLanguage();
  const formatPrice           = useCurrency().formatPrice;
  const saved                   = isSaved(property.id);
  const [liked, setLiked]       = useState(false);
  const [imgErr, setImgErr]     = useState(false);
  const main                    = formatPrice(Number(property.priceTHB));
  const sub                     = property.listingType === "sale" ? "" : (property.priceLabel ?? "");
  const fallback                = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const href                    = `/property/${property.slug}`;
  const [commutes, setCommutes] = useState<CommuteData[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nhp_commute_hubs");
      if (stored && property.latitude && property.longitude) {
        const hubs = JSON.parse(stored);
        const pLat = Number(property.latitude);
        const pLng = Number(property.longitude);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          const list = hubs.map((h: HubData) => {
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

  const badgeLabel = (type: string) => {
    if (type === "sale") return t.property.forSale;
    if (type === "rent") return t.property.longRent;
    return t.property.shortStay;
  };

  return (
    // Entire card is clickable — navigate on click anywhere on the card
    <div
      role="link"
      tabIndex={0}
      aria-label={`View ${property.name}`}
      onClick={() => router.push(href)}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      className="rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
      style={{ background: "#FFFFFF", border: "1px solid #E5E0D8", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 36px rgba(28,58,47,0.12)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "none";
      }}
    >
      {/* Image */}
      <div className="relative h-[190px] overflow-hidden flex-shrink-0">
        {property.coverImage && !imgErr ? (
          <img
            src={property.coverImage}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: fallback }}>
            <span className="text-[48px] font-black select-none" style={{ color: "rgba(255,255,255,0.07)", letterSpacing: "-3px" }}>NHP</span>
          </div>
        )}

        {/* Badges */}
        <span className="absolute top-3 left-3 px-2.5 py-[3px] rounded-full text-[10px] font-semibold uppercase tracking-[0.5px]" style={badgeStyle(property.listingType)}>
          {badgeLabel(property.listingType)}
        </span>
        {property.featured && (
          <span className="absolute bottom-3 left-3 px-2.5 py-[3px] rounded-full text-[9px] font-semibold uppercase tracking-[0.8px]" style={{ background: "#C9A84C", color: "#1C3A2F" }}>
            {t.property.featured}
          </span>
        )}
        {property.hasVideo && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10px] font-medium" style={{ background: "rgba(0,0,0,0.55)", color: "#FFFFFF", backdropFilter: "blur(4px)" }}>
            ▶ Tour
          </span>
        )}

        {/* Save — stop propagation so card click doesn't fire */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(property.id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer border-none transition-all duration-200 ${
            saved ? "animate-pop-bounce scale-110" : "hover:scale-110 active:scale-90"
          }`}
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)" }}
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? "💚" : "🤍"}
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[19px] font-bold mb-0.5 leading-tight" style={{ color: "#1C3A2F", letterSpacing: "-0.5px" }}>
          {main}
          {sub && <span className="text-[11px] font-normal ml-1.5" style={{ color: "#999" }}>{sub}</span>}
        </div>
        <div className="text-[13px] font-semibold mb-1 leading-tight line-clamp-1" style={{ color: "#1A1A1A" }}>
          {property.name}
        </div>
        <div className="text-[11px] mb-2.5 flex items-center gap-1" style={{ color: "#999" }}>
          📍 {property.district ? `${property.district}, ` : ""}{property.area}
        </div>

        {/* Commute Times */}
        {commutes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {commutes.map((c: CommuteData) => (
              <span
                key={c.name}
                className="text-[9.5px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                style={{ background: "#F4EFE6", color: "#1C3A2F", border: "1px solid #E5DCCB" }}
                title={`${c.distance.toFixed(1)} km away`}
              >
                {c.transitMode === "walking" ? "🚶" : c.transitMode === "driving" ? "🚗" : "🚆"}{" "}
                {c.minutes}m to {c.name}
              </span>
            ))}
          </div>
        )}

        {/* Specs */}
        <div className="flex gap-3 py-2 mb-3" style={{ borderTop: "1px solid #EDE8DF", borderBottom: "1px solid #EDE8DF" }}>
          <span className="text-[11px] flex items-center gap-1" style={{ color: "#555" }}>
            🛏 {property.bedrooms === 0 ? t.property.studio : `${property.bedrooms} ${t.property.beds}`}
          </span>
          <span className="text-[11px] flex items-center gap-1" style={{ color: "#555" }}>
            🚿 {property.bathrooms} {t.property.bath}
          </span>
          {property.sqm && (
            <span className="text-[11px] flex items-center gap-1" style={{ color: "#555" }}>
              📐 {property.sqm}m²
            </span>
          )}
        </div>

        <p className="text-[12px] leading-[1.55] font-light line-clamp-2 mb-3" style={{ color: "#777" }}>
          {property.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-1">
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
            className="flex items-center gap-1 text-[11px] font-medium cursor-pointer bg-transparent border-none p-0 transition-colors"
            style={{ color: liked ? "#10B981" : "#bbb", fontFamily: "inherit" }}
            aria-label="Like"
          >
            💚 {property.likes + (liked ? 1 : 0)}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${href}?enquiry=true`);
            }}
            className="ml-auto px-3.5 py-2 rounded-lg text-[11px] font-semibold cursor-pointer border-none transition-opacity hover:opacity-80"
            style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
          >
            {t.property.interested}
          </button>
        </div>
      </div>
    </div>
  );
}
