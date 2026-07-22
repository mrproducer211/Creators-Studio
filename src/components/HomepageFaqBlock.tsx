"use client";

import { useState } from "react";
import Link from "next/link";

const HOMEPAGE_FAQS = [
  {
    q: "Is New Homes Property a free service for renters?",
    a: "Yes, completely free. You pay nothing to browse listings, enquire, or arrange a viewing. Our platform is funded by landlords and agents who list with us — not by renters.",
  },
  {
    q: "Are all listings verified and currently available?",
    a: "Yes. Every property is confirmed directly with the landlord or agent before going live. We actively remove rented or unavailable listings so you never waste time chasing a property that's already gone.",
  },
  {
    q: "How do I arrange a property viewing?",
    a: "Click 'Enquire' or 'Book a Viewing' on any listing and fill in the short form. We confirm viewings within 24 hours on business days. Virtual video tours via LINE or WhatsApp are also available on request.",
  },
  {
    q: "Do I need to speak Thai to rent a condo in Bangkok?",
    a: "Not at all. Our team communicates in English and handles all coordination with Thai-speaking landlords on your behalf. Lease agreements can also be provided in English.",
  },
  {
    q: "Can I find short-term rentals of 1–3 months on this site?",
    a: "Yes. Filter listings by 'Short Stay' to find properties available on flexible 1–3 month leases — perfect for digital nomads, trial periods before committing to a longer lease, or extended visits to Bangkok.",
    link: { text: "Browse short stays", href: "/explore?type=short_stay" },
  },
];

function HomepageAccordionItem({
  q,
  a,
  link,
}: {
  q: string;
  a: string;
  link?: { text: string; href: string };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b last:border-b-0 transition-colors"
      style={{ borderColor: "#E5E0D8" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer bg-transparent border-none"
        aria-expanded={open}
      >
        <span
          className="text-[13.5px] font-semibold leading-snug"
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
        <div className="pb-4 pr-8">
          <p className="text-[13px] leading-[1.75] mb-2" style={{ color: "#555555" }}>
            {a}
          </p>
          {link && (
            <Link
              href={link.href}
              className="inline-flex items-center gap-1 text-[12px] font-semibold no-underline transition-opacity hover:opacity-75"
              style={{ color: "#1C3A2F" }}
            >
              {link.text}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 8L8 2M4 2h4v4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomepageFaqBlock() {
  // FAQPage schema for homepage block
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <section className="px-4 py-10 md:py-14" style={{ background: "#F7F3EC" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-2xl mx-auto">
        {/* Section header */}
        <div className="mb-6">
          <span
            className="inline-block text-[11px] font-bold tracking-[1.5px] uppercase mb-2"
            style={{ color: "#C9A84C" }}
          >
            Quick Answers
          </span>
          <h2 className="text-[22px] md:text-[26px] font-bold leading-tight" style={{ color: "#1A1A1A" }}>
            Questions people ask us
          </h2>
        </div>

        {/* Accordion card */}
        <div
          className="rounded-2xl px-4 md:px-6 mb-5"
          style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
        >
          {HOMEPAGE_FAQS.map((faq) => (
            <HomepageAccordionItem key={faq.q} {...faq} />
          ))}
        </div>

        {/* See all link */}
        <Link
          href="/faq"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold no-underline transition-opacity hover:opacity-70"
          style={{ color: "#1C3A2F" }}
        >
          See all frequently asked questions
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 9.5L9.5 2.5M5 2.5h4.5v4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
