"use client";

import { useState } from "react";
import { EnquiryPayload } from "@/lib/telegram";

type Status = "idle" | "loading" | "done" | "error";

export function useEnquiry() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(payload: EnquiryPayload) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/enquiry", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  return { status, errorMsg, submit, reset: () => setStatus("idle") };
}
