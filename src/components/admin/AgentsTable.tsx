"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadUser } from "@/lib/store/leads";

export default function AgentsTable({ initialAgents }: { initialAgents: LeadUser[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update agent status.");
      }
    } catch {
      alert("Error updating agent status.");
    } finally {
      setBusy(null);
    }
  };

  const handleToggleRestriction = async (id: string, field: "postingRestricted" | "requireVerification", value: boolean) => {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update agent restrictions.");
      }
    } catch {
      alert("Error updating agent restrictions.");
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
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Posting Privileges</th>
            <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Publishing Mode</th>
            <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Status</th>
            <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3.5" style={{ color: "#888" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialAgents.map((agent) => (
            <tr key={agent.id} style={{ borderBottom: "1px solid #F0EAE0" }}>
              <td className="px-4 py-4 text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>
                {agent.name}
              </td>
              <td className="px-4 py-4 text-[13px]" style={{ color: "#1C3A2F" }}>
                {agent.email}
              </td>
              <td className="px-4 py-4">
                <select
                  value={agent.postingRestricted ? "restricted" : "allowed"}
                  onChange={(e) => handleToggleRestriction(agent.id, "postingRestricted", e.target.value === "restricted")}
                  disabled={busy === agent.id || agent.agentStatus !== "approved"}
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold outline-none cursor-pointer border transition-colors"
                  style={{
                    borderColor: "#E5E0D8",
                    background: "#FAF8F3",
                    color: agent.postingRestricted ? "#E05252" : "#2E7D4F",
                    fontFamily: "inherit"
                  }}
                >
                  <option value="allowed" style={{ color: "#2E7D4F" }}>Allowed</option>
                  <option value="restricted" style={{ color: "#E05252" }}>Restricted</option>
                </select>
              </td>
              <td className="px-4 py-4">
                <select
                  value={agent.requireVerification ? "verify" : "auto"}
                  onChange={(e) => handleToggleRestriction(agent.id, "requireVerification", e.target.value === "verify")}
                  disabled={busy === agent.id || agent.agentStatus !== "approved"}
                  className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold outline-none cursor-pointer border transition-colors"
                  style={{
                    borderColor: "#E5E0D8",
                    background: "#FAF8F3",
                    color: agent.requireVerification ? "#8B6914" : "#2E7D4F",
                    fontFamily: "inherit"
                  }}
                >
                  <option value="auto" style={{ color: "#2E7D4F" }}>Auto-Publish</option>
                  <option value="verify" style={{ color: "#8B6914" }}>Requires Verification</option>
                </select>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.5px] px-3 py-1 rounded-full inline-block"
                  style={
                    agent.agentStatus === "approved"
                      ? { background: "rgba(46,125,79,0.1)", color: "#2E7D4F" }
                      : agent.agentStatus === "rejected"
                      ? { background: "rgba(224,82,82,0.1)", color: "#E05252" }
                      : { background: "rgba(201,168,76,0.15)", color: "#8B6914" }
                  }>
                  {agent.agentStatus === "approved" ? "active" : (agent.agentStatus || "pending")}
                </span>
              </td>
              <td className="px-4 py-4 text-right flex items-center justify-end gap-2" style={{ minHeight: "56px" }}>
                {(agent.agentStatus === "pending" || agent.agentStatus === "rejected") && (
                  <button
                    onClick={() => handleUpdateStatus(agent.id, "approved")}
                    disabled={busy === agent.id}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border-none disabled:opacity-50 transition-opacity hover:opacity-85"
                    style={{ background: "rgba(46,125,79,0.1)", color: "#2E7D4F", fontFamily: "inherit" }}
                  >
                    {busy === agent.id ? "Updating…" : "Approve"}
                  </button>
                )}
                {(agent.agentStatus === "pending" || agent.agentStatus === "approved") && (
                  <button
                    onClick={() => handleUpdateStatus(agent.id, "rejected")}
                    disabled={busy === agent.id}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border-none disabled:opacity-50 transition-opacity hover:opacity-85"
                    style={{ background: "rgba(224,82,82,0.1)", color: "#E05252", fontFamily: "inherit" }}
                  >
                    {busy === agent.id ? "Updating…" : "Reject"}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {initialAgents.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-[13px]" style={{ color: "#999" }}>
                No agent partners registered yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
