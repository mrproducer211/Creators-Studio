"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PropertyCard } from "@/types/property";
import { useLanguage } from "@/contexts/LanguageContext";
import MiniPropertyCard from "./MiniPropertyCard";
import { 
  User, 
  Map, 
  Home, 
  Compass, 
  School, 
  ShoppingBag, 
  Trees,
  ArrowRight
} from "lucide-react";

// Dynamically load MiniMap to prevent SSR leaflet window reference errors
const MiniMap = dynamic(() => import("./MiniMap"), { ssr: false });

export default function DiscoveryGrid({ featuredProperty }: { featuredProperty: PropertyCard }) {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-16 w-full" style={{ background: "#FAF8F5" }}>
      <div className="w-full px-4 md:px-6">
        
        {/* Section Header */}
        <div className="mb-8 text-left">
          <span 
            className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5 block" 
            style={{ color: "#C9A84C" }}
          >
            {t.discoveryGrid.label}
          </span>
          <h2 
            className="text-[20px] md:text-[24px] font-bold leading-[1.3] mb-2" 
            style={{ color: "#1C3A2F", letterSpacing: "-0.3px" }}
          >
            {t.discoveryGrid.title}
          </h2>
          <p 
            className="text-[12.5px] md:text-[13px] font-light leading-relaxed max-w-[620px]" 
            style={{ color: "rgba(28, 58, 47, 0.7)" }}
          >
            {t.discoveryGrid.subtitle}
          </p>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-[#EDE8DF] p-1 rounded-full mb-6 w-full max-w-[440px] mx-auto border" style={{ borderColor: "#E5E0D8" }}>
          <button
            onClick={() => setActiveTab(0)}
            className={`flex-1 py-2 px-3 rounded-full text-[11px] font-bold transition-all duration-300 ${
              activeTab === 0 ? "bg-[#1C3A2F] text-white shadow-sm" : "text-[#1C3A2F]/80 hover:text-[#1C3A2F]"
            }`}
          >
            {t.discoveryGrid.tabs.card1}
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-2 px-3 rounded-full text-[11px] font-bold transition-all duration-300 ${
              activeTab === 1 ? "bg-[#1C3A2F] text-white shadow-sm" : "text-[#1C3A2F]/80 hover:text-[#1C3A2F]"
            }`}
          >
            {t.discoveryGrid.tabs.card2}
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`flex-1 py-2 px-3 rounded-full text-[11px] font-bold transition-all duration-300 ${
              activeTab === 2 ? "bg-[#1C3A2F] text-white shadow-sm" : "text-[#1C3A2F]/80 hover:text-[#1C3A2F]"
            }`}
          >
            {t.discoveryGrid.tabs.card3}
          </button>
        </div>

        {/* 12-Column Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Match Your Lifestyle (Tall Left Card) */}
          <div
            className={`bg-[#FDFCF9] rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative p-6 md:p-8 lg:col-span-5 flex flex-col justify-between ${
              activeTab === 0 ? "flex min-h-[420px] md:min-h-[460px]" : "hidden lg:flex lg:h-[480px]"
            }`}
            style={{ borderColor: "#E5E0D8" }}
          >
            {/* Top Avatar badge & Text Content */}
            <div className="z-10 max-w-[62%] sm:max-w-[55%] flex flex-col h-full justify-between">
              <div className="flex flex-col gap-2">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center mb-3 shadow-sm" 
                  style={{ backgroundColor: "#B59E7A" }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[1.5px] text-gold">
                  {t.discoveryGrid.card1.tag}
                </span>
                
                <h3
                  className="text-[19px] md:text-[22px] font-extrabold leading-[1.25] text-forest"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  {t.discoveryGrid.card1.title}
                </h3>
                
                <p className="text-[11.5px] md:text-[12px] leading-relaxed font-light text-forest/75">
                  {t.discoveryGrid.card1.desc}
                </p>
              </div>

              <div className="mt-4 sm:mt-6">
                <Link
                  href="/explore/match"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[11px] font-bold transition-all duration-300 text-white bg-forest hover:bg-forest-mid hover:scale-[1.02] active:scale-95 shadow-sm no-underline mb-3.5 sm:mb-5"
                >
                  {t.discoveryGrid.card1.button} <ArrowRight className="ml-1.5 w-3.5 h-3.5 font-bold" />
                </Link>

                {/* Social Proof Avatars */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                      alt="User avatar"
                      className="w-7 h-7 rounded-full border-2 border-[#FDFCF9] object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
                      alt="User avatar"
                      className="w-7 h-7 rounded-full border-2 border-[#FDFCF9] object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                      alt="User avatar"
                      className="w-7 h-7 rounded-full border-2 border-[#FDFCF9] object-cover"
                    />
                  </div>
                  <span className="text-[10px] sm:text-[10.5px] font-semibold text-forest/80 leading-tight">
                    {t.discoveryGrid.card1.matchedText}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Portrait Image (Live clean Arisa photo) */}
            <img
              src="/images/arisa_phone_live.png"
              alt="Arisa"
              className="absolute bottom-0 right-0 h-[82%] sm:h-[86%] w-auto max-w-[44%] sm:max-w-[48%] object-contain object-bottom select-none pointer-events-none z-0"
            />
          </div>

          {/* Right Column Stack (Cards 2 & 3) */}
          <div 
            className={`lg:col-span-7 flex flex-col gap-6 ${
              activeTab !== 0 ? "flex" : "hidden lg:flex"
            }`}
          >
            
            {/* Card 2: Explore the Map (Top-Right Stack Card) */}
            <div
              className={`bg-[#FDFCF9] rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-12 ${
                activeTab === 1 ? "flex min-h-[440px] md:min-h-[228px]" : "hidden lg:grid lg:h-[228px]"
              }`}
              style={{ borderColor: "#E5E0D8" }}
            >
              {/* Left Column content */}
              <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between z-10 h-full">
                <div className="flex flex-col gap-2">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" 
                    style={{ backgroundColor: "#1C3A2F" }}
                  >
                    <Map className="w-5 h-5 text-white" />
                  </div>
                  
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[1.5px] text-gold mt-1">
                    {t.discoveryGrid.card2.tag}
                  </span>
                  
                  <h3 className="text-[17px] md:text-[19px] font-bold text-forest leading-snug">
                    {t.discoveryGrid.card2.title}
                  </h3>
                  
                  <p className="text-[11px] md:text-[11.5px] leading-relaxed font-light text-forest/75">
                    {t.discoveryGrid.card2.desc}
                  </p>
                </div>

                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full text-[11px] font-bold transition-all duration-300 text-forest bg-white border border-forest hover:bg-forest hover:text-white hover:scale-[1.02] active:scale-95 shadow-sm no-underline self-start mt-4"
                >
                  {t.discoveryGrid.card2.button} <ArrowRight className="ml-1.5 w-3 h-3 font-bold" />
                </Link>
              </div>

              {/* Right Column: Live Map Container */}
              <div className="md:col-span-5 h-[240px] md:h-auto border-t md:border-t-0 md:border-l relative overflow-hidden bg-white flex-shrink-0" style={{ borderColor: "#E5E0D8" }}>
                <MiniMap />

                {/* Floating Category Tag Bar */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-md rounded-xl p-1.5 flex items-center justify-between border border-white/60 shadow-sm overflow-x-auto no-scrollbar gap-1.5 z-[1000]">
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-forest flex-shrink-0">
                    <Compass className="w-2.5 h-2.5 text-gold" />
                    <span>{t.discoveryGrid.card2.tags.access}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-forest flex-shrink-0">
                    <School className="w-2.5 h-2.5 text-gold" />
                    <span>{t.discoveryGrid.card2.tags.intlSchools}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-forest flex-shrink-0">
                    <ShoppingBag className="w-2.5 h-2.5 text-gold" />
                    <span>{t.discoveryGrid.card2.tags.shopping}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-semibold text-forest flex-shrink-0">
                    <Trees className="w-2.5 h-2.5 text-gold" />
                    <span>{t.discoveryGrid.card2.tags.greenSpaces}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Card 3: Discover Homes (Bottom-Right Stack Card) */}
            <div
              className={`bg-[#FDFCF9] rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-12 ${
                activeTab === 2 ? "flex min-h-[440px] md:min-h-[228px]" : "hidden lg:grid lg:h-[228px]"
              }`}
              style={{ borderColor: "#E5E0D8" }}
            >
              {/* Left Column content */}
              <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between z-10 h-full">
                <div className="flex flex-col gap-2">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" 
                    style={{ backgroundColor: "#1C3A2F" }}
                  >
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[1.5px] text-gold mt-1">
                    {t.discoveryGrid.card3.tag}
                  </span>
                  
                  <h3 className="text-[17px] md:text-[19px] font-bold text-forest leading-snug">
                    {t.discoveryGrid.card3.title}
                  </h3>
                  
                  <p className="text-[11px] md:text-[11.5px] leading-relaxed font-light text-forest/75">
                    {t.discoveryGrid.card3.desc}
                  </p>
                </div>

                <Link
                  href="/explore?featured=true"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full text-[11px] font-bold transition-all duration-300 text-white bg-forest hover:bg-forest-mid hover:scale-[1.02] active:scale-95 shadow-sm no-underline self-start mt-4"
                >
                  {t.discoveryGrid.card3.button} <ArrowRight className="ml-1.5 w-3 h-3 font-bold" />
                </Link>
              </div>

              {/* Right Column Live Mini Property Listing Card */}
              <div className="md:col-span-5 relative bg-[#FDFCF9] border-t md:border-t-0 md:border-l p-1 flex items-center justify-center overflow-hidden flex-shrink-0" style={{ borderColor: "#E5E0D8" }}>
                <MiniPropertyCard property={featuredProperty} />
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
