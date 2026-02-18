"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { authUser } from "@/db/auth-schema";
import { db } from "@/db/client";
import { materials } from "@/db/new-schema";
import { auth } from "@/lib/auth";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session;
}

async function requireAdmin(sessionEmail: string) {
  const [user] = await db
    .select()
    .from(authUser)
    .where(eq(authUser.email, sessionEmail));

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

export async function listMaterialSubmissionsAction() {
  const session = await getSession();
  await requireAdmin(session.user.email);
  return await db.select().from(materials);
}

export async function approveMaterialSubmissionAction(id: string) {
  const session = await getSession();
  await requireAdmin(session.user.email);
  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id));
  if (!material) throw new Error("Material not found");

  await db
    .update(materials)
    .set({
      approved: true,
      rejectionReason: null,
    })
    .where(eq(materials.id, id));

  revalidatePath("/admin/materials");
}

export async function rejectMaterialSubmissionAction(
  id: string,
  reason: string,
) {
  const session = await getSession();
  await requireAdmin(session.user.email);
  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id));
  if (!material) throw new Error("Material not found");

  await db
    .update(materials)
    .set({
      approved: false,
      rejectionReason: reason,
    })
    .where(eq(materials.id, id));

  revalidatePath("/admin/materials");
}
