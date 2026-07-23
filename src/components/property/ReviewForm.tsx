"use client";

import { useState } from "react";
import { Star, CheckCircle2, AlertCircle, Sparkles, Send } from "lucide-react";
import { useSession } from "next-auth/react";

interface Props {
  propertyId: number;
  propertyName: string;
  projectName?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ propertyId, propertyName, projectName, onSuccess }: Props) {
  const { data: session } = useSession();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState(session?.user?.name || "");
  const [authorEmail, setAuthorEmail] = useState(session?.user?.email || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const displayName = projectName || propertyName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          projectName: displayName,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex flex-col items-center justify-center text-center my-4 animate-fadeIn">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
        <h4 className="text-base font-bold mb-1">Thank You for Your Review!</h4>
        <p className="text-xs text-emerald-700 max-w-sm">
          Your feedback for <strong>{displayName}</strong> has been submitted and is pending quick admin approval.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 rounded-2xl border border-[#EDE8DF] bg-[#FAF8F3] flex flex-col gap-4 text-left my-2 transition-all"
    >
      <div className="flex items-center justify-between border-b border-[#F5F0E6] pb-3">
        <div>
          <h4 className="text-base font-bold text-[#1C3A2F] flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#C9A84C]" />
            Write a Review for {displayName}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Share your experience living at or visiting this condo project.
          </p>
        </div>
      </div>

      {/* Interactive 5-Star Rating Picker */}
      <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#EDE8DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <label className="block text-xs font-bold text-[#1C3A2F]">Overall Rating Score</label>
          <span className="text-[11px] text-gray-500">Hover and click to rate 1 to 5 stars</span>
        </div>
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#EDE8DF]">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-115 focus:outline-none cursor-pointer"
            >
              <Star
                size={22}
                className={(hoverRating || rating) >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-extrabold text-[#C9A84C]">
            {hoverRating || rating}.0 / 5.0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#1C3A2F] mb-1">Your Name *</label>
          <input
            type="text"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#C9A84C]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#1C3A2F] mb-1">Email (Optional)</label>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="e.g. alex@example.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#C9A84C]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1C3A2F] mb-1">Review Headline</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Peaceful condo near BTS with great gym & pool"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#C9A84C]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1C3A2F] mb-1">Your Detailed Experience</label>
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How are the facilities, security, noise levels, and location?"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none resize-none focus:border-[#C9A84C]"
        />
      </div>

      {error && (
        <div className="text-xs text-rose-600 flex items-center gap-1 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="py-3 px-6 rounded-xl font-bold text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-50 self-start cursor-pointer border-none flex items-center gap-2"
        style={{ background: "#1C3A2F" }}
      >
        <Send size={14} className="text-[#C9A84C]" />
        <span>{submitting ? "Submitting Review..." : "Submit Review for Approval"}</span>
      </button>
    </form>
  );
}
