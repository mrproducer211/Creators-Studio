import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About NHP Bangkok — Premium Property Platform",
  description: "Learn about New Home Property (NHP) Bangkok, the leading real estate platform for expats, digital nomads, and international residents.",
};

export default function AboutPage() {
  const values = [
    { icon: "✨", title: "Transparency First", desc: "No hidden fees, no fake pricing. We check all listing data to ensure accuracy before publishing." },
    { icon: "🚇", title: "Transit Oriented", desc: "We map every single property against Bangkok's BTS and MRT grids so you know your commute beforehand." },
    { icon: "📱", title: "Modern Interaction", desc: "Swipe through cards or browse property reels to discover homes in a visual, responsive way." },
    { icon: "🤝", title: "Expat-Friendly Support", desc: "Our support agents speak perfect English and understand the relocation nuances of moving to Thailand." },
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", minHeight: "100vh" }}>
        
        {/* Header Hero Banner */}
        <div className="px-4 py-16 text-center" style={{ background: "#1C3A2F" }}>
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[1px] uppercase mb-4" style={{ background: "#C9A84C", color: "#1C3A2F" }}>
              Our Story
            </span>
            <h1 className="text-[28px] md:text-[38px] font-bold leading-tight mb-4 text-white" style={{ letterSpacing: "-0.5px" }}>
              About New Home Property
            </h1>
            <p className="text-[14px] md:text-[16px] font-light max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Bangkok&apos;s premium property platform designed specifically to make renting, buying, and staying in Thailand completely effortless for the international community.
            </p>
          </div>
        </div>

        {/* Narrative / Context */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-2xl p-6 md:p-8 mb-8 border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
            <h2 className="text-[18px] md:text-[22px] font-bold mb-4" style={{ color: "#1C3A2F" }}>
              Why We Built NHP
            </h2>
            <p className="text-[14px] leading-[1.8] text-gray-600 font-light mb-4">
              Finding an apartment in a foreign city is notoriously stressful. False listings, outdated prices, language barriers, and complicated lease terms make settling down difficult. We founded NHP to solve these exact frustrations.
            </p>
            <p className="text-[14px] leading-[1.8] text-gray-600 font-light mb-4">
              We combined high-quality photography, automated transit walk calculations, interactive swipe decks, and instant messaging connections (WhatsApp, Line) to construct a real estate search engine that feels alive, intuitive, and trustworthy.
            </p>
            <p className="text-[14px] leading-[1.8] text-gray-600 font-light">
              Whether you are a digital nomad booking a short stay in Thong Lo, an expat signing a 12-month lease in On Nut, or a family enrolling children near Bangkok&apos;s top international schools, NHP is your trusted guide.
            </p>
          </div>

          {/* Core Values Grid */}
          <h2 className="text-[18px] font-bold text-center mb-6" style={{ color: "#1C3A2F" }}>
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl p-5 border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
                <span className="text-2xl block mb-2">{v.icon}</span>
                <h3 className="text-[14px] font-bold mb-1" style={{ color: "#1C3A2F" }}>{v.title}</h3>
                <p className="text-[12px] font-light leading-[1.6] text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="rounded-2xl p-8 text-center" style={{ background: "#1C3A2F" }}>
            <h3 className="text-[18px] font-bold mb-2 text-white">Find your next home in Bangkok</h3>
            <p className="text-[13px] font-light mb-5 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
              Filter by budget, transit proximity, and pet-friendly policies to see what fits your lifestyle.
            </p>
            <a href="/explore" className="inline-block px-6 py-3 rounded-xl text-[13px] font-semibold no-underline" style={{ background: "#C9A84C", color: "#1C3A2F" }}>
              Explore Properties →
            </a>
          </div>

        </div>

      </main>
      <Footer />
    </>
  );
}
