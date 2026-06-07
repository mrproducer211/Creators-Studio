"use client";

import { PropertyCard } from "@/types/property";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Props {
  saved: PropertyCard[];
  onClose: () => void;
  onRemove: (id: number) => void;
}

export default function SavedPanel({ saved, onClose, onRemove }: Props) {
  const { formatPrice: formatPriceFn } = useCurrency();
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
      <div
        className="relative w-full rounded-t-3xl overflow-hidden"
        style={{ background: "#F7F3EC", maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: "#E5E0D8" }} />
        </div>

        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[18px] font-bold" style={{ color: "#1C3A2F" }}>Saved Properties</h2>
              <p className="text-[12px]" style={{ color: "#999" }}>{saved.length} saved</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none text-lg"
              style={{ background: "#EDE8DF", color: "#555", fontFamily: "inherit" }}
            >
              ✕
            </button>
          </div>

          {saved.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🤍</div>
              <p className="text-[14px] font-medium mb-1" style={{ color: "#1C3A2F" }}>No saved properties yet</p>
              <p className="text-[12px] font-light" style={{ color: "#999" }}>Swipe right or tap ♥ to save</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex flex-col gap-3" style={{ maxHeight: "55vh" }}>
              {saved.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl p-3"
                  style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
                >
                  {/* Mini image */}
                  <div
                    className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{
                      background: p.id % 2 === 0
                        ? "linear-gradient(135deg,#254D3E,#1C3A2F)"
                        : "linear-gradient(135deg,#8B6914,#C9A84C)",
                      color: "rgba(255,255,255,0.2)",
                    }}
                  >
                    NHP
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: "#1A1A1A" }}>{p.name}</div>
                    <div className="text-[12px]" style={{ color: "#1C3A2F" }}>
                      {formatPriceFn(Number(p.priceTHB))}
                      {p.listingType === "sale" ? "" : (p.priceLabel ?? "")}
                    </div>
                    <div className="text-[11px]" style={{ color: "#999" }}>📍 {p.area}</div>
                  </div>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs cursor-pointer border-none"
                    style={{ background: "#F7F3EC", color: "#999", fontFamily: "inherit" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {saved.length > 0 && (
            <a
              href="/explore"
              className="block mt-4 py-3.5 rounded-2xl text-sm font-semibold text-center no-underline"
              style={{ background: "#C9A84C", color: "#1C3A2F" }}
            >
              View All Saved Properties →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
