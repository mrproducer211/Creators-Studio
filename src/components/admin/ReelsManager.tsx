"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyCard } from "@/types/property";

export default function ReelsManager({ initialProperties }: { initialProperties: PropertyCard[] }) {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyCard[]>(initialProperties);
  const [filter, setFilter] = useState<"all" | "with_video">("with_video");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState("");

  const filtered = properties.filter((p) => {
    if (filter === "with_video") return p.hasVideo || !!p.videoUrl;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const handleEditVideo = (property: PropertyCard) => {
    setEditingId(property.id);
    setEditUrl(property.videoUrl || "");
  };

  const handleSaveVideo = async (id: number) => {
    setProcessing(true);
    try {
      const property = properties.find((p) => p.id === id);
      if (!property) return;

      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...property,
          videoUrl: editUrl,
          hasVideo: !!editUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save video URL");

      setProperties((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, videoUrl: editUrl, hasVideo: !!editUrl } : p
        )
      );
      setEditingId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteVideo = async (id: number) => {
    if (!confirm("Are you sure you want to clear the video for this property?")) return;
    setProcessing(true);
    try {
      const property = properties.find((p) => p.id === id);
      if (!property) return;

      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...property,
          videoUrl: "",
          hasVideo: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete video");

      setProperties((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, videoUrl: "", hasVideo: false } : p
        )
      );
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkClearVideos = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to clear videos for the ${selectedIds.length} selected properties?`)) return;

    setProcessing(true);
    try {
      for (const id of selectedIds) {
        const property = properties.find((p) => p.id === id);
        if (!property) continue;

        await fetch(`/api/admin/properties/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...property,
            videoUrl: "",
            hasVideo: false,
          }),
        });
      }

      setProperties((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.id) ? { ...p, videoUrl: "", hasVideo: false } : p
        )
      );
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      alert("Error processing bulk action: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setProcessing(false);
    }
  };

  const borderStyle = "1px solid #E5E0D8";

  return (
    <div className="flex flex-col gap-6">
      
      {/* Filters & Bulk Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl" style={{ background: "#FFFFFF", border: borderStyle }}>
        
        {/* Toggle filter */}
        <div className="inline-flex rounded-lg overflow-hidden border" style={{ borderColor: "#E5E0D8" }}>
          <button
            onClick={() => setFilter("with_video")}
            className="px-4 py-2 text-[12px] font-semibold cursor-pointer border-none transition-all"
            style={{
              background: filter === "with_video" ? "#1C3A2F" : "#FFFFFF",
              color: filter === "with_video" ? "#FFFFFF" : "#555",
            }}
          >
            With Video Tour ({properties.filter((p) => p.hasVideo || p.videoUrl).length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className="px-4 py-2 text-[12px] font-semibold cursor-pointer border-none transition-all"
            style={{
              background: filter === "all" ? "#1C3A2F" : "#FFFFFF",
              color: filter === "all" ? "#FFFFFF" : "#555",
            }}
          >
            All Listings ({properties.length})
          </button>
        </div>

        {/* Bulk Action Buttons */}
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkClearVideos}
            disabled={processing}
            className="py-2 px-4 rounded-xl text-[12px] font-semibold cursor-pointer border-none text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#E05252" }}
          >
            🗑 Clear Videos for Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Table grid */}
      <div className="rounded-2xl overflow-hidden border" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: "#FAF8F3", borderBottom: borderStyle }}>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999]">Property</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999]">Location</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999]">Video URL</th>
              <th className="p-4 text-xs font-bold uppercase tracking-[1px] text-[#999] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-[13px] text-[#999]">
                  No matching listings found. Add video tour links in the property form!
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} style={{ borderBottom: borderStyle }} className="hover:bg-[#FAF8F3]/50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.coverImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=120"}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border"
                          style={{ borderColor: "#EDE8DF" }}
                        />
                        <div>
                          <div className="text-[13px] font-bold text-[#1A1A1A]">{p.name}</div>
                          <div className="text-[11px] text-[#C9A84C] font-semibold capitalize">{p.propertyType} · {p.listingType.replace("_", " ")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[12px] text-[#666]">
                      {p.district ? `${p.district}, ` : ""}{p.area}
                    </td>
                    <td className="p-4 flex-1">
                      {isEditing ? (
                        <div className="flex gap-2 w-full max-w-[400px]">
                          <input
                            className="w-full rounded-lg px-2.5 py-1.5 text-[12px] outline-none border bg-white"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="Cloudinary MP4 link..."
                          />
                          <button
                            onClick={() => handleSaveVideo(p.id)}
                            disabled={processing}
                            className="px-3 py-1.5 rounded-lg text-white font-semibold text-[11px] border-none cursor-pointer"
                            style={{ background: "#2E7D4F" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1.5 rounded-lg font-semibold text-[11px] border cursor-pointer bg-white"
                            style={{ borderColor: "#EDE8DF" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="text-[12px] text-[#666] max-w-[400px] truncate">
                          {p.videoUrl ? (
                            <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[#1C3A2F] underline truncate font-medium">
                              📹 {p.videoUrl}
                            </a>
                          ) : (
                            <span className="text-[#bbb] italic">No Video Tour Added</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {!isEditing && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditVideo(p)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border hover:bg-[#FAF8F3] transition-all bg-white"
                            style={{ borderColor: "#EDE8DF", color: "#1C3A2F" }}
                          >
                            Edit Video
                          </button>
                          {p.videoUrl && (
                            <button
                              onClick={() => handleDeleteVideo(p.id)}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer border hover:bg-[#FAF8F3] transition-all bg-white"
                              style={{ borderColor: "#EDE8DF", color: "#E05252" }}
                            >
                              Remove Video
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
