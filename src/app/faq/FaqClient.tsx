"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FAQ_CATEGORIES = [
  {
    id: "about",
    emoji: "🏠",
    label: "About New Homes Property",
    faqs: [
      {
        q: "Is New Homes Property a free service for renters?",
        a: "Yes, completely free for anyone searching for a property to rent. We are a Bangkok-based property platform that connects renters directly with verified landlords and agents. You pay nothing to browse listings, enquire, or arrange a viewing. Our service is funded by property owners and agents who list with us.",
        links: [{ text: "Browse all listings", href: "/explore" }],
      },
      {
        q: "Who runs New Homes Property and are you based in Bangkok?",
        a: "New Homes Property is a Bangkok-based property team with direct, on-the-ground knowledge of the local market. We are not a faceless aggregator — we personally verify listings, communicate with landlords, and support renters throughout the process. You can reach us via LINE, WhatsApp, or the enquiry form on any listing.",
        links: [{ text: "Learn about us", href: "/about" }],
      },
      {
        q: "How is New Homes Property different from other Bangkok property sites?",
        a: "Most Bangkok property portals list thousands of properties from anonymous sources, many of which are outdated or inaccurate. We focus on a curated selection of verified, active listings with detailed descriptions, real photos, and honest neighbourhood context written specifically for expats, digital nomads, and foreign buyers — not Thai-speaking locals.",
        links: [{ text: "Read neighbourhood guides", href: "/explore" }],
      },
    ],
  },
  {
    id: "verified",
    emoji: "✅",
    label: "Verified Listings",
    faqs: [
      {
        q: "How do you verify that listings are real and currently available?",
        a: "Every property on our site is checked directly with the landlord or listing agent before it goes live. We remove listings that have been taken or are no longer available. If you enquire on a listing and it has just been rented, we will tell you immediately and suggest alternatives.",
        links: [],
      },
      {
        q: "Are the photos on listings real and up to date?",
        a: "Yes. We only accept listings with current, genuine photos of the actual unit — not stock images or photos from a different floor. Many of our photos are taken by our team or sourced directly from the landlord. If you arrive at a viewing and the property does not match the photos, contact us immediately.",
        links: [],
      },
      {
        q: "Can I trust the price shown on a listing?",
        a: "The price shown is the asking price confirmed with the landlord or agent at the time of listing. Prices in Bangkok can occasionally be negotiated, especially for longer leases or direct landlord listings. We will always tell you if there is room to negotiate when you enquire.",
        links: [],
      },
      {
        q: "What does 'active listing' mean on your site?",
        a: "Active listings are properties confirmed available within the last 30 days. Properties marked as unlisted have been recently rented or taken off market. We update listing statuses regularly so you are never chasing unavailable properties.",
        links: [],
      },
    ],
  },
  {
    id: "finding",
    emoji: "🔍",
    label: "Finding & Matching Your Property",
    faqs: [
      {
        q: "How do I search for properties that match my exact needs?",
        a: "Use the filters on the Explore page to search by neighbourhood, number of bedrooms, price range, property type, and features like pet-friendly or short-stay availability. You can also use our AI Neighbourhood Match — just describe what you're looking for in plain English and it will match you with the most relevant listings instantly.",
        links: [
          { text: "Browse properties", href: "/explore" },
          { text: "Try AI Match", href: "/explore/match" },
        ],
      },
      {
        q: "I don't know Bangkok well — how do I choose the right neighbourhood?",
        a: "Our Neighbourhood Guides are written specifically for this. Each guide covers the lifestyle, cost of living, transit options, dining scene, and honest pros and cons of every major Bangkok area — from Thong Lo to On Nut to Ari. We recommend reading the guide for your top 2–3 areas before enquiring on listings.",
        links: [{ text: "Read neighbourhood guides", href: "/neighborhood/thong-lo" }],
      },
      {
        q: "Can you help me find a property if I can't find what I need on the site?",
        a: "Absolutely. Contact us via the enquiry form or LINE and describe what you need — budget, location, size, move-in date. Our team actively sources properties from our agent network, including off-market listings that are not yet on the website.",
        links: [],
      },
    ],
  },
  {
    id: "viewings",
    emoji: "📅",
    label: "Viewings & Moving In",
    faqs: [
      {
        q: "How do I arrange a viewing for a property I like?",
        a: "Click the 'Enquire' or 'Book a Viewing' button on any listing and fill in the short form. We will confirm your viewing within 24 hours on business days. For urgent requests, contact us directly via LINE or WhatsApp for same-day availability.",
        links: [{ text: "Browse listings", href: "/explore" }],
      },
      {
        q: "Can I do a virtual viewing or video call tour before visiting in person?",
        a: "Yes, for many properties we can arrange a video walkthrough via LINE or WhatsApp — especially useful for international renters who haven't arrived in Bangkok yet. Request this specifically in your enquiry and we will coordinate with the landlord.",
        links: [],
      },
      {
        q: "How long does it take from enquiry to moving in?",
        a: "The typical timeline is: viewing within 3–5 days of enquiry, lease signed within 1 week, move-in within 2–4 weeks. Some landlords can accommodate faster move-ins. Let us know your preferred date when enquiring and we will do our best to match it.",
        links: [],
      },
      {
        q: "What documents do I need to prepare before moving in?",
        a: "Most Bangkok landlords require a copy of your passport, a Thai visa or entry stamp, and 2–3 months deposit (usually 2 months deposit + 1 month advance rent). Some buildings also require a work permit or proof of income. We will send you a clear checklist once a viewing is confirmed.",
        links: [],
      },
    ],
  },
  {
    id: "pricing",
    emoji: "💰",
    label: "Pricing, Fees & Contracts",
    faqs: [
      {
        q: "Is there an agent fee or commission for renting through New Homes Property?",
        a: "For most rental listings, there is no fee charged to the renter. The agent or landlord covers our platform fee. For some premium or exclusive listings, a one-month commission may apply — this will always be stated clearly on the listing page before you enquire.",
        links: [],
      },
      {
        q: "How much deposit do Bangkok landlords typically require?",
        a: "The standard in Bangkok is 2 months security deposit plus 1 month advance rent — totalling 3 months upfront. Some luxury developments may require more. The deposit is held by the landlord and returned at the end of your lease, minus any deductions for damage.",
        links: [],
      },
      {
        q: "Can I negotiate the rent price?",
        a: "Yes, negotiation is common in Bangkok — especially for longer leases (12 months+), or if you are signing directly with the landlord. We are happy to help you negotiate. Generally, you can expect to negotiate 5–10% off the asking price on direct landlord listings.",
        links: [],
      },
      {
        q: "What currency are prices listed in and can I pay in USD or GBP?",
        a: "All prices are listed in Thai Baht (฿). Rent is almost always paid in Baht via bank transfer inside Thailand. If you are transferring money from abroad, services like Wise make it easy and cost-effective to convert and send funds. We can advise on payment setup once you confirm a property.",
        links: [],
      },
    ],
  },
  {
    id: "neighborhoods",
    emoji: "📍",
    label: "Neighbourhoods & Commute",
    faqs: [
      {
        q: "Which Bangkok neighbourhood is best for expats and digital nomads?",
        a: "It depends on your priorities. For cafes, walkability, and a creative community: Ari or Ekkamai. For nightlife, restaurants, and convenience: Thong Lo or Asok. For luxury near the CBD: Sathorn or Chidlom. For value near the BTS: On Nut or Phra Khanong. Read our neighbourhood guides for detailed, honest comparisons.",
        links: [
          { text: "Thong Lo guide", href: "/neighborhood/thong-lo" },
          { text: "On Nut guide", href: "/neighborhood/on-nut" },
          { text: "Ari guide", href: "/neighborhood/ari" },
        ],
      },
      {
        q: "How important is being near a BTS or MRT station in Bangkok?",
        a: "Very important. Bangkok traffic can be severe, and the Skytrain (BTS) and Underground (MRT) are the most reliable way to move around the city. We strongly recommend staying within 15 minutes walking distance of a station. All our listings show the exact walking time to the nearest BTS or MRT.",
        links: [],
      },
      {
        q: "Can I live in Bangkok comfortably without a car or motorbike?",
        a: "Yes — many expats live car-free in Bangkok. Areas like Asok, Thong Lo, On Nut, and Ari are all highly walkable with excellent BTS access, abundant food delivery (Grab Food, LINE MAN), and easy access to Grab taxis. A car is only really necessary in outer districts like Bang Na.",
        links: [],
      },
      {
        q: "Which neighbourhoods are best for families near international schools?",
        a: "Sathorn and Silom are close to Garden International School and Shrewsbury. Thong Lo and Sukhumvit are near Bangkok Prep and NIST. Bang Na is near Bangkok Patana School. Our neighbourhood guides cover school access for each area in detail.",
        links: [
          { text: "Sathorn guide", href: "/neighborhood/sathorn" },
          { text: "Thong Lo guide", href: "/neighborhood/thong-lo" },
          { text: "Bang Na guide", href: "/neighborhood/bang-na" },
        ],
      },
    ],
  },
];

