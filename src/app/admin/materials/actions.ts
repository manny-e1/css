"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { materials, users } from "@/db/new-schema";
import { auth } from "@/lib/auth";

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session;
}

async function requireAdmin(sessionEmail: string) {
  const [domainUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, sessionEmail));
  if (!domainUser) throw new Error("User not found");
  // TODO: Implement proper admin role checking when role field is added to new-schema.ts
  // For now, we'll allow access to all authenticated users
  return domainUser;
}

export async function listMaterialSubmissionsAction() {
  const session = await getSession();
  await requireAdmin(session.user.email);
  return await db.select().from(materials).where(eq(materials.approved, false));
}

export async function approveMaterialSubmissionAction(id: string) {
  const session = await getSession();
  await requireAdmin(session.user.email);
  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id));
  if (!material) throw new Error("Material not found");
  if (material.approved) throw new Error("Material already approved");

  await db
    .update(materials)
    .set({
      approved: true,
    })
    .where(eq(materials.id, id));

  revalidatePath("/admin/materials");
}

export async function rejectMaterialSubmissionAction(
  id: string,
  _note?: string,
) {
  const session = await getSession();
  await requireAdmin(session.user.email);
  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id));
  if (!material) throw new Error("Material not found");
  if (material.approved) throw new Error("Cannot reject approved material");

  await db.delete(materials).where(eq(materials.id, id));

  revalidatePath("/admin/materials");
}
