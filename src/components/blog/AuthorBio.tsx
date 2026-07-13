import Image from "next/image";
import Link from "next/link";

export default function AuthorBio() {
  return (
    <div
      className="rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4"
      style={{ background: "#FFFFFF", border: "1px solid #EDE8DF" }}
    >
      {/* Avatar / Brand Image */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#1C3A2F] flex items-center justify-center border border-[#EDE8DF]">
        <Image
          src="/images/nhp-logo.webp"
          alt="NHP Bangkok Team"
          width={30}
          height={30}
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 text-center sm:text-left flex-grow">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#C9A84C]">
            About the Author
          </span>
          <h4 className="text-[14px] font-bold text-[#1C3A2F] m-0">
            NHP Bangkok Team
          </h4>
        </div>

        <p className="text-[12px] font-light leading-relaxed text-gray-500 m-0">
          We are a team of property professionals and long-term expats living and working in Bangkok. We compile honest, street-smart guides based on real city experience to help you navigate rentals, visas, school options, and daily life in Thailand.
        </p>

        <div className="pt-1">
          <Link
            href="/explore"
            className="text-[11px] font-bold no-underline hover:underline transition-colors"
            style={{ color: "#C9A84C" }}
          >
            Browse Bangkok Condos & Rentals →
          </Link>
        </div>
      </div>
    </div>
  );
}
