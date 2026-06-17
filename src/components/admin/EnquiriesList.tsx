"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
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

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
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

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
          <p className="text-[13px]" style={{ color: "#999" }}>No enquiries in this view.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                  <button onClick={() => setStatus(e.id, "responded")} disabled={busyId === e.id}
                    className="text-[11px] font-medium cursor-pointer px-3 py-1.5 rounded-lg border-none disabled:opacity-50"
                    style={{ background: "#1C3A2F", color: "#FFFFFF", fontFamily: "inherit" }}>
                    Mark responded
                  </button>
                )}
                {e.status !== "archived" && (
                  <button onClick={() => setStatus(e.id, "archived")} disabled={busyId === e.id}
                    className="text-[11px] font-medium cursor-pointer px-3 py-1.5 rounded-lg border-none disabled:opacity-50"
                    style={{ background: "#EDE8DF", color: "#555", fontFamily: "inherit" }}>
                    Archive
                  </button>
                )}
                {e.status !== "new" && (
                  <button onClick={() => setStatus(e.id, "new")} disabled={busyId === e.id}
                    className="text-[11px] font-medium cursor-pointer px-3 py-1.5 rounded-lg border-none disabled:opacity-50"
                    style={{ background: "transparent", border: "1px solid #E5E0D8", color: "#555", fontFamily: "inherit" }}>
                    Mark as new
                  </button>
                )}
                <a href={e.method === "Line" ? `https://line.me/ti/p/~${e.contact}` : `https://wa.me/${e.contact.replace(/[^0-9]/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[11px] font-medium no-underline px-3 py-1.5 rounded-lg ml-auto"
                  style={{ background: "rgba(74,222,128,0.12)", color: "#2E7D4F" }}>
                  Reply on {e.method} →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
