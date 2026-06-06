"use client";

import { useSaved } from "@/contexts/SavedContext";
import { PropertyCard } from "@/types/property";
import ExplorePropertyCard from "@/components/explore/ExplorePropertyCard";

export default function SavedPageClient({ allProperties }: { allProperties: PropertyCard[] }) {
  const { savedIds, count } = useSaved();
  const saved = allProperties.filter((p) => savedIds.has(p.id));

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-8" style={{ background: "#1C3A2F" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: "#C9A84C" }}>
          Your Collection
        </div>
        <h1 className="text-[26px] font-bold mb-1" style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}>
          Saved Properties
        </h1>
        <p className="text-[13px] font-light" style={{ color: "rgba(255,255,255,0.55)" }}>
          {count} {count === 1 ? "property" : "properties"} saved
        </p>
      </div>

      <div className="px-4 md:px-6 py-8">
        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-5">🤍</span>
            <h2 className="text-[20px] font-bold mb-2" style={{ color: "#1C3A2F" }}>
              No saved properties yet
            </h2>
            <p className="text-[14px] font-light mb-8 max-w-xs" style={{ color: "#999" }}>
              Tap the ♥ on any property to save it here. Browse, swipe, or watch reels to find your next home.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="/explore" className="px-5 py-3 rounded-xl text-[13px] font-semibold no-underline" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>
                Browse Properties
              </a>
              <a href="/swipe" className="px-5 py-3 rounded-xl text-[13px] font-semibold no-underline" style={{ background: "#F7F3EC", color: "#1C3A2F", border: "1px solid #E5E0D8" }}>
                ♥ Swipe Mode
              </a>
              <a href="/reels" className="px-5 py-3 rounded-xl text-[13px] font-semibold no-underline" style={{ background: "#F7F3EC", color: "#1C3A2F", border: "1px solid #E5E0D8" }}>
                ▶ Watch Reels
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px]" style={{ color: "#555" }}>
                {count} saved {count === 1 ? "property" : "properties"}
              </p>
              <a href="/explore" className="text-[13px] font-medium no-underline" style={{ color: "#1C3A2F", borderBottom: "1px solid #1C3A2F", paddingBottom: "1px" }}>
                Browse more →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {saved.map((p, i) => (
                <ExplorePropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
