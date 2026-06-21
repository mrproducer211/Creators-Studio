"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Compass,
  TrainFront,
  Globe,
  Handshake,
  ShieldCheck,
  BookOpen,
  Search,
  Plane,
  Sunset,
  Briefcase,
  Home,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { T_ABOUT } from "@/data/aboutTranslations";

const valueIcons = [
  <Search key="search" className="w-6 h-6" style={{ color: "#C9A84C" }} />,
  <ShieldCheck key="shield" className="w-6 h-6" style={{ color: "#C9A84C" }} />,
  <TrainFront key="train" className="w-6 h-6" style={{ color: "#C9A84C" }} />,
  <Compass key="compass" className="w-6 h-6" style={{ color: "#C9A84C" }} />,
  <Handshake key="handshake" className="w-6 h-6" style={{ color: "#C9A84C" }} />,
  <BookOpen key="book" className="w-6 h-6" style={{ color: "#C9A84C" }} />,
  <Globe key="globe" className="w-6 h-6" style={{ color: "#C9A84C" }} />,
];

const serveIcons = [
  <Plane key="plane" className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />,
  <Sunset key="sunset" className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />,
  <Briefcase key="business" className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />,
  <Home key="home" className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />,
  <Globe key="buyer" className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />,
];

export default function AboutClient() {
  const { lang } = useLanguage();
  const t = T_ABOUT[lang] || T_ABOUT.en;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", minHeight: "100vh" }}>

        {/* Hero */}
        <div className="px-4 py-20 text-center" style={{ background: "#1C3A2F" }}>
          <div className="max-w-3xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[1.5px] uppercase mb-4"
              style={{ background: "#C9A84C", color: "#1C3A2F" }}
            >
              {t.badge}
            </span>
            <h1
              className="text-[28px] md:text-[42px] font-bold leading-tight mb-5 text-white animate-fade-in"
              style={{ letterSpacing: "-0.5px" }}
            >
              {t.heroTitle}
            </h1>
            <p
              className="text-[14px] md:text-[16px] font-light max-w-2xl mx-auto leading-relaxed"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {t.heroDesc}
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div
          className="border-b"
          style={{ background: "#ffffff", borderColor: "#E5E0D8" }}
        >
          <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {t.stats.map((s, idx) => (
              <div key={idx} className="py-1">
                <p
                  className="text-[28px] md:text-[34px] font-bold"
                  style={{ color: "#1C3A2F" }}
                >
                  {s.value}
                </p>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

          {/* Our Story */}
          <div
            className="rounded-2xl p-6 md:p-8 border"
            style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}
          >
            <h2
              className="text-[20px] md:text-[24px] font-bold mb-4"
              style={{ color: "#1C3A2F" }}
            >
              {t.storyTitle}
            </h2>
            <div className="space-y-3">
              {t.storyParagraphs.map((para, idx) => (
                <p key={idx} className="text-[14px] leading-[1.85] text-gray-600 font-light">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* What Makes Us Different */}
          <div
            className="rounded-2xl p-6 md:p-8 border"
            style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}
          >
            <h2
              className="text-[20px] md:text-[24px] font-bold mb-1.5"
              style={{ color: "#1C3A2F" }}
            >
              {t.differentTitle}
            </h2>
            <p className="text-[13px] text-gray-400 mb-5 font-light">
              {t.differentSub}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.values.map((v, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-4 border transition-all hover:shadow-sm"
                  style={{ background: "#FAFAF8", borderColor: "#EDE8DF" }}
                >
                  <div className="mb-2.5">{valueIcons[idx] || valueIcons[0]}</div>
                  <h3
                    className="text-[13px] font-bold mb-1"
                    style={{ color: "#1C3A2F" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-[12px] font-light leading-[1.7] text-gray-500">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Who We Serve */}
          <div
            className="rounded-2xl p-6 md:p-8 border"
            style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}
          >
            <h2
              className="text-[20px] md:text-[24px] font-bold mb-1.5"
              style={{ color: "#1C3A2F" }}
            >
              {t.serveTitle}
            </h2>
            <p className="text-[13px] text-gray-400 mb-5 font-light">
              {t.serveSub}
            </p>
            <div className="space-y-3">
              {t.serveItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 rounded-xl p-4 border transition-all hover:shadow-sm"
                  style={{ borderColor: "#EDE8DF", background: "#FAFAF8" }}
                >
                  {serveIcons[idx] || serveIcons[0]}
                  <div>
                    <p className="text-[13px] font-bold mb-1" style={{ color: "#1C3A2F" }}>
                      {item.title}
                    </p>
                    <p className="text-[12px] font-light text-gray-500 leading-[1.7]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "#1C3A2F" }}
          >
            <h3 className="text-[20px] md:text-[24px] font-bold mb-2 text-white">
              {t.ctaTitle}
            </h3>
            <p
              className="text-[13px] font-light mb-5 max-w-md mx-auto leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {t.ctaSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/explore"
                className="inline-block px-6 py-3 rounded-xl text-[13px] font-semibold no-underline transition-opacity hover:opacity-90"
                style={{ background: "#C9A84C", color: "#1C3A2F" }}
              >
                {t.ctaBrowse}
              </Link>
              <Link
                href="/neighborhood"
                className="inline-block px-6 py-3 rounded-xl text-[13px] font-semibold no-underline border transition-all hover:bg-white/5"
                style={{
                  background: "transparent",
                  color: "#C9A84C",
                  borderColor: "rgba(201,168,76,0.4)",
                }}
              >
                {t.ctaExplore}
              </Link>
            </div>
          </div>

        </div>

        <div className="h-4" />
      </main>
      <Footer />
    </>
  );
}
