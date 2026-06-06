"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AppointmentRecord {
  id: string | number;
  propertyId?: number | null;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  status: "pending" | "confirmed" | "cancelled";
  message?: string | null;
  createdAt: string | Date;
  propertyName?: string | null;
  propertySlug?: string | null;
}

export default function AppointmentsList({ initialAppointments }: { initialAppointments: AppointmentRecord[] }) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(initialAppointments);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  const filtered = appointments.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  const handleUpdateStatus = async (id: string | number, newStatus: "confirmed" | "cancelled") => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return { background: "rgba(74,222,128,0.15)", color: "#2E7D4F" };
      case "cancelled":
        return { background: "rgba(239,68,68,0.12)", color: "#B91C1C" };
      default:
        return { background: "rgba(201,168,76,0.15)", color: "#8B6914" };
    }
  };

  const borderStyle = "1px solid #E5E0D8";

  return (
    <div className="flex flex-col gap-6">
      {/* Filters bar */}
      <div className="flex items-center gap-2 p-4 rounded-xl" style={{ background: "#FFFFFF", border: borderStyle }}>
        {(["all", "pending", "confirmed", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold cursor-pointer border-none capitalize transition-all"
            style={{
              background: statusFilter === tab ? "#1C3A2F" : "transparent",
              color: statusFilter === tab ? "#FFFFFF" : "#555",
            }}
          >
            {tab} ({tab === "all" ? appointments.length : appointments.filter((a) => a.status === tab).length})
          </button>
        ))}
      </div>

      {/* Grid Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: "#FAF8F3", borderBottom: borderStyle }}>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999]">Date & Time</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999]">Visitor Info</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999]">Property</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999]">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999]">Message</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[13px] text-[#999]">
                  No appointments scheduled.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} style={{ borderBottom: borderStyle }} className="hover:bg-[#FAF8F3]/50 transition-colors">
                  <td className="p-4 text-[13px]">
                    <div className="font-bold text-[#1C3A2F]">
                      {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="text-[11px] text-[#888] font-semibold mt-0.5">{a.timeSlot}</div>
                  </td>
                  <td className="p-4 text-[13px]">
                    <div className="font-semibold text-[#1A1A1A]">{a.name}</div>
                    <div className="text-[11px] text-[#666] mt-0.5">{a.email}</div>
                    <div className="text-[11px] text-[#666]">{a.phone}</div>
                  </td>
                  <td className="p-4 text-[13px] font-medium text-[#1C3A2F]">
                    {a.propertyName ? (
                      <a href={`/property/${a.propertySlug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        🏠 {a.propertyName}
                      </a>
                    ) : (
                      <span className="text-[#999] italic">General Enquiry</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.5px] px-2.5 py-1 rounded-full" style={getStatusBadgeStyle(a.status)}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4 text-[12px] text-[#555] max-w-[240px] truncate" title={a.message || ""}>
                    {a.message || <span className="text-[#ccc] italic">None</span>}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    {a.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(a.id, "confirmed")}
                          disabled={processingId === a.id}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border-none text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ background: "#2E7D4F" }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(a.id, "cancelled")}
                          disabled={processingId === a.id}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border hover:bg-[#FAF8F3] transition-all bg-white"
                          style={{ borderColor: "#EDE8DF", color: "#E05252" }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {a.status !== "pending" && (
                      <span className="text-[11px] text-[#bbb] italic">Action completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
