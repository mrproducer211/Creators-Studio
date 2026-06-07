"use client";

import { useState, useRef } from "react";
import { PropertyCard } from "@/types/property";
import { useEnquiry } from "@/hooks/useEnquiry";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Props {
  property: PropertyCard;
  onClose: () => void;
}

function formatPrice(p: PropertyCard, formatPriceFn: (n: number) => string) {
  if (p.listingType === "sale") return formatPriceFn(Number(p.priceTHB));
  return `${formatPriceFn(Number(p.priceTHB))}${p.priceLabel ?? ""}`;
}

export default function ReelInterestSheet({ property, onClose }: Props) {
  const [step, setStep]       = useState<"info" | "form">("info");
  const [name, setName]       = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod]   = useState("WhatsApp");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();
  const { formatPrice: formatPriceFn } = useCurrency();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const propertyImages = property.images && property.images.length > 0
    ? property.images
    : (property.coverImage ? [property.coverImage] : []);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      if (index !== activeImgIndex) {
        setActiveImgIndex(index);
      }
    }
  };

  const scrollToImage = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const width = container.clientWidth;
    container.scrollTo({
      left: index * width,
      behavior: "smooth"
    });
    setActiveImgIndex(index);
  };

  const handleImageClick = () => {
    if (propertyImages.length <= 1) return;
    const nextIndex = (activeImgIndex + 1) % propertyImages.length;
    scrollToImage(nextIndex);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    await sendEnquiry({
      propertySlug: property.slug,
      propertyName: property.name,
      listingType:  property.listingType,
      price:        formatPrice(property, formatPriceFn),
      area:         property.area,
      name, contact, method,
      source:       "reels",
    });
  };

  const inputStyle = {
    border: "1.5px solid #E5E0D8",
    background: "#FFFFFF",
    color: "#1A1A1A",
    fontFamily: "inherit",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} />
      <div
        className="relative w-full rounded-t-3xl overflow-y-auto"
        style={{ background: "#F7F3EC", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "#E5E0D8" }} />
        </div>

        <div className="px-5 pb-10">
          {/* ── INFO STEP ── */}
          {step === "info" && (
            <>
              <div
                className="relative w-full h-52 rounded-2xl mb-4 mt-2 overflow-hidden flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#254D3E,#1C3A2F)" }}
              >
                {propertyImages.length > 0 ? (
                  <>
                    <div
                      ref={scrollRef}
                      className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
                      style={{ scrollBehavior: "smooth" }}
                      onScroll={handleScroll}
                    >
                      {propertyImages.map((imgUrl, idx) => (
                        <div
                          key={imgUrl}
                          className="w-full h-full flex-shrink-0 snap-start snap-always relative cursor-pointer"
                          onClick={handleImageClick}
                        >
                          <img src={imgUrl} alt={`${property.name} - ${idx + 1}`} className="w-full h-full object-cover select-none pointer-events-none" />
                        </div>
                      ))}
                    </div>

                    {/* Pagination Dots */}
                    {propertyImages.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-auto bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-xs">
                        {propertyImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => scrollToImage(idx)}
                            className="w-1.5 h-1.5 rounded-full p-0 border-none transition-all cursor-pointer"
                            style={{
                              background: idx === activeImgIndex ? "#C9A84C" : "rgba(255,255,255,0.4)"
                            }}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Prev/Next arrows */}
                    {propertyImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); scrollToImage(activeImgIndex - 1); }}
                          disabled={activeImgIndex === 0}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none bg-black/45 text-white disabled:opacity-0 transition-opacity z-10 font-semibold"
                          style={{ fontSize: "16px" }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); scrollToImage(activeImgIndex + 1); }}
                          disabled={activeImgIndex === propertyImages.length - 1}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none bg-black/45 text-white disabled:opacity-0 transition-opacity z-10 font-semibold"
                          style={{ fontSize: "16px" }}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-[60px] font-bold" style={{ color: "rgba(255,255,255,0.06)", letterSpacing: "-5px" }}>NHP</span>
                )}
              </div>

              <div className="text-[22px] font-bold mb-1" style={{ color: "#1C3A2F", letterSpacing: "-0.5px" }}>
                {formatPrice(property, formatPriceFn)}
              </div>
              <div className="text-[16px] font-semibold mb-1 leading-tight" style={{ color: "#1A1A1A" }}>{property.name}</div>
              <div className="text-[13px] mb-3" style={{ color: "#999" }}>
                📍 {property.area}{property.district ? `, ${property.district}` : ""}
              </div>

              {/* Specs */}
              <div className="flex gap-4 py-3 px-4 rounded-2xl mb-4" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                {[
                  { icon: "🛏", val: property.bedrooms === 0 ? "Studio" : property.bedrooms, label: "Beds" },
                  { icon: "🚿", val: property.bathrooms, label: "Baths" },
                  ...(property.sqm ? [{ icon: "📐", val: property.sqm, label: "m²" }] : []),
                  { icon: "❤️", val: property.likes, label: "Likes" },
                ].map((s) => (
                  <div key={s.label} className="flex-1 text-center">
                    <div className="text-lg">{s.icon}</div>
                    <div className="text-[13px] font-bold mt-0.5" style={{ color: "#1C3A2F" }}>{s.val}</div>
                    <div className="text-[10px]" style={{ color: "#999" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <p className="text-[13px] leading-[1.7] font-light mb-5" style={{ color: "#555" }}>{property.description}</p>

              <div className="flex gap-3">
                <a
                  href={`/property/${property.slug}`}
                  className="flex-1 text-center py-3.5 rounded-2xl text-[14px] font-semibold no-underline"
                  style={{ background: "#F7F3EC", color: "#1C3A2F", border: "1px solid #E5E0D8" }}
                >
                  Full Details
                </a>
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold cursor-pointer border-none"
                  style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
                >
                  📩 I&apos;m Interested
                </button>
              </div>
            </>
          )}

          {/* ── FORM STEP ── */}
          {step === "form" && status !== "done" && (
            <>
              <div className="mt-3 mb-5">
                <button onClick={() => setStep("info")} className="text-[12px] mb-3 cursor-pointer border-none bg-transparent p-0 flex items-center gap-1" style={{ color: "#999", fontFamily: "inherit" }}>
                  ← Back
                </button>
                <p className="text-[18px] font-bold mb-1" style={{ color: "#1C3A2F" }}>Contact us about this property</p>
                <p className="text-[12px] font-light" style={{ color: "#999" }}>{property.name} · {property.area}</p>
              </div>

              <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <input
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                  style={inputStyle}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")}
                  onBlur={(e)  => (e.target.style.borderColor = "#E5E0D8")}
                  required
                />
                <div className="flex gap-2.5">
                  <select value={method} onChange={(e) => setMethod(e.target.value)}
                    className="rounded-xl px-4 py-3 text-[14px] outline-none"
                    style={inputStyle}
                  >
                    <option>WhatsApp</option>
                    <option>Line</option>
                    <option>Telegram</option>
                  </select>
                  <input
                    className="flex-1 rounded-xl px-4 py-3 text-[14px] outline-none"
                    style={inputStyle}
                    placeholder="Phone / username"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")}
                    onBlur={(e)  => (e.target.style.borderColor = "#E5E0D8")}
                    required
                  />
                </div>
                {errorMsg && <p className="text-[12px] px-1" style={{ color: "#E05252" }}>⚠ {errorMsg}</p>}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 rounded-2xl text-[15px] font-semibold cursor-pointer border-none disabled:opacity-60"
                  style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
                >
                  {status === "loading" ? "Sending…" : "Send Enquiry →"}
                </button>
              </form>
            </>
          )}

          {/* ── DONE STEP ── */}
          {status === "done" && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-[20px] font-bold mb-2" style={{ color: "#1C3A2F" }}>Enquiry sent!</p>
              <p className="text-[14px] font-light mb-6" style={{ color: "#555" }}>
                We&apos;ll contact you via {method} within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-2xl text-[14px] font-semibold cursor-pointer border-none"
                style={{ background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }}
              >
                Keep Browsing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
