"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import {
  categories,
  inquiries,
  inquiryMessages,
  materials,
  orders,
  subCategories,
  users,
} from "@/db/new-schema";
import { auth } from "@/lib/auth";
import { authUser } from "@/db/auth-schema";

export async function getSessionEmail() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.email ?? null;
}

export async function getDomainUser(email: string) {
  const [existing] = await db
    .select()
    .from(authUser)
    .where(eq(authUser.email, email));
  if (existing) return existing;
  const userId = crypto.randomUUID();
  const [created] = await db
    .insert(authUser)
    .values({
      id: userId,
      email,
    })
    .returning();
  return created ?? null;
}

export async function createMaterialAction(input: {
  name: string;
  category: string;
  categoryId?: string;
  subCategoryId?: string;
  supplierName: string;
  supplierEmail?: string;
  countryOfOrigin: string;
  unit: string;
  unitPriceMin: number;
  unitPriceMax: number;
  leadTimeEstimate?: string;
  embodiedCarbonFactorPerUnit: number;
  imageUrl?: string;
  images?: string[];
  certificationOrSourceNote?: string;
}) {
  const email = await getSessionEmail();
  if (!email) throw new Error("Not authenticated");
  const user = await getDomainUser(email);
  if (!user) throw new Error("User not found");

  if (!input.name.trim()) throw new Error("Name is required");
  if (!input.category.trim()) throw new Error("Category is required");
  if (!input.supplierName.trim()) throw new Error("Supplier name is required");
  if (!input.countryOfOrigin.trim())
    throw new Error("Country of origin is required");
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
    throw new Error("Material with same name and supplier already exists");

  await db.insert(materials).values({
    name: input.name,
    category: input.category,
    categoryId: input.categoryId,
    subCategoryId: input.subCategoryId,
    supplierName: input.supplierName,
    supplierEmail: input.supplierEmail || email, // Default to creator's email if not provided
    origin: input.countryOfOrigin,
    unit: input.unit,
    unitPriceRange: `${input.unitPriceMin.toFixed(2)}-${input.unitPriceMax.toFixed(2)}`,
    leadTimeEstimate: input.leadTimeEstimate || "Unknown",
    embodiedCarbonFactor: Number.isFinite(input.embodiedCarbonFactorPerUnit)
      ? input.embodiedCarbonFactorPerUnit.toFixed(4)
      : "0",
    imageUrl: input.imageUrl,
    images: input.images || [],
    certification: input.certificationOrSourceNote,
    approved: false, // Admin approval required
  });

  revalidatePath("/materials");
}

export async function deleteMaterialAction(id: string) {
  const email = await getSessionEmail();
  if (!email) throw new Error("Not authenticated");

  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id));

  if (!material) throw new Error("Material not found");

  // Only allow supplier of the material or admin to delete
  const user = await getDomainUser(email);
  if (material.supplierEmail !== email && user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db.delete(materials).where(eq(materials.id, id));
  revalidatePath("/materials");
}

export async function listMaterialsAction() {
  return await db.select().from(materials).where(eq(materials.approved, true));
}

export async function getMaterialCategoriesAction() {
  const all = await listMaterialsAction();
  const categories = Array.from(new Set(all.map((m) => m.category))).sort();
  return categories;
}

export async function listSupplierMaterialsAction() {
  const email = await getSessionEmail();
  if (!email) throw new Error("Not authenticated");
  const user = await getDomainUser(email);
  if (!user) throw new Error("User not found");

  return await db
    .select()
    .from(materials)
    .where(eq(materials.supplierEmail, user.email))
    .orderBy(desc(materials.createdAt));
}

export async function getMaterialByIdAction(id: string) {
  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id));
  return material;
}

export async function getMaterialInquiryCountAction(materialId: string) {
  const result = await db
    .select({ count: sql`count(*)` })
    .from(inquiries)
    .where(eq(inquiries.materialId, materialId));
  return Number(result[0]?.count || 0);
}

export async function getCategoriesAction() {
  return await db.query.categories.findMany({
    with: {
      subCategories: true,
    },
  });
}

export async function getMaterialsWithInquiryCountsAction() {
  const email = await getSessionEmail();
  const user = email ? await getDomainUser(email) : null;
  const isAdmin = user?.role === "admin";
  const userEmail = email || "";

  const materialsList = await db.query.materials.findMany({
    where: (materials, { eq, or }) =>
      isAdmin
        ? undefined
        : or(
          eq(materials.approved, true),
          eq(materials.supplierEmail, userEmail),
        ),
    with: {
      category: true,
      subCategory: true,
    },
  });

  const materialsWithCounts = await Promise.all(
    materialsList.map(async (material: any) => {
      const inquiryCount = await getMaterialInquiryCountAction(material.id);
      return {
        ...material,
        inquiryCount,
      };
    }),
  );

  return materialsWithCounts;
}

