import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function proxy(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  // Protect admin routes — redirect to sign-in if not logged in
  if (pathname.startsWith("/admin") && !session) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
