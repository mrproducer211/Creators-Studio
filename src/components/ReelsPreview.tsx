const REELS = [
  { gradient: "linear-gradient(180deg, #254D3E 0%, #1C3A2F 100%)", price: "฿18.5M", name: "Sky Residences Sukhumvit", badge: "2 Bed · For Sale" },
  { gradient: "linear-gradient(180deg, #7A5C12 0%, #C9A84C 100%)", price: "฿45K/mo", name: "Modern Studio Asok", badge: "Studio · Long Rent" },
  { gradient: "linear-gradient(180deg, #111 0%, #2E6150 100%)", price: "฿3,200/night", name: "Executive Suite Silom", badge: "2 Bed · Short Stay" },
  { gradient: "linear-gradient(180deg, #2E6150 0%, #7A5C12 100%)", price: "฿12M", name: "Townhouse Sathorn", badge: "3 Bed · For Sale" },
  { gradient: "linear-gradient(180deg, #1C3A2F 0%, #111 100%)", price: "฿65K/mo", name: "Penthouse On Nut", badge: "4 Bed · Long Rent" },
  { gradient: "linear-gradient(180deg, #C9A84C 0%, #1C3A2F 100%)", price: "฿8,000/night", name: "Villa Thong Lo", badge: "3 Bed · Short Stay" },
];

export default function ReelsPreview() {
  return (
    <section className="pt-8 pb-8 pl-4" style={{ background: "#1A1A1A" }}>
      {/* Header */}
      <div className="pr-4 mb-5 flex items-end justify-between">
        <div>
          <div
            className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5"
            style={{ color: "#C9A84C" }}
          >
            Property Reels
          </div>
          <div className="text-[20px] font-bold leading-[1.3]" style={{ color: "#FFFFFF" }}>
            Watch before you visit
          </div>
        </div>
        <a
          href="#"
          className="text-xs font-medium no-underline pb-px"
          style={{ color: "#E2C97E", borderBottom: "1px solid #E2C97E" }}
        >
          See all
        </a>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pr-4 pb-1 no-scrollbar">
        {REELS.map((reel, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[150px] h-[266px] rounded-2xl overflow-hidden relative cursor-pointer transition-transform duration-150 hover:scale-[1.03]"
          >
            {/* Background */}
            <div className="w-full h-full" style={{ background: reel.gradient }} />

            {/* Play button */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-base text-white"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
                border: "1.5px solid rgba(255,255,255,0.35)",
              }}
            >
              ▶
            </div>

            {/* Overlay with info */}
            <div
              className="absolute inset-0 flex flex-col justify-end p-3"
              style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.8) 100%)" }}
            >
              <div
                className="text-[15px] font-bold mb-0.5"
                style={{ color: "#E2C97E", letterSpacing: "-0.3px" }}
              >
                {reel.price}
              </div>
              <div
                className="text-[11px] font-normal mb-0.5 leading-[1.3]"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {reel.name}
              </div>
              <div
                className="text-[9px] uppercase tracking-[0.8px]"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {reel.badge}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
