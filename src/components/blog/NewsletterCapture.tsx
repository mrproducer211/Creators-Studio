"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function NewsletterCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div
      className="rounded-2xl p-4 md:p-5 text-white w-full max-w-4xl mx-auto mb-4 flex flex-col md:flex-row items-center justify-between gap-4"
      style={{ background: "#1C3A2F", border: "1px solid #C9A84C" }}
    >
      <div className="flex flex-col gap-1 max-w-md text-center md:text-left">
        <h3 className="text-[15px] md:text-[17px] font-bold leading-tight font-outfit m-0" style={{ color: "#FFFFFF" }}>
          Get Bangkok guides in your inbox
        </h3>
        <p className="text-[11.5px] font-light leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.7)" }}>
          Subscribe to receive honest neighbourhood comparisons, expat tips, and hidden local gems, straight from our Bangkok team.
        </p>
      </div>

      <div className="w-full md:w-auto flex-shrink-0">
        {status === "success" ? (
          <div className="flex items-center gap-2 text-[#E2C97E] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 w-full md:w-[300px] justify-center animate-scale-up">
            <CheckCircle2 size={15} />
            <span className="text-[12px] font-bold">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 w-full md:w-[300px]">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="px-3 py-2.5 rounded-xl text-[12px] outline-none border transition-all flex-grow text-gray-800"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EDE8DF",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-2.5 rounded-xl text-[11px] font-bold cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-1 border-none text-[#1C3A2F]"
              style={{ background: "#C9A84C" }}
            >
              {status === "loading" ? "Subscribing..." : (
                <>
                  Subscribe <ArrowRight size={12} />
                </>
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <div className="text-[10px] text-[#FF6B6B] mt-1 text-center md:text-left font-medium">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
