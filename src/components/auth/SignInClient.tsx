"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bookmark, Bell, BarChart3, Heart, Home } from "lucide-react";

export default function SignInClient({ googleEnabled }: { googleEnabled: boolean }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/";

  const [tab, setTab]         = useState<"signin" | "register">("signin");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
    } else {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          const role = session?.user?.role;
          if (role === "admin") {
            router.push("/admin");
          } else if (role === "agent") {
            router.push("/agent/dashboard");
          } else {
            router.push(callbackUrl);
          }
        } else {
          router.push(callbackUrl);
        }
      } catch {
        router.push(callbackUrl);
      }
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register.");
      }

      // Automatically sign in the user after successful registration
      const signinRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (signinRes?.error) {
        setError("Account created, but automatic sign-in failed. Please sign in manually.");
        setTab("signin");
      } else {
        try {
          const sessionRes = await fetch("/api/auth/session");
          if (sessionRes.ok) {
            const session = await sessionRes.json();
            const role = session?.user?.role;
            if (role === "admin") {
              router.push("/admin");
            } else if (role === "agent") {
              router.push("/agent/dashboard");
            } else {
              router.push(callbackUrl);
            }
          } else {
            router.push(callbackUrl);
          }
        } catch {
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setLoading(true);
    signIn("google", { callbackUrl });
  };

  const inputStyle = {
    border: "1.5px solid #E5E0D8",
    background: "#FFFFFF",
    color: "#1A1A1A",
    fontFamily: "inherit",
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F3EC" }}>
      {/* Left panel — desktop only */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 flex-shrink-0"
        style={{ width: 420, background: "#1C3A2F" }}
      >
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold" style={{ background: "#C9A84C", color: "#1C3A2F" }}>NHP</div>
          <div>
            <div className="text-[15px] font-semibold" style={{ color: "#FFFFFF" }}>New Home Property</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Bangkok, Thailand</div>
          </div>
        </Link>

        <div>
          <div className="text-[11px] uppercase tracking-[2px] font-semibold mb-4" style={{ color: "#C9A84C" }}>Member benefits</div>
          {[
            { icon: <Bookmark size={18} />, text: "Save properties across devices" },
            { icon: <Bell size={18} />, text: "Get alerts for new listings" },
            { icon: <BarChart3 size={18} />, text: "Track your enquiries" },
            { icon: <Heart size={18} />, text: "Build your shortlist" },
            { icon: <Home size={18} />, text: "Access exclusive listings" },
          ].map((b) => (
            <div key={b.text} className="flex items-center gap-3 mb-4">
              <span className="w-8 flex justify-center flex-shrink-0" style={{ color: "#C9A84C" }}>{b.icon}</span>
              <span className="text-[14px] font-light" style={{ color: "rgba(255,255,255,0.75)" }}>{b.text}</span>
            </div>
          ))}
        </div>

        <p className="text-[12px] font-light" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 New Home Property · Bangkok
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center justify-center gap-2 no-underline mb-8 mx-auto w-fit">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: "#1C3A2F", color: "#C9A84C" }}>NHP</div>
            <span className="text-[15px] font-semibold" style={{ color: "#1C3A2F" }}>New Home Property</span>
          </Link>

          <h1 className="text-[26px] font-bold mb-1" style={{ color: "#1A1A1A", letterSpacing: "-0.5px" }}>
            {tab === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-[14px] font-light mb-8" style={{ color: "#999" }}>
            {tab === "signin" ? "Sign in to save and track properties." : "Register to like, save, and track properties."}
          </p>

          {/* Google */}
          {googleEnabled && (
            <>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-[14px] font-medium cursor-pointer border transition-all disabled:opacity-60 mb-4"
                style={{ borderColor: "#E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: "#E5E0D8" }} />
                <span className="text-[12px]" style={{ color: "#bbb" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "#E5E0D8" }} />
              </div>
            </>
          )}

          {/* Credentials form */}
          <form onSubmit={tab === "signin" ? handleCredentials : handleRegister} className="flex flex-col gap-3">
            {tab === "register" && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")}
                onBlur={(e)  => (e.target.style.borderColor = "#E5E0D8")}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")}
              onBlur={(e)  => (e.target.style.borderColor = "#E5E0D8")}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#1C3A2F")}
              onBlur={(e)  => (e.target.style.borderColor = "#E5E0D8")}
              required
            />
            {error && (
              <p className="text-[13px] px-1" style={{ color: "#E05252" }}>⚠ {error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-[15px] font-semibold cursor-pointer border-none disabled:opacity-60 transition-opacity hover:opacity-90 mt-1"
              style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
            >
              {loading ? (tab === "signin" ? "Signing in…" : "Registering…") : (tab === "signin" ? "Sign In →" : "Sign Up →")}
            </button>
          </form>

          {tab === "signin" ? (
            <p className="text-[13px] text-center mt-6" style={{ color: "#666" }}>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => { setTab("register"); setError(""); }}
                className="font-semibold underline cursor-pointer bg-transparent border-none p-0"
                style={{ color: "#1C3A2F", fontFamily: "inherit" }}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-[13px] text-center mt-6" style={{ color: "#666" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setTab("signin"); setError(""); }}
                className="font-semibold underline cursor-pointer bg-transparent border-none p-0"
                style={{ color: "#1C3A2F", fontFamily: "inherit" }}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
