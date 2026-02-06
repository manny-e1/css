import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/roles";

export interface ProtectedRouteConfig {
  roles?: Role[];
  permissions?: string[];
  redirectTo?: string;
}

export function createRoleMiddleware(config: ProtectedRouteConfig = {}) {
  return async function middleware(request: NextRequest) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
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

        if (!hasRequiredPermission) {
          return NextResponse.redirect(
            new URL(config.redirectTo || "/unauthorized", request.url),
          );
        }
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  };
}

// Route-specific middleware configurations
export const roleMiddleware = {
  // Admin only routes
  admin: createRoleMiddleware({
    roles: ["admin"],
    redirectTo: "/admin/unauthorized",
  }),

  // Professional and admin routes
  professional: createRoleMiddleware({
    roles: ["admin", "professional"],
    redirectTo: "/unauthorized",
  }),

  // Supplier and admin routes
  supplier: createRoleMiddleware({
    roles: ["admin", "supplier"],
    redirectTo: "/unauthorized",
  }),

  // All authenticated users
  authenticated: createRoleMiddleware(),

  // Custom permission-based middleware
  withPermission: (permissions: string[], redirectTo?: string) =>
    createRoleMiddleware({ permissions, redirectTo }),
};
