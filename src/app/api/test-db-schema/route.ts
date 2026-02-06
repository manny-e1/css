import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/client";

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export async function GET() {
  try {
    console.log("Testing database schema...");

    // Check what columns exist in the user table
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      ORDER BY ordinal_position
    `);

    console.log("Query result:", result);

    // Handle different result formats
    const columns = Array.isArray(result)
      ? result
      : (result as unknown as { rows?: ColumnInfo[] }).rows || [];
    console.log("User table columns:", columns);

    // Check if role column exists
    const roleColumn = columns.find((col) => col.column_name === "role");

    if (!roleColumn) {
      console.log("❌ Role column does not exist in user table");
      console.log(
        "Available columns:",
        columns.map((col) => col.column_name),
      );

      return NextResponse.json({
        success: false,
        message: "Role column does not exist",
        availableColumns: columns.map((col) => col.column_name),
        suggestion:
          "You need to run a database migration to add the role column",
      });
    }

    console.log("✅ Role column exists:", roleColumn);

    return NextResponse.json({
      success: true,
      message: "Database schema is correct",
      roleColumn: roleColumn,
    });
  } catch (error) {
    console.error("❌ Database schema check failed:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error),
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Database schema check failed",
      },
      { status: 500 },
    );
  }
}
