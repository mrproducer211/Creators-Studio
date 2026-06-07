"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadUser } from "@/lib/store/leads";

export default function LeadsTable({ initialLeads }: { initialLeads: LeadUser[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete lead user "${email}"? This action cannot be undone.`)) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete lead user.");
      }
    } catch {
      alert("Error deleting lead user.");
    } finally {
      setBusy(null);
    }
  };

  const borderStyle = "1px solid #E5E0D8";

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ background: "#FFFFFF", border: borderStyle }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: "#FAF8F3", borderBottom: borderStyle }}>
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Name</th>
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Email Address</th>
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Password (Hashed)</th>
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Registered Date</th>
            <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialLeads.map((lead) => (
            <tr key={lead.id} style={{ borderBottom: "1px solid #F0EAE0" }}>
              <td className="px-4 py-4 text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>
                {lead.name}
              </td>
              <td className="px-4 py-4 text-[13px]" style={{ color: "#1C3A2F" }}>
                {lead.email}
              </td>
              <td className="px-4 py-4 text-[11px]" style={{ color: "#666", fontFamily: "monospace" }}>
                <span className="truncate max-w-[200px] block" title={lead.passwordHash}>
                  {lead.passwordHash}
                </span>
              </td>
              <td className="px-4 py-4 text-[12px]" style={{ color: "#555" }}>
                {new Date(lead.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  onClick={() => handleDelete(lead.id, lead.email)}
                  disabled={busy === lead.id}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border-none disabled:opacity-50 transition-opacity hover:opacity-85"
                  style={{ background: "rgba(224,82,82,0.1)", color: "#E05252", fontFamily: "inherit" }}
                >
                  {busy === lead.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
          {initialLeads.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-12 text-[13px]" style={{ color: "#999" }}>
                No registered user leads yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
