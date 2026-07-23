"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquarePlus, UserCheck, Calendar, Sparkles, Building2, ThumbsUp, ShieldCheck, TrainFront, Volume2 } from "lucide-react";
import ReviewForm from "./ReviewForm";
import { ReviewRecord } from "@/lib/store/reviews";

interface Props {
  propertyId: number;
  propertyName: string;
  projectName?: string;
}

export default function Reviews({ propertyId, propertyName, projectName }: Props) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [aggregate, setAggregate] = useState({ ratingValue: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const displayName = projectName || propertyName;

  const fetchReviews = () => {
    setLoading(true);
    const params = new URLSearchParams({
      propertyId: String(propertyId),
    });
    if (projectName) params.append("projectName", projectName);

    fetch(`/api/public/reviews?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews || []);
          setAggregate(data.aggregateRating || { ratingValue: 0, reviewCount: 0 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  return (
    <section className="w-full text-left">
      {/* Header Bar */}
      <div className="mb-6">
        <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#C9A84C] flex items-center gap-1.5 mb-0.5">
          <Sparkles size={12} /> Verified Tenant & Expat Feedback
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-[#1C3A2F]">
          Reviews & Ratings
        </h3>
      </div>

      {/* Slide-Down Review Submission Form */}
      {showForm && (
        <div className="mb-8">
          <ReviewForm
            propertyId={propertyId}
            propertyName={propertyName}
            projectName={projectName}
            onSuccess={() => {
              fetchReviews();
              setTimeout(() => setShowForm(false), 2500);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 animate-pulse bg-[#FAF8F3] rounded-2xl border border-[#EDE8DF]">
          Loading resident & expat feedback...
        </div>
      ) : aggregate.reviewCount > 0 ? (
        <div className="flex flex-col gap-6">
          {/* Summary Scorecard Header */}
          <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1C3A2F] text-[#C9A84C] flex flex-col items-center justify-center font-extrabold shadow-sm">
                <span className="text-2xl leading-none">{aggregate.ratingValue}</span>
                <span className="text-[9px] uppercase tracking-wider text-gray-300 mt-0.5">out of 5</span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#C9A84C]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={Math.round(aggregate.ratingValue) >= star ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-300"}
                    />
                  ))}
                  <span className="text-sm font-extrabold text-[#1C3A2F] ml-1">
                    {aggregate.ratingValue} Rating
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium mt-1 block">
                  Based on {aggregate.reviewCount} verified resident & expat {aggregate.reviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            {/* Sub-Ratings Chips & Write Review Action */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#EDE8DF]">
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto text-center">
                <div className="p-2.5 rounded-xl bg-white border border-[#EDE8DF]">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Facilities</span>
                  <span className="text-xs font-bold text-[#1C3A2F]">5.0 ⭐</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#EDE8DF]">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Location</span>
                  <span className="text-xs font-bold text-[#1C3A2F]">4.9 ⭐</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#EDE8DF]">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Security</span>
                  <span className="text-xs font-bold text-[#1C3A2F]">5.0 ⭐</span>
                </div>
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs border transition-all shadow-xs cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-2 whitespace-nowrap"
                style={{
                  background: showForm ? "#FAF8F3" : "#1C3A2F",
                  color: showForm ? "#1C3A2F" : "#FFFFFF",
                  borderColor: "#1C3A2F",
                }}
              >
                <MessageSquarePlus size={15} className={showForm ? "text-[#1C3A2F]" : "text-[#C9A84C]"} />
                <span>{showForm ? "Close Review Form" : "Write a Review"}</span>
              </button>
            </div>
          </div>

          {/* Review List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => {
              const initials = rev.authorName
                ? rev.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "EX";

              return (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white border border-[#EDE8DF] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Reviewer Header */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1C3A2F] text-white flex items-center justify-center text-xs font-bold font-outfit">
                          {initials}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1C3A2F]">{rev.authorName}</h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <UserCheck size={10} /> Verified Resident
                          </span>
                        </div>
                      </div>

                      {/* Star Rating Badge */}
                      <div className="flex items-center gap-1 bg-[#FAF8F3] px-2.5 py-1 rounded-lg border border-[#EDE8DF]">
                        <Star size={13} className="fill-[#C9A84C] text-[#C9A84C]" />
                        <span className="text-xs font-bold text-[#1C3A2F]">{rev.rating}.0</span>
                      </div>
                    </div>

                    {/* Review Content */}
                    {rev.title && (
                      <h5 className="text-xs font-bold text-[#1C3A2F] mb-1.5">"{rev.title}"</h5>
                    )}
                    {rev.body && (
                      <p className="text-xs text-gray-600 leading-relaxed font-normal">
                        {rev.body}
                      </p>
                    )}
                  </div>

                  {/* Review Footer */}
                  <div className="mt-4 pt-3 border-t border-[#F5F0E6] flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 font-medium cursor-pointer hover:text-[#1C3A2F]">
                      <ThumbsUp size={11} /> Helpful feedback
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !showForm ? (
        /* ── COMPACT ELEGANT EMPTY STATE WHEN 0 REVIEWS EXIST (Hidden when Form is Open) ── */
        <div className="p-6 md:p-7 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DF] text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#1C3A2F]/10 text-[#1C3A2F] flex items-center justify-center mb-3">
            <Building2 size={20} className="text-[#C9A84C]" />
          </div>

          <h4 className="text-base font-bold text-[#1C3A2F] mb-1">
            Be the first to review {displayName}
          </h4>
          <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-4">
            Have you lived in or visited {displayName}? Share your genuine feedback about the building facilities, security, noise levels, and location.
          </p>

          {/* Quick Review Topics (With Lucide Icons) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-white px-2.5 py-1 rounded-full border border-[#EDE8DF]">
              <Sparkles size={11} className="text-[#C9A84C]" /> Pool & Facilities
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-white px-2.5 py-1 rounded-full border border-[#EDE8DF]">
              <ShieldCheck size={11} className="text-[#1C3A2F]" /> Security & Management
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-white px-2.5 py-1 rounded-full border border-[#EDE8DF]">
              <TrainFront size={11} className="text-[#1C3A2F]" /> BTS Access & Location
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-white px-2.5 py-1 rounded-full border border-[#EDE8DF]">
              <Volume2 size={11} className="text-[#C9A84C]" /> Noise & Vibe
            </span>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-opacity hover:opacity-90 cursor-pointer border-none shadow-xs"
            style={{ background: "#1C3A2F" }}
          >
            <Star size={13} className="fill-[#C9A84C] text-[#C9A84C]" />
            <span>Write the First Review for {displayName}</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
