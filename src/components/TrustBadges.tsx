"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const ICONS = [
  // 1. Local Expertise (three people outline)
  (
    <svg key="users" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  // 2. Personalized Support (shield outline with check)
  (
    <svg key="shield-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  // 3. Premium Listings (modern condo / building outline)
  (
    <svg key="building" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  ),
  // 4. Relocation Made Easy (globe outline with path)
  (
    <svg key="globe" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
];

export default function TrustBadges() {
  const { lang } = useLanguage();

  const items = {
    en: [
      {
        title: "Local Expertise",
        desc: "Trusted insights from someone who lives here.",
        icon: ICONS[0]
      },
      {
        title: "Personalized Support",
        desc: "From neighborhood finding to moving in.",
        icon: ICONS[1]
      },
      {
        title: "Premium Listings",
        desc: "Carefully selected homes that fit your lifestyle.",
        icon: ICONS[2]
      },
      {
        title: "Relocation Made Easy",
        desc: "We make your Bangkok journey smooth.",
        icon: ICONS[3]
      }
    ],
    th: [
      {
        title: "ความเชี่ยวชาญในท้องถิ่น",
        desc: "ข้อมูลเชิงลึกจากคนในพื้นที่ที่คุณไว้ใจได้",
        icon: ICONS[0]
      },
      {
        title: "การช่วยเหลือส่วนบุคคล",
        desc: "ดูแลคุณตั้งแต่หาทำเลไปจนถึงย้ายเข้าอยู่อาศัย",
        icon: ICONS[1]
      },
      {
        title: "รายการที่พักระดับพรีเมียม",
        desc: "คัดสรรบ้านและคอนโดที่ตรงกับไลฟ์สไตล์ของคุณอย่างพิถีพิถัน",
        icon: ICONS[2]
      },
      {
        title: "ช่วยให้การย้ายที่อยู่อาศัยเป็นเรื่องง่าย",
        desc: "เราทำให้การเดินทางและการย้ายมาใช้ชีวิตในกรุงเทพฯ ของคุณเป็นเรื่องง่าย",
        icon: ICONS[3]
      }
    ],
    zh: [
      {
        title: "本地专业知识",
        desc: "来自本地居民的可靠洞察。",
        icon: ICONS[0]
      },
      {
        title: "个性化支持",
        desc: "从社区搜寻到顺利入住的全程协助。",
        icon: ICONS[1]
      },
      {
        title: "高品质房源",
        desc: "精心挑选契合您生活方式的理想家园。",
        icon: ICONS[2]
      },
      {
        title: "移居更加轻松",
        desc: "助您开启顺畅的曼谷之旅。",
        icon: ICONS[3]
      }
    ]
  };

  const activeItems = items[lang as "en" | "th" | "zh"] || items.en;

  return (
    <section className="py-8 w-full border-t border-b" style={{ background: "#FDFCF9", borderColor: "#EDE8DF" }}>
      <div className="w-full max-w-[1360px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {activeItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              {/* Icon */}
              <div className="text-[#1C3A2F] flex-shrink-0 mt-0.5">
                {item.icon}
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4
                  className="text-[13px] font-bold leading-tight font-outfit"
                  style={{ color: "#1C3A2F" }}
                >
                  {item.title}
                </h4>
                <p
                  className="text-[11px] md:text-[11.5px] leading-[1.4] mt-1 font-light"
                  style={{ color: "rgba(28, 58, 47, 0.7)" }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
