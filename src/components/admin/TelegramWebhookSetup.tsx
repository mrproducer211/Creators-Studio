"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function TelegramWebhookSetup() {
  const [url, setUrl] = useState("");
  const [registering, setRegistering] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Promise.resolve().then(() => {
        setUrl(window.location.origin + "/api/webhooks/telegram");
      });
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    setRegistering(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/telegram/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to set Telegram webhook");
      }

      setStatus({ type: "success", msg: "✓ Webhook registered successfully with Telegram Bot API!" });
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Registration failed" });
    } finally {
      setRegistering(false);
    }
  };

  const borderStyle = "1px solid #E5E0D8";
  const inputStyle = { border: borderStyle, background: "#FFFFFF", color: "#1A1A1A" };

  return (
    <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: borderStyle }}>
      <h3 className="text-[15px] font-bold mb-1" style={{ color: "#1C3A2F" }}>Telegram Channel Auto-Posting Webhook</h3>
      <p className="text-[12px] text-[#888] mb-4">
        Register your public domain webhook URL with the Telegram Bot API so posts to your Telegram channel are auto-created as website listings.
      </p>

      <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-xl">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Webhook URL</label>
          <input
            suppressHydrationWarning
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none"
            style={inputStyle}
            placeholder="e.g. https://yourdomain.com/api/webhooks/telegram"
            required
          />
          <p className="text-[11px] text-[#999] mt-1.5">
            <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Must be a public HTTPS URL. For local testing, run <code className="bg-[#FAF8F3] px-1 border rounded font-mono">ngrok http 3000</code> and use your ngrok URL.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            suppressHydrationWarning
            type="submit"
            disabled={registering}
            className="py-2.5 px-4 rounded-xl text-[12px] font-semibold cursor-pointer border-none text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#1C3A2F" }}
          >
            {registering ? "Registering..." : "Link Webhook"}
          </button>
          {status && (
            <span
              className="text-[12px] font-bold"
              style={{ color: status.type === "success" ? "#2E7D4F" : "#E05252" }}
            >
              {status.msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
