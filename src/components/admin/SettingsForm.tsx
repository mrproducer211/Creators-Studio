"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SystemSettings } from "@/lib/store/settings";

export default function SettingsForm({ initialSettings }: { initialSettings: SystemSettings }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialSettings.adminEmail);
  const [phone, setPhone] = useState(initialSettings.adminPhone);
  const [whatsApp, setWhatsApp] = useState(initialSettings.adminWhatsApp || "");
  const [line, setLine] = useState(initialSettings.adminLine || "");
  const [telegram, setTelegram] = useState(initialSettings.adminTelegram || "");
  const [expiryEnabled, setExpiryEnabled] = useState(initialSettings.rentalExpiryEnabled);
  const [expiryDays, setExpiryDays] = useState(initialSettings.rentalExpiryDays);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: email,
          adminPhone: phone,
          rentalExpiryEnabled: expiryEnabled,
          rentalExpiryDays: Number(expiryDays),
          adminWhatsApp: whatsApp,
          adminLine: line,
          adminTelegram: telegram,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save settings");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const borderStyle = "1px solid #E5E0D8";
  const inputStyle = { border: borderStyle, background: "#FFFFFF", color: "#1A1A1A" };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
      {/* Expiry deletion rules */}
      <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: borderStyle }}>
        <h3 className="text-[15px] font-bold mb-1" style={{ color: "#1C3A2F" }}>Automatic Rental Listing Expiry</h3>
        <p className="text-[12px] text-[#888] mb-4">Automatically delete rental properties after they reach a certain duration since creation.</p>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input
              suppressHydrationWarning
              type="checkbox"
              id="expiry_toggle"
              checked={expiryEnabled}
              onChange={(e) => setExpiryEnabled(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#1C3A2F]"
            />
            <label htmlFor="expiry_toggle" className="text-[13px] font-medium text-[#1A1A1A] cursor-pointer">
              Enable Automatic Deletion of Rentals
            </label>
          </div>

          {expiryEnabled && (
            <div className="max-w-xs">
              <label className="block text-[11px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Expiry Threshold (Days)</label>
              <select
                suppressHydrationWarning
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none cursor-pointer"
                style={inputStyle}
              >
                <option value={15}>15 Days</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
                <option value={120}>120 Days</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Admin Contacts */}
      <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: borderStyle }}>
        <h3 className="text-[15px] font-bold mb-4" style={{ color: "#1C3A2F" }}>Public Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Agent Email Address</label>
            <input
              suppressHydrationWarning
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none"
              style={inputStyle}
              placeholder="e.g. admin@newhomesproperty.com"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Agent Contact Number</label>
            <input
              suppressHydrationWarning
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none"
              style={inputStyle}
              placeholder="e.g. +66812345678"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">WhatsApp Number</label>
            <input
              suppressHydrationWarning
              type="text"
              value={whatsApp}
              onChange={(e) => setWhatsApp(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none"
              style={inputStyle}
              placeholder="e.g. +66812345678"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Line ID</label>
            <input
              suppressHydrationWarning
              type="text"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none"
              style={inputStyle}
              placeholder="e.g. nhp-line-id"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1px] text-[#999] mb-1.5">Telegram Username</label>
            <input
              suppressHydrationWarning
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none"
              style={inputStyle}
              placeholder="e.g. nhp-telegram"
            />
          </div>
        </div>
      </div>

      {/* Action panel */}
      <div className="flex items-center gap-3">
        <button
          suppressHydrationWarning
          type="submit"
          disabled={saving}
          className="py-3 px-6 rounded-xl text-[13px] font-semibold cursor-pointer border-none text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "#1C3A2F", minWidth: 140 }}
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        {success && <span className="text-[12px] font-bold text-[#2E7D4F]">✓ System settings saved successfully!</span>}
      </div>

    </form>
  );
}
