import type { NextAuthConfig } from "next-auth";

// This config is used by the middleware (Edge runtime)
// DO NOT import Prisma or other Node.js-only modules here
export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLandlord = nextUrl.pathname.startsWith("/landlord");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      if (isOnAuth) {
        if (isLoggedIn) {
          const role = auth?.user?.role;
          if (role === "ADMIN") {
            return Response.redirect(new URL("/admin", nextUrl));
          } else if (role === "LANDLORD") {
            return Response.redirect(new URL("/landlord", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isOnAdmin) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/auth/login", nextUrl));
        }
        if (auth?.user?.role !== "ADMIN") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
        return true;
      }

      if (isOnLandlord) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/auth/login", nextUrl));
        }
        if (auth?.user?.role !== "LANDLORD" && auth?.user?.role !== "ADMIN") {
          return Response.redirect(new URL("/unauthorized", nextUrl));
        }
        return true;
      }

      if (isOnDashboard) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/auth/login", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
};
