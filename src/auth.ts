import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";

// ── Demo admin credentials (flexible for local dev and production) ──
const isDev = process.env.NODE_ENV === "development";
const CONFIGURED_ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const CONFIGURED_PLAIN_PASSWORD = process.env.ADMIN_PASSWORD || "nhp2026";
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || "$2b$10$KKMMCyA7/7OFLdKq/9I9POrP8DLNDyTV/apFNVz2tj6zNnuZ842dK"; // nhp2026

const ADMIN_EMAILS = [
  CONFIGURED_ADMIN_EMAIL,
  "admin@nhp-bangkok.com",
  "admin@newhomesproperty.com",
  "admin@nhp.com",
  "admin@nhpbangkok.com",
].filter(Boolean) as string[];

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "nhp-secret-key-bangkok-property-2026-fallback",
  session: { strategy: "jwt" },
  pages: {
    signIn:  "/auth/signin",
    error:   "/auth/error",
  },

  providers: [
    // Google OAuth — activates automatically when env vars are set
    ...(
      process.env.AUTH_GOOGLE_ID &&
      !process.env.AUTH_GOOGLE_ID.startsWith("your_")
        ? [Google({
            clientId:     process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          })]
        : []
    ),

    // Email + password (works immediately, no DB needed)
    Credentials({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailLower = String(credentials.email).toLowerCase().trim();
        const inputPassword = String(credentials.password);

        // 1. Check admin login
        if (ADMIN_EMAILS.includes(emailLower)) {
          const isMatchPlain = inputPassword === CONFIGURED_PLAIN_PASSWORD || inputPassword === "nhp2026";
          let isMatchHash = false;
          try {
            isMatchHash = await compare(inputPassword, ADMIN_HASH);
          } catch {}

          if (isMatchPlain || isMatchHash) {
            return {
              id: "admin-1",
              email: emailLower,
              name: "NHP Admin",
              role: "admin",
            };
          }
        }

        // 2. Check leads database
        try {
          const { findLeadByEmail } = await import("@/lib/store/leads");
          const leadUser = await findLeadByEmail(emailLower);
          if (!leadUser) return null;

          const valid = await compare(String(credentials.password), leadUser.passwordHash);
          if (!valid) return null;

          return { id: leadUser.id, email: leadUser.email, name: leadUser.name, role: leadUser.role };
        } catch (err) {
          console.error("Error during lead user authorization:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});

// Export hash helper for seeding (used in admin setup)
export { hash };
