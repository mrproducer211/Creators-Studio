"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSaved } from "@/contexts/SavedContext";
import { PropertyCard as PropertyType } from "@/types/property";

const FILTERS = ["All", "For Sale", "Long Rent", "Short Stay", "Condo", "House", "Sukhumvit", "Silom", "Sathorn"];

function badgeStyle(t: string) {
  if (t === "sale") return { background: "#1C3A2F", color: "#E2C97E" };
  if (t === "rent") return { background: "#C9A84C", color: "#1C3A2F" };
  return                   { background: "#FFFFFF", color: "#1C3A2F" };
}

const badgeLabel = (type: string) => {
  if (type === "sale") return "For Sale";
  if (type === "rent") return "Long Rent";
  return "Short Stay";
};

function PropertyCard({ property }: { property: PropertyType }) {
  const { data: session } = useSession();
  const { isSaved, toggle } = useSaved();
  const [liked, setLiked] = useState(false);

  const saved = isSaved(property.id);

  const gradientsList = [
    "linear-gradient(135deg, #254D3E, #1C3A2F)",
    "linear-gradient(135deg, #8B6914, #C9A84C)",
    "linear-gradient(135deg, #1A1A1A, #2E6150)",
  ];
  const cardGradient = gradientsList[property.id % gradientsList.length];

  const thb = Number(property.priceTHB).toLocaleString("th-TH");
  const priceMain = `฿${thb}`;
  const priceSub = property.listingType === "sale"
    ? (property.priceUSD ? `$${Number(property.priceUSD).toLocaleString("en")}` : "")
    : (property.priceLabel ?? "");

  const bedsLabel = property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bed`;
  const bathsLabel = `${property.bathrooms} Bath`;
  const sqmLabel = property.sqm ? `${property.sqm} m²` : "";

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow duration-150"
      style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
    >
      {/* Image placeholder */}
      <div className="w-full h-[200px] relative overflow-hidden">
        {property.coverImage ? (
          <img
            src={property.coverImage}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: cardGradient }}
          >
            <span
              className="text-[64px] font-bold select-none"
              style={{ color: "rgba(255,255,255,0.07)", letterSpacing: "-4px" }}
            >
              NHP
            </span>
          </div>
        )}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.5px]"
          style={badgeStyle(property.listingType)}
        >
          {badgeLabel(property.listingType)}
        </span>
        <button
          onClick={() => {
            if (!session) {
              window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
              return;
            }
            toggle(property.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[15px] cursor-pointer border-none transition-colors z-10"
          style={{ background: "rgba(255,255,255,0.9)" }}
        >
          {saved ? "❤️" : "🤍"}
        </button>
        {property.hasVideo && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1 rounded-2xl px-2.5 py-1 text-[11px] font-medium"
            style={{ background: "rgba(255,255,255,0.9)", color: "#1C3A2F" }}
          >
            ▶ Tour
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div
          className="text-[22px] font-bold mb-0.5"
          style={{ color: "#1C3A2F", letterSpacing: "-0.5px" }}
        >
          {priceMain}
          <span className="text-[13px] font-normal ml-1" style={{ color: "#999" }}>
            {priceSub}
          </span>
        </div>
        <a
          href={`/property/${property.slug}`}
          className="text-[15px] font-semibold mb-1 block no-underline hover:underline"
          style={{ color: "#1A1A1A" }}
        >
          {property.name}
        </a>
        <div className="text-xs mb-2.5 flex items-center gap-1" style={{ color: "#999" }}>
          📍 {property.district ? `${property.district}, ` : ""}{property.area}
        </div>

        <div
          className="flex gap-3.5 py-2.5 mb-3.5"
          style={{
            borderTop: "1px solid #EDE8DF",
            borderBottom: "1px solid #EDE8DF",
          }}
        >
          <span className="text-xs flex items-center gap-1" style={{ color: "#555" }}>
            🛏 {bedsLabel}
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: "#555" }}>
            🚿 {bathsLabel}
          </span>
          {sqmLabel && (
            <span className="text-xs flex items-center gap-1" style={{ color: "#555" }}>
              📐 {sqmLabel}
            </span>
          )}
        </div>

        <p
          className="text-[13px] leading-[1.6] font-light mb-3.5 overflow-hidden"
          style={{
            color: "#555",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as const,
          }}
        >
          {property.description}
        </p>

        <div className="flex items-center gap-3.5">
          <button
            onClick={async () => {
              if (!session) {
                window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                return;
              }
              if (!liked) {
                setLiked(true);
                try {
                  await fetch(`/api/properties/${property.id}/track`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "like" }),
                  });
                } catch (err) {
                  console.error("Failed to persist feed property like:", err);
                }
              }
            }}
            className="flex items-center gap-1.5 text-xs font-medium cursor-pointer bg-none border-none transition-colors duration-150 p-0"
            style={{ color: liked ? "#E05252" : "#999", fontFamily: "inherit" }}
          >
            ❤️ {property.likes + (liked ? 1 : 0)}
          </button>
          <button
            className="flex items-center gap-1.5 text-xs font-medium cursor-pointer bg-none border-none p-0"
            style={{ color: "#999", fontFamily: "inherit" }}
          >
            💬 8
          </button>
          <button
            onClick={() => {
              if (!session) {
                window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                return;
              }
              toggle(property.id);
            }}
            className="flex items-center gap-1.5 text-xs font-medium cursor-pointer bg-none border-none p-0"
            style={{ color: saved ? "#C9A84C" : "#999", fontFamily: "inherit" }}
          >
            🔖 {saved ? "Saved" : "Save"}
          </button>
          <a
            href={`/property/${property.slug}`}
            className="ml-auto px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer border-none transition-colors duration-150 no-underline"
            style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
          >
            I&apos;m Interested
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FeedPreview({ properties }: { properties?: PropertyType[] }) {
  const [activeFilter, setActiveFilter] = useState(0);

  const displayProperties = properties && properties.length > 0 ? properties : [];

  const filteredProperties = displayProperties.filter((p) => {
    const filter = FILTERS[activeFilter];
    if (filter === "All") return true;
    if (filter === "For Sale") return p.listingType === "sale";
    if (filter === "Long Rent") return p.listingType === "rent";
    if (filter === "Short Stay") return p.listingType === "short_stay";
    if (filter === "Condo") return p.propertyType === "condo";
    if (filter === "House") return p.propertyType === "house" || p.propertyType === "villa" || p.propertyType === "townhouse";
    if (filter === "Sukhumvit") return p.area === "Sukhumvit";
    if (filter === "Silom") return p.area === "Silom";
    if (filter === "Sathorn") return p.area === "Sathorn";
    return true;
  }).slice(0, 3);

  return (
    <section className="px-4 pt-8 pb-2" style={{ background: "#F7F3EC" }}>
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div
            className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5"
            style={{ color: "#C9A84C" }}
          >
            Explore
          </div>
          <div
            className="text-[20px] font-bold leading-[1.3]"
            style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}
          >
            Latest Properties
          </div>
        </div>
        <a
          href="/explore"
          className="text-xs font-medium no-underline pb-px"
          style={{ color: "#1C3A2F", borderBottom: "1px solid #1C3A2F" }}
        >
          See all
        </a>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-5">
        {FILTERS.map((f, i) => (
          <button
            key={f}
            onClick={() => setActiveFilter(i)}
            className="flex-shrink-0 px-3.5 py-[7px] rounded-full text-xs font-medium cursor-pointer transition-all duration-150 border-[1.5px] whitespace-nowrap"
            style={
              activeFilter === i
                ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F" }
                : { background: "transparent", color: "#555", borderColor: "#E5E0D8" }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filteredProperties.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border-2 border-dashed border-[#E5E0D8] bg-white mb-6">
          <span className="text-3xl">🏠</span>
          <p className="text-sm font-medium mt-2" style={{ color: "#1C3A2F" }}>No properties found</p>
          <p className="text-xs font-light text-[#999] mt-0.5">Try choosing another filter category</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </section>
  );
}
