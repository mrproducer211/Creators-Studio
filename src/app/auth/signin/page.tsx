import { Suspense } from "react";
import SignInClient from "@/components/auth/SignInClient";

export const metadata = {
  title: "Sign In — NHP Bangkok",
  description: "Sign in to save properties and manage your enquiries.",
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
