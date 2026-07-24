"use client";

import { useState } from "react";
import { Star, CheckCircle2, AlertCircle, Sparkles, Send, MapPin, ShieldCheck, CircleDollarSign, X, SlidersHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  propertyId: number;
  propertyName: string;
  projectName?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ReviewForm({ propertyId, propertyName, projectName, onSuccess, onClose }: Props) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  
  // Quick mode defaults
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState(session?.user?.name || "");
  const [body, setBody] = useState("");

  // Optional category ratings toggle
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);
  const [ratingLocation, setRatingLocation] = useState<number>(5);
  const [ratingFacilities, setRatingFacilities] = useState<number>(5);
  const [ratingManagement, setRatingManagement] = useState<number>(5);
  const [ratingValue, setRatingValue] = useState<number>(5);

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
          authorEmail: session?.user?.email || undefined,
          rating,
          ratingLocation: showDetailedRatings ? ratingLocation : rating,
          ratingFacilities: showDetailedRatings ? ratingFacilities : rating,
          ratingManagement: showDetailedRatings ? ratingManagement : rating,
          ratingValue: showDetailedRatings ? ratingValue : rating,
          title: body.trim() ? (body.length > 50 ? `${body.substring(0, 47)}...` : body) : undefined,
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
      <div className="p-6 md:p-8 rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex flex-col items-center justify-center text-center my-4 animate-fadeIn shadow-xs">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
        <h4 className="text-base font-bold mb-1">{t.reviews.thankYouTitle}</h4>
        <p className="text-xs text-emerald-700 max-w-sm leading-relaxed mb-4">
          {t.reviews.thankYouSub}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1C3A2F] text-white text-xs font-semibold hover:opacity-90 transition-opacity border-none cursor-pointer"
          >
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 md:p-6 rounded-3xl border border-[#E5E0D8] bg-white flex flex-col gap-5 text-left my-2 shadow-sm transition-all relative"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-3.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C9A84C] flex items-center gap-1 mb-0.5 font-outfit">
            <Sparkles size={12} /> Quick Review Mode
          </span>
          <h3 className="text-base font-bold text-[#1C3A2F] leading-tight">
            Review {displayName}
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FAF8F3] hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black border border-[#EDE8DF] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Step 1: Star Rating */}
      <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#EDE8DF] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#1C3A2F] uppercase tracking-wide">
          Tap your rating:
        </span>
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#EDE8DF]">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
            >
              <Star
                size={22}
                className={(hoverRating || rating) >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-200"}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-extrabold text-[#1C3A2F] font-outfit">
            {(hoverRating || rating)}.0
          </span>
        </div>
      </div>

      {/* Step 2: Name & Comment */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-[#1C3A2F] mb-1">Your Name</label>
          <input
            type="text"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#1C3A2F] focus:bg-white transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1C3A2F] mb-1">Your Review</label>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell us about location access, management, or overall living experience..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none resize-none focus:border-[#1C3A2F] focus:bg-white transition-all font-medium leading-relaxed"
          />
        </div>
      </div>

      {/* Optional Sub-Category Ratings Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetailedRatings(!showDetailedRatings)}
          className="text-[11px] font-semibold text-[#1C3A2F] hover:text-[#C9A84C] inline-flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <SlidersHorizontal size={13} className="text-[#C9A84C]" />
          <span>{showDetailedRatings ? "Hide detailed category ratings" : "+ Add detailed ratings (Location, Facilities, etc.)"}</span>
        </button>

        {showDetailedRatings && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 animate-fadeIn">
            {/* Location */}
            <div className="flex items-center justify-between bg-[#FAF8F3] px-3 py-2 rounded-xl border border-[#EDE8DF]">
              <span className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5">
                <MapPin size={12} className="text-[#C9A84C]" /> Location
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingLocation(star)}
                    className="p-0.5 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={14}
                      className={ratingLocation >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="flex items-center justify-between bg-[#FAF8F3] px-3 py-2 rounded-xl border border-[#EDE8DF]">
              <span className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#1C3A2F]" /> Facilities
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingFacilities(star)}
                    className="p-0.5 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={14}
                      className={ratingFacilities >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Management */}
            <div className="flex items-center justify-between bg-[#FAF8F3] px-3 py-2 rounded-xl border border-[#EDE8DF]">
              <span className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-700" /> Management
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingManagement(star)}
                    className="p-0.5 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={14}
                      className={ratingManagement >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Value */}
            <div className="flex items-center justify-between bg-[#FAF8F3] px-3 py-2 rounded-xl border border-[#EDE8DF]">
              <span className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5">
                <CircleDollarSign size={12} className="text-[#C9A84C]" /> Value
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className="p-0.5 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={14}
                      className={ratingValue >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="py-3 px-6 rounded-xl font-bold text-xs text-white transition-all hover:bg-[#1C3A2F]/90 disabled:opacity-50 cursor-pointer border-none flex items-center gap-2 shadow-xs"
          style={{ background: "#1C3A2F" }}
        >
          <Send size={14} className="text-[#C9A84C]" />
          <span>{submitting ? "Posting..." : "Submit Review"}</span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl font-bold text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer border-none"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
