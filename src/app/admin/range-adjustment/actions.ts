"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { authUser } from "@/db/auth-schema";
import { db } from "@/db/client";
import { materials } from "@/db/new-schema";
import { auth } from "@/lib/auth";

export interface MaterialWithRanges {
  id: string;
  category: string;
  name: string;
  supplierName: string;
  origin: string;
  unitPriceRange: string;
  leadTimeEstimate: string;
  embodiedCarbonFactor: string;
  certification: string | null;
  approved: boolean | null;
  createdAt: Date | null;
}

interface MaterialRangeUpdate {
  materialId: string;
  unitPriceRange: string;
  embodiedCarbonFactor: string;
  leadTimeEstimate: string;
}

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session;
}

async function requireAdmin(sessionEmail: string) {
  const [authUserRecord] = await db
    .select()
    .from(authUser)
    .where(eq(authUser.email, sessionEmail));
  if (!authUserRecord) throw new Error("User not found");
  if (authUserRecord.role !== "admin") throw new Error("Admin access required");
  return authUserRecord;
}

export async function listApprovedMaterialsAction() {
  const session = await getSession();
  await requireAdmin(session.user.email);
  return await db.select().from(materials).where(eq(materials.approved, true));
}

export async function updateMaterialRangesAction(update: MaterialRangeUpdate) {
  const session = await getSession();
  await requireAdmin(session.user.email);

  // Validate the material exists and is approved
  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, update.materialId));

  if (!material) throw new Error("Material not found");
  if (!material.approved)
    throw new Error("Cannot adjust ranges for unapproved material");

  // Validate carbon factor is a valid number
  const carbonFactor = parseFloat(update.embodiedCarbonFactor);
  if (Number.isNaN(carbonFactor) || carbonFactor < 0) {
    throw new Error("Carbon factor must be a non-negative number");
  }

  // Update the material with new ranges
  await db
    .update(materials)
    .set({
      unitPriceRange: update.unitPriceRange,
      embodiedCarbonFactor: update.embodiedCarbonFactor,
      leadTimeEstimate: update.leadTimeEstimate,
    })
    .where(eq(materials.id, update.materialId));

  revalidatePath("/admin/range-adjustment");
  revalidatePath("/materials");
  revalidatePath("/projects");
}
