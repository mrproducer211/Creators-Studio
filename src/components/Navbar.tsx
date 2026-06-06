"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSaved } from "@/contexts/SavedContext";
import { useLanguage } from "@/contexts/LanguageContext";

const NAV_LINKS = [
  { href: "/explore",                  label: "Explore" },
  { href: "/swipe",                    label: "♥ Swipe" },
  { href: "/reels",                    label: "▶ Reels" },
  { href: "/explore?type=sale",        label: "Buy" },
  { href: "/explore?type=rent",        label: "Rent" },
  { href: "/explore?type=short_stay",  label: "Short Stay" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const { count }                  = useSaved();
  const { lang, setLang, t }       = useLanguage();
  const [menuOpen, setMenuOpen]    = useState(false);
  const [userMenu, setUserMenu]    = useState(false);

  const user      = session?.user;
  const initials  = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: "rgba(247,243,236,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid #E5E0D8" }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
          <div className="rounded-[8px] flex items-center justify-center font-bold" style={{ width: "38px", height: "38px", fontSize: "15px", background: "#1C3A2F", color: "#C9A84C", letterSpacing: "-0.5px" }}>
            NHP
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold" style={{ color: "#1C3A2F" }}>New Home Property</span>
            <span className="text-[11px] font-medium" style={{ color: "#999" }}>Bangkok, Thailand</span>
          </div>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-5 text-[13px] font-medium">
          <a href="/"                      className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.home}</a>
          <a href="/explore"               className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.explore}</a>
          <a href="/swipe"                 className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.swipe}</a>
          <a href="/reels"                 className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.reels}</a>
          <a href="/explore?type=sale"     className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.buy}</a>
          <a href="/explore?type=rent"     className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.rent}</a>
          <a href="/explore?type=short_stay" className="no-underline transition-opacity hover:opacity-60 text-[13px] font-medium" style={{ color: "#1C3A2F" }}>{t.nav.shortStay}</a>

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
          <a
            href="/saved"
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-full no-underline transition-all"
            style={count > 0 ? { background: "#1C3A2F", color: "#FFFFFF" } : { background: "transparent", color: "#1C3A2F" }}
          >
            <span className="text-sm">❤️</span>
            {count > 0 && (
              <span className="text-[12px] font-semibold">{count}</span>
            )}
          </a>

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
                  <a href="/saved" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                    ❤️ {t.nav.saved}
                    {count > 0 && <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>{count}</span>}
                  </a>
                  {(session.user as { role?: string }).role === "admin" && (
                    <a href="/admin" className="flex items-center gap-2.5 px-4 py-3 no-underline transition-colors hover:bg-gray-50 text-[13px]" style={{ color: "#1A1A1A" }}>
                      ⚙️ {t.nav.adminDashboard}
                    </a>
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
            <a
              href="/auth/signin"
              className="hidden md:inline-flex items-center px-3.5 py-[7px] rounded-lg text-xs font-medium no-underline transition-all"
              style={{ border: "1.5px solid #1C3A2F", color: "#1C3A2F" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#1C3A2F"; (e.currentTarget as HTMLAnchorElement).style.color = "#F7F3EC"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "#1C3A2F"; }}
            >
              {t.nav.signIn}
            </a>
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
            {[
              { href: "/",                       label: t.nav.home      },
              { href: "/explore",                label: t.nav.explore   },
              { href: "/swipe",                  label: t.nav.swipe     },
              { href: "/reels",                  label: t.nav.reels     },
              { href: "/explore?type=sale",      label: t.nav.buy       },
              { href: "/explore?type=rent",      label: t.nav.rent      },
              { href: "/explore?type=short_stay",label: t.nav.shortStay },
            ].map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="px-5 py-3.5 text-[15px] font-medium no-underline border-b"
                style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}>
                {l.label}
              </a>
            ))}

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
            <a href="/saved" onClick={() => setMenuOpen(false)}
              className="px-5 py-3.5 text-[15px] font-medium no-underline border-b flex items-center justify-between"
              style={{ color: "#1C3A2F", borderColor: "#EDE8DF" }}>
              ❤️ {t.nav.saved}
              {count > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>{count}</span>}
            </a>
            <div className="px-5 py-4 flex gap-3">
              {user ? (
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex-1 text-center py-3 rounded-xl text-sm font-semibold cursor-pointer border-none"
                  style={{ background: "#1C3A2F", color: "#F7F3EC", fontFamily: "inherit" }}>
                  {t.nav.signOut}
                </button>
              ) : (
                <>
                  <a href="/auth/signin" className="flex-1 text-center py-3 rounded-xl text-sm font-semibold no-underline" style={{ border: "1.5px solid #1C3A2F", color: "#1C3A2F" }}>{t.nav.signIn}</a>
                  <a href="/explore" className="flex-1 text-center py-3 rounded-xl text-sm font-semibold no-underline" style={{ background: "#1C3A2F", color: "#F7F3EC" }}>Browse</a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
