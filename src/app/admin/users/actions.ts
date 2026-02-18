"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { authUser } from "@/db/auth-schema";
import { db } from "@/db/client";
import { supplierProfiles } from "@/db/new-schema";
import { auth } from "@/lib/auth";

export async function getUsersAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Fetch all users
  const users = await db
    .select()
    .from(authUser)
    .orderBy(desc(authUser.createdAt));

  // Fetch all supplier profiles
  const profiles = await db.select().from(supplierProfiles);

  // Merge them
  const usersWithProfiles = users.map((user) => {
    const profile = profiles.find((p) => p.userId === user.id);
    return {
      ...user,
      supplierProfile: profile || null,
    };
  });

  return usersWithProfiles;
}

export async function approveSupplierAction(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    // Update profile status
    await db
      .update(supplierProfiles)
      .set({ approvalStatus: "approved", rejectionReason: null })
      .where(eq(supplierProfiles.userId, userId));

    // Unban user
    await db
      .update(authUser)
      .set({ banned: false })
      .where(eq(authUser.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error approving supplier:", error);
    return { error: "Failed to approve supplier" };
  }
}

export async function rejectSupplierAction(userId: string, reason: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  if (!reason) {
    return { error: "Rejection reason is required" };
  }

  try {
    // Update profile status
    await db
      .update(supplierProfiles)
      .set({
        approvalStatus: "rejected",
        rejectionReason: reason,
      })
      .where(eq(supplierProfiles.userId, userId));

    // Ban user (or keep banned)
    await db
      .update(authUser)
      .set({ banned: true })
      .where(eq(authUser.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error rejecting supplier:", error);
    return { error: "Failed to reject supplier" };
  }
}
