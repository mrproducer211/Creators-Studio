"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global system error:", error);
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
    return "An unexpected system error occurred.";
  };

  const message = getErrorMessage();

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#F7F3EC", color: "#1C3A2F" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: "400px", width: "100%", background: "#FFFFFF", padding: "32px", borderRadius: "24px", border: "1px solid #E5E0D8", textAlign: "center" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>System Error</h2>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "24px", lineHeight: "1.5" }}>
              {message}
            </p>
            <button
              onClick={() => reset()}
              style={{ width: "100%", padding: "12px", borderRadius: "12px", fontWeight: "bold", fontSize: "13px", background: "#1C3A2F", color: "#FFFFFF", border: "none", cursor: "pointer" }}
            >
              Refresh Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
