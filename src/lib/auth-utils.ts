import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { authUser } from "@/db/auth-schema";
import { db } from "@/db/client";
import { auth } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/roles";

export interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as Role,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAuth(): Promise<UserWithRole> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireRole(roles: Role[]): Promise<UserWithRole> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error(
      `Insufficient permissions. Required roles: ${roles.join(", ")}`,
    );
  }
  return user;
}

export async function requirePermission(
  permission: string,
): Promise<UserWithRole> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new Error(
      `Insufficient permissions. Required permission: ${permission}`,
    );
  }
  return user;
}

export async function requireAnyPermission(
  permissions: string[],
): Promise<UserWithRole> {
  const user = await requireAuth();
  const hasAny = permissions.some((permission) =>
    hasPermission(user.role, permission),
  );
  if (!hasAny) {
    throw new Error(
      `Insufficient permissions. Required any of: ${permissions.join(", ")}`,
    );
  }
  return user;
}

/**
 * Update a user's role
 * Only admin users can update roles
 */
export async function updateUserRole(
  userId: string,
  newRole: Role,
): Promise<void> {
  // Verify the current user is an admin
  const _currentUser = await requireRole(["admin"]);

  // Update the user's role in the database
  await db
    .update(authUser)
    .set({ role: newRole })
    .where(eq(authUser.id, userId));
}

/**
 * Get all users with their roles
 * Only admin users can list all users
 */
export async function getAllUsersWithRoles(): Promise<UserWithRole[]> {
  // Verify the current user is an admin
  await requireRole(["admin"]);

  // Get all users from the database
  const users = await db
    .select({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
    })
    .from(authUser);

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role as Role,
  }));
}

/**
 * Get a specific user with their role
 * Only admin users can get user details
 */
export async function getUserWithRole(
  userId: string,
): Promise<UserWithRole | null> {
  // Verify the current user is an admin
  await requireRole(["admin"]);

  // Get the user from the database
  const [user] = await db
    .select({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
    })
    .from(authUser)
    .where(eq(authUser.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    role: user.role as Role,
  };
}