const HOMEPAGE_FAQ_IDS = [
  { category: "about", q: "Is New Homes Property a free service for renters?" },
  { category: "verified", q: "How do you verify that listings are real and currently available?" },
  { category: "viewings", q: "How do I arrange a viewing for a property I like?" },
  { category: "neighborhoods", q: "Which Bangkok neighbourhood is best for expats and digital nomads?" },
  { category: "finding", q: "Can you help me find a property if I can't find what I need on the site?" },
];

function AccordionItem({ q, a, links }: { q: string; a: string; links: { text: string; href: string }[] }) {
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
          className="text-[14px] font-semibold leading-snug pr-2"
          style={{ color: "#1A1A1A", fontFamily: "inherit" }}
        >
          {q}
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200"
          style={{
            background: open ? "#1C3A2F" : "#EDE8DF",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke={open ? "#F7F3EC" : "#1C3A2F"} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-4 pr-10">
          <p className="text-[13.5px] leading-[1.75] mb-3" style={{ color: "#555555" }}>
            {a}
          </p>
          {links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold no-underline px-3 py-1.5 rounded-full transition-opacity hover:opacity-75"
                  style={{ background: "#1C3A2F", color: "#F7F3EC" }}
                >
                  {link.text}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 8L8 2M4 2h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const baseUrl = "https://newhomesproperty.com";

  // Build FAQPage JSON-LD
  const allFaqs = FAQ_CATEGORIES.flatMap((c) => c.faqs);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />
      <main style={{ background: "#F7F3EC", paddingTop: "56px", minHeight: "100vh" }}>
        {/* Hero */}
        <div
          className="px-4 py-12 md:py-16 text-center"
          style={{ background: "linear-gradient(135deg, #1C3A2F 0%, #254D3E 100%)" }}
        >
          <div className="max-w-2xl mx-auto">
            <span
              className="inline-block text-[11px] font-bold tracking-[1.5px] uppercase px-3 py-1.5 rounded-full mb-4"
              style={{ background: "rgba(201,168,76,0.2)", color: "#C9A84C" }}
            >
              Help Centre
            </span>
            <h1 className="text-[28px] md:text-[36px] font-bold leading-tight mb-3" style={{ color: "#F7F3EC" }}>
              Frequently Asked Questions
            </h1>
            <p className="text-[14.5px] leading-relaxed" style={{ color: "rgba(247,243,236,0.7)" }}>
              Everything you need to know about renting a condo in Bangkok through New Homes Property.
              Can't find your answer?{" "}
              <Link href="/about" className="underline" style={{ color: "#C9A84C" }}>
                Contact our team directly.
              </Link>
            </p>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category.id} className="mb-10">
              {/* Category heading */}
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-[20px]">{category.emoji}</span>
                <h2 className="text-[15px] font-bold uppercase tracking-[0.8px]" style={{ color: "#1C3A2F" }}>
                  {category.label}
                </h2>
              </div>
              {/* Accordion card */}
              <div
                className="rounded-2xl px-4 md:px-6"
                style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}
              >
                {category.faqs.map((faq) => (
                  <AccordionItem key={faq.q} {...faq} />
                ))}
              </div>
            </div>
          ))}

          {/* Still have questions CTA */}
          <div
            className="rounded-2xl p-6 md:p-8 text-center mt-6"
            style={{ background: "linear-gradient(135deg, #1C3A2F 0%, #254D3E 100%)" }}
          >
            <h3 className="text-[17px] font-bold mb-2" style={{ color: "#F7F3EC" }}>
              Still have a question?
            </h3>
            <p className="text-[13.5px] mb-5" style={{ color: "rgba(247,243,236,0.7)" }}>
              Our Bangkok-based team responds within a few hours on business days.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-full text-[13px] font-bold no-underline transition-opacity hover:opacity-90"
                style={{ background: "#C9A84C", color: "#1A1A1A" }}
              >
                Browse Listings
              </Link>
              <Link
                href="/about"
                className="px-5 py-2.5 rounded-full text-[13px] font-bold no-underline transition-opacity hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.12)", color: "#F7F3EC", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Export FAQ data for reuse on homepage and listing pages
export { FAQ_CATEGORIES, HOMEPAGE_FAQ_IDS };
