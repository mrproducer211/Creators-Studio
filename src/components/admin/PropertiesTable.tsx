"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PropertyCard } from "@/types/property";
import { Clock, Eye, MousePointerClick, Heart, Star } from "lucide-react";
import { stripEmojis } from "@/lib/emoji";

function badgeStyle(t: string) {
  if (t === "sale") return { background: "#1C3A2F", color: "#E2C97E" };
  if (t === "rent") return { background: "#C9A84C", color: "#1C3A2F" };
  return { background: "#FFFFFF", color: "#1C3A2F", border: "1px solid #E5E0D8" };
}
function badgeLabel(t: string) {
  if (t === "sale") return "Sale";
  if (t === "rent") return "Rent";
  return "Short Stay";
}

export default function PropertiesTable({ properties }: { properties: PropertyCard[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "sale" | "rent" | "short_stay">("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filtered.map((p) => p.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));
    if (areAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const next = [...prev];
        allFilteredIds.forEach((id) => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected listings? This cannot be undone.`)) return;

    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/properties/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete selected listings.");
      }
    } catch {
      alert("Error performing bulk delete.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties
      .filter((p) => filter === "all" || p.listingType === filter)
      .filter((p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
  }, [properties, search, filter]);

  const approve = async (id: number) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active", pendingVerification: false }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to approve listing.");
      }
    } catch {
      alert("Error approving listing.");
    } finally {
      setBusyId(null);
    }
  };

  const extend = async (id: number, currentExpiryStr?: string) => {
    setBusyId(id);
    try {
      const currentExpiry = currentExpiryStr ? new Date(currentExpiryStr) : new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiryDate: newExpiry.toISOString(), status: "active" }), // also make active if extended
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to extend expiry.");
      }
    } catch {
      alert("Error extending expiry.");
    } finally {
      setBusyId(null);
    }
  };

  const del = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete.");
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, area or slug…"
          suppressHydrationWarning
          className="flex-1 min-w-[200px] rounded-xl px-4 py-2.5 text-[13px] outline-none"
          style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "sale" | "rent" | "short_stay")}
          suppressHydrationWarning
          className="rounded-xl px-3 py-2.5 text-[13px] cursor-pointer outline-none"
          style={{ border: "1.5px solid #E5E0D8", background: "#FFFFFF", color: "#1A1A1A", fontFamily: "inherit" }}
        >
          <option value="all">All listings</option>
          <option value="sale">For Sale</option>
          <option value="rent">Long Rent</option>
          <option value="short_stay">Short Stay</option>
        </select>
        {selectedIds.length > 0 && (
          <button
            onClick={bulkDelete}
            disabled={isBulkDeleting}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold cursor-pointer border-none text-white hover:opacity-90 transition-opacity"
            style={{
              background: "#E05252",
              fontFamily: "inherit",
            }}
          >
            {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E5E0D8" }}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAF8F3", borderBottom: "1px solid #E5E0D8" }}>
              <th className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((p) => selectedIds.includes(p.id))}
                  onChange={handleSelectAll}
                  className="cursor-pointer rounded border-gray-300"
                />
              </th>
              <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3" style={{ color: "#888" }}>Property</th>
              <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-3 py-3" style={{ color: "#888" }}>Type</th>
              <th className="text-left text-[11px] uppercase tracking-[0.8px] font-semibold px-3 py-3" style={{ color: "#888" }}>Area</th>
              <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-3 py-3" style={{ color: "#888" }}>Price</th>
              <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-3 py-3" style={{ color: "#888" }}>Flags</th>
              <th className="text-center text-[11px] uppercase tracking-[0.8px] font-semibold px-3 py-3" style={{ color: "#888" }}>Engagement</th>
              <th className="text-right text-[11px] uppercase tracking-[0.8px] font-semibold px-4 py-3" style={{ color: "#888" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
               const isExpired = p.expiryDate && new Date() > new Date(p.expiryDate);
               return (
                 <tr key={p.id} style={{ borderBottom: "1px solid #F0EAE0" }}>
                   <td className="px-4 py-3 text-center">
                     <input
                       type="checkbox"
                       checked={selectedIds.includes(p.id)}
                       onChange={() => handleSelectRow(p.id)}
                       className="cursor-pointer rounded border-gray-300"
                     />
                   </td>
                   <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.coverImage ? (
                        <img src={p.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: "linear-gradient(135deg,#254D3E,#1C3A2F)" }} />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-[13px] font-semibold truncate" style={{ color: "#1A1A1A" }}>{stripEmojis(p.name)}</div>
                          {p.pendingVerification && (
                            <span className="text-[8px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-[0.3px]">Pending Approve</span>
                          )}
                          {p.status === "unlisted" && !p.pendingVerification && (
                            <span className="text-[8px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-[0.3px]">{isExpired ? "Expired (Unlisted)" : "Unlisted"}</span>
                          )}
                        </div>
                        <div className="text-[11px] truncate flex items-center gap-2" style={{ color: "#999" }}>
                          <span>{p.slug}</span>
                          {p.expiryDate && (
                            <span className="font-semibold inline-flex items-center gap-1" style={{ color: isExpired ? "#E05252" : "#8B6914" }}>
                              <Clock className="w-3 h-3" /> Expires: {new Date(p.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.5px] px-2 py-1 rounded-full" style={badgeStyle(p.listingType)}>
                      {badgeLabel(p.listingType)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[12px]" style={{ color: "#555" }}>{p.area}</td>
                  <td className="px-3 py-3 text-right text-[12px] font-semibold" style={{ color: "#1C3A2F" }}>
                    ฿{Number(p.priceTHB).toLocaleString("th-TH")}{p.priceLabel}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {p.featured  && <span title="Featured"    className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(201,168,76,0.18)", color: "#8B6914" }}>FEAT</span>}
                      {p.hasVideo  && <span title="Has video"   className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(28,58,47,0.1)", color: "#1C3A2F" }}>VID</span>}
                      {p.petFriendly && <span title="Pet friendly" className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(46,97,80,0.15)", color: "#2E6150" }}>PET</span>}
                      {p.nearBts   && <span title="Near BTS/MRT" className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "rgba(74,144,222,0.15)", color: "#2A5A99" }}>BTS</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold text-[#666]">
                      <span title="Views" className="flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" /> {p.viewCount ?? 0}</span>
                      <span title="Clicks" className="flex items-center gap-0.5"><MousePointerClick className="w-3.5 h-3.5" /> {p.clicks ?? 0}</span>
                      <span title="Likes" className="flex items-center gap-0.5"><Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {p.likes}</span>
                      <span title="Saves" className="flex items-center gap-0.5"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {p.saves}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      {p.pendingVerification && (
                        <button onClick={() => approve(p.id)} disabled={busyId === p.id}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer text-white hover:opacity-95"
                          style={{ background: "#2E7D4F", fontFamily: "inherit" }}>
                          {busyId === p.id ? "…" : "Approve"}
                        </button>
                      )}
                      {(p.expiryDate || isExpired) && (
                        <button onClick={() => extend(p.id, p.expiryDate)} disabled={busyId === p.id}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer hover:bg-[#FAF8F3]"
                          style={{ background: "transparent", borderColor: "#EDE8DF", color: "#8B6914", fontFamily: "inherit" }}
                          title="Extend expiry date by 30 days">
                          {isExpired ? "Renew (+30d)" : "+30 Days"}
                        </button>
                      )}
                      <a href={`/property/${p.slug}`} target="_blank" rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium no-underline" style={{ background: "#F7F3EC", color: "#1C3A2F", border: "1px solid #E5E0D8" }}>
                        View
                      </a>
                      <a href={`/admin/properties/${p.id}`}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium no-underline" style={{ background: "#1C3A2F", color: "#FFFFFF" }}>
                        Edit
                      </a>
                      <button onClick={() => del(p.id, p.name)} disabled={busyId === p.id}
                        suppressHydrationWarning
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border-none disabled:opacity-50"
                        style={{ background: "rgba(224,82,82,0.1)", color: "#E05252", fontFamily: "inherit" }}>
                        {busyId === p.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-[13px] text-center py-10" style={{ color: "#999" }}>
                  No properties match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
