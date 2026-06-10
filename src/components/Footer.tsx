"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Footer() {
  const { t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [contacts, setContacts] = useState({
    adminWhatsApp: "+66812345678",
    adminLine: "nhp-line-id",
    adminTelegram: "nhp-telegram",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setContacts({
          adminWhatsApp: data.adminWhatsApp || "+66812345678",
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
        { label: t.footer.forSale, href: "/explore?type=sale" },
        { label: t.footer.longRent, href: "/explore?type=rent" },
        { label: t.footer.shortStay, href: "/explore?type=short_stay" },
        { label: t.footer.swipeMode, href: "/swipe" },
      ],
    },
    {
      heading: t.footer.areas,
      items: [
        { label: t.footer.sukhumvit, href: "/explore?area=Sukhumvit" },
        { label: t.footer.silomSathorn, href: "/explore?area=Sathorn" },
        { label: t.footer.thongLo, href: "/explore?area=Thong%20Lo" },
        { label: t.footer.asok, href: "/explore?area=Asok" },
        { label: t.footer.onNut, href: "/explore?area=On%20Nut" },
      ],
    },
    {
      heading: t.footer.contact,
      items: [
        { label: "WhatsApp", href: `https://wa.me/${contacts.adminWhatsApp.replace(/[^0-9]/g, "")}` },
        { label: "Line", href: `https://line.me/ti/p/~${contacts.adminLine}` },
        { label: t.footer.aboutNhp, href: "/about" },
        { label: t.footer.privacyPolicy, href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="px-4 pt-8 pb-6" style={{ background: "#1A1A1A" }}>
      {/* Brand */}
      <div className="mb-6">
        <strong
          className="block text-base font-semibold mb-1.5"
          style={{ color: "#FFFFFF" }}
        >
          New Home Property
        </strong>
        <p
          className="text-xs leading-[1.65] font-light max-w-[280px]"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {t.footer.tagline}
        </p>
      </div>

      {/* Links grid */}
      <div className="grid grid-cols-2 gap-6 mb-7 md:grid-cols-3">
        {linkGroups.map((group) => (
          <div key={group.heading}>
            <h4
              className="text-[11px] uppercase tracking-[1.5px] font-medium mb-3"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {group.heading}
            </h4>
            <ul className="list-none p-0 m-0 space-y-[9px]">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[13px] font-light no-underline transition-colors duration-150 block"
                    style={{ color: "rgba(255,255,255,0.45)", fontFamily: "inherit" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)")
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
        className="flex justify-between items-center flex-wrap gap-2 pt-5 text-[11px]"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        <span>{t.footer.copy}</span>
        <div className="flex gap-1.5 flex-wrap">
          {(["THB", "USD", "EUR", "CNY"] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className="cursor-pointer border-none text-[10px] font-bold px-2 py-1 rounded transition-colors"
              style={{
                background: currency === curr ? "#C9A84C" : "rgba(255,255,255,0.06)",
                color: currency === curr ? "#1A1A1A" : "rgba(255,255,255,0.5)",
                fontFamily: "inherit",
              }}
            >
              {curr === "THB" ? "฿ THB" : curr === "USD" ? "$ USD" : curr === "EUR" ? "€ EUR" : "¥ CNY"}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
