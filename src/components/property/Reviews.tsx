"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  UserCheck,
  Calendar,
  Sparkles,
  Building2,
  ThumbsUp,
  ShieldCheck,
  MapPin,
  CircleDollarSign,
  ChevronRight,
  ChevronLeft,
  X,
  MessageSquarePlus,
  Search,
} from "lucide-react";
import ReviewForm from "./ReviewForm";
import { ReviewRecord } from "@/lib/store/reviews";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  propertyId: number;
  propertyName: string;
  projectName?: string;
}

const REVIEW_TRANSLATIONS: Record<string, { thTitle?: string; thBody?: string; zhTitle?: string; zhBody?: string }> = {
  "Stunning skyline views & top gym": {
    thTitle: "วิวขอบฟ้าที่สวยงามและฟิตเนสชั้นเลิศ",
    thBody: "อาศัยอยู่ที่นี่มา 1 ปี สระว่ายน้ำอินฟินิตี้บนดาดฟ้าและฟิตเนสยอดเยี่ยมมาก เดินไป BTS อโศกใช้เวลาไม่ถึง 7 นาที",
    zhTitle: "绝美天际线景观与顶尖健身房",
    zhBody: "在此居住已满 1 年。顶楼无边际泳池与健身房非常棒，步行至 BTS Asok 站不到 7 分钟。",
  },
  "Super convenient & quiet building": {
    thTitle: "อาคารสะดวกสบายมากและเงียบสงบ",
    thBody: "การบริหารจัดการของแสนสิริดีเยี่ยม ระบบรักษาความปลอดภัย 24 ชม. และช่วยเหลือดีมาก ชอบเลานจ์โคเวิร์กกิ้งสำหรับทำงานรีโมท",
    zhTitle: "极其便利且极其安静的大楼",
    zhBody: "尚思瑞 (Sansiri) 物业管理非常棒，24小时安保热情尽责。非常喜欢专为远程办公设计的共享工作区。",
  },
  "Best value near BTS On Nut": {
    thTitle: "คุ้มค่าที่สุดใกล้ BTS อ่อนนุช",
    thBody: "อาคารเงียบสงบมาก การดูแลสัตว์เลี้ยงทำได้ดีเยี่ยม และเดินทางไปโลตัสอ่อนนุชกับเซ็นจูรี่มอลล์ได้รวดเร็ว",
    zhTitle: "BTS 安努 (On Nut) 站附近性价比极高",
    zhBody: "大楼环境非常安静，宠物友好型管理非常出色，前往 Lotus On Nut 和 Century 购物中心极其便捷。",
  },
  "Peaceful garden condo with shuttle bus": {
    thTitle: "คอนโดสวนเงียบสงบพร้อมรถรับส่ง",
    thBody: "สระว่ายน้ำสไตล์รีสอร์ท บรรยากาศเงียบสงบห่างจากเสียงรบกวนถนนใหญ่ รถรับส่งฟรีไป BTS สะดวกมาก",
    zhTitle: "宁静花园景观公寓配有接驳车",
    zhBody: "度假村风格泳池，远离主干道噪音环境清幽。免费前往轻轨站的接驳车非常实用方便。",
  },
};

function translateReviewContent(title?: string, body?: string, lang: string = "en") {
  if (lang === "en" || (!title && !body)) return { title, body };
  const matched = title && REVIEW_TRANSLATIONS[title];
  if (matched) {
    return {
      title: lang === "th" ? (matched.thTitle || title) : lang === "zh" ? (matched.zhTitle || title) : title,
      body: lang === "th" ? (matched.thBody || body) : lang === "zh" ? (matched.zhBody || body) : body,
    };
  }
  return { title, body };
}

