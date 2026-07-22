"use client";

import { useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/types/property";

function buildListingFaqs(property: PropertyCard): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const name = property.projectName || property.name;
  const area = property.area;

  // 1. Pet policy — highest conversion question
  if (property.houseRules?.pets === true || property.petFriendly) {
    faqs.push({
      q: `Is ${name} pet-friendly?`,
      a: `Yes, this property welcomes pets. Please mention your pet(s) when enquiring so we can confirm any size or breed restrictions with the landlord before your viewing.`,
    });
  } else if (property.houseRules?.pets === false) {
    faqs.push({
      q: `Are pets allowed at ${name}?`,
      a: `This property does not allow pets. If you have a pet, we can help you find other verified pet-friendly listings in ${area}. Contact us directly and we will match you with the right building.`,
    });
  } else {
    faqs.push({
      q: `Are pets allowed at ${name}?`,
      a: `The pet policy for this building has not been confirmed yet. When you enquire, let us know if you have a pet and we will check with the landlord directly before scheduling your viewing.`,
    });
  }

  // 2. Transit / BTS
  if (property.btsStation && property.btsWalkMin) {
    faqs.push({
      q: `How far is ${name} from the nearest BTS station?`,
      a: `This property is approximately ${property.btsWalkMin} minutes' walk from ${property.btsStation} BTS station, putting you directly on the Skytrain network for easy access across Bangkok. No car or motorbike needed for daily commuting.`,
    });
  } else if (property.mrtStation && property.mrtWalkMin) {
    faqs.push({
      q: `How far is ${name} from the nearest MRT station?`,
      a: `This property is approximately ${property.mrtWalkMin} minutes' walk from ${property.mrtStation} MRT station. The Underground gives you direct access to Bangkok's central business district and key transfer points.`,
    });
  } else if (property.nearBts) {
    faqs.push({
      q: `Is ${name} near a BTS or MRT station?`,
      a: `Yes, this property is located close to the BTS Skytrain network. Exact walking time to the station will be confirmed during your viewing — it is within easy commuting distance.`,
    });
  }

  // 3. Lease term
  if (property.listingType === "short_stay") {
    faqs.push({
      q: `What is the minimum rental period for this property?`,
      a: `This property is listed as a short-stay, meaning flexible leases from 1 to 3 months are available. It is ideal for digital nomads, people trying out a neighbourhood before committing, or those on extended visits to Bangkok.`,
    });
  } else if (property.listingType === "rent") {
    faqs.push({
      q: `What is the minimum lease term at ${name}?`,
      a: `Most long-term rental leases in Bangkok run for a minimum of 6–12 months. For this property, the preferred term is 12 months, though shorter leases may be available on request. Enquire directly and we will clarify the landlord's flexibility.`,
    });
  } else if (property.listingType === "sale") {
    faqs.push({
      q: `Can foreigners purchase this property?`,
      a: property.foreignQuota
        ? `Yes, this unit is available under foreign quota, meaning it can be purchased freehold by a non-Thai national. Foreign quota condos allow full ownership registered in your name at the Land Department.`
        : `Foreign quota availability for this unit has not been confirmed. We recommend enquiring and we will verify quota status with the developer or current owner before you proceed.`,
    });
  }

  // 4. Viewing — always shown last
  faqs.push({
    q: `How do I book a viewing for this property?`,
    a: `Fill in the enquiry form on this page and we will confirm a viewing within 24 hours on business days. Prefer a video walkthrough first? Request one via LINE or WhatsApp and we will arrange it with the landlord — perfect if you haven't arrived in Bangkok yet.`,
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
  const faqs = buildListingFaqs(property);

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
            Common Questions
          </span>
          <Link
            href="/faq"
            className="text-[11.5px] font-semibold no-underline transition-opacity hover:opacity-70"
            style={{ color: "#C9A84C" }}
          >
            See full FAQ →
          </Link>
        </div>
        {faqs.map((faq) => (
          <ListingAccordionItem key={faq.q} {...faq} />
        ))}
      </div>
    </div>
  );
}
