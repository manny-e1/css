import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ROUTE_CONFIGS, roleMiddleware } from "@/lib/middleware-config";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that should not be protected
  if (
    pathname.startsWith("/supplier/register") ||
    pathname.startsWith("/auth/verify-email") ||
    pathname.startsWith("/auth/email-verified")
  ) {
    return NextResponse.next();
  }

  // Check if the path matches any protected route patterns
  for (const [routePattern, config] of Object.entries(ROUTE_CONFIGS)) {
    if (pathname.startsWith(routePattern)) {
      return roleMiddleware(request, config);
    }
  }

  // Check for specific dynamic routes
  if (pathname.startsWith("/projects/") && pathname.includes("/edit")) {
    return roleMiddleware(request, {
      permissions: ["project:update"],
      redirectTo: "/unauthorized",
    });
  }

  if (pathname.startsWith("/projects/") && pathname.includes("/summary")) {
    return roleMiddleware(request, {
      permissions: ["project:read"],
      redirectTo: "/unauthorized",
    });
  }

  if (pathname.startsWith("/projects/") && pathname.includes("/inquiries")) {
    return roleMiddleware(request, {
      permissions: ["inquiry:read", "inquiry:create"],
      redirectTo: "/unauthorized",
    });
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
