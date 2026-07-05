import PrivacyClient from "@/components/privacy/PrivacyClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NHP Bangkok — How We Handle Your Data",
  description:
    "Read the NHP Bangkok Privacy Policy to understand what personal data we collect, how it is used, and how we protect your information as a user of our Bangkok property platform.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
