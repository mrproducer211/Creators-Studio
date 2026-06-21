import AboutClient from "@/components/about/AboutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NHP Bangkok | Bangkok Property Experts for Expats & Nomads",
  description:
    "NHP Bangkok is a specialist property platform built for expats, digital nomads, and international residents seeking condos, long-term rentals, and short-stay apartments in Bangkok's best neighbourhoods.",
};

export default function AboutPage() {
  return <AboutClient />;
}
