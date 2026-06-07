"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const ICONS = [
  (
    <svg key="shield" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  (
    <svg key="globe" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  (
    <svg key="clock" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  (
    <svg key="heart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
];

export default function TrustStrip() {
  const { t } = useLanguage();

  const items = [
    { icon: ICONS[0], label: t.trust.v1l, sub: t.trust.v1s },
    { icon: ICONS[1], label: t.trust.v2l, sub: t.trust.v2s },
    { icon: ICONS[2], label: t.trust.v3l, sub: t.trust.v3s },
    { icon: ICONS[3], label: t.trust.v4l, sub: t.trust.v4s },
  ];

  return (
    <div
      className="px-4 md:px-6 py-5"
      style={{ background: "#FFFFFF", borderTop: "1px solid #EDE8DF", borderBottom: "1px solid #EDE8DF" }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            {/* Icon circle */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(28,58,47,0.07)", color: "#1C3A2F" }}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-tight" style={{ color: "#1A1A1A" }}>
                {item.label}
              </p>
              <p className="text-[11px] font-light mt-0.5" style={{ color: "#999" }}>
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
