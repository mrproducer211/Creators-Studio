"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, XCircle, Trash2, Search, Filter } from "lucide-react";
import { ReviewRecord } from "@/lib/store/reviews";

export default function ReviewsTable() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "published" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchReviews = () => {
    setLoading(true);
    fetch("/api/admin/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: number, status: "published" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch {}
    setActionLoading(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review permanently?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch {}
    setActionLoading(null);
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.body && r.body.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.propertyId.toString().includes(searchTerm);

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#EDE8DF] shadow-sm overflow-hidden flex flex-col gap-4 p-5">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EDE8DF] bg-[#F7F3EC] text-xs text-[#1C3A2F] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#EDE8DF] bg-[#F7F3EC] text-xs text-[#1C3A2F] outline-none cursor-pointer"
          >
            <option value="all">All Reviews ({reviews.length})</option>
            <option value="pending">Pending ({reviews.filter((r) => r.status === "pending").length})</option>
            <option value="published">Published ({reviews.filter((r) => r.status === "published").length})</option>
            <option value="rejected">Rejected ({reviews.filter((r) => r.status === "rejected").length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500">No reviews found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#EDE8DF] text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3">Property ID</th>
                <th className="py-3 px-3">Author</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Review Details</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE8DF]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF8F3] transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[#1C3A2F]">#{r.propertyId}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#1C3A2F]">{r.authorName}</div>
                    {r.authorEmail && <div className="text-[10px] text-gray-400">{r.authorEmail}</div>}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-0.5 text-[#C9A84C]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={r.rating >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs">
                    {r.title && <div className="font-bold text-[#1C3A2F] truncate">{r.title}</div>}
                    {r.body && <div className="text-gray-500 line-clamp-2">{r.body}</div>}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.status === "published"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status !== "published" && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, "published")}
                          disabled={actionLoading === r.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-semibold text-[10px] hover:bg-emerald-800 border-none cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle size={12} /> Publish
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, "rejected")}
                          disabled={actionLoading === r.id}
                          className="px-2.5 py-1 rounded-lg bg-amber-700 text-white font-semibold text-[10px] hover:bg-amber-800 border-none cursor-pointer flex items-center gap-1"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={actionLoading === r.id}
                        className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 border-none cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
