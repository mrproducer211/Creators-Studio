"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  const getErrorMessage = (): string => {
    if (!error) return "An unexpected error occurred.";
    if (typeof error === "string") return error;
    if (error.message && typeof error.message === "string" && error.message !== "[object Object]") {
      return error.message;
    }
    try {
      const jsonStr = JSON.stringify(error);
      if (jsonStr && jsonStr !== "{}" && jsonStr !== "[]") {
        return jsonStr;
      }
    } catch {}
    return "An unexpected application error occurred. Please try again.";
  };

  const message = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F3EC] text-[#1C3A2F]">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E5E0D8] shadow-lg text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-[#C9A84C] flex items-center justify-center mb-4 border border-amber-200">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold mb-2 font-outfit">Something went wrong</h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-[#1C3A2F] text-white hover:bg-opacity-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2 font-outfit"
          >
            <RefreshCw size={14} /> Try Again
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs border border-[#E5E0D8] bg-white text-[#1C3A2F] hover:bg-gray-50 transition-all no-underline text-center flex items-center justify-center gap-2 font-outfit"
          >
            <Home size={14} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
