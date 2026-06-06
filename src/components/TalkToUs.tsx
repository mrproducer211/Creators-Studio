"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TalkToUs() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState({
    email: "admin@nhpbangkok.com",
    whatsapp: "+66812345678",
    line: "nhp-line-id",
    telegram: "nhp-telegram",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setContacts({
            email: data.adminEmail || "admin@nhpbangkok.com",
            whatsapp: data.adminWhatsApp || "+66812345678",
            line: data.adminLine || "nhp-line-id",
            telegram: data.adminTelegram || "nhp-telegram",
          });
        }
      })
      .catch((err) => console.error("Failed to load settings in TalkToUs:", err));
  }, []);

  const waUrl = contacts.whatsapp.startsWith("http")
    ? contacts.whatsapp
    : `https://wa.me/${contacts.whatsapp.replace(/[^0-9]/g, "")}`;

  const lineUrl = contacts.line.startsWith("http")
    ? contacts.line
    : `https://line.me/ti/p/~${contacts.line}`;

  return (
    <section
      className="px-4 md:px-6 py-12"
      style={{ background: "#1C3A2F" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Label */}
        <p
          className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-3"
          style={{ color: "#C9A84C" }}
        >
          {t.talk.label}
        </p>

        {/* Headline */}
        <h2
          className="text-[24px] md:text-[30px] font-bold leading-[1.25] mb-3"
          style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}
        >
          {t.talk.title}
        </h2>

        {/* Sub */}
        <p
          className="text-[14px] font-light leading-[1.7] mb-8 max-w-md mx-auto"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {t.talk.sub}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[14px] font-semibold no-underline transition-opacity hover:opacity-90 w-full sm:w-auto justify-center"
            style={{ background: "#25D366", color: "#FFFFFF" }}
          >
            {/* WhatsApp icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t.talk.whatsapp}
          </a>

          {/* Line */}
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[14px] font-semibold no-underline transition-opacity hover:opacity-90 w-full sm:w-auto justify-center"
            style={{ background: "#00B900", color: "#FFFFFF" }}
          >
            {/* Line icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            {t.talk.line}
          </a>
 
          {/* Email */}
          <a
            href={`mailto:${contacts.email}`}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[14px] font-semibold no-underline transition-all w-full sm:w-auto justify-center"
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.65)",
              border: "1.5px solid rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)"; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {t.talk.emailUs || "Email Us"}
          </a>
        </div>

        {/* Trust note */}
        <p className="text-[11px] mt-6 font-light" style={{ color: "rgba(255,255,255,0.3)" }}>
          {t.talk.note}
        </p>
      </div>
    </section>
  );
}
