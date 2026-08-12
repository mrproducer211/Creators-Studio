import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Error — NHP Bangkok",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F7F3EC" }}>
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-4 text-[#DC2626]">
          <AlertTriangle size={48} />
        </div>
        <h1 className="text-[22px] font-bold mb-2" style={{ color: "#1C3A2F" }}>Sign-in failed</h1>
        <p className="text-[14px] font-light mb-6" style={{ color: "#555" }}>
          There was a problem signing you in. Check your credentials and try again.
        </p>
        <Link
          href="/auth/signin"
          className="inline-block px-6 py-3 rounded-xl text-[14px] font-semibold no-underline"
          style={{ background: "#1C3A2F", color: "#FFFFFF" }}
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
