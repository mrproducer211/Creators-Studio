"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSaved } from "@/contexts/SavedContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { count }                  = useSaved();
  const { lang, setLang, t }       = useLanguage();
  const [menuOpen, setMenuOpen]    = useState(false);
  const [userMenu, setUserMenu]    = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [lookingForOpen, setLookingForOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      setDiscoverOpen(false);
      setLookingForOpen(false);
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
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
          <div className="rounded-[8px] flex items-center justify-center font-bold" style={{ width: "38px", height: "38px", fontSize: "15px", background: "#1C3A2F", color: "#C9A84C", letterSpacing: "-0.5px" }}>
            NHP
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold" style={{ color: "#1C3A2F" }}>New Home Property</span>
            <span className="text-[11px] font-medium" style={{ color: "#999" }}>Bangkok, Thailand</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-5 text-[13px] font-medium">
          <Link href="/"                      className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.home}</Link>
          <Link href="/explore"               className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.explore}</Link>
          <Link href="/swipe"                 className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.swipe}</Link>
          <Link href="/reels"                 className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.reels}</Link>
          <Link href="/explore?type=sale"     className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.buy}</Link>
          <Link href="/explore?type=rent"     className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.rent}</Link>
          <Link href="/explore?type=short_stay" className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.shortStay}</Link>

          {/* Language toggle */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1.5px solid #E5E0D8" }}>
            {(["en", "th"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="cursor-pointer border-none text-[11px] font-bold transition-all"
                style={{
                  padding: "4px 10px",
                  background: lang === l ? "#1C3A2F" : "transparent",
                  color:      lang === l ? "#F7F3EC" : "#888",
                  fontFamily: "inherit",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Saved badge */}
          <Link
            href="/saved"
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-full no-underline transition-all"
            style={count > 0 ? { background: "#1C3A2F", color: "#FFFFFF" } : { background: "transparent", color: "#1C3A2F" }}
          >
            <span className="text-sm">❤️</span>
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
                  <img src={user.image} alt={user.name ?? ""} className="w-8 h-8 rounded-full object-cover" />
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
                  <Link href="/saved" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                    ❤️ {t.nav.saved}
                    {count > 0 && <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>{count}</span>}
                  </Link>
                  {(session.user as { role?: string }).role === "admin" && (
                    <Link href="/admin" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                      ⚙️ {t.nav.adminDashboard}
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] cursor-pointer border-none bg-transparent text-left transition-colors hover:bg-gray-50"
                    style={{ color: "#E05252", fontFamily: "inherit", borderTop: "1px solid #EDE8DF" }}
                  >
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
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(28,58,47,0.4)", backdropFilter: "blur(4px)" }} />
          <div
            className="absolute top-14 left-0 right-0 flex flex-col py-2 shadow-2xl"
            style={{ background: "#F7F3EC", borderBottom: "1px solid #E5E0D8" }}
            onClick={(e) => e.stopPropagation()}
          >
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
                  <Link
                    href="/reels"
                    onClick={() => setMenuOpen(false)}
                    className="pl-8 pr-5 py-3 text-[14px] font-medium no-underline border-t"
                    style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                  >
                    {t.nav.reels}
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
                    href="/explore?type=short_stay"
                    onClick={() => setMenuOpen(false)}
                    className="pl-8 pr-5 py-3 text-[14px] font-medium no-underline border-t"
                    style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}
                  >
                    {t.nav.shortStay}
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

            {/* Mobile language toggle */}
            <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #EDE8DF" }}>
              <span className="text-[12px]" style={{ color: "#999" }}>{t.nav.language}</span>
              <div className="flex items-center rounded-lg overflow-hidden ml-auto" style={{ border: "1.5px solid #E5E0D8" }}>
                {(["en", "th"] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className="cursor-pointer border-none text-[11px] font-bold"
                    style={{ padding: "5px 12px", background: lang === l ? "#1C3A2F" : "transparent", color: lang === l ? "#F7F3EC" : "#888", fontFamily: "inherit" }}
                  >{l.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {user && (
              <Link href="/saved" onClick={() => setMenuOpen(false)}
                className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center justify-between"
                style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}>
                <span className="flex items-center gap-1.5">❤️ {t.nav.saved}</span>
                {count > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>{count}</span>}
              </Link>
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
          </div>
        </div>
      )}
    </>
  );
}
