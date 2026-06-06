"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState({ adminEmail: "admin@nhpbangkok.com", adminPhone: "+66812345678" });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.adminEmail && data.adminPhone) {
          setContacts({ adminEmail: data.adminEmail, adminPhone: data.adminPhone });
        }
      })
      .catch(() => {});
  }, []);

  const links = {
    [t.footer.browse]: [t.footer.forSale, t.footer.longRent, t.footer.shortStay, t.footer.swipeMode, t.footer.reels],
    [t.footer.areas]: [t.footer.sukhumvit, t.footer.silomSathorn, t.footer.thongLo, t.footer.asok, t.footer.onNut],
    [t.footer.contact]: ["WhatsApp", "Line", t.footer.aboutNhp, t.footer.privacyPolicy],
  };

  return (
    <footer className="px-4 pt-8 pb-6" style={{ background: "#1A1A1A" }}>
      {/* Brand */}
      <div className="mb-6">
        <strong
          className="block text-base font-semibold mb-1.5"
          style={{ color: "#FFFFFF" }}
        >
          New Homes Property
        </strong>
        <p
          className="text-xs leading-[1.65] font-light max-w-[280px]"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {t.footer.tagline}
        </p>
        <div className="text-[11px] font-light mt-3.5 flex flex-col gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          <a href={`tel:${contacts.adminPhone}`} className="hover:underline no-underline text-inherit">📞 {contacts.adminPhone}</a>
          <a href={`mailto:${contacts.adminEmail}`} className="hover:underline no-underline text-inherit">✉️ {contacts.adminEmail}</a>
        </div>
      </div>

      {/* Links grid */}
      <div className="grid grid-cols-2 gap-6 mb-7 md:grid-cols-3">
        {Object.entries(links).map(([heading, items]) => (
          <div key={heading}>
            <h4
              className="text-[11px] uppercase tracking-[1.5px] font-medium mb-3"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {heading}
            </h4>
            <ul className="list-none p-0 m-0 space-y-[9px]">
              {items.map((item) => (
                <li
                  key={item}
                  className="text-[13px] font-light cursor-pointer transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLLIElement).style.color = "rgba(255,255,255,0.7)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLLIElement).style.color = "rgba(255,255,255,0.45)")
                  }
                >
                  {item}
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
        <span className="font-medium" style={{ color: "#C9A84C" }}>
          ฿ THB · $ USD
        </span>
      </div>
    </footer>
  );
}
