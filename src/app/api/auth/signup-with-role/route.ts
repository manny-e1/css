import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authUser } from "@/db/auth-schema";
import { db } from "@/db/client";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["admin", "professional", "supplier"]).default("professional"),
});

/**
 * POST /api/auth/signup-with-role
 * Handle user signup with role assignment
 * This is a server-side endpoint that can be called after better-auth signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    signupSchema.parse(body);

    // First, let better-auth handle the signup
    // We'll update the role after the user is created

    // For now, we'll use the default better-auth signup flow
    // and then update the role in a separate step

    // This endpoint is designed to be called after successful better-auth signup
    // with the userId from the better-auth session

    // In a real implementation, you would:
    // 1. Call better-auth signup first
    // 2. Get the userId from the response
    // 3. Update the role in the database

    // For now, return a message indicating the flow
    return NextResponse.json({
      success: true,
      message: "Please use the standard signup flow and then update the role",
    });
  } catch (error) {
    console.error("Signup with role error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/auth/signup-with-role
 * Update role for an existing user after signup
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = z
      .object({
        userId: z.string(),
        role: z.enum(["admin", "professional", "supplier"]),
      })
      .parse(body);

    // Update the user's role in the database
    await db.update(authUser).set({ role }).where(eq(authUser.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update role error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
