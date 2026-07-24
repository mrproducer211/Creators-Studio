"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useCurrency } from "@/contexts/CurrencyContext";

// Business NAP — kept in sync with src/app/layout.tsx BUSINESS_ADDRESS constants.
// Surfaced visibly for local-SEO consistency (crawlers + Google Business Profile).
// TODO(owner): update the placeholders below AND in layout.tsx with your real address.
const BUSINESS_NAP = {
  streetAddress: "[YOUR STREET ADDRESS]",
  locality: "Bangkok",
  postalCode: "[YOUR POSTAL CODE]",
  phoneDisplay: "+66 818 794 182",
  phoneHref: "+66818794182",
};

export default function Footer() {
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [contacts, setContacts] = useState({
    adminWhatsApp: BUSINESS_NAP.phoneHref,
    adminLine: "nhp-line-id",
    adminTelegram: "nhp-telegram",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setContacts({
          adminWhatsApp: data.adminWhatsApp || BUSINESS_NAP.phoneHref,
          adminLine: data.adminLine || "nhp-line-id",
          adminTelegram: data.adminTelegram || "nhp-telegram",
        });
      })
      .catch(() => {});
  }, []);

  const linkGroups = [
    {
      heading: t.footer.browse,
      items: [
        { label: t.footer.forSale, href: "/for-sale" },
        { label: t.footer.longRent, href: "/for-rent" },
        { label: t.footer.shortStay, href: "/short-stay" },
        { label: t.footer.swipeMode, href: "/swipe" },
        { label: t.footer.blog, href: "/blog" },
      ],
    },
    {
      heading: t.footer.primeAreas,
      items: [
        { label: t.footer.sukhumvit, href: "/neighborhood/sukhumvit" },
        { label: t.footer.thongLoEkkamai, href: "/neighborhood/thong-lo" },
        { label: t.footer.asokPhromPhong, href: "/neighborhood/asok" },
        { label: t.footer.silomSathorn, href: "/neighborhood/sathorn" },
        { label: t.footer.onNutPhraKhanong, href: "/neighborhood/on-nut" },
      ],
    },
    {
      heading: t.footer.moreNeighborhoods,
      items: [
        { label: t.footer.ariPhayaThai, href: "/neighborhood/ari" },
        { label: t.footer.rama9Ratchada, href: "/neighborhood/rama-9" },
        { label: t.footer.riversideCharoenkrung, href: "/neighborhood/charoenkrung" },
        { label: t.footer.bangNaUdomSuk, href: "/neighborhood/bang-na" },
        { label: t.footer.huaiKhwangChatuchak, href: "/neighborhood/huai-khwang" },
      ],
    },
    {
      heading: t.footer.contact,
      items: [
        { label: t.footer.whatsAppSupport, href: `https://wa.me/${contacts.adminWhatsApp.replace(/[^0-9]/g, "")}` },
        { label: t.footer.lineOfficial, href: `https://line.me/ti/p/~${contacts.adminLine}` },
        { label: t.footer.aboutNhp, href: "/about-us" },
        { label: t.footer.faqHelpCenter, href: "/faq" },
        { label: t.footer.privacyPolicy, href: "/privacy" },
        { label: t.footer.joinAsAgent, href: "/agent/register" },
      ],
    },
  ];

  return (
    <footer className="px-5 pt-10 pb-8" style={{ background: "#161B18" }}>
      <div className="max-w-6xl mx-auto">
        {/* Brand */}
        <div className="mb-8">
          <strong
            className="block text-lg font-bold mb-2 tracking-tight"
            style={{ color: "#FFFFFF" }}
          >
            New Homes Property
          </strong>
          <p
            className="text-xs leading-relaxed font-light max-w-sm"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {t.footer.tagline}
          </p>
          <address
            className="text-xs leading-relaxed font-light max-w-sm mt-3 not-italic"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Bangkok 10110, Thailand
            <br />
            <a
              href={`tel:${BUSINESS_NAP.phoneHref}`}
              className="underline-offset-2 hover:underline"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {BUSINESS_NAP.phoneDisplay}
            </a>
          </address>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {linkGroups.map((group) => (
            <div key={group.heading}>
              <h4
                className="text-[11px] uppercase tracking-[1.5px] font-bold mb-3.5"
                style={{ color: "#C9A233" }}
              >
                {group.heading}
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-xs font-normal no-underline transition-colors duration-150 block"
                      style={{ color: "rgba(255,255,255,0.55)", fontFamily: "inherit" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)")
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex justify-between items-center flex-wrap gap-4 pt-6 text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <span>{t.footer.copy}</span>
          <div className="flex gap-4 flex-wrap items-center">
            {/* Language Switcher */}
            <div className="flex gap-1.5 items-center">
              <span className="text-[10px] text-white/40 font-medium mr-1">🌐 Language</span>
              {(["en", "th", "zh"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="cursor-pointer border-none text-[10px] font-bold px-2 py-1 rounded transition-all"
                  style={{
                    background: lang === l ? "#C9A233" : "rgba(255,255,255,0.08)",
                    color: lang === l ? "#0F2A20" : "rgba(255,255,255,0.6)",
                    fontFamily: "inherit",
                  }}
                >
                  {l === "en" ? "EN" : l === "th" ? "TH" : "中文"}
                </button>
              ))}
            </div>

            {/* Currency Switcher */}
            <div className="flex gap-1.5 items-center">
              <span className="text-[10px] text-white/40 font-medium mr-1">{t.footer.currency}</span>
              {(["THB", "USD", "EUR", "CNY"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className="cursor-pointer border-none text-[10px] font-bold px-2 py-1 rounded transition-all"
                  style={{
                    background: currency === curr ? "#C9A233" : "rgba(255,255,255,0.08)",
                    color: currency === curr ? "#0F2A20" : "rgba(255,255,255,0.6)",
                    fontFamily: "inherit",
                  }}
                >
                  {curr === "THB" ? "฿ THB" : curr === "USD" ? "$ USD" : curr === "EUR" ? "€ EUR" : "¥ CNY"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