export async function createInquiryAction(input: {
  materialId: string;
  quantity?: number;
  notes?: string;
  projectId?: string;
  projectName?: string;
  deliveryAddress?: string;
  desiredDeliveryDate?: string;
}) {
  const email = await getSessionEmail();
  if (!email) throw new Error("Not authenticated");
  const user = await getDomainUser(email);
  if (!user) throw new Error("User not found");

  const [inquiry] = await db
    .insert(inquiries)
    .values({
      materialId: input.materialId,
      userId: user.id,
      quantity: input.quantity?.toString(),
      projectId: input.projectId,
      projectName: input.projectName,
      deliveryAddress: input.deliveryAddress,
      desiredDeliveryDate: input.desiredDeliveryDate
        ? new Date(input.desiredDeliveryDate)
        : null,
      notes: input.notes, // Keep initial notes as context
      status: "sent",
    })
    .returning();

  if (input.notes) {
    await db.insert(inquiryMessages).values({
      inquiryId: inquiry.id,
      senderId: user.id,
      content: input.notes,
    });
  }

  revalidatePath("/materials");
  revalidatePath("/inquiries");
  revalidatePath("/supplier/inquiries");
}

export async function listSupplierOrdersAction() {
  const email = await getSessionEmail();
  if (!email) throw new Error("Not authenticated");
  const user = await getDomainUser(email);
  if (!user) throw new Error("User not found");

  // Get orders where the material belongs to this supplier
  const supplierOrders = await db
    .select({
      id: orders.id,
      quantity: orders.quantity,
      totalPrice: orders.totalPrice,
      status: orders.status,
      createdAt: orders.createdAt,
      notes: orders.notes,
      shippingAddress: orders.shippingAddress,
      material: {
        id: materials.id,
        name: materials.name,
      },
      buyer: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(orders)
    .innerJoin(materials, eq(orders.materialId, materials.id))
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(materials.supplierEmail, user.email))
    .orderBy(desc(orders.createdAt));

  return supplierOrders;
}

export async function replyToInquiryAction(inquiryId: string, content: string) {
  const email = await getSessionEmail();
  if (!email) throw new Error("Not authenticated");
  const user = await getDomainUser(email);
  if (!user) throw new Error("User not found");

  await db.insert(inquiryMessages).values({
    inquiryId,
    senderId: user.id,
    content,
  });

  // Update status if sender is supplier
  const [inquiry] = await db
    .select({ supplierEmail: materials.supplierEmail })
    .from(inquiries)
    .innerJoin(materials, eq(inquiries.materialId, materials.id))
    .where(eq(inquiries.id, inquiryId));

  if (inquiry && inquiry.supplierEmail === email) {
    await db
      .update(inquiries)
      .set({ status: "responded" })
      .where(eq(inquiries.id, inquiryId));
  }

  revalidatePath("/inquiries");
  revalidatePath("/supplier/inquiries");
}

export async function getBuyerInquiriesAction() {
  const email = await getSessionEmail();
  if (!email) throw new Error("Not authenticated");
  const user = await getDomainUser(email);
  if (!user) throw new Error("User not found");

  const results = await db
    .select({
      id: inquiries.id,
      materialId: inquiries.materialId,
      notes: inquiries.notes,
      status: inquiries.status,
      createdAt: inquiries.createdAt,
      projectName: inquiries.projectName,
      quantity: inquiries.quantity,
      deliveryAddress: inquiries.deliveryAddress,
      desiredDeliveryDate: inquiries.desiredDeliveryDate,
      projectId: inquiries.projectId,
      // Material info
      materialName: materials.name,
      materialCategory: materials.category,
      supplierName: materials.supplierName,
      supplierEmail: materials.supplierEmail,
    })
    .from(inquiries)
    .innerJoin(materials, eq(inquiries.materialId, materials.id))
    .where(eq(inquiries.userId, user.id))
    .orderBy(desc(inquiries.createdAt));

  const inquiriesWithMessages = await Promise.all(
    results.map(async (inquiry) => {
      const msgs = await db
        .select({
          id: inquiryMessages.id,
          content: inquiryMessages.content,
          senderId: inquiryMessages.senderId,
          createdAt: inquiryMessages.createdAt,
          senderName: users.name,
          senderEmail: users.email,
        })
        .from(inquiryMessages)
        .leftJoin(users, eq(inquiryMessages.senderId, users.id))
        .where(eq(inquiryMessages.inquiryId, inquiry.id))
        .orderBy(inquiryMessages.createdAt);

      return { ...inquiry, messages: msgs };
    }),
  );

  return inquiriesWithMessages;
}
