import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function setCorsHeaders(response: NextResponse, origin: string | null) {
  const allowedOrigins = new Set([
    "https://www.kibbledrop.com",
    "https://kibbledrop.com",
    "http://localhost:3000",
  ]);

  if (origin && allowedOrigins.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Vary", "Origin");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  return response;
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const origin = req.headers.get("origin");

    // Handle CORS for API routes (including preflight)
    if (pathname.startsWith("/api")) {
      if (req.method === "OPTIONS") {
        return setCorsHeaders(new NextResponse(null, { status: 204 }), origin);
      }
    }

    // Check if user is trying to access admin routes
    if (pathname.startsWith("/admin")) {
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

    // For all other requests, continue and attach CORS headers for API
    const res = NextResponse.next();
    if (pathname.startsWith("/api")) {
      return setCorsHeaders(res, origin);
    }
    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Only protect specific API scopes + all admin
        const isProtectedApi =
          path.startsWith("/api/pets") ||
          path.startsWith("/api/subscription") ||
          path.startsWith("/api/admin");

        if (path.startsWith("/admin") || isProtectedApi) {
          // Admin routes require admin role, protected APIs require any auth
          if (path.startsWith("/admin")) return token?.role === "admin";
          return !!token;
        }

        // Everything else (including public APIs) allowed
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