export default function Reviews({ propertyId, propertyName, projectName }: Props) {
  const { lang, t } = useLanguage();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [aggregate, setAggregate] = useState<{
    ratingValue: number;
    reviewCount: number;
    ratingLocation?: number;
    ratingFacilities?: number;
    ratingManagement?: number;
    ratingValueForMoney?: number;
  }>({ ratingValue: 0, reviewCount: 0 });

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const displayName = projectName || propertyName;

  const fetchReviews = useCallback(() => {
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
  }, [propertyId, projectName]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleScroll = (dir: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = dir === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const filteredModalReviews = reviews.filter((r) => {
    if (!modalSearch.trim()) return true;
    const term = modalSearch.toLowerCase();
    return (
      r.authorName.toLowerCase().includes(term) ||
      (r.title && r.title.toLowerCase().includes(term)) ||
      (r.body && r.body.toLowerCase().includes(term))
    );
  });

  return (
    <section className="w-full text-left font-sans">
      {/* ── AIRBNB HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#EDE8DF]">
        <div>
          <div className="flex items-center gap-2 text-[#1C3A2F] mb-1">
            <Star className="w-5 h-5 fill-[#1C3A2F] text-[#1C3A2F]" />
            <h3 className="text-2xl font-bold tracking-tight font-outfit">
              {aggregate.ratingValue > 0 ? aggregate.ratingValue : "New"} · {aggregate.reviewCount} {aggregate.reviewCount === 1 ? "review" : "reviews"}
            </h3>
          </div>
          <p className="text-xs text-gray-500 font-normal m-0">
            Verified resident & expat feedback for {displayName}
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#1C3A2F] text-xs font-semibold text-[#1C3A2F] hover:bg-[#1C3A2F] hover:text-white transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto shadow-2xs"
        >
          <MessageSquarePlus size={14} />
          <span>{showForm ? "Close Form" : "Write a Review"}</span>
        </button>
      </div>

      {/* ── WRITE REVIEW SLIDE-OVER FORM ── */}
      {showForm && (
        <div className="mb-8">
          <ReviewForm
            propertyId={propertyId}
            propertyName={propertyName}
            projectName={projectName}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              fetchReviews();
              setTimeout(() => setShowForm(false), 2000);
            }}
          />
        </div>
      )}

      {/* ── AIRBNB SUB-RATINGS BADGES ── */}
      {aggregate.reviewCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1">
              <MapPin size={13} className="text-[#C9A84C]" /> Location
            </span>
            <span className="text-base font-bold text-[#1C3A2F]">
              {(aggregate.ratingLocation || aggregate.ratingValue).toFixed(1)} ★
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1">
              <Sparkles size={13} className="text-[#1C3A2F]" /> Facilities
            </span>
            <span className="text-base font-bold text-[#1C3A2F]">
              {(aggregate.ratingFacilities || aggregate.ratingValue).toFixed(1)} ★
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1">
              <ShieldCheck size={13} className="text-emerald-700" /> Management
            </span>
            <span className="text-base font-bold text-[#1C3A2F]">
              {(aggregate.ratingManagement || aggregate.ratingValue).toFixed(1)} ★
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 mb-1">
              <CircleDollarSign size={13} className="text-[#C9A84C]" /> Value
            </span>
            <span className="text-base font-bold text-[#1C3A2F]">
              {(aggregate.ratingValueForMoney || aggregate.ratingValue).toFixed(1)} ★
            </span>
          </div>
        </div>
      )}

      {/* ── LOADING STATE ── */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 animate-pulse bg-[#FAF8F3] rounded-3xl border border-[#EDE8DF]">
          Loading resident reviews...
        </div>
      ) : reviews.length > 0 ? (
        <div className="relative group/carousel">
          {/* Controls for desktop carousel */}
          {reviews.length > 2 && (
            <div className="hidden md:flex items-center gap-2 absolute -top-14 right-0">
              <button
                onClick={() => handleScroll("left")}
                className="w-8 h-8 rounded-full border border-[#EDE8DF] bg-white hover:bg-gray-50 flex items-center justify-center text-[#1C3A2F] transition-all shadow-2xs cursor-pointer"
                aria-label="Previous reviews"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="w-8 h-8 rounded-full border border-[#EDE8DF] bg-white hover:bg-gray-50 flex items-center justify-center text-[#1C3A2F] transition-all shadow-2xs cursor-pointer"
                aria-label="Next reviews"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── AIRBNB HORIZONTALLY SCROLLABLE CAROUSEL ── */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ touchAction: "pan-x" }}
          >
            {reviews.map((rev) => {
              const initials = rev.authorName
                ? rev.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "EX";

              const { title: translatedTitle, body: translatedBody } = translateReviewContent(
                rev.title,
                rev.body,
                lang
              );

              return (
                <div
                  key={rev.id}
                  className="w-[300px] sm:w-[350px] shrink-0 snap-start p-5 rounded-3xl bg-white border border-[#EDE8DF] shadow-xs flex flex-col justify-between transition-all hover:border-[#1C3A2F]/30"
                >
                  <div>
                    {/* Reviewer Header */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1C3A2F] text-white flex items-center justify-center text-xs font-bold font-outfit shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#1C3A2F] truncate">{rev.authorName}</h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <UserCheck size={10} /> Verified
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-[#FAF8F3] px-2 py-1 rounded-lg border border-[#EDE8DF] shrink-0">
                        <Star size={12} className="fill-[#C9A84C] text-[#C9A84C]" />
                        <span className="text-xs font-bold text-[#1C3A2F]">{rev.rating}.0</span>
                      </div>
                    </div>

                    {/* Review Content */}
                    {translatedTitle && (
                      <h5 className="text-xs font-bold text-[#1C3A2F] mb-1.5 line-clamp-1">
                        &quot;{translatedTitle}&quot;
                      </h5>
                    )}
                    {translatedBody && (
                      <p className="text-xs text-gray-600 leading-relaxed font-normal line-clamp-4 m-0">
                        {translatedBody}
                      </p>
                    )}
                  </div>

                  {/* Review Footer */}
                  <div className="mt-4 pt-3 border-t border-[#F5F0E6] flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 font-medium">
                      <ThumbsUp size={11} /> Helpful
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show All Reviews Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowAllModal(true)}
              className="px-5 py-3 rounded-2xl border border-[#1C3A2F] text-xs font-bold text-[#1C3A2F] hover:bg-[#1C3A2F] hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            >
              <span>Show all {reviews.length} reviews</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : !showForm ? (
        /* ── AIRBNB ELEGANT EMPTY STATE ── */
        <div className="p-8 rounded-3xl bg-[#FAF8F3] border border-[#EDE8DF] text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#1C3A2F]/10 text-[#1C3A2F] flex items-center justify-center mb-3">
            <Building2 size={24} className="text-[#C9A84C]" />
          </div>
          <h4 className="text-base font-bold text-[#1C3A2F] mb-1">
            Be the first to review {displayName}
          </h4>
          <p className="text-xs text-gray-500 max-w-md leading-relaxed mb-5">
            Share your experience on building amenities, location access, and management to help future residents.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white transition-opacity hover:opacity-90 cursor-pointer border-none shadow-xs"
            style={{ background: "#1C3A2F" }}
          >
            <Star size={14} className="fill-[#C9A84C] text-[#C9A84C]" />
            <span>Write a Review for {displayName}</span>
          </button>
        </div>
      ) : null}

      {/* ── AIRBNB FULL REVIEWS OVERLAY MODAL ── */}
      {showAllModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E5E0D8]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#EDE8DF] flex items-center justify-between bg-[#FAF8F3]">
              <div>
                <div className="flex items-center gap-2 text-[#1C3A2F]">
                  <Star size={18} className="fill-[#1C3A2F]" />
                  <h3 className="text-xl font-bold font-outfit">
                    {aggregate.ratingValue > 0 ? aggregate.ratingValue : "New"} · {reviews.length} reviews
                  </h3>
                </div>
                <p className="text-xs text-gray-500 m-0 mt-0.5">{displayName}</p>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black border border-[#EDE8DF] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Search input inside modal */}
              <div className="relative max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search reviews..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#EDE8DF] bg-[#FAF8F3] text-xs text-[#1C3A2F] outline-none focus:border-[#1C3A2F] focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Reviews grid in modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModalReviews.map((rev) => {
                  const initials = rev.authorName
                    ? rev.authorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "EX";

                  const { title: translatedTitle, body: translatedBody } = translateReviewContent(
                    rev.title,
                    rev.body,
                    lang
                  );

                  return (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DF] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1C3A2F] text-white flex items-center justify-center text-xs font-bold font-outfit shrink-0">
                              {initials}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#1C3A2F]">{rev.authorName}</h4>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <UserCheck size={10} /> Verified
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-[#EDE8DF]">
                            <Star size={12} className="fill-[#C9A84C] text-[#C9A84C]" />
                            <span className="text-xs font-bold text-[#1C3A2F]">{rev.rating}.0</span>
                          </div>
                        </div>

                        {translatedTitle && (
                          <h5 className="text-xs font-bold text-[#1C3A2F] mb-1 font-outfit">&quot;{translatedTitle}&quot;</h5>
                        )}
                        {translatedBody && (
                          <p className="text-xs text-gray-600 leading-relaxed font-normal m-0">{translatedBody}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#EDE8DF] flex items-center justify-between text-[10px] text-gray-400">
                        <span>
                          {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
