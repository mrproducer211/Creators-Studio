"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section
      className="px-4 py-12 text-center relative overflow-hidden"
      style={{ background: "#1C3A2F" }}
    >
      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
          top: -100,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <div
        className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-2.5 relative z-10"
        style={{ color: "#C9A84C" }}
      >
        {t.cta.ready}
      </div>
      <h2
        className="text-[26px] font-bold leading-[1.25] mb-3 relative z-10"
        style={{ color: "#FFFFFF", letterSpacing: "-0.5px" }}
      >
        {t.cta.waitingA}
        <br />
        <span style={{ color: "#E2C97E" }}>{t.cta.waitingB}</span>
      </h2>
      <p
        className="text-[13px] leading-[1.65] font-light mb-7 relative z-10"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {t.cta.sub}
      </p>
      <div className="flex flex-col gap-2.5 max-w-[300px] mx-auto relative z-10 md:flex-row md:max-w-[400px]">
        <a
          href="/explore"
          suppressHydrationWarning
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors duration-150 border-2 text-center no-underline"
          style={{ background: "#C9A84C", color: "#1C3A2F", borderColor: "#C9A84C", fontFamily: "inherit" }}
        >
          {t.cta.browse}
        </a>
        <a
          href="/reels"
          suppressHydrationWarning
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors duration-150 text-center no-underline"
          style={{
            background: "transparent",
            color: "#FFFFFF",
            border: "2px solid rgba(255,255,255,0.3)",
            fontFamily: "inherit",
          }}
        >
          {t.cta.watchReels}
        </a>
      </div>
    </section>
  );
}
