import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Compass, TrainFront, Palmtree, Handshake } from "lucide-react";

export const metadata = {
  title: "About NHP Bangkok — Discover Your Neighbourhood Vibe",
  description: "Learn how New Home Property (NHP) Bangkok connects travelers, expats, and visitors to the perfect neighbourhoods that match their lifestyles.",
};

export default function AboutPage() {
  const values = [
    { icon: <Compass className="w-6 h-6" style={{ color: "#C9A84C" }} />, title: "Neighbourhood Matching", desc: "We map properties based on local lifestyle vibes. Find locations suited to quiet coffee shops, active street markets, or premium nightlife nodes." },
    { icon: <TrainFront className="w-6 h-6" style={{ color: "#C9A84C" }} />, title: "Transit-Oriented Precision", desc: "No more guessing your commute. We calculate direct walking and transit times to BTS and MRT stations for every single listing." },
    { icon: <Palmtree className="w-6 h-6" style={{ color: "#C9A84C" }} />, title: "Traveler-Centric Experience", desc: "Designed for digital nomads, expats, and visitors who want to experience the authentic soul of Bangkok, not just rent a room." },
    { icon: <Handshake className="w-6 h-6" style={{ color: "#C9A84C" }} />, title: "Instant Messaging Setup", desc: "Connect instantly with local support, agents, and properties via WhatsApp and Line for a stress-free transition." },
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", minHeight: "100vh" }}>
        
        {/* Header Hero Banner */}
        <div className="px-4 py-16 text-center" style={{ background: "#1C3A2F" }}>
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[1px] uppercase mb-4" style={{ background: "#C9A84C", color: "#1C3A2F" }}>
              Our Philosophy
            </span>
            <h1 className="text-[28px] md:text-[38px] font-bold leading-tight mb-4 text-white" style={{ letterSpacing: "-0.5px" }}>
              Live. Belong. Bangkok.
            </h1>
            <p className="text-[14px] md:text-[16px] font-light max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Helping travelers, digital nomads, and visitors discover the perfect Bangkok neighbourhood that matches their unique lifestyle for a richer experience in Thailand.
            </p>
          </div>
        </div>

        {/* Narrative / Context */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-2xl p-6 md:p-8 mb-8 border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
            <h2 className="text-[18px] md:text-[22px] font-bold mb-4" style={{ color: "#1C3A2F" }}>
              Connecting You to Bangkok’s Soul
            </h2>
            <p className="text-[14px] leading-[1.8] text-gray-600 font-light mb-4">
              Bangkok is a spectacular metropolis, but it is also a collection of distinct urban villages. A street in Ari has a completely different energy than an alley in Thong Lo, a high-rise sector in Asok, or a residential block in On Nut. Choosing where you stay defines your daily experience.
            </p>
            <p className="text-[14px] leading-[1.8] text-gray-600 font-light mb-4">
              We founded NHP because conventional property search engines fail travelers. Outdated prices, false locations, and generic filters make finding a home exhausting. We wanted to build a platform that focuses on neighbourhood vibes, transit proximity, and lifestyle fit.
            </p>
            <p className="text-[14px] leading-[1.8] text-gray-600 font-light">
              By mapping local hotspots, compiling transit travel-times, and showcasing properties with dynamic client swipe-decks, we enable international visitors to locate their perfect base. We don&apos;t just find you an apartment—we find you your community.
            </p>
          </div>

          {/* Core Values Grid */}
          <h2 className="text-[18px] font-bold text-center mb-6" style={{ color: "#1C3A2F" }}>
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl p-5 border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
                <div className="mb-2.5">{v.icon}</div>
                <h3 className="text-[14px] font-bold mb-1" style={{ color: "#1C3A2F" }}>{v.title}</h3>
                <p className="text-[12px] font-light leading-[1.6] text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="rounded-2xl p-8 text-center" style={{ background: "#1C3A2F" }}>
            <h3 className="text-[18px] font-bold mb-2 text-white">Find your lifestyle fit in Bangkok</h3>
            <p className="text-[13px] font-light mb-5 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
              Filter by budget, transit proximity, and local vibes to match your travel needs.
            </p>
            <a href="/explore" className="inline-block px-6 py-3 rounded-xl text-[13px] font-semibold no-underline" style={{ background: "#C9A84C", color: "#1C3A2F" }}>
              Explore Neighbourhoods →
            </a>
          </div>

        </div>

      </main>
      <Footer />
    </>
  );
}
