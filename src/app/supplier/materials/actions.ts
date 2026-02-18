"use server";

import { and, eq } from "drizzle-orm";
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

async function ensureDomainUser(email: string, name?: string) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existing) return existing;
  const userId = crypto.randomUUID();
  const [created] = await db
    .insert(users)
    .values({
      id: userId,
      email,
      name,
    })
    .returning();
  return created;
}

export async function createMaterialSubmissionAction(input: {
  name: string;
  category: "cement" | "steel" | "timber" | "blocks" | "finishes";
  supplierName: string;
  countryOfOrigin: string;
  unit: string;
  unitPriceMin: number;
  unitPriceMax: number;
  leadTimeEstimate?: string;
  embodiedCarbonFactorPerUnit: number;
  certificationOrSourceNote?: string;
}) {
  const session = await getSession();
  const email = session.user.email;
  await ensureDomainUser(email, session.user.name ?? undefined);

  if (!input.name.trim()) throw new Error("Name is required");
  if (
    !["cement", "steel", "timber", "blocks", "finishes"].includes(
      input.category,
    )
  ) {
    throw new Error("Invalid category");
  }
  if (!input.supplierName.trim()) throw new Error("Supplier name is required");
  if (!input.countryOfOrigin.trim())
    throw new Error("Country of origin is required");
  if (!input.unit.trim()) throw new Error("Unit is required");
  if (!(input.unitPriceMin >= 0 && input.unitPriceMax >= 0))
    throw new Error("Prices must be non-negative");
  if (input.unitPriceMin > input.unitPriceMax)
    throw new Error("Min price must be <= max price");
  if (!(input.embodiedCarbonFactorPerUnit >= 0))
    throw new Error("Embodied carbon must be non-negative");

  const [dup] = await db
    .select()
    .from(materials)
    .where(
      and(
        eq(materials.name, input.name),
        eq(materials.supplierName, input.supplierName),
      ),
    );
  if (dup)
    throw new Error("A material with same name and supplier already exists");

  await db.insert(materials).values({
    name: input.name,
    category: input.category,
    supplierName: input.supplierName,
    supplierEmail: email,
    origin: input.countryOfOrigin,
    unit: input.unit,
    unitPriceRange: `${input.unitPriceMin.toFixed(2)}-${input.unitPriceMax.toFixed(2)}`,
    leadTimeEstimate: input.leadTimeEstimate || "Unknown",
    embodiedCarbonFactor: Number.isFinite(input.embodiedCarbonFactorPerUnit)
      ? input.embodiedCarbonFactorPerUnit.toString()
      : "0",
    certification: input.certificationOrSourceNote,
    approved: false, // Submitted materials are not approved by default
  });

  revalidatePath("/supplier/materials");
}

export async function listMyMaterialSubmissionsAction() {
  const session = await getSession();
  const email = session.user.email;
  const res = await db
    .select()
    .from(materials)
    .where(eq(materials.supplierEmail, email));

  return res.map((m) => {
    const [min, max] = m.unitPriceRange.split("-").map(parseFloat);
    return {
      ...m,
      countryOfOrigin: m.origin,
      unitPriceMin: min || 0,
      unitPriceMax: max || 0,
      embodiedCarbonFactorPerUnit: parseFloat(m.embodiedCarbonFactor) || 0,
      unit: m.unit || "Unit",
    };
  });
}
