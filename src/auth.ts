import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";

// ── Demo admin credentials (replace with DB lookup in production) ──
const DEMO_USERS = [
  {
    id:       "admin-1",
    email:    "admin@nhp-bangkok.com",
    name:     "NHP Admin",
    password: "$2b$10$KKMMCyA7/7OFLdKq/9I9POrP8DLNDyTV/apFNVz2tj6zNnuZ842dK", // nhp2026
    role:     "admin",
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
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
        console.log("Authorize called with credentials:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          passwordLength: credentials?.password ? String(credentials.password).length : 0,
        });
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        const emailLower = String(credentials.email).toLowerCase();

        // 1. Check demo/admin users first
        const demoUser = DEMO_USERS.find((u) => u.email === emailLower);
        if (demoUser) {
          try {
            const valid = await compare(String(credentials.password), demoUser.password);
            if (!valid) return null;
            return { id: demoUser.id, email: demoUser.email, name: demoUser.name, role: demoUser.role };
          } catch (err) {
            console.error("Error comparing demo user password:", err);
            return null;
          }
        }

        // 2. Check leads database
        try {
          const { findLeadByEmail } = await import("@/lib/store/leads");
          const leadUser = await findLeadByEmail(emailLower);
          if (!leadUser) {
            console.log("No user found with email:", emailLower);
            return null;
          }

          const valid = await compare(String(credentials.password), leadUser.passwordHash);
          if (!valid) {
            console.log("Password invalid for user:", emailLower);
            return null;
          }

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
