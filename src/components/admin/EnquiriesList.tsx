"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Trash2, CheckSquare, Square, CheckCircle, Archive } from "lucide-react";
import { stripEmojis } from "@/lib/emoji";
import type { StoredEnquiry } from "@/lib/store/enquiries";
import type { LeadUser } from "@/lib/store/leads";

interface ExtendedEnquiry extends StoredEnquiry {
  userRole?: string;
}

function statusStyle(s: string) {
  if (s === "new")       return { background: "rgba(74,222,128,0.15)", color: "#2E7D4F" };
  if (s === "responded") return { background: "rgba(28,58,47,0.1)",     color: "#1C3A2F" };
  return { background: "#EDE8DF", color: "#888" };
}

export default function EnquiriesList({ enquiries, leads }: { enquiries: ExtendedEnquiry[]; leads: LeadUser[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "new" | "responded" | "archived">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkBusy, setIsBulkBusy] = useState(false);

  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  // Build role lookup map
  const leadRoleMap = new Map<string, string>();
  leads.forEach((l) => {
    leadRoleMap.set(l.email.toLowerCase(), l.role);
    leadRoleMap.set(l.name.toLowerCase(), l.role);
  });

  const getSubmitterRole = (e: ExtendedEnquiry) => {
    if (e.userRole) return e.userRole;
    const contactLower = e.contact.toLowerCase();
    const nameLower = e.name.toLowerCase();
    return leadRoleMap.get(contactLower) || leadRoleMap.get(nameLower) || "user";
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const allFilteredIds = filtered.map((e) => String(e.id));
    const allSelected = allFilteredIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      const next = new Set(selectedIds);
      allFilteredIds.forEach((id) => next.delete(id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      allFilteredIds.forEach((id) => next.add(id));
      setSelectedIds(next);
    }
  };

  const setStatus = async (id: string, status: StoredEnquiry["status"]) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const deleteEnquiryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry permanently?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const deleteSelectedEnquiries = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${ids.length} selected ${ids.length === 1 ? "enquiry" : "enquiries"} permanently?`)) return;

    setIsBulkBusy(true);
    try {
      const res = await fetch("/api/admin/enquiries/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert("Failed to delete selected enquiries.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during bulk deletion.");
    } finally {
      setIsBulkBusy(false);
    }
  };

  const setBulkStatus = async (status: StoredEnquiry["status"]) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsBulkBusy(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/enquiries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsBulkBusy(false);
    }
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((e) => selectedIds.has(String(e.id)));

  return (
    <div>
      {/* Top Filter and Select Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap items-center">
          {(["all", "new", "responded", "archived"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer border-[1.5px] transition-all"
              style={filter === f
                ? { background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F", fontFamily: "inherit" }
                : { background: "transparent", color: "#555", borderColor: "#E5E0D8", fontFamily: "inherit" }
              }>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && ` (${enquiries.filter((e) => e.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Select all toggle */}
        {filtered.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer"
            style={{ background: "#FFFFFF", borderColor: "#E5E0D8", color: "#1C3A2F" }}
          >
            {allFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-[#1C3A2F]" />
            ) : (
              <Square className="w-4 h-4 text-[#999]" />
            )}
            {allFilteredSelected ? "Deselect All" : "Select All in View"}
          </button>
        )}
      </div>

      {/* Bulk Action Banner */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-20 flex items-center justify-between gap-3 p-3.5 mb-4 rounded-xl shadow-sm border animate-in fade-in"
          style={{ background: "#1C3A2F", color: "#FFFFFF", borderColor: "#1C3A2F" }}>
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <span>{selectedIds.size} {selectedIds.size === 1 ? "enquiry" : "enquiries"} selected</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setBulkStatus("responded")}
              disabled={isBulkBusy}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all border border-emerald-500/30 text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Mark Responded
            </button>
            <button
              onClick={() => setBulkStatus("archived")}
              disabled={isBulkBusy}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all border border-amber-500/30 text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 disabled:opacity-50 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" /> Archive
            </button>
            <button
              onClick={deleteSelectedEnquiries}
              disabled={isBulkBusy}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all border-none disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
          <p className="text-[13px]" style={{ color: "#999" }}>No enquiries in this view.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((e) => {
            const eIdStr = String(e.id);
            const isSelected = selectedIds.has(eIdStr);
            return (
              <div
                key={e.id}
                className="rounded-2xl p-5 transition-all"
                style={{
                  background: isSelected ? "#FAF7F0" : "#FFFFFF",
                  border: isSelected ? "1.5px solid #1C3A2F" : "1px solid #E5E0D8",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleSelect(eIdStr)}
                      className="mt-1 flex-shrink-0 cursor-pointer text-[#1C3A2F] border-none bg-transparent p-0"
                      title={isSelected ? "Deselect" : "Select"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#1C3A2F]" />
                      ) : (
                        <Square className="w-5 h-5 text-[#CCC] hover:text-[#999]" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.5px] px-2 py-0.5 rounded-full" style={statusStyle(e.status)}>
                          {e.status}
                        </span>
                        {(() => {
                          const role = getSubmitterRole(e);
                          const isAgent = role === "agent";
                          const isAdmin = role === "admin";
                          const badgeBg = isAgent 
                            ? "rgba(201,168,76,0.15)"
                            : isAdmin
                            ? "rgba(28,58,47,0.1)"
                            : "rgba(46,125,79,0.1)";
                          const badgeColor = isAgent
                            ? "#8B6914"
                            : isAdmin
                            ? "#1C3A2F"
                            : "#2E7D4F";
                          const badgeBorder = isAgent
                            ? "1px solid rgba(201,168,76,0.3)"
                            : isAdmin
                            ? "1px solid rgba(28,58,47,0.2)"
                            : "1px solid rgba(46,125,79,0.2)";
                          return (
                            <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 rounded-full" style={{ background: badgeBg, color: badgeColor, border: badgeBorder }}>
                              {role}
                            </span>
                          );
                        })()}
                        <span className="text-[10px] uppercase tracking-[0.5px]" style={{ color: "#999" }}>
                          via {e.method} · {e.source}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-bold truncate" style={{ color: "#1A1A1A" }}>{e.name}</h3>
                      <p className="text-[12px]" style={{ color: "#888" }}>
                        {new Date(e.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <a href={`/property/${e.propertySlug}`} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-medium no-underline px-2.5 py-1.5 rounded-lg flex-shrink-0"
                    style={{ background: "#F7F3EC", color: "#1C3A2F", border: "1px solid #E5E0D8" }}>
                    View property →
                  </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 pb-3" style={{ borderBottom: "1px solid #F0EAE0" }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.5px] mb-0.5" style={{ color: "#999" }}>Property</p>
                    <p className="text-[12px] font-medium truncate" style={{ color: "#1A1A1A" }}>{stripEmojis(e.propertyName)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.5px] mb-0.5" style={{ color: "#999" }}>Price</p>
                    <p className="text-[12px] font-medium" style={{ color: "#1A1A1A" }}>{e.price}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.5px] mb-0.5" style={{ color: "#999" }}>Area</p>
                    <p className="text-[12px] font-medium" style={{ color: "#1A1A1A" }}>{e.area}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.5px] mb-0.5" style={{ color: "#999" }}>Contact</p>
                    <p className="text-[12px] font-medium truncate" style={{ color: "#1A1A1A" }}>{e.contact}</p>
                  </div>
                </div>

                {(e.tourDate || e.message) && (
                  <div className="mb-3 pb-3" style={{ borderBottom: "1px solid #F0EAE0" }}>
                    {e.tourDate && (
                      <p className="text-[12px] mb-1" style={{ color: "#555" }}>
                        <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> <strong>Tour requested:</strong> {new Date(e.tourDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at {e.tourTime}</span>
                      </p>
                    )}
                    {e.message && (
                      <p className="text-[12px] italic" style={{ color: "#555" }}>“{stripEmojis(e.message)}”</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {e.status !== "responded" && (
                    <button onClick={() => setStatus(eIdStr, "responded")} disabled={busyId === eIdStr}
                      className="text-[11px] font-medium cursor-pointer px-3 py-1.5 rounded-lg border-none disabled:opacity-50"
                      style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                      Mark responded
                    </button>
                  )}
                  {e.status !== "archived" && (
                    <button onClick={() => setStatus(eIdStr, "archived")} disabled={busyId === eIdStr}
                      className="text-[11px] font-medium cursor-pointer px-3 py-1.5 rounded-lg border-none disabled:opacity-50"
                      style={{ background: "#EDE8DF", color: "#555", fontFamily: "inherit" }}>
                      Archive
                    </button>
                  )}
                  {e.status !== "new" && (
                    <button onClick={() => setStatus(eIdStr, "new")} disabled={busyId === eIdStr}
                      className="text-[11px] font-medium cursor-pointer px-3 py-1.5 rounded-lg border-none disabled:opacity-50"
                      style={{ background: "transparent", border: "1px solid #E5E0D8", color: "#555", fontFamily: "inherit" }}>
                      Mark as new
                    </button>
                  )}
                  <button onClick={() => deleteEnquiryItem(eIdStr)} disabled={busyId === eIdStr}
                    className="text-[11px] font-medium cursor-pointer px-2.5 py-1.5 rounded-lg border-none disabled:opacity-50 flex items-center gap-1 text-rose-700 bg-rose-50 hover:bg-rose-100"
                    style={{ fontFamily: "inherit" }}
                    title="Delete Enquiry">
                    <Trash2 size={13} /> Delete
                  </button>
                  <a href={e.method === "Line" ? `https://line.me/ti/p/~${e.contact}` : `https://wa.me/${e.contact.replace(/[^0-9]/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-medium no-underline px-3 py-1.5 rounded-lg ml-auto"
                    style={{ background: "rgba(74,222,128,0.12)", color: "#2E7D4F" }}>
                    Reply on {e.method} →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
