"use client";

import { useState } from "react";
import { useSaved } from "@/contexts/SavedContext";
import { useSession } from "next-auth/react";

const STACK = [
  {
    gradient: "linear-gradient(135deg, #8B6914, #C9A84C)",
    price: "฿65,000/mo",
    name: "Penthouse On Nut",
    loc: "On Nut, Bangkok",
    tag: null,
    zIndex: 1,
    style: { transform: "rotate(-6deg) translateY(10px) scale(0.95)", opacity: 0.4 },
  },
  {
    gradient: "linear-gradient(135deg, #1A1A1A, #2E6150)",
    price: "฿12,000,000",
    name: "Townhouse Sathorn",
    loc: "Sathorn, Bangkok",
    tag: null,
    zIndex: 2,
    style: { transform: "rotate(-3deg) translateY(5px) scale(0.975)", opacity: 0.7 },
  },
  {
    gradient: "linear-gradient(135deg, #254D3E, #1C3A2F)",
    price: "฿18,500,000",
    name: "Sky Residences Sukhumvit 31",
    loc: "Sukhumvit, Bangkok",
    tag: "For Sale",
    beds: "2 Bed",
    baths: "2 Bath",
    sqm: "72 m²",
    zIndex: 3,
    style: { transform: "rotate(0deg)" },
  },
];

export default function SwipePreview() {
  const { data: session } = useSession();
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(1);
  const [heartPulsed, setHeartPulsed] = useState(false);

  const pulseHeart = () => {
    setHeartPulsed(true);
    setTimeout(() => setHeartPulsed(false), 500);
  };

  const handleHeartClick = () => {
    if (!session) {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    toggle(1);
    pulseHeart();
  };

  return (
    <section className="px-4 pt-8 pb-10" style={{ background: "#1C3A2F" }}>
      <div
        className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5"
        style={{ color: "#C9A84C" }}
      >
        Swipe Mode
      </div>
      <div
        className="text-[20px] font-bold mb-6 leading-[1.3]"
        style={{ color: "#FFFFFF", letterSpacing: "-0.3px" }}
      >
        Browse like a dating app
      </div>

      {/* Card stack */}
      <div className="relative h-[360px] max-w-[300px] mx-auto mb-6">
        {STACK.map((card, i) => (
          <div
            key={i}
            className="absolute w-full rounded-[20px] overflow-hidden"
            style={{
              background: "#FFFFFF",
              boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
              zIndex: card.zIndex,
              ...card.style,
              ...(i === 2
                ? {
                    animation: "floatCard 3.5s ease-in-out infinite",
                  }
                : {}),
            }}
          >
            {/* Card image */}
            <div
              className="h-[200px] flex items-center justify-center relative"
              style={{ background: card.gradient }}
            >
              <span
                className="text-[72px] font-bold select-none"
                style={{ color: "rgba(255,255,255,0.06)", letterSpacing: "-5px" }}
              >
                NHP
              </span>
              {card.tag && (
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.5px]"
                  style={{ background: "#1C3A2F", color: "#E2C97E" }}
                >
                  {card.tag}
                </span>
              )}
              {i === 2 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleHeartClick(); }}
                  className="absolute top-3 right-3 w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm border-none cursor-pointer z-10"
                  style={{ background: "rgba(255,255,255,0.9)" }}
                >
                  {saved ? "💚" : "🤍"}
                </button>
              )}
            </div>

            {/* Card body */}
            <div className="p-4">
              <div
                className="text-[20px] font-bold mb-[3px]"
                style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}
              >
                {card.price}
              </div>
              <div className="text-[13px] font-medium mb-[3px]" style={{ color: "#1A1A1A" }}>
                {card.name}
              </div>
              <div className="text-[11px] mb-2.5" style={{ color: "#999" }}>
                📍 {card.loc}
              </div>
              {"beds" in card && (
                <div
                  className="flex gap-3 pt-2.5 text-[11px]"
                  style={{ borderTop: "1px solid #EDE8DF", color: "#555" }}
                >
                  <span>🛏 {card.beds}</span>
                  <span>🚿 {card.baths}</span>
                  <span>📐 {card.sqm}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-5">
        <button
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl cursor-pointer transition-all duration-150"
          style={{
            border: "2px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          ✕
        </button>
        <button
          onClick={handleHeartClick}
          className="w-16 h-16 rounded-full flex items-center justify-center text-[26px] cursor-pointer transition-all duration-150"
          style={{
            border: "2px solid #C9A84C",
            background: saved || heartPulsed ? "#C9A84C" : "rgba(255,255,255,0.08)",
            color: saved || heartPulsed ? "#1C3A2F" : "#C9A84C",
          }}
        >
          ♥
        </button>
        <button
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl cursor-pointer transition-all duration-150"
          style={{
            border: "2px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          ℹ
        </button>
      </div>

      <p
        className="text-center text-[11px] mt-3.5 tracking-[0.5px]"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        ✕ Skip &nbsp;&nbsp; ♥ Save &nbsp;&nbsp; ℹ Details
      </p>

      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
