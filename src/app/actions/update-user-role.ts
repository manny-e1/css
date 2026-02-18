"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { authUser } from "@/db/auth-schema";
import { db } from "@/db/client";

import type { Role } from "@/lib/roles";

export async function updateUserRole(userId: string, newRole: Role) {
  try {
    await db
      .update(authUser)
      .set({ role: newRole })
      .where(eq(authUser.id, userId));

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "Failed to update role" };
  }
}
