import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { accounts, users } from "@/db/new-schema";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()));

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Create user ID
    const userId = crypto.randomUUID();

    // Create user in users table
    await db.insert(users).values({
      id: userId,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      emailVerified: true, // Auto-verify admin users
    });

    // Create account with password for authentication
    const hashedPassword = bcrypt.hashSync(password, 10);

    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      userId: userId,
      providerId: "credentials",
      accountId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully",
        userId: userId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin user creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
