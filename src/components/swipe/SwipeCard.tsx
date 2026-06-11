"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PropertyCard } from "@/types/property";
import { useCurrency } from "@/contexts/CurrencyContext";

const GRADIENTS = [
  "linear-gradient(160deg, #254D3E 0%, #1C3A2F 100%)",
  "linear-gradient(160deg, #8B6914 0%, #C9A84C 100%)",
  "linear-gradient(160deg, #1A1A1A 0%, #2E6150 100%)",
  "linear-gradient(160deg, #2E6150 0%, #7A5C12 100%)",
  "linear-gradient(160deg, #1C3A2F 0%, #111 100%)",
  "linear-gradient(160deg, #C9A84C 0%, #1C3A2F 100%)",
];

function listingLabel(t: string) {
  if (t === "sale") return "For Sale";
  if (t === "rent") return "Long Rent";
  return "Short Stay";
}
function listingStyle(t: string) {
  if (t === "sale") return { background: "#1C3A2F", color: "#E2C97E" };
  if (t === "rent") return { background: "#C9A84C", color: "#1C3A2F" };
  return { background: "#FFFFFF", color: "#1C3A2F" };
}

interface Props {
  property: PropertyCard;
  index: number;        // 0 = top, 1 = second, 2 = third
  total: number;
  onSwipe: (dir: "left" | "right") => void;
}

const SWIPE_THRESHOLD = 100;
const TAP_THRESHOLD   = 8;     // px — drag less than this counts as a tap
const MAX_ROTATE      = 15;

export default function SwipeCard({ property, index, total, onSwipe }: Props) {
  const router  = useRouter();
  const { formatPrice: formatPriceFn } = useCurrency();
  const cardRef = useRef<HTMLDivElement>(null);
  const startX  = useRef(0);
  const startY  = useRef(0);
  const didDrag = useRef(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [gone, setGone] = useState<"left" | "right" | null>(null);

  const gradient = GRADIENTS[property.id % GRADIENTS.length];

  const fly = useCallback((dir: "left" | "right") => {
    setGone(dir);
    setTimeout(() => onSwipe(dir), 350);
  }, [onSwipe]);

  /* ── pointer events ── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (index !== 0 || gone) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startY.current = e.clientY;
    didDrag.current = false;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || index !== 0 || gone) return;
    const dx = e.clientX - startX.current;
    setOffset(dx);
    if (Math.abs(dx) > TAP_THRESHOLD) didDrag.current = true;
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (offset > SWIPE_THRESHOLD) {
      fly("right");
    } else if (offset < -SWIPE_THRESHOLD) {
      fly("left");
    } else {
      setOffset(0);
      // Tap (no significant drag) on mobile → open property detail
      if (!didDrag.current && typeof window !== "undefined" && window.innerWidth < 768) {
        router.push(`/property/${property.slug}`);
      }
    }
  };

  /* ── visual stack transforms ── */
  const stackStyles: React.CSSProperties = (() => {
    if (gone === "left")  return { transform: "translate(-150%, -10%) rotate(-30deg)", opacity: 0, transition: "all 0.35s ease" };
    if (gone === "right") return { transform: "translate(150%, -10%) rotate(30deg)",  opacity: 0, transition: "all 0.35s ease" };
    if (index === 0) {
      const rotate = (offset / 20) * (Math.abs(offset) / 100);
      const clampedRotate = Math.max(-MAX_ROTATE, Math.min(MAX_ROTATE, rotate));
      return {
        transform: `translate(${offset}px, 0) rotate(${clampedRotate}deg)`,
        transition: dragging ? "none" : "transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
        cursor: dragging ? "grabbing" : "grab",
        zIndex: 30,
      };
    }
    if (index === 1) return { transform: "translateY(16px) scale(0.96)", zIndex: 20, transition: "transform 0.3s ease" };
    return                { transform: "translateY(32px) scale(0.92)", zIndex: 10, opacity: 0.7, transition: "transform 0.3s ease" };
  })();

  const likeOpacity  = index === 0 ? Math.min(1, offset / SWIPE_THRESHOLD) : 0;
  const nopeOpacity  = index === 0 ? Math.min(1, -offset / SWIPE_THRESHOLD) : 0;

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 rounded-3xl overflow-hidden select-none"
      style={{
        boxShadow: index === 0 ? "0 20px 60px rgba(0,0,0,0.25)" : "0 8px 24px rgba(0,0,0,0.15)",
        background: "#FFFFFF",
        willChange: "transform",
        touchAction: "none",
        ...stackStyles,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Image / gradient */}
      <div className="absolute inset-0" style={{ background: gradient }}>
        {property.coverImage && (
          <img src={property.coverImage} alt={property.name} className="w-full h-full object-cover" />
        )}
        {/* Watermark */}
        <span
          className="absolute inset-0 flex items-center justify-center text-[100px] font-bold pointer-events-none"
          style={{ color: "rgba(255,255,255,0.05)", letterSpacing: "-8px" }}
        >
          NHP
        </span>
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.5) 100%)" }}
      />

      {/* LIKE badge */}
      {index === 0 && (
        <div
          className="absolute top-10 left-6 px-4 py-2 rounded-xl border-4 text-2xl font-black uppercase tracking-widest"
          style={{
            opacity: likeOpacity,
            borderColor: "#4ADE80",
            color: "#4ADE80",
            transform: "rotate(-15deg)",
            transition: dragging ? "none" : "opacity 0.2s",
          }}
        >
          SAVE ♥
        </div>
      )}

      {/* NOPE badge */}
      {index === 0 && (
        <div
          className="absolute top-10 right-6 px-4 py-2 rounded-xl border-4 text-2xl font-black uppercase tracking-widest"
          style={{
            opacity: nopeOpacity,
            borderColor: "#F87171",
            color: "#F87171",
            transform: "rotate(15deg)",
            transition: dragging ? "none" : "opacity 0.2s",
          }}
        >
          SKIP ✕
        </div>
      )}

      {/* Type badge */}
      <div
        className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.5px]"
        style={listingStyle(property.listingType)}
      >
        {listingLabel(property.listingType)}
      </div>



      {/* Card counter (top centre) */}
      {index === 0 && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.35)", color: "rgba(255,255,255,0.7)" }}
        >
          {total} left
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="text-[26px] font-bold mb-1" style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}>
          {formatPriceFn(Number(property.priceTHB))}
          {property.listingType === "sale" ? "" : (property.priceLabel ?? "")}
        </div>
        <div className="text-[16px] font-semibold mb-1 leading-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
          {property.name}
        </div>
        <div className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
          📍 {property.area}{property.district ? `, ${property.district}` : ""}
        </div>
        <div className="flex items-center gap-4 mb-3">
          <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>
            🛏 {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bed`}
          </span>
          <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>
            🚿 {property.bathrooms} Bath
          </span>
          {property.sqm && (
            <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>
              📐 {property.sqm} m²
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {property.petFriendly && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(255,255,255,0.14)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.18)" }}>
              Pet Friendly
            </span>
          )}
          {property.nearBts && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(201,168,76,0.18)", color: "#F4D77A", border: "1px solid rgba(201,168,76,0.32)" }}>
              Near BTS / MRT
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
