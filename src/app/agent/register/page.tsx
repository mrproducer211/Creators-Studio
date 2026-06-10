"use client";

import { useState } from "react";
import Link from "next/link";
import { UserCheck, ShieldAlert, Sparkles, Building2, Eye, EyeOff } from "lucide-react";

export default function AgentRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register.");
      }
      setRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
          <div className="text-[11px] uppercase tracking-[2px] font-semibold mb-4" style={{ color: "#C9A84C" }}>Agent Partners</div>
          {[
            { icon: <Building2 size={18} />, text: "Upload & manage your own properties" },
            { icon: <UserCheck size={18} />, text: "Manual admin review ensures trusted network" },
            { icon: <Sparkles size={18} />, text: "Premium exposure to verified home seekers" },
            { icon: <ShieldAlert size={18} />, text: "Secure, credential-guarded access portal" },
          ].map((b, idx) => (
            <div key={idx} className="flex items-center gap-3 mb-4">
              <span className="w-8 flex justify-center flex-shrink-0" style={{ color: "#C9A84C" }}>{b.icon}</span>
              <span className="text-[14px] font-light" style={{ color: "rgba(255,255,255,0.75)" }}>{b.text}</span>
            </div>
          ))}
        </div>

        <p className="text-[12px] font-light" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 New Home Property · Bangkok HQ
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 no-underline mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: "#1C3A2F", color: "#C9A84C" }}>NHP</div>
            <span className="text-[15px] font-semibold" style={{ color: "#1C3A2F" }}>New Home Property</span>
          </Link>

          {registered ? (
            <div className="p-6 rounded-2xl border text-center" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(46,125,79,0.1)", color: "#2E7D4F" }}>
                <UserCheck size={28} />
              </div>
              <h2 className="text-[20px] font-bold mb-2 text-[#1C3A2F]">Application Submitted</h2>
              <p className="text-[14px] font-light leading-relaxed text-[#666] mb-6">
                Thanks for registering, <strong>{name}</strong>! Your agent account is pending manual review by our administrators. 
                You will be able to access your dashboard and post properties once approved.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-xl text-[13px] font-semibold no-underline transition-all"
                style={{ background: "#1C3A2F", color: "#FFFFFF" }}
              >
                Back to Homepage
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[26px] font-bold mb-1" style={{ color: "#1A1A1A", letterSpacing: "-0.5px" }}>
                Join as an Agent
              </h1>
              <p className="text-[14px] font-light mb-8" style={{ color: "#999" }}>
                Register to upload properties. Applications are manually verified by admins.
              </p>

              {error && (
                <div
                  className="p-4 rounded-xl text-[13px] mb-5 border font-medium flex items-center gap-2"
                  style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)", color: "#DC2626" }}
                >
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#666] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. Somchai Dev"
                    required
                    className="w-full px-4 py-3 rounded-xl text-[14px] transition-all focus:outline-none focus:border-[#C9A84C]"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#666] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="agent@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl text-[14px] transition-all focus:outline-none focus:border-[#C9A84C]"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#666] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Min. 6 characters"
                      required
                      className="w-full px-4 py-3 rounded-xl text-[14px] pr-10 transition-all focus:outline-none focus:border-[#C9A84C]"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A1A] border-none bg-transparent cursor-pointer p-0"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#666] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Repeat password"
                    required
                    className="w-full px-4 py-3 rounded-xl text-[14px] transition-all focus:outline-none focus:border-[#C9A84C]"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-[14px] font-bold tracking-[0.5px] cursor-pointer border-none transition-all disabled:opacity-60 mt-2"
                  style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}
                >
                  {loading ? "Submitting Application..." : "Submit Registration"}
                </button>
              </form>

              <div className="text-center mt-6 text-[13px] text-[#888] font-light">
                Already registered?{" "}
                <Link href="/auth/signin" className="font-semibold underline" style={{ color: "#1C3A2F" }}>
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
