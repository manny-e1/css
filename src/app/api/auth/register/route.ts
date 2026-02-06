import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/new-schema";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    // Hash password and create user
    const _hashedPassword = bcrypt.hashSync(password, 10);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email,
      name: null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
