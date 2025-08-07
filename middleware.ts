import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token;

      // If no token, redirect to login
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // If user is not admin, redirect to dashboard
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // For admin routes, require admin role
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }

        // For other protected routes, just require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/api/pets/:path*",
    "/api/subscription/:path*",
    "/api/admin/:path*",
  ],
};
