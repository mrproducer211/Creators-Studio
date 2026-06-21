"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { T_PRIVACY } from "@/data/privacyTranslations";

export default function PrivacyClient() {
  const { lang } = useLanguage();
  const t = T_PRIVACY[lang] || T_PRIVACY.en;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", minHeight: "100vh" }}>

        {/* Banner */}
        <div className="px-4 py-20 text-center" style={{ background: "#1C3A2F" }}>
          <div className="max-w-3xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[1.5px] uppercase mb-4"
              style={{ background: "#C9A84C", color: "#1C3A2F" }}
            >
              {t.badge}
            </span>
            <h1
              className="text-[28px] md:text-[42px] font-bold leading-tight mb-3 text-white"
              style={{ letterSpacing: "-0.5px" }}
            >
              {t.title}
            </h1>
            <p
              className="text-[12px] font-medium"
              style={{ color: "rgba(201,168,76,0.85)" }}
            >
              {t.lastUpdated}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

          {/* Intro Card */}
          <div
            className="rounded-2xl p-6 md:p-8 border"
            style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}
          >
            <p className="text-[13px] leading-[1.85] text-gray-500 font-light">
              {t.intro}
            </p>
          </div>

          {/* Policy Sections */}
          <div
            className="rounded-2xl border divide-y overflow-hidden"
            style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}
          >
            {t.sections.map((s) => (
              <div key={s.number} className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span
                    className="text-[11px] font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#F7F3EC", color: "#C9A84C" }}
                  >
                    {s.number}
                  </span>
                  <div className="space-y-3">
                    <h2 className="text-[15px] font-bold text-[#1C3A2F]">
                      {s.title}
                    </h2>
                    <div className="space-y-2">
                      {s.body.map((paragraph, pIdx) => (
                        <p
                          key={pIdx}
                          className="text-[13px] leading-[1.85] text-gray-500 font-light"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="h-4" />
      </main>
      <Footer />
    </>
  );
}
