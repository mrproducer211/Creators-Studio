"use client";

import { useState } from "react";
import { SubscriberRecord } from "@/lib/store/newsletter";
import { Mail, Search, Trash2, Copy, Download, Check, RefreshCw } from "lucide-react";

export default function NewsletterTable({ initialSubscribers }: { initialSubscribers: SubscriberRecord[] }) {
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>(initialSubscribers);
  const [search, setSearch] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.source.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCopyAll = () => {
    const allEmails = subscribers.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(allEmails);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Email,Subscribed At,Source"].concat(
        subscribers.map((s) => `"${s.email}","${s.createdAt}","${s.source}"`)
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nhp_newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from subscribers?`)) return;

    setDeletingEmail(email);
    try {
      const res = await fetch("/api/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.email !== email));
      } else {
        alert("Failed to delete subscriber.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting subscriber.");
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter");
      const data = await res.json();
      if (data.subscribers) {
        setSubscribers(data.subscribers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subscriber email or source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[#FAF9F6] border border-[#E5E0D8] focus:outline-none focus:border-[#1C3A2F]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-[#E5E0D8] bg-white text-[#1C3A2F] text-xs font-semibold hover:bg-[#FAF9F6] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleCopyAll}
            className="px-3 py-2 rounded-xl border border-[#E5E0D8] bg-white text-[#1C3A2F] text-xs font-semibold hover:bg-[#FAF9F6] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#C9A84C]" />}
            <span>{copiedAll ? "Copied All!" : "Copy All Emails"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-[#1C3A2F] text-white text-xs font-semibold hover:bg-[#144433] transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C9A84C]" />
            <h3 className="text-sm font-bold text-[#1C3A2F] m-0">
              Active Subscribers ({filtered.length})
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Total Captured: {subscribers.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-medium m-0">No subscribers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E5E0D8] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Subscriber Email</th>
                  <th className="py-3 px-5">Subscribed Date</th>
                  <th className="py-3 px-5">Source</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8] text-xs text-gray-700 font-normal">
                {filtered.map((sub) => (
                  <tr key={sub.email} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#1C3A2F]">
                      <div className="flex items-center gap-2">
                        <span>{sub.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF1EC] text-[#0F2A20]">
                        {sub.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleCopy(sub.email)}
                        className="p-1.5 rounded-lg border border-[#E5E0D8] bg-white text-gray-600 hover:text-[#1C3A2F] hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedEmail === sub.email ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(sub.email)}
                        disabled={deletingEmail === sub.email}
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                        title="Remove Subscriber"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
