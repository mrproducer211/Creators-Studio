"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, LayoutGrid, ArrowRightLeft } from "lucide-react";

export default function BrowseModes() {
  const { t } = useLanguage();

  const modes = [
    {
      icon: <Sparkles className="w-8 h-8 text-[#E2C97E]" />,
      name: t.browse.swipeName,
      desc: t.browse.swipeDesc,
      featured: true,
      href: "/explore/match",
    },
    {
      icon: <LayoutGrid className="w-6 h-6 text-[#1C3A2F]" />,
      name: t.browse.gridName,
      desc: t.browse.gridDesc,
      featured: false,
      href: "/explore",
    },
    {
      icon: <ArrowRightLeft className="w-6 h-6 text-[#1C3A2F]" />,
      name: t.browse.reelName,
      desc: t.browse.reelDesc,
      featured: false,
      href: "/swipe",
    },
  ];

  return (
    <section className="px-4 py-7" style={{ background: "#FFFFFF" }}>
      <div className="mb-5">
        <div
          className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5"
          style={{ color: "#C9A84C" }}
        >
          {t.browse.label}
        </div>
        <div
          className="text-[20px] font-bold leading-[1.3]"
          style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}
        >
          {t.browse.title}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {modes.map((m) =>
          m.featured ? (
            <a
              key={m.name}
              href={m.href}
              className="col-span-2 flex items-center gap-4 rounded-2xl p-5 cursor-pointer transition-all duration-150 no-underline"
              style={{ background: "#1C3A2F", border: "1.5px solid #1C3A2F" }}
            >
              <span className="flex-shrink-0">{m.icon}</span>
              <div>
                <div className="text-base font-semibold mb-1.5" style={{ color: "#E2C97E" }}>
                  {m.name}
                </div>
                <p className="text-xs leading-[1.55]" style={{ color: "rgba(247,243,236,0.65)" }}>
                  {m.desc}
                </p>
              </div>
            </a>
          ) : (
            <a
              key={m.name}
              href={m.href}
              className="no-underline rounded-2xl p-5 cursor-pointer transition-all duration-150 relative overflow-hidden block"
              style={{ background: "#F7F3EC", border: "1.5px solid #E5E0D8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1C3A2F";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(28,58,47,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E0D8";
                (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              }}
            >
              <span className="block mb-2.5">{m.icon}</span>
              <div className="text-[15px] font-semibold mb-1" style={{ color: "#1C3A2F" }}>
                {m.name}
              </div>
              <p className="text-xs leading-[1.55] font-normal" style={{ color: "#555" }}>
                {m.desc}
              </p>
            </a>
          )
        )}
      </div>
    </section>
  );
}
