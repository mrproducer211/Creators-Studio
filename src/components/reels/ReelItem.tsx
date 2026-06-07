"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Play, Volume2, VolumeX } from "lucide-react";
import { PropertyCard } from "@/types/property";
import ReelActions from "./ReelActions";
import ReelInterestSheet from "./ReelInterestSheet";
import { useCurrency } from "@/contexts/CurrencyContext";

const GRADIENTS = [
  "linear-gradient(180deg, #254D3E 0%, #1C3A2F 100%)",
  "linear-gradient(180deg, #8B6914 0%, #C9A84C 60%, #1C3A2F 100%)",
  "linear-gradient(180deg, #111 0%, #2E6150 100%)",
  "linear-gradient(180deg, #2E6150 0%, #7A5C12 80%, #111 100%)",
  "linear-gradient(180deg, #1C3A2F 0%, #111 100%)",
  "linear-gradient(180deg, #C9A84C 0%, #1C3A2F 100%)",
];

const MOCK_REEL_VIDEOS = [
  "/videos/v1.mp4",
  "/videos/v2.mp4",
  "/videos/v3.mp4",
  "/videos/v4.mp4",
  "/videos/v5.mp4",
];

function listingLabel(t: string) {
  if (t === "sale") return "For Sale";
  if (t === "rent") return "Long Rent";
  return "Short Stay";
}

function listingStyle(t: string) {
  if (t === "sale") return { background: "#1C3A2F", color: "#E2C97E" };
  if (t === "rent") return { background: "#C9A84C", color: "#1C3A2F" };
  return { background: "rgba(255,255,255,0.9)", color: "#1C3A2F" };
}

interface Props {
  property: PropertyCard;
  index: number;
  isActive: boolean;
  onLocationClick?: (loc: string) => void;
}

export default function ReelItem({ property, index, isActive, onLocationClick }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const { formatPrice: formatPriceFn } = useCurrency();
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const videoSrc = property.videoUrl ?? MOCK_REEL_VIDEOS[index % MOCK_REEL_VIDEOS.length];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      if (!userPaused) {
        video.play()
          .then(() => {
            Promise.resolve().then(() => setPlaying(true));
          })
          .catch(() => {
            Promise.resolve().then(() => setPlaying(false));
          });
      }
    } else {
      video.pause();
      video.currentTime = 0;
      Promise.resolve().then(() => setPlaying(false));
    }
  }, [isActive, userPaused]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying(true);
      setUserPaused(false);
    } else {
      video.pause();
      setPlaying(false);
      setUserPaused(true);
    }
  };

  return (
    <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ height: "100%", minHeight: "100%", background: "#111" }}>
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={property.coverImage}
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          muted={muted}
          onClick={togglePlay}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: gradient }} onClick={togglePlay}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[120px] font-black select-none" style={{ color: "rgba(255,255,255,0.04)" }}>
              NHP
            </span>
          </div>
        </div>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.85) 100%)" }}
      />

      <div className="absolute top-[68px] left-0 right-0 z-10 flex items-center justify-between px-4 pt-2">
        <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.5px]" style={listingStyle(property.listingType)}>
          {listingLabel(property.listingType)}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted((m) => !m)}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none"
            style={{ background: "rgba(0,0,0,0.42)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}
            aria-label={muted ? "Unmute video" : "Mute video"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {!playing && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.42)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}
            >
              <Play size={16} fill="currentColor" />
            </div>
          )}
        </div>
      </div>

      <div className="absolute right-4 flex flex-col items-center gap-1" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)" }}>
        <ReelActions property={property} />
      </div>

      <div className="absolute left-0 right-16 px-4" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)" }}>
        <button
          onClick={() => setShowInfo(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-bold cursor-pointer border-none mb-3.5 shadow-lg active:scale-95 transition-transform"
          style={{ background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }}
        >
          <Mail size={16} /> I&apos;m Interested
        </button>

        <div className="text-[28px] font-bold mb-1" style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}>
          {formatPriceFn(Number(property.priceTHB))}
          {property.listingType === "sale" ? "" : (property.priceLabel ?? "")}
        </div>
        <div className="text-[16px] font-semibold mb-1 leading-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
          {property.name}
        </div>
        <button
          onClick={() => onLocationClick?.(property.area)}
          className="text-[12.5px] mb-3 border-none bg-transparent p-0 cursor-pointer flex items-center hover:text-white transition-colors text-left"
          style={{ color: "rgba(255,255,255,0.75)", fontFamily: "inherit" }}
        >
          📍 <span className="underline decoration-dotted decoration-white/40 underline-offset-2">{property.area}{property.district ? `, ${property.district}` : ""}</span>
        </button>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
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

        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
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

        <p className="text-[12.5px] leading-[1.5] font-light text-white/85 line-clamp-2 mt-2" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)", maxWidth: "92%" }}>
          {property.description}
        </p>
      </div>

      {showInfo && <ReelInterestSheet property={property} onClose={() => setShowInfo(false)} />}
    </div>
  );
}
