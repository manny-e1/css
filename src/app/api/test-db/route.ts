import { NextResponse } from "next/server";
import { authUser } from "@/db/auth-schema";
import { db } from "@/db/client";

export async function GET() {
  try {
    console.log("Testing database connection in API route...");

    // Test basic connection
    const users = await db.select().from(authUser).limit(5);
    console.log("✅ Database connection successful!");
    console.log("Found users:", users.length);

    // Test role column
    if (users.length > 0) {
      console.log("Sample user:", users[0]);
    }

    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: users,
      message: "Database connection working!",
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Database connection failed",
      },
      { status: 500 },
    );
  }
}
