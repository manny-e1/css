import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";

interface ColumnInfo {
  column_name: string;
}

export async function POST() {
  try {
    console.log("Starting role column migration...");

    // First, check if the role column already exists
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND column_name = 'role'
    `);

    const columns = Array.isArray(checkResult)
      ? checkResult
      : (checkResult as unknown as { rows?: ColumnInfo[] }).rows || [];

    if (columns.length > 0) {
      console.log("✅ Role column already exists");
      return NextResponse.json({
        success: true,
        message: "Role column already exists",
        action: "none",
      });
    }

    console.log("Adding role column to user table...");

    // Add the role column
    await db.execute(sql`
      ALTER TABLE "user" 
      ADD COLUMN "role" TEXT DEFAULT 'professional' NOT NULL
    `);

    console.log("✅ Role column added successfully");

    // Create an index on the role column for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "user_role_idx" ON "user" ("role")
    `);

    console.log("✅ Role index created successfully");

    return NextResponse.json({
      success: true,
      message: "Role column migration completed successfully",
      action: "added",
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Migration failed",
      },
      { status: 500 },
    );
  }
}
