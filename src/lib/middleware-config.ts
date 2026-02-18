import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { hasPermission, type Role } from "@/lib/roles";

export interface ProtectedRouteConfig {
  roles?: Role[];
  permissions?: string[];
  redirectTo?: string;
}

export async function roleMiddleware(
  request: NextRequest,
  config: ProtectedRouteConfig = {},
) {
  try {
    // Use cookie-based session check for edge runtime compatibility
    const sessionToken =
      request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    // For better security, we'll do a lightweight session validation
    const sessionResponse = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!sessionResponse.ok) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    const session = await sessionResponse.json();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    const userRole = session.user.role as Role;

    // Check role requirements
    if (config.roles && !config.roles.includes(userRole)) {
      return NextResponse.redirect(
        new URL(config.redirectTo || "/unauthorized", request.url),
      );
    }

    // Check permission requirements
    if (config.permissions) {
      const hasRequiredPermission = config.permissions.some((permission) =>
        hasPermission(userRole, permission),
      );

      console.log("config roles", config.roles, "config permissions", config.permissions);
      if (!hasRequiredPermission) {
        return NextResponse.redirect(
          new URL(config.redirectTo || "/unauthorized", request.url),
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Role middleware error:", error);
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }
}

// Route protection configurations
export const ROUTE_CONFIGS: Record<string, ProtectedRouteConfig> = {
  // Admin routes
  "/admin": {
    roles: ["admin"],
    redirectTo: "/admin/unauthorized",
  },

  // Supplier routes
  "/supplier": {
    roles: ["admin", "supplier"],
    redirectTo: "/unauthorized",
  },

  // Professional routes
  "/projects": {
    permissions: [
      "project:create",
      "project:read",
      "project:update",
      "project:delete",
    ],
    redirectTo: "/unauthorized",
  },

  "/inquiries": {
    permissions: [
      "inquiry:create",
      "inquiry:read",
      "inquiry:update",
      "inquiry:delete",
    ],
    redirectTo: "/unauthorized",
  },

  "/bids": {
    permissions: ["sourcing:read"],
    redirectTo: "/unauthorized",
  },

  "/orders": {
    permissions: ["order:read"],
    redirectTo: "/unauthorized",
  },

  // Materials management (supplier and admin)
  "/materials/manage": {
    roles: ["admin", "supplier"],
    redirectTo: "/unauthorized",
  },

  // Inquiries creation (any authenticated professional/admin)
  "/inquiries/create": {
    permissions: ["inquiry:create"],
    redirectTo: "/unauthorized",
  },
};
