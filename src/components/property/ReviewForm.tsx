"use client";

import { useState } from "react";
import { Star, CheckCircle2, AlertCircle, Sparkles, Send, MapPin, ShieldCheck, CircleDollarSign, X } from "lucide-react";
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
  const [rating, setRating] = useState<number>(5);
  const [ratingLocation, setRatingLocation] = useState<number>(5);
  const [ratingFacilities, setRatingFacilities] = useState<number>(5);
  const [ratingManagement, setRatingManagement] = useState<number>(5);
  const [ratingValue, setRatingValue] = useState<number>(5);

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
          ratingLocation,
          ratingFacilities,
          ratingManagement,
          ratingValue,
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
      <div className="p-8 rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex flex-col items-center justify-center text-center my-4 animate-fadeIn shadow-xs">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3" />
        <h4 className="text-lg font-bold mb-1">{t.reviews.thankYouTitle}</h4>
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
      className="p-6 md:p-8 rounded-3xl border border-[#E5E0D8] bg-white flex flex-col gap-6 text-left my-2 shadow-sm transition-all relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EDE8DF] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C9A84C] flex items-center gap-1 mb-1 font-outfit">
            <Sparkles size={13} /> Airbnb Standard Verified Reviews
          </span>
          <h3 className="text-lg font-bold text-[#1C3A2F] leading-tight">
            Review {displayName}
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF8F3] hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black border border-[#EDE8DF] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Overall Rating Star Selector */}
      <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#EDE8DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-[#1C3A2F] uppercase tracking-wide">
            {t.reviews.overallScore}
          </label>
          <p className="text-[11px] text-gray-500 m-0 mt-0.5">{t.reviews.overallSub}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-[#EDE8DF] shadow-2xs">
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
            {(hoverRating || rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Sub-Category Ratings Grid (Airbnb Breakdown) */}
      <div>
        <label className="block text-xs font-bold text-[#1C3A2F] uppercase tracking-wide mb-3">
          Category Ratings
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Location */}
          <div className="flex items-center justify-between bg-[#FAF8F3] px-4 py-3 rounded-xl border border-[#EDE8DF]">
            <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
              <MapPin size={14} className="text-[#C9A84C]" /> {t.reviews.locationTransit}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingLocation(star)}
                  className="p-0.5 focus:outline-none cursor-pointer"
                >
                  <Star
                    size={15}
                    className={ratingLocation >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div className="flex items-center justify-between bg-[#FAF8F3] px-4 py-3 rounded-xl border border-[#EDE8DF]">
            <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
              <Sparkles size={14} className="text-[#1C3A2F]" /> {t.reviews.facilitiesAmenities}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingFacilities(star)}
                  className="p-0.5 focus:outline-none cursor-pointer"
                >
                  <Star
                    size={15}
                    className={ratingFacilities >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Management */}
          <div className="flex items-center justify-between bg-[#FAF8F3] px-4 py-3 rounded-xl border border-[#EDE8DF]">
            <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-700" /> {t.reviews.managementSecurity}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingManagement(star)}
                  className="p-0.5 focus:outline-none cursor-pointer"
                >
                  <Star
                    size={15}
                    className={ratingManagement >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Value */}
          <div className="flex items-center justify-between bg-[#FAF8F3] px-4 py-3 rounded-xl border border-[#EDE8DF]">
            <span className="text-xs font-medium text-gray-700 flex items-center gap-2">
              <CircleDollarSign size={14} className="text-[#C9A84C]" /> {t.reviews.valueForMoney}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="p-0.5 focus:outline-none cursor-pointer"
                >
                  <Star
                    size={15}
                    className={ratingValue >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#1C3A2F] mb-1.5">{t.reviews.yourName}</label>
          <input
            type="text"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            className="w-full px-4 py-3 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#1C3A2F] focus:bg-white transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#1C3A2F] mb-1.5">{t.reviews.emailOptional}</label>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="e.g. alex@example.com"
            className="w-full px-4 py-3 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#1C3A2F] focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Review Headline & Body */}
      <div>
        <label className="block text-xs font-bold text-[#1C3A2F] mb-1.5">{t.reviews.reviewHeadline}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.reviews.headlinePlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#1C3A2F] focus:bg-white transition-all font-medium"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#1C3A2F] mb-1.5">{t.reviews.detailedExperience}</label>
        <textarea
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.reviews.bodyPlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none resize-none focus:border-[#1C3A2F] focus:bg-white transition-all font-medium leading-relaxed"
        />
      </div>

      {error && (
        <div className="text-xs text-rose-600 flex items-center gap-2 bg-rose-50 p-3 rounded-xl border border-rose-200 font-medium">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="py-3.5 px-8 rounded-xl font-bold text-xs text-white transition-all hover:bg-[#1C3A2F]/90 disabled:opacity-50 cursor-pointer border-none flex items-center gap-2 shadow-xs"
          style={{ background: "#1C3A2F" }}
        >
          <Send size={14} className="text-[#C9A84C]" />
          <span>{submitting ? "Submitting..." : t.reviews.submitReview}</span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 px-5 rounded-xl font-bold text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer border-none"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
