"use client";

import { useState } from "react";
import { useEnquiry } from "@/hooks/useEnquiry";
import { useLanguage } from "@/contexts/LanguageContext";
import { MailOpen, AlertCircle } from "lucide-react";

export default function InterestSection() {
  const { t } = useLanguage();
  const [name, setName]       = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod]   = useState("WhatsApp");
  const { status, errorMsg, submit: sendEnquiry } = useEnquiry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    await sendEnquiry({
      propertySlug: "general-enquiry",
      propertyName: "General Enquiry",
      listingType:  "sale",
      price:        "N/A",
      area:         "Bangkok",
      name, contact, method,
      source: "homepage",
    });
  };

  const inputStyle = {
    border: "1.5px solid #E5E0D8",
    background: "#F7F3EC",
    color: "#1A1A1A",
    fontFamily: "inherit",
  };

  return (
    <section className="px-4 py-8" style={{ background: "#EDE8DF" }}>
      <div
        className="rounded-2xl p-6 text-center max-w-[480px] mx-auto"
        style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
      >
        <MailOpen className="w-10 h-10 text-[#C9A84C] mx-auto mb-3.5" />
        <div className="text-[18px] font-bold mb-2" style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}>
          {t.interest.title}
        </div>
        <p className="text-[13px] leading-[1.6] font-light mb-5" style={{ color: "#555" }}>
          {t.interest.sub}
        </p>

        {status === "done" ? (
          <div className="py-4 px-6 rounded-xl" style={{ background: "#F7F3EC", border: "1px solid #E5E0D8" }}>
            <p className="text-[15px] font-semibold mb-1" style={{ color: "#1C3A2F" }}>{t.interest.sent}</p>
            <p className="text-[13px] font-light" style={{ color: "#555" }}>
              {t.interest.reachOut.replace("{method}", method)}
            </p>
          </div>
        ) : (
          <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
            <input
              suppressHydrationWarning
              className="flex-1 rounded-xl px-3.5 py-3 text-[13px] outline-none transition-colors"
              style={inputStyle}
              type="text"
              placeholder={t.interest.placeholderName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")}
              onBlur={(e)  => (e.target.style.borderColor = "#E5E0D8")}
              required
            />
            <div className="flex gap-2.5">
              <select
                suppressHydrationWarning
                className="flex-shrink-0 rounded-xl px-3.5 py-3 text-[13px] outline-none"
                style={inputStyle}
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option>WhatsApp</option>
                <option>Line</option>
                <option>Telegram</option>
              </select>
              <input
                suppressHydrationWarning
                className="flex-1 w-full min-w-0 rounded-xl px-3.5 py-3 text-[13px] outline-none transition-colors"
                style={inputStyle}
                type="text"
                placeholder={t.interest.placeholderNumber}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")}
                onBlur={(e)  => (e.target.style.borderColor = "#E5E0D8")}
                required
              />
            </div>
            {errorMsg && (
              <p className="text-[12px] text-left px-1 flex items-center gap-1" style={{ color: "#E05252" }}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errorMsg}
              </p>
            )}
            <button
              suppressHydrationWarning
              type="submit"
              disabled={status === "loading"}
              className="rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150 border-none disabled:opacity-60"
              style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
            >
              {status === "loading" ? t.interest.sending : t.interest.sendButton}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
