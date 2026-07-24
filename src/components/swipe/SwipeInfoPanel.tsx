"use client";

import { useState } from "react";
import { PropertyCard } from "@/types/property";
import { useEnquiry } from "@/hooks/useEnquiry";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Heart, MapPin, Bed, ShowerHead, Maximize2, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { stripEmojis } from "@/lib/emoji";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedPropertySummary } from "@/lib/seoEnricher";

function formatPrice(p: PropertyCard, formatPriceFn: (n: number) => string) {
  if (p.listingType === "sale") return formatPriceFn(Number(p.priceTHB));
  return `${formatPriceFn(Number(p.priceTHB))}${p.priceLabel ?? ""}`;
}

interface Props {
  property: PropertyCard;
  onClose: () => void;
  onSave: () => void;
  onSkip: () => void;
}

export default function SwipeInfoPanel({ property, onClose, onSave, onSkip }: Props) {
  const { lang }                = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [name, setName]         = useState("");
  const [contact, setContact]   = useState("");
  const [method, setMethod]     = useState("WhatsApp");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();
  const { formatPrice: formatPriceFn } = useCurrency();

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
      source:       "swipe",
    });
  };

  const inputStyle = {
    border: "1.5px solid #E5E0D8",
    background: "#F7F3EC",
    color: "#1A1A1A",
    fontFamily: "inherit",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
      <div
        className="relative w-full rounded-t-3xl overflow-y-auto"
        style={{ background: "#F7F3EC", maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "#E5E0D8" }} />
        </div>

        <div className="px-5 pb-8">
          {/* ── Property info ── */}
          {!showForm && status !== "done" && (
            <>
              <div className="text-[24px] font-bold mt-3 mb-1" style={{ color: "#1C3A2F", letterSpacing: "-0.5px" }}>
                {formatPrice(property, formatPriceFn)}
              </div>
               <div className="text-[17px] font-semibold mb-1 leading-tight" style={{ color: "#1A1A1A" }}>{stripEmojis(property.name)}</div>
              <div className="text-[13px] mb-4 flex items-center gap-1" style={{ color: "#999" }}>
                <MapPin size={12} className="shrink-0" />
                <span>
                  {stripEmojis(property.area)}
                  {property.district ? `, ${stripEmojis(property.district)}` : ""}
                </span>
              </div>

              <div className="flex gap-5 py-3 mb-4 rounded-2xl px-4" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
                {[
                  { icon: <Bed className="w-5 h-5 mx-auto text-[#1C3A2F]" />, val: property.bedrooms === 0 ? "Studio" : property.bedrooms, label: "Beds" },
                  { icon: <ShowerHead className="w-5 h-5 mx-auto text-[#1C3A2F]" />, val: property.bathrooms, label: "Baths" },
                  ...(property.sqm ? [{ icon: <Maximize2 className="w-5 h-5 mx-auto text-[#1C3A2F]" />, val: property.sqm, label: "m²" }] : []),
                  { icon: <Heart className="w-5 h-5 mx-auto text-[#1C3A2F] fill-current" />, val: property.likes, label: "Likes" },
                ].map((s) => (
                  <div key={s.label} className="flex-1 text-center">
                    <div className="h-6 flex items-center justify-center">{s.icon}</div>
                    <div className="text-[13px] font-semibold mt-0.5" style={{ color: "#1C3A2F" }}>{s.val}</div>
                    <div className="text-[10px]" style={{ color: "#999" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <p className="text-[14px] leading-[1.7] font-light mb-5" style={{ color: "#555" }}>{stripEmojis(getLocalizedPropertySummary(property, lang))}</p>

              <div className="flex gap-3 mb-3">
                <button onClick={onSkip} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold cursor-pointer border-2" style={{ borderColor: "#E5E0D8", background: "transparent", color: "#555", fontFamily: "inherit" }}>
                  ✕ Skip
                </button>
                <button onClick={onSave} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold cursor-pointer border-none flex items-center justify-center gap-1.5" style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                  <Heart className="w-4 h-4 fill-current" /> Save
                </button>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 rounded-2xl text-sm font-semibold cursor-pointer border-none flex items-center justify-center gap-1.5"
                style={{ background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }}
              >
                <Mail className="w-4 h-4" /> I&apos;m Interested — Contact Me
              </button>
            </>
          )}

          {/* ── Contact form ── */}
          {showForm && status !== "done" && (
            <>
              <button onClick={() => setShowForm(false)} className="text-[12px] mt-2 mb-4 cursor-pointer border-none bg-transparent p-0 flex items-center gap-1" style={{ color: "#999", fontFamily: "inherit" }}>
                ← Back
              </button>
              <p className="text-[18px] font-bold mb-1" style={{ color: "#1C3A2F" }}>Contact about this property</p>
              <p className="text-[12px] font-light mb-4" style={{ color: "#999" }}>{stripEmojis(property.name)}</p>
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
                    className="flex-shrink-0 rounded-xl px-4 py-3 text-[14px] outline-none" style={inputStyle}>
                    <option>WhatsApp</option>
                    <option>Line</option>
                    <option>Telegram</option>
                  </select>
                  <input
                    className="flex-1 w-full min-w-0 rounded-xl px-4 py-3 text-[14px] outline-none"
                    style={inputStyle}
                    placeholder="Phone / username"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")}
                    onBlur={(e)  => (e.target.style.borderColor = "#E5E0D8")}
                    required
                  />
                </div>
                {errorMsg && <p className="text-[12px] px-1 flex items-center gap-1" style={{ color: "#E05252" }}><AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}</p>}
                <button type="submit" disabled={status === "loading"}
                  className="w-full py-4 rounded-2xl text-[15px] font-semibold cursor-pointer border-none disabled:opacity-60"
                  style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                  {status === "loading" ? "Sending…" : "Send Enquiry →"}
                </button>
              </form>
            </>
          )}

          {/* ── Done ── */}
          {status === "done" && (
            <div className="text-center py-10">
              <CheckCircle2 className="w-12 h-12 text-[#2E7D4F] mx-auto mb-4" />
              <p className="text-[20px] font-bold mb-2" style={{ color: "#1C3A2F" }}>Enquiry sent!</p>
              <p className="text-[14px] font-light mb-6" style={{ color: "#555" }}>
                We&apos;ll contact you via {method} within 24 hours.
              </p>
              <button onClick={onClose} className="px-8 py-3 rounded-2xl text-[14px] font-semibold cursor-pointer border-none" style={{ background: "#C9A84C", color: "#1C3A2F", fontFamily: "inherit" }}>
                Keep Swiping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
