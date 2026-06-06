import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-24 text-center" style={{ background: "#F7F3EC" }}>
        {/* Main card panel */}
        <div className="relative max-w-md w-full p-8 rounded-3xl bg-white border border-[#E5E0D8] shadow-xl overflow-hidden">
          {/* Subtle luxury brand gradient line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1.5" 
            style={{ background: "linear-gradient(90deg, #1C3A2F 0%, #C9A84C 50%, #1C3A2F 100%)" }} 
          />
          
          <div 
            className="text-[72px] font-black leading-none mb-3 select-none" 
            style={{ color: "#1C3A2F", letterSpacing: "-3px" }}
          >
            404
          </div>
          
          <h1 
            className="text-xl font-bold mb-3" 
            style={{ color: "#1C3A2F", letterSpacing: "-0.5px" }}
          >
            Page Not Found
          </h1>
          
          <p 
            className="text-sm leading-relaxed mb-8 font-light" 
            style={{ color: "#555" }}
          >
            The premium listing or page you are seeking is either no longer active, has changed location, or the web address was mistyped.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/"
              className="px-5 py-3 rounded-xl text-sm font-semibold no-underline transition-transform active:scale-95 text-white text-center"
              style={{ background: "#1C3A2F" }}
            >
              Return Home
            </Link>
            <Link
              href="/explore"
              className="px-5 py-3 rounded-xl text-sm font-semibold no-underline transition-transform active:scale-95 border-2 text-center"
              style={{ borderColor: "#1C3A2F", color: "#1C3A2F", background: "transparent" }}
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
