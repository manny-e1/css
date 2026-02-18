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

export async function banUserAction(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(authUser)
      .set({ banned: true })
      .where(eq(authUser.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    return { error: "Failed to ban user" };
  }
}

export async function unbanUserAction(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .update(authUser)
      .set({ banned: false })
      .where(eq(authUser.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { error: "Failed to unban user" };
  }
}

export async function deleteUserAction(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    // Delete user (cascade will handle related records)
    await db.delete(authUser).where(eq(authUser.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}

export async function changeUserRoleAction(userId: string, newRole: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const validRoles = ["buyer", "professional", "supplier", "admin"];
  if (!validRoles.includes(newRole)) {
    return { error: "Invalid role" };
  }

  try {
    await db
      .update(authUser)
      .set({ role: newRole as any })
      .where(eq(authUser.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error changing user role:", error);
    return { error: "Failed to change user role" };
  }
}
