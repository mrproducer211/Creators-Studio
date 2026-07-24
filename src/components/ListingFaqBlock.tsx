"use client";

import { useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";

function buildListingFaqs(property: PropertyCard, lang: "en" | "th" | "zh" = "en"): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const name = property.projectName || property.name;
  const area = property.area;

  // 1. Pet policy — highest conversion question
  if (property.houseRules?.pets === true || property.petFriendly) {
    faqs.push({
      q: lang === "th"
        ? `${name} เลี้ยงสัตว์ได้หรือไม่?`
        : lang === "zh"
        ? `${name} 允许携带宠物吗？`
        : `Is ${name} pet-friendly?`,
      a: lang === "th"
        ? `ใช่ โครงการนี้ต้อนรับสัตว์เลี้ยง โปรดระบุข้อมูลสัตว์เลี้ยงเมื่อติดต่อสอบถาม เพื่อให้เรายืนยันเงื่อนไขขนาดหรือสายพันธุ์กับเจ้าของห้องก่อนเข้าชม`
        : lang === "zh"
        ? `是的，该项目欢迎携带宠物。在咨询时请注明您的宠物信息，以便我们在看房前与房东确认尺寸或品种限制。`
        : `Yes, this property welcomes pets. Please mention your pet(s) when enquiring so we can confirm any size or breed restrictions with the landlord before your viewing.`,
    });
  } else if (property.houseRules?.pets === false) {
    faqs.push({
      q: lang === "th"
        ? `${name} อนุญาตให้เลี้ยงสัตว์หรือไม่?`
        : lang === "zh"
        ? `${name} 可以养宠物吗？`
        : `Are pets allowed at ${name}?`,
      a: lang === "th"
        ? `โครงการนี้ไม่อนุญาตให้เลี้ยงสัตว์ หากคุณมีสัตว์เลี้ยง เราสามารถช่วยคุณหาคอนโดที่เลี้ยงสัตว์ได้ในย่าน ${area}`
        : lang === "zh"
        ? `该项目不允许携带宠物。如果您有宠物，我们可以帮您在 ${area} 区域寻找其他已认证允许携带宠物的房源。`
        : `This property does not allow pets. If you have a pet, we can help you find other verified pet-friendly listings in ${area}. Contact us directly and we will match you with the right building.`,
    });
  } else {
    faqs.push({
      q: lang === "th"
        ? `${name} อนุญาตให้เลี้ยงสัตว์หรือไม่?`
        : lang === "zh"
        ? `${name} 可以养宠物吗？`
        : `Are pets allowed at ${name}?`,
      a: lang === "th"
        ? `นโยบายสัตว์เลี้ยงของโครงการนี้กำลังรอการยืนยัน โปรดแจ้งให้เราทราบเมื่อติดต่อสอบถาม`
        : lang === "zh"
        ? `该大楼的宠物政策待确认。咨询时请告知我们，我们将在安排看房前直接与房东确认。`
        : `The pet policy for this building has not been confirmed yet. When you enquire, let us know if you have a pet and we will check with the landlord directly before scheduling your viewing.`,
    });
  }

  // 2. Transit / BTS
  if (property.btsStation && property.btsWalkMin) {
    faqs.push({
      q: lang === "th"
        ? `${name} อยู่ห่างจากสถานี BTS ที่ใกล้ที่สุดแค่ไหน?`
        : lang === "zh"
        ? `${name} 距离最近的轻轨 (BTS) 站有多远？`
        : `How far is ${name} from the nearest BTS station?`,
      a: lang === "th"
        ? `โครงการนี้เดินเพียงประมาณ ${property.btsWalkMin} นาที จากสถานี BTS ${property.btsStation} เดินทางสะดวกทั่วกรุงเทพฯ`
        : lang === "zh"
        ? `该项目距离 BTS ${property.btsStation} 站步行约 ${property.btsWalkMin} 分钟，方便快捷到达曼谷各大核心区域。`
        : `This property is approximately ${property.btsWalkMin} minutes' walk from ${property.btsStation} BTS station, putting you directly on the Skytrain network for easy access across Bangkok. No car or motorbike needed for daily commuting.`,
    });
  } else if (property.mrtStation && property.mrtWalkMin) {
    faqs.push({
      q: lang === "th"
        ? `${name} อยู่ห่างจากสถานี MRT ที่ใกล้ที่สุดแค่ไหน?`
        : lang === "zh"
        ? `${name} 距离最近的地铁 (MRT) 站有多远？`
        : `How far is ${name} from the nearest MRT station?`,
      a: lang === "th"
        ? `โครงการนี้เดินเพียงประมาณ ${property.mrtWalkMin} นาที จากสถานี MRT ${property.mrtStation} เชื่อมต่อย่านธุรกิจหลัก`
        : lang === "zh"
        ? `该项目距离 MRT ${property.mrtStation} 站步行约 ${property.mrtWalkMin} 分钟，直达曼谷中央商务区。`
        : `This property is approximately ${property.mrtWalkMin} minutes' walk from ${property.mrtStation} MRT station. The Underground gives you direct access to Bangkok's central business district and key transfer points.`,
    });
  } else if (property.nearBts) {
    faqs.push({
      q: lang === "th"
        ? `${name} อยู่ใกล้สถานี BTS หรือ MRT หรือไม่?`
        : lang === "zh"
        ? `${name} 靠近轻轨或地铁站吗？`
        : `Is ${name} near a BTS or MRT station?`,
      a: lang === "th"
        ? `ใช่ โครงการนี้ตั้งอยู่ใกล้ระบบรถไฟฟ้า BTS เดินทางสะดวก`
        : lang === "zh"
        ? `是的，该项目靠近轻轨网络，出行十分便捷。`
        : `Yes, this property is located close to the BTS Skytrain network. Exact walking time to the station will be confirmed during your viewing — it is within easy commuting distance.`,
    });
  }

  // 3. Lease term
  if (property.listingType === "short_stay") {
    faqs.push({
      q: lang === "th"
        ? `ระยะเวลาเช่าขั้นต่ำสำหรับโครงการนี้คือเท่าไร?`
        : lang === "zh"
        ? `该房源的最短租赁期限是多少？`
        : `What is the minimum rental period for this property?`,
      a: lang === "th"
        ? `โครงการนี้เปิดให้เช่าระยะสั้น สัญญายืดหยุ่น 1 ถึง 3 เดือน เหมาะสำหรับผู้ที่ต้องการทดลองอยู่อาศัย`
        : lang === "zh"
        ? `该房源支持短租，提供 1 至 3 个月的灵活租期，非常适合数字游民或短居人士。`
        : `This property is listed as a short-stay, meaning flexible leases from 1 to 3 months are available. It is ideal for digital nomads, people trying out a neighbourhood before committing, or those on extended visits to Bangkok.`,
    });
  } else if (property.listingType === "rent") {
    faqs.push({
      q: lang === "th"
        ? `สัญญาเช่าขั้นต่ำที่ ${name} คือเท่าไร?`
        : lang === "zh"
        ? `${name} 的最短租期是多少？`
        : `What is the minimum lease term at ${name}?`,
      a: lang === "th"
        ? `สัญญาเช่าระยะยาวส่วนใหญ่ในกรุงเทพฯ คือ 6–12 เดือน โดยโครงการนี้แนะนำสัญญา 12 เดือน`
        : lang === "zh"
        ? `曼谷的大部分长租合同为 6 至 12 个月。该房源首选 12 个月租期。`
        : `Most long-term rental leases in Bangkok run for a minimum of 6–12 months. For this property, the preferred term is 12 months, though shorter leases may be available on request. Enquire directly and we will clarify the landlord's flexibility.`,
    });
  } else if (property.listingType === "sale") {
    faqs.push({
      q: lang === "th"
        ? `ชาวต่างชาติสามารถซื้อโครงการนี้ได้หรือไม่?`
        : lang === "zh"
        ? `外国买家可以购买此房源吗？`
        : `Can foreigners purchase this property?`,
      a: property.foreignQuota
        ? lang === "th"
          ? `ใช่ ยูนิตนี้มีโควต้าต่างชาติ (Foreign Quota) สามารถถือครองถือกรรมสิทธิ์ในนามชาวต่างชาติได้`
          : lang === "zh"
          ? `是的，该房源拥有外籍配额 (Foreign Quota)，外国买家可以在土地局合法实名过户永久产权。`
          : `Yes, this unit is available under foreign quota, meaning it can be purchased freehold by a non-Thai national. Foreign quota condos allow full ownership registered in your name at the Land Department.`
        : lang === "th"
          ? `โควต้าต่างชาติของยูนิตนี้อยู่ระหว่างการตรวจสอบ โปรดติดต่อเราเพื่อยืนยันสถานะโควต้า`
          : lang === "zh"
          ? `外籍配额待确认。我们建议您联系咨询，我们将在进行下一步前与开发商或业主确认。`
          : `Foreign quota availability for this unit has not been confirmed. We recommend enquiring and we will verify quota status with the developer or current owner before you proceed.`,
    });
  }

  // 4. Viewing — always shown last
  faqs.push({
    q: lang === "th"
      ? `ฉันจะนัดหมายเข้าชมโครงการนี้ได้อย่างไร?`
      : lang === "zh"
      ? `如何预约看房？`
      : `How do I book a viewing for this property?`,
    a: lang === "th"
      ? `กรอกแบบฟอร์มสอบถามในหน้านี้ แล้วเราจะยืนยันวันเวลานัดหมายเข้าชมภายใน 24 ชั่วโมง หรือขอชมวิดีโอผ่าน LINE / WhatsApp`
      : lang === "zh"
      ? `在当前页面填写咨询表单，我们将在工作日 24 小时内与您确认看房时间。也可以通过 LINE 或 WhatsApp 请求视频看房。`
      : `Fill in the enquiry form on this page and we will confirm a viewing within 24 hours on business days. Prefer a video walkthrough first? Request one via LINE or WhatsApp and we will arrange it with the landlord.`,
  });

  return faqs.slice(0, 4);
}

function ListingAccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: "#E5E0D8" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-3.5 text-left cursor-pointer bg-transparent border-none"
        aria-expanded={open}
      >
        <span
          className="text-[13px] font-semibold leading-snug"
          style={{ color: "#1A1A1A", fontFamily: "inherit" }}
        >
          {q}
        </span>
        <span
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200"
          style={{
            background: open ? "#1C3A2F" : "#EDE8DF",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 2v6M2 5h6"
              stroke={open ? "#F7F3EC" : "#1C3A2F"}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      {open && (
        <p className="pb-4 pr-8 text-[13px] leading-[1.75]" style={{ color: "#555555" }}>
          {a}
        </p>
      )}
    </div>
  );
}

interface Props {
  property: PropertyCard;
}

export default function ListingFaqBlock({ property }: Props) {
  const { lang, t } = useLanguage();
  const faqs = buildListingFaqs(property, lang);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="mt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div
        className="rounded-2xl px-4 md:px-5 pt-1 pb-1"
        style={{ background: "#F7F3EC", border: "1px solid #E5E0D8" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between py-3.5 border-b" style={{ borderColor: "#E5E0D8" }}>
          <span className="text-[12px] font-bold uppercase tracking-[1px]" style={{ color: "#1C3A2F" }}>
            {t.faq.commonQuestions}
          </span>
          <Link
            href="/faq"
            className="text-[11.5px] font-semibold no-underline transition-opacity hover:opacity-70"
            style={{ color: "#C9A84C" }}
          >
            {t.faq.seeFullFaq}
          </Link>
        </div>
        {faqs.map((faq) => (
          <ListingAccordionItem key={faq.q} {...faq} />
        ))}
      </div>
    </div>
  );
}
