import { Suspense } from "react";
import SignInClient from "@/components/auth/SignInClient";

export const metadata = {
  title: "Sign In — NHP Bangkok",
  description: "Sign in to your NHP Bangkok account to save favorite properties, create custom watchlists, schedule viewings, and manage your rental inquiries seamlessly.",
};

export default function SignInPage() {
  const googleEnabled =
    !!process.env.AUTH_GOOGLE_ID &&
    !process.env.AUTH_GOOGLE_ID.startsWith("your_");

  return (
    <Suspense fallback={null}>
      <SignInClient googleEnabled={googleEnabled} />
    </Suspense>
  );
}
