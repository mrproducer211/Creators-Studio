import React from "react";
import { BookOpen, CheckCircle2, HelpCircle } from "lucide-react";

export interface GuideSection {
  heading: string;
  text: string;
  list?: string[];
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface SeoCategoryGuideProps {
  title: string;
  subtitle?: string;
  badge?: string;
  sections: GuideSection[];
  faq?: GuideFaq[];
  canonicalUrl?: string;
}

export default function SeoCategoryGuide({
  title,
  subtitle,
  badge = "Expat & Nomad Guide",
  sections,
  faq,
}: SeoCategoryGuideProps) {
  const faqJsonLd = faq && faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  } : null;

  return (
    <section className="w-full py-12 md:py-16 border-t" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Header Badge & Title */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ background: "rgba(28, 58, 47, 0.08)", color: "#1C3A2F" }}>
            <BookOpen className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
            <span>{badge}</span>
          </div>
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#1C3A2F] leading-tight mb-3" style={{ letterSpacing: "-0.5px" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-[14px] md:text-[15px] text-gray-600 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className="p-6 md:p-7 rounded-2xl border transition-shadow hover:shadow-sm"
              style={{ background: "#F7F3EC", borderColor: "#EDE8DF" }}
            >
              <h3 className="text-[17px] font-bold text-[#1C3A2F] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: "#C9A84C" }} />
                {sec.heading}
              </h3>
              <p className="text-[13px] md:text-[14px] text-gray-700 leading-relaxed font-light mb-4">
                {sec.text}
              </p>
              {sec.list && sec.list.length > 0 && (
                <ul className="space-y-2 mt-3 pt-3 border-t border-[#E5E0D8]">
                  {sec.list.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2 text-[13px] text-gray-700 font-light">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#1C3A2F" }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Frequently Asked Questions Section */}
        {faq && faq.length > 0 && (
          <div className="mt-12 pt-10 border-t" style={{ borderColor: "#E5E0D8" }}>
            <div className="flex items-center justify-center gap-2 mb-8">
              <HelpCircle className="w-5 h-5 text-[#C9A84C]" />
              <h3 className="text-[20px] md:text-[24px] font-bold text-[#1C3A2F]">
                Frequently Asked Questions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faq.map((item, fIdx) => (
                <div
                  key={fIdx}
                  className="p-6 rounded-2xl border"
                  style={{ background: "#F7F3EC", borderColor: "#EDE8DF" }}
                >
                  <h4 className="text-[15px] font-bold text-[#1C3A2F] mb-2 leading-snug">
                    {item.question}
                  </h4>
                  <p className="text-[13px] text-gray-600 font-light leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
