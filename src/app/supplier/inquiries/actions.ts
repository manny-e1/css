"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getDomainUser, getSessionEmail } from "@/app/materials/actions";
import { db } from "@/db/client";
import { inquiries, inquiryMessages, materials, users } from "@/db/new-schema";
import { auth } from "@/lib/auth";

// Get all inquiries for materials that belong to the current supplier
export async function getSupplierInquiriesAction() {
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
      // User info
      buyerName: users.name,
      buyerEmail: users.email,
      // Material info
      materialName: materials.name,
      materialCategory: materials.category,
      unitPriceRange: materials.unitPriceRange,
    })
    .from(inquiries)
    .innerJoin(materials, eq(inquiries.materialId, materials.id))
    .leftJoin(users, eq(inquiries.userId, users.id))
    .where(eq(materials.supplierEmail, user.email))
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

// Update inquiry status (for suppliers to respond)
export async function updateInquiryStatusAction(
  inquiryId: string,
  status: string,
  responseMessage?: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Verify the inquiry exists
  const [inquiry] = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.id, inquiryId));

  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  // Get current notes to append response
  const currentNotes = inquiry.notes || "";
  const newNotes = responseMessage
    ? `${currentNotes}\n\n--- Supplier Response ---\n${responseMessage}`
    : currentNotes;

  await db
    .update(inquiries)
    .set({
      status,
      notes: newNotes,
    })
    .where(eq(inquiries.id, inquiryId));

  revalidatePath("/supplier/inquiries");
  revalidatePath("/inquiries");
}
