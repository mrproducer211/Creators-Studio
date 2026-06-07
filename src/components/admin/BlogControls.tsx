"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BlogControls() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<"ai" | "rss" | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const triggerRss = async () => {
    setLoading(true);
    setActionType("rss");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/blog/rss-sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "RSS Sync failed");
      
      setMessage({
        text: `Successfully synced RSS feed! Added ${data.added} new articles.`,
        type: "success",
      });
      router.refresh();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Sync failed",
        type: "error",
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const triggerAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setLoading(true);
    setActionType("ai");
    setMessage(null);
    setShowAiModal(false);

    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");

      setMessage({
        text: `AI successfully generated and published: "${data.post.title}"!`,
        type: "success",
      });
      setAiPrompt("");
      router.refresh();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Generation failed",
        type: "error",
      });
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const buttonStyle = {
    fontFamily: "inherit",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* + New Post (Custom routing) */}
        <a
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold no-underline"
          style={{ background: "#1C3A2F", color: "#FFFFFF", ...buttonStyle }}
        >
          + Create Post
        </a>

        {/* AI Generate Button */}
        <button
          onClick={() => setShowAiModal(true)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border border-[#E5E0D8] text-[#1C3A2F]"
          style={{ background: "#FFFFFF", ...buttonStyle }}
        >
          {loading && actionType === "ai" ? "🤖 Generating..." : "🤖 AI Generate Post"}
        </button>

        {/* RSS Sync Button */}
        <button
          onClick={triggerRss}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold border border-[#E5E0D8] text-[#1C3A2F]"
          style={{ background: "#FFFFFF", ...buttonStyle }}
        >
          {loading && actionType === "rss" ? "🔄 Syncing..." : "🔄 Sync RSS Feeds"}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className="p-3.5 rounded-xl text-[12px] font-medium border"
          style={{
            background: message.type === "success" ? "rgba(74,222,128,0.1)" : "rgba(224,82,82,0.1)",
            borderColor: message.type === "success" ? "#4ADE80" : "#E05252",
            color: message.type === "success" ? "#1E4620" : "#721C24",
          }}
        >
          {message.text}
        </div>
      )}

      {/* AI Generator Prompt Modal */}
      {showAiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowAiModal(false)}
        >
          <form
            onSubmit={triggerAiGenerate}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl p-6 border shadow-xl"
            style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[16px] font-bold" style={{ color: "#1C3A2F" }}>AI Blog post generator</h3>
                <p className="text-[12px] mt-0.5 text-gray-500">Enter a topic or neighborhood in Bangkok to generate a complete guide.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 border-none"
              >
                ✕
              </button>
            </div>

            <textarea
              required
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Living in Sathorn for expats, street food spots, and condo rental budgets."
              className="w-full rounded-xl px-4 py-3 text-[13px] outline-none border focus:border-[#1C3A2F] mb-4"
              style={{ borderColor: "#E5E0D8", fontFamily: "inherit" }}
            />

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold border bg-white text-gray-600"
                style={{ borderColor: "#E5E0D8", fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-[12px] font-semibold text-white"
                style={{ background: "#1C3A2F", border: "none", fontFamily: "inherit" }}
              >
                Generate Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
