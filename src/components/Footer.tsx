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
  const { t } = useLanguage();
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
      heading: "Prime Areas",
      items: [
        { label: "Sukhumvit", href: "/neighborhood/sukhumvit" },
        { label: "Thong Lo & Ekkamai", href: "/neighborhood/thong-lo" },
        { label: "Asok & Phrom Phong", href: "/neighborhood/asok" },
        { label: "Silom & Sathorn", href: "/neighborhood/sathorn" },
        { label: "On Nut & Phra Khanong", href: "/neighborhood/on-nut" },
      ],
    },
    {
      heading: "More Neighborhoods",
      items: [
        { label: "Ari & Phaya Thai", href: "/neighborhood/ari" },
        { label: "Rama 9 & Ratchada", href: "/neighborhood/rama-9" },
        { label: "Riverside & Charoenkrung", href: "/neighborhood/charoenkrung" },
        { label: "Bang Na & Udom Suk", href: "/neighborhood/bang-na" },
        { label: "Huai Khwang & Chatuchak", href: "/neighborhood/huai-khwang" },
      ],
    },
    {
      heading: t.footer.contact,
      items: [
        { label: "WhatsApp Support", href: `https://wa.me/${contacts.adminWhatsApp.replace(/[^0-9]/g, "")}` },
        { label: "LINE Official", href: `https://line.me/ti/p/~${contacts.adminLine}` },
        { label: t.footer.aboutNhp, href: "/about-us" },
        { label: "FAQ & Help Center", href: "/frequent-asked-question-faq" },
        { label: t.footer.privacyPolicy, href: "/privacy" },
        { label: "Join as Agent", href: "/agent/register" },
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
            New Home Property
          </strong>
          <p
            className="text-xs leading-relaxed font-light max-w-sm"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {t.footer.tagline}
          </p>
          {/* NAP — visible business address + phone for local SEO consistency.
              Mirrors the LocalBusiness schema in layout.tsx. */}
          <address
            className="text-xs leading-relaxed font-light max-w-sm mt-3 not-italic"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {BUSINESS_NAP.streetAddress}, {BUSINESS_NAP.locality} {BUSINESS_NAP.postalCode}, Thailand
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
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[10px] text-white/40 font-medium mr-1">Currency:</span>
            {(["THB", "USD", "EUR", "CNY"] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className="cursor-pointer border-none text-[10px] font-bold px-2.5 py-1 rounded transition-all"
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
    </footer>
  );
}
