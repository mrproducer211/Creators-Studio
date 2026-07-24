"use client";

import { useState } from "react";
import { Star, CheckCircle2, AlertCircle, Sparkles, Send, MapPin, ShieldCheck, CircleDollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  propertyId: number;
  propertyName: string;
  projectName?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ propertyId, propertyName, projectName, onSuccess }: Props) {
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
      <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900 flex flex-col items-center justify-center text-center my-4 animate-fadeIn">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
        <h4 className="text-base font-bold mb-1">{t.reviews.thankYouTitle}</h4>
        <p className="text-xs text-emerald-700 max-w-sm">
          {t.reviews.thankYouSub}
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
            {t.reviews.writeReview} — {displayName}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {t.reviews.beFirstSub}
          </p>
        </div>
      </div>

      {/* Interactive Multi-Category Star Rating Pickers */}
      <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#EDE8DF] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#EDE8DF]">
          <div>
            <label className="block text-xs font-bold text-[#1C3A2F]">{t.reviews.overallScore}</label>
            <span className="text-[10px] text-gray-500">{t.reviews.overallSub}</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#EDE8DF]">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
              >
                <Star
                  size={18}
                  className={(hoverRating || rating) >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                />
              </button>
            ))}
            <span className="ml-1.5 text-xs font-extrabold text-[#C9A84C]">
              {hoverRating || rating}.0
            </span>
          </div>
        </div>

        {/* Sub-Category Ratings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Location Rating */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#EDE8DF]">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#C9A84C]" /> {t.reviews.locationTransit}
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

          {/* Facilities Rating */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#EDE8DF]">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#1C3A2F]" /> {t.reviews.facilitiesAmenities}
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

          {/* Management Rating */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#EDE8DF]">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-700" /> {t.reviews.managementSecurity}
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

          {/* Value Rating */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#EDE8DF]">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <CircleDollarSign size={13} className="text-[#C9A84C]" /> {t.reviews.valueForMoney}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#1C3A2F] mb-1">{t.reviews.yourName}</label>
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
          <label className="block text-xs font-semibold text-[#1C3A2F] mb-1">{t.reviews.emailOptional}</label>
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
        <label className="block text-xs font-semibold text-[#1C3A2F] mb-1">{t.reviews.reviewHeadline}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.reviews.headlinePlaceholder}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#C9A84C]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1C3A2F] mb-1">{t.reviews.detailedExperience}</label>
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t.reviews.bodyPlaceholder}
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
        <span>{submitting ? "Submitting..." : t.reviews.submitReview}</span>
      </button>
    </form>
  );
}
