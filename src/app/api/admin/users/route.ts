import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAllUsersWithRoles, updateUserRole } from "@/lib/auth-utils";
import type { Role } from "@/lib/roles";

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["admin", "professional", "supplier"]),
});

/**
 * GET /api/admin/users
 * Get all users with their roles
 * Requires admin role
 */
export async function GET() {
  try {
    const users = await getAllUsersWithRoles();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Insufficient permissions")
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/users
 * Update a user's role
 * Requires admin role
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = updateRoleSchema.parse(body);

    await updateUserRole(userId, role as Role);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Insufficient permissions")
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
