"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authUser } from "@/db/auth-schema";
import { db } from "@/db/client";
import { supplierProfiles } from "@/db/new-schema";
import { auth } from "@/lib/auth";

export async function registerSupplierAction(formData: FormData) {
  console.log("Starting registration");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const tin = formData.get("tin") as string;
  const description = formData.get("description") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const certificationUrl = formData.get("certificationUrl") as string;

  if (
    !name ||
    !email ||
    !password ||
    !tin ||
    !description ||
    !phoneNumber ||
    !certificationUrl
  ) {
    console.log("Validation failed: Missing fields");
    return { error: "All fields are required" };
  }

  try {
    // 1. Create the user
    console.log(`Creating user for email: ${email}`);
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result?.user) {
      console.log("User creation failed: No user returned");
      return { error: "Failed to create user account" };
    }

    const userId = result.user.id;
    console.log(`User created with ID: ${userId}`);

    // 2. Create supplier profile
    console.log("Creating supplier profile");
    await db.insert(supplierProfiles).values({
      userId: userId,
      tin,
      description,
      phoneNumber,
      certificationUrl,
      approvalStatus: "pending",
    });
    console.log("Supplier profile created");

    // 3. Update user role to supplier and set banned status (pending approval)
    console.log(`Updating user ${userId} to supplier role and banned status`);

    let updated = false;
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < 5; i++) {
      await db
        .update(authUser)
        .set({
          role: "supplier",
          banned: true,
        })
        .where(eq(authUser.id, userId));

      // Verify the update
      const check = await db
        .select()
        .from(authUser)
        .where(eq(authUser.id, userId))
        .limit(1);
      if (
        check[0] &&
        check[0].role === "supplier" &&
        check[0].banned === true
      ) {
        updated = true;
        console.log(
          `User ${userId} updated successfully. Role: ${check[0].role}, Banned: ${check[0].banned}`,
        );
        break;
      }
      console.log(
        `Update verification failed (Attempt ${i + 1}). Role: ${check[0]?.role}, Banned: ${check[0]?.banned}. Retrying...`,
      );
      await delay(500); // Wait 500ms before retry
    }

    if (!updated) {
      console.log(`Failed to update user ${userId} after multiple attempts.`);
      return {
        error:
          "Account created but failed to set supplier role. Please contact support.",
      };
    }

    return { success: true };
  } catch (error) {
    console.log(`Registration error: ${error}`);
    console.error("Registration error:", error);
    return {
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}
