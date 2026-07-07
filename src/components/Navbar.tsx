"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSaved } from "@/contexts/SavedContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/contexts/CurrencyContext";
import { LayoutDashboard, Heart, Settings, LogOut, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { count }                  = useSaved();
  const { lang, setLang, t }       = useLanguage();
  const { currency, setCurrency }  = useCurrency();
  const [menuOpen, setMenuOpen]    = useState(false);
  const [userMenu, setUserMenu]    = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [lookingForOpen, setLookingForOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [mobileCurrencyOpen, setMobileCurrencyOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      setTimeout(() => {
        setDiscoverOpen(false);
        setLookingForOpen(false);
        setMobileLangOpen(false);
        setMobileCurrencyOpen(false);
      }, 0);
    }
  }, [menuOpen]);

  const user      = session?.user;
  const initials  = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: "rgba(247,243,236,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid #E5E0D8" }}
      >
        {/* Mobile Logo: Logo Image + Name */}
        <Link href="/" className="flex md:hidden items-center gap-2 no-underline">
          <Image
            src="/images/nhp-logo.webp"
            alt="NHP Logo"
            width={30}
            height={30}
            priority
            className="object-contain rounded-[6px]"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[16px] font-extrabold tracking-[-0.5px]" style={{ color: "#1C3A2F" }}>New Home Property</span>
            <span className="text-[11px] font-bold tracking-[0.3px] mt-0.5" style={{ color: "#806414" }}>Live. Belong. Bangkok.</span>
          </div>
        </Link>

        {/* Desktop Logo: Logo Image + Name */}
        <Link href="/" className="hidden md:flex items-center gap-2.5 no-underline flex-shrink-0">
          <Image
            src="/images/nhp-logo.webp"
            alt="NHP Logo"
            width={38}
            height={38}
            priority
            className="object-contain rounded-[8px]"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold" style={{ color: "#1C3A2F" }}>New Home Property</span>
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.5px]" style={{ color: "#806414" }}>Live. Belong. Bangkok.</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-5 text-[13px] font-medium">
          <Link href="/"                      className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.home}</Link>
          <Link href="/explore"               className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.explore}</Link>
          <Link href="/swipe"                 className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.swipe}</Link>
          <Link href="/explore/match"         className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium flex items-center gap-1" style={{ color: "#1C3A2F", fontWeight: "bold" }}>
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Auto Finder</span>
          </Link>
          <Link href="/explore?type=sale"     className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.buy}</Link>
          <Link href="/explore?type=rent"     className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.rent}</Link>

          {/* Language toggle dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-bold cursor-pointer transition-all hover:bg-white/80 bg-transparent"
              style={{ borderColor: "#E5E0D8", color: "#1C3A2F", fontFamily: "inherit" }}
            >
              <span>{lang === "en" ? "EN" : lang === "th" ? "TH" : "中文"}</span>
              <svg className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {langMenuOpen && (
              <>
                {/* Click-outside backdrop */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setLangMenuOpen(false)} 
                />
                <div 
                  className="absolute right-0 mt-1.5 w-32 rounded-xl border p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}
                >
                  {(["en", "th", "zh"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg cursor-pointer text-[12px] font-semibold transition-colors hover:bg-[#F7F3EC] border-none"
                      style={{ 
                        background: lang === l ? "#1C3A2F" : "transparent", 
                        color: lang === l ? "#F7F3EC" : "#1C3A2F",
                        fontFamily: "inherit"
                      }}
                    >
                      {l === "en" ? "English" : l === "th" ? "ไทย (Thai)" : "中文 (Chinese)"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Mobile Right Icons (Heart & Chat) */}
          <div className="flex md:hidden items-center gap-4 mr-1">
            {/* Heart Icon */}
            <Link href="/saved" className="text-gray-700 hover:text-black transition-colors" aria-label="Saved properties">
              <svg className="w-[22px] h-[22px]" fill="none" stroke="#1C3A2F" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </Link>
            {/* Chat Icon removed */}
          </div>

          {/* Desktop Right Actions (Saved badge & Auth state) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Saved badge */}
            <Link
              href="/saved"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-full no-underline transition-all"
              style={count > 0 ? { background: "#1C3A2F", color: "#FFFFFF" } : { background: "transparent", color: "#1C3A2F" }}
            >
              <svg
                className="w-[18px] h-[18px] flex-shrink-0"
                fill={count > 0 ? "#FFFFFF" : "none"}
                stroke={count > 0 ? "#FFFFFF" : "#1C3A2F"}
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {count > 0 && (
                <span className="text-[12px] font-semibold">{count}</span>
              )}
            </Link>

            {/* Auth state */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "#EDE8DF" }} />
            ) : user ? (
              /* User avatar + dropdown */
              <div className="relative">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 cursor-pointer border-none bg-transparent p-0"
                >
                  {user.image ? (
                    <Image src={user.image} alt={user.name ?? ""} width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#1C3A2F", color: "#C9A84C" }}>
                      {initials}
                    </div>
                  )}
                  <span className="hidden md:block text-[13px] font-medium" style={{ color: "#1C3A2F" }}>
                    {user.name?.split(" ")[0]}
                  </span>
                </button>

                {userMenu && (
                  <div
                    className="absolute right-0 top-10 rounded-2xl shadow-xl overflow-hidden"
                    style={{ width: 200, background: "#FFFFFF", border: "1px solid #E5E0D8", zIndex: 60 }}
                    onMouseLeave={() => setUserMenu(false)}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid #EDE8DF" }}>
                      <p className="text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>{user.name}</p>
                      <p className="text-[11px]" style={{ color: "#999" }}>{user.email}</p>
                    </div>
                    {(session.user as { role?: string }).role === "agent" ? (
                      <Link href="/agent/dashboard" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                        <LayoutDashboard size={14} className="text-[#C9A84C]" />
                        Agent Dashboard
                      </Link>
                    ) : (
                      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                        <LayoutDashboard size={14} className="text-[#C9A84C]" />
                        My Dashboard
                      </Link>
                    )}
                    <Link href="/dashboard?tab=saved" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                      <Heart size={14} className="text-[#C9A84C]" />
                      Saved Properties
                      {count > 0 && <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>{count}</span>}
                    </Link>
                    <Link href="/dashboard?tab=settings" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                      <Settings size={14} className="text-[#C9A84C]" />
                      Settings
                    </Link>
                    {(session.user as { role?: string }).role === "admin" && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                        <Settings size={14} className="text-[#1C3A2F]" />
                        {t.nav.adminDashboard}
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] cursor-pointer border-none bg-transparent text-left transition-colors hover:bg-gray-50"
                      style={{ color: "#E05252", fontFamily: "inherit", borderTop: "1px solid #EDE8DF" }}
                    >
                      <LogOut size={14} className="text-[#E05252]" />
                      {t.nav.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not signed in */
              <Link
                href="/auth/signin"
                className="hidden md:inline-flex items-center px-3.5 py-[7px] rounded-lg text-xs font-medium no-underline transition-all"
                style={{ border: "1.5px solid #1C3A2F", color: "#1C3A2F" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#1C3A2F"; (e.currentTarget as HTMLAnchorElement).style.color = "#F7F3EC"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#1C3A2F"; }}
              >
                {t.nav.signIn}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer border-none bg-transparent"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <span className="block w-5 h-[2px] rounded-full transition-all duration-200" style={{ background: "#1C3A2F", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span className="block w-5 h-[2px] rounded-full transition-all duration-200" style={{ background: "#1C3A2F", opacity: menuOpen ? 0 : 1 }} />
            <span className="block w-5 h-[2px] rounded-full transition-all duration-200" style={{ background: "#1C3A2F", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 md:hidden" style={{ zIndex: 45 }} onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(28,58,47,0.4)", backdropFilter: "blur(4px)" }} />
          <div
            className="absolute top-14 left-0 right-0 flex flex-col py-2 shadow-2xl"
            style={{ background: "#F7F3EC", borderBottom: "1px solid #E5E0D8" }}
            onClick={(e) => e.stopPropagation()}
          >
            {pathname === "/dashboard" && user && (session.user as { role?: string }).role !== "agent" && (session.user as { role?: string }).role !== "admin" ? (
              <>
                {/* Home */}
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[15px] font-medium no-underline border-b"
                  style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                >
                  {t.nav.home}
                </Link>

                {/* My Dashboard */}
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center gap-2.5"
                  style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                >
                  <LayoutDashboard size={18} className="text-[#C9A84C]" />
                  <span>My Dashboard</span>
                </Link>

                {/* Saved Properties */}
                <Link
                  href="/dashboard?tab=saved"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center justify-between"
                  style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                >
                  <span className="flex items-center gap-2.5">
                    <Heart size={18} className="text-[#C9A84C]" />
                    <span>Saved Properties</span>
                  </span>
                  {count > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>{count}</span>}
                </Link>

                {/* Settings */}
                <Link
                  href="/dashboard?tab=settings"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[15px] font-medium no-underline flex items-center gap-2.5"
                  style={{ color: "#1C3A2F" }}
                >
                  <Settings size={18} className="text-[#C9A84C]" />
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <>
                {/* Home */}
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[15px] font-medium no-underline border-b"
                  style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                >
                  {t.nav.home}
                </Link>

                {/* Discover Collapsible Parent */}
                <div>
                  <button
                    onClick={() => setDiscoverOpen(!discoverOpen)}
                    className="w-full text-left px-5 py-3.5 text-[15px] font-medium border-b flex items-center justify-between cursor-pointer bg-transparent"
                    style={{ color: "#1C3A2F", borderColor: "#EDE8DF", fontFamily: "inherit" }}
                  >
                    <span>{t.nav.discover}</span>
                    <span
                      className="text-[10px] transition-transform duration-200"
                      style={{
                        color: "#1C3A2F",
                        transform: discoverOpen ? "rotate(180deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {discoverOpen && (
                    <div
                      className="flex flex-col bg-[rgba(28,58,47,0.03)] border-b transition-all"
                      style={{ borderColor: "#EDE8DF" }}
                    >
                      <Link
                        href="/explore"
                        onClick={() => setMenuOpen(false)}
                        className="pl-8 pr-5 py-3 text-[14px] font-medium no-underline"
                        style={{ color: "#1C3A2F" }}
                      >
                        {t.nav.explore}
                      </Link>
                      <Link
                        href="/swipe"
                        onClick={() => setMenuOpen(false)}
                        className="pl-8 pr-5 py-3 text-[14px] font-medium no-underline border-t"
                        style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                      >
                        {t.nav.swipe}
                      </Link>
                    </div>
                  )}
                </div>

                {/* I'm Looking For Collapsible Parent */}
                <div>
                  <button
                    onClick={() => setLookingForOpen(!lookingForOpen)}
                    className="w-full text-left px-5 py-3.5 text-[15px] font-medium border-b flex items-center justify-between cursor-pointer bg-transparent"
                    style={{ color: "#1C3A2F", borderColor: "#EDE8DF", fontFamily: "inherit" }}
                  >
                    <span>{t.nav.imLookingFor}</span>
                    <span
                      className="text-[10px] transition-transform duration-200"
                      style={{
                        color: "#1C3A2F",
                        transform: lookingForOpen ? "rotate(180deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {lookingForOpen && (
                    <div
                      className="flex flex-col bg-[rgba(28,58,47,0.03)] border-b transition-all"
                      style={{ borderColor: "#EDE8DF" }}
                    >
                      <Link
                        href="/explore?type=rent"
                        onClick={() => setMenuOpen(false)}
                        className="pl-8 pr-5 py-3 text-[14px] font-medium no-underline"
                        style={{ color: "#1C3A2F" }}
                      >
                        {t.nav.renting}
                      </Link>
                      <Link
                        href="/explore?type=sale"
                        onClick={() => setMenuOpen(false)}
                        className="pl-8 pr-5 py-3 text-[14px] font-medium no-underline border-t"
                        style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                      >
                        {t.nav.buying}
                      </Link>

                      <Link
                        href="/explore?pets=true"
                        onClick={() => setMenuOpen(false)}
                        className="pl-8 pr-5 py-3 text-[14px] font-medium no-underline border-t"
                        style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                      >
                        {t.nav.petFriendly}
                      </Link>
                    </div>
                  )}
                </div>
                {/* NHP Match Link */}
                <Link
                  href="/explore/match"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center justify-between"
                  style={{ color: "#1C3A2F", borderColor: "#EDE8DF", fontWeight: "bold" }}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                    <span>Auto Finder</span>
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>AI</span>
                </Link>

                {/* Mobile language toggle (collapsible dropdown) */}
                <div>
                  <button
                    onClick={() => setMobileLangOpen(!mobileLangOpen)}
                    className="w-full text-left px-5 py-3.5 text-[15px] font-medium border-b flex items-center justify-between cursor-pointer bg-transparent"
                    style={{ color: "#1C3A2F", borderColor: "#EDE8DF", fontFamily: "inherit" }}
                  >
                    <span className="flex items-center gap-2">
                      <span>{t.nav.language}</span>
                      <span className="text-[11px] font-normal text-gray-400">
                        ({lang === "en" ? "English" : lang === "th" ? "ไทย" : "中文"})
                      </span>
                    </span>
                    <span
                      className="text-[10px] transition-transform duration-200"
                      style={{
                        color: "#1C3A2F",
                        transform: mobileLangOpen ? "rotate(180deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {mobileLangOpen && (
                    <div
                      className="flex flex-col bg-[rgba(28,58,47,0.03)] border-b"
                      style={{ borderColor: "#EDE8DF" }}
                    >
                      {(["en", "th", "zh"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            setLang(l);
                            setMobileLangOpen(false);
                          }}
                          className="w-full text-left pl-8 pr-5 py-3 text-[14px] font-medium transition-colors hover:bg-black/5 bg-transparent border-none cursor-pointer"
                          style={{
                            color: lang === l ? "#1C3A2F" : "#666",
                            fontWeight: lang === l ? "bold" : "normal",
                            fontFamily: "inherit",
                          }}
                        >
                          {l === "en" ? "English" : l === "th" ? "ไทย (Thai)" : "中文 (Chinese)"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile currency toggle (collapsible dropdown) */}
                <div>
                  <button
                    onClick={() => setMobileCurrencyOpen(!mobileCurrencyOpen)}
                    className="w-full text-left px-5 py-3.5 text-[15px] font-medium border-b flex items-center justify-between cursor-pointer bg-transparent"
                    style={{ color: "#1C3A2F", borderColor: "#EDE8DF", fontFamily: "inherit" }}
                  >
                    <span className="flex items-center gap-2">
                      <span>Currency</span>
                      <span className="text-[11px] font-normal text-gray-400">
                        ({currency === "THB" ? "฿ THB" : currency === "USD" ? "$ USD" : currency === "EUR" ? "€ EUR" : "¥ CNY"})
                      </span>
                    </span>
                    <span
                      className="text-[10px] transition-transform duration-200"
                      style={{
                        color: "#1C3A2F",
                        transform: mobileCurrencyOpen ? "rotate(180deg)" : "rotate(0deg)",
                        display: "inline-block",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {mobileCurrencyOpen && (
                    <div
                      className="flex flex-col bg-[rgba(28,58,47,0.03)] border-b"
                      style={{ borderColor: "#EDE8DF" }}
                    >
                      {(["THB", "USD", "EUR", "CNY"] as const).map((curr) => (
                        <button
                          key={curr}
                          onClick={() => {
                            setCurrency(curr);
                            setMobileCurrencyOpen(false);
                          }}
                          className="w-full text-left pl-8 pr-5 py-3 text-[14px] font-medium transition-colors hover:bg-black/5 bg-transparent border-none cursor-pointer"
                          style={{
                            color: currency === curr ? "#1C3A2F" : "#666",
                            fontWeight: currency === curr ? "bold" : "normal",
                            fontFamily: "inherit",
                          }}
                        >
                          {curr === "THB" ? "฿ THB (Thai Baht)" : curr === "USD" ? "$ USD (US Dollar)" : curr === "EUR" ? "€ EUR (Euro)" : "¥ CNY (Chinese Yuan)"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {user && (
                  <>
                    {(session.user as { role?: string }).role === "agent" ? (
                      <Link href="/agent/dashboard" onClick={() => setMenuOpen(false)}
                        className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center gap-2.5"
                        style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}>
                        <LayoutDashboard size={18} className="text-[#C9A84C]" />
                        <span>Agent Dashboard</span>
                      </Link>
                    ) : (
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                        className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center gap-2.5"
                        style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}>
                        <LayoutDashboard size={18} className="text-[#C9A84C]" />
                        <span>My Dashboard</span>
                      </Link>
                    )}
                    <Link href="/dashboard?tab=saved" onClick={() => setMenuOpen(false)}
                      className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center justify-between"
                      style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}>
                      <span className="flex items-center gap-2.5">
                        <Heart size={18} className="text-[#C9A84C]" />
                        <span>Saved Properties</span>
                      </span>
                      {count > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>{count}</span>}
                    </Link>
                    <Link href="/dashboard?tab=settings" onClick={() => setMenuOpen(false)}
                      className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center gap-2.5"
                      style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}>
                      <Settings size={18} className="text-[#C9A84C]" />
                      <span>Settings</span>
                    </Link>
                  </>
                )}
                <div className="px-5 py-4 flex gap-3">
                  {user ? (
                    <button onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex-1 text-center py-3 rounded-xl text-sm font-semibold cursor-pointer border-none"
                      style={{ background: "#1C3A2F", color: "#F7F3EC", fontFamily: "inherit" }}>
                      {t.nav.signOut}
                    </button>
                  ) : (
                    <>
                      <Link href="/auth/signin" className="flex-1 text-center py-3 rounded-xl text-sm font-semibold no-underline" style={{ border: "1.5px solid #1C3A2F", color: "#1C3A2F" }}>{t.nav.signIn}</Link>
                      <Link href="/explore" className="flex-1 text-center py-3 rounded-xl text-sm font-semibold no-underline" style={{ background: "#1C3A2F", color: "#F7F3EC" }}>Browse</Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
