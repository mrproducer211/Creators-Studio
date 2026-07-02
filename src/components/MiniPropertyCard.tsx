"use client";

import { useSaved } from "@/contexts/SavedContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PropertyCard } from "@/types/property";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MiniPropertyCard({ property }: { property: PropertyCard }) {
  const router = useRouter();
  const { isSaved, toggle } = useSaved();
  const { formatPrice } = useCurrency();
  const saved = isSaved(property.id);

  const priceFormatted = formatPrice(Number(property.priceTHB));
  const specsLabel = `${property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bed`} · ${property.sqm} sqm · ${property.area}`;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(property.id);
  };

  const handleCardClick = () => {
    router.push(`/property/${property.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative w-full h-full flex flex-col justify-end p-4 cursor-pointer select-none group"
    >
      {/* Floating listing details card */}
      <div
        className="bg-white rounded-xl border p-2.5 mb-[-32px] sm:mb-3 shadow-md z-10 w-[calc(100%-24px)] sm:w-full mx-auto sm:mx-0 sm:max-w-[175px] sm:self-end relative hover:scale-[1.02] transition-transform duration-200"
        style={{ borderColor: "#E5E0D8", transform: "translateY(-4px)" }}
      >
        {/* Live Heart icon */}
        <button
          onClick={handleHeartClick}
          className="absolute top-2.5 right-2.5 border-none bg-transparent cursor-pointer text-[12px] p-0 flex items-center justify-center transition-transform active:scale-95"
          aria-label={saved ? "Remove from saved" : "Save property"}
        >
          {saved ? (
            <span style={{ color: "#10B981" }}>💚</span>
          ) : (
            <span style={{ color: "#9CA3AF" }}>🖤</span>
          )}
        </button>
        
        <h4 className="text-[11px] sm:text-[10px] font-bold leading-tight pr-4 truncate" style={{ color: "#1C3A2F" }}>
          {property.name}
        </h4>
        <p className="text-[8.5px] sm:text-[7.5px] text-gray-500 leading-none mt-0.5 truncate">
          {specsLabel}
        </p>
        <div className="text-[11px] sm:text-[10px] font-bold mt-1" style={{ color: "#C9A84C" }}>
          {priceFormatted}
        </div>
      </div>

      {/* Interior Image */}
      <div className="relative w-full h-[120px] sm:h-[105px] rounded-lg overflow-hidden border transition-all duration-300 group-hover:shadow" style={{ borderColor: "#E5E0D8" }}>
        {property.coverImage ? (
          <Image
            src={property.coverImage}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#254D3E,#1C3A2F)" }}>
            <span className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.08)" }}>NHP</span>
          </div>
        )}
      </div>
    </div>
  );
}
