import PrivacyClient from "@/components/privacy/PrivacyClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NHP Bangkok — How We Handle Your Data",
  description:
    "Read the NHP Bangkok Privacy Policy to learn how we collect, use, and safeguard your personal information when using our Bangkok real estate platform.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
