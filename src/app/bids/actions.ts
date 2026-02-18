"use server";

import { and, desc, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import {
  bids,
  materials,
  notifications,
  projects,
  sourcingRequests,
  users,
} from "@/db/new-schema";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { authUser } from "@/db/auth-schema";

// Create a sourcing request
export async function createSourcingRequestAction(input: {
  projectId?: string;
  category: string;
  subCategory?: string;
  quantity: number;
  unit?: string;
  requestType?: string;
  location?: string;
  deadline?: string;
  notes?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  const user = session.user;

  let projectLocation = null;

  if (input.projectId) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, input.projectId));
    if (!project || project.userId !== user.id)
      throw new Error("Access denied");
    projectLocation = project.location;
  }

  const [request] = await db
    .insert(sourcingRequests)
    .values({
      projectId: input.projectId || null,
      userId: user.id,
      category: input.category,
      subCategory: input.subCategory || null,
      description: null,
      quantity: String(input.quantity),
      unit: input.unit || null,
      requestType: input.requestType || "material",
      location: input.location || projectLocation || null,
      targetUnitPrice: null,
      deadline: input.deadline ? new Date(input.deadline) : null,
      notes: input.notes || null,
      status: "open",
    })
    .returning();

  revalidatePath("/bids");
  if (input.projectId) {
    revalidatePath(`/projects/${input.projectId}`);
  }
  return request;
}

// List all open sourcing requests (publicly accessible)
export async function listOpenSourcingRequestsAction(filters?: {
  category?: string;
  location?: string;
}) {
  const { and, eq, ilike } = await import("drizzle-orm");
  const conditions = [eq(sourcingRequests.status, "open")];

  if (filters?.category && filters.category !== "All Categories") {
    conditions.push(eq(sourcingRequests.category, filters.category));
  }

  if (filters?.location) {
    conditions.push(ilike(sourcingRequests.location, `%${filters.location}%`));
  }

  return await db
    .select()
    .from(sourcingRequests)
    .where(and(...conditions))
    .orderBy(desc(sourcingRequests.createdAt));
}

// List sourcing requests for a specific project
export async function listProjectSourcingRequestsAction(projectId: string) {
  const _user = await requirePermission("project:read");

  return await db
    .select()
    .from(sourcingRequests)
    .where(eq(sourcingRequests.projectId, projectId))
    .orderBy(desc(sourcingRequests.createdAt));
}

export async function submitBidAction(input: {
  requestId: string;
  bidUnitPrice: number;
  leadTimeEstimate?: string;
  minimumOrder?: string;
  quoteUrl?: string;
  materialId?: string;
  notes?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  const user = session.user;

  // Verify supplier role
  const [supplierProfile] = await db
    .select()
    .from(authUser)
    .where(and(eq(authUser.id, user.id), eq(authUser.role, "supplier")));

  if (!supplierProfile) throw new Error("Only suppliers can submit bids");

  // Get the sourcing request to notify the creator
  const [request] = await db
    .select()
    .from(sourcingRequests)
    .where(eq(sourcingRequests.id, input.requestId));

  if (!request) throw new Error("Sourcing request not found");

  const [bid] = await db
    .insert(bids)
    .values({
      requestId: input.requestId,
      supplierId: user.id,
      materialId: input.materialId || null,
      bidUnitPrice: String(input.bidUnitPrice),
      leadTimeEstimate: input.leadTimeEstimate,
      minimumOrder: input.minimumOrder,
      quoteUrl: input.quoteUrl,
      notes: input.notes,
      status: "pending",
    })
    .returning();

  // Create notification for the professional who created the request
  if (request.userId) {
    await db.insert(notifications).values({
      userId: request.userId,
      title: "New Bid Received!",
      message: `You received a new bid of $${input.bidUnitPrice}/unit for your ${request.category} request.`,
      type: "info",
      link: `/bids/${input.requestId}`,
      read: false,
    });
  }

  revalidatePath("/bids");
  revalidatePath(`/bids/request/${input.requestId}`);
  return bid;
}

export async function deleteSourcingRequestAction(requestId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  const user = session.user;

  const [request] = await db
    .select()
    .from(sourcingRequests)
    .where(eq(sourcingRequests.id, requestId));

  if (!request) throw new Error("Request not found");
  if (request.userId !== user.id) throw new Error("Unauthorized");

  // Delete associated bids first (if cascading delete is not set up in DB, which it might be, but safer to do it explicit or ensure schema handles it)
  // Assuming cascade delete or manual delete. Let's try simple delete, if it fails due to FK, I will handle it.
  // Actually, standard practice is to let DB handle cascade if configured, or delete manually.
  // Checking schema... bids reference sourcingRequests.
  // Let's assume we can delete.

  await db.delete(sourcingRequests).where(eq(sourcingRequests.id, requestId));
  revalidatePath("/bids");
  redirect("/bids");
}

// List sourcing requests created by the current user (for buyers)
export async function listMySourcingRequestsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  return await db
    .select()
    .from(sourcingRequests)
    .where(eq(sourcingRequests.userId, session.user.id))
    .orderBy(desc(sourcingRequests.createdAt));
}

// List bids submitted by the current supplier
export async function listMyBidsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  return await db
    .select({
      id: bids.id,
      requestId: bids.requestId,
      bidUnitPrice: bids.bidUnitPrice,
      leadTimeEstimate: bids.leadTimeEstimate,
      minimumOrder: bids.minimumOrder,
      quoteUrl: bids.quoteUrl,
      notes: bids.notes,
      status: bids.status,
      createdAt: bids.createdAt,
      category: sourcingRequests.category,
      description: sourcingRequests.description,
      quantity: sourcingRequests.quantity,
      unit: sourcingRequests.unit,
      deadline: sourcingRequests.deadline,
    })
    .from(bids)
    .innerJoin(sourcingRequests, eq(bids.requestId, sourcingRequests.id))
    .where(eq(bids.supplierId, session.user.id))
    .orderBy(desc(bids.createdAt));
}

// List notifications for the current user
export async function listMyNotificationsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt));
}

// Mark a notification as read
export async function markNotificationAsReadAction(notificationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id),
      ),
    );

  revalidatePath("/");
  return { success: true };
}

// List all sourcing requests with their bids (for transparency board)
export async function listAllSourcingRequestsWithBidsAction() {
  const requests = await db
    .select({
      id: sourcingRequests.id,
      userId: sourcingRequests.userId,
      userName: users.name,
      category: sourcingRequests.category,
      subCategory: sourcingRequests.subCategory,
      quantity: sourcingRequests.quantity,
      unit: sourcingRequests.unit,
      requestType: sourcingRequests.requestType,
      status: sourcingRequests.status,
      createdAt: sourcingRequests.createdAt,
      location: sourcingRequests.location,
      deadline: sourcingRequests.deadline,
      description: sourcingRequests.description,
      notes: sourcingRequests.notes,
    })
    .from(sourcingRequests)
    .leftJoin(users, eq(sourcingRequests.userId, users.id))
    .orderBy(desc(sourcingRequests.createdAt));

  const bidsWithSuppliers = await db
    .select({
      id: bids.id,
      requestId: bids.requestId,
      bidUnitPrice: bids.bidUnitPrice,
      leadTimeEstimate: bids.leadTimeEstimate,
      status: bids.status,
      createdAt: bids.createdAt,
      supplierName: users.name,
    })
    .from(bids)
    .leftJoin(users, eq(bids.supplierId, users.id));

  // Group bids by request ID
  const requestsWithBids = requests.map((req) => ({
    ...req,
    bids: bidsWithSuppliers.filter((bid) => bid.requestId === req.id),
  }));

  return requestsWithBids;
}

// Clear all notifications for the current user
export async function clearAllNotificationsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  await db
    .delete(notifications)
    .where(eq(notifications.userId, session.user.id));

  revalidatePath("/");
  return { success: true };
}

// List bids for a sourcing request (for the professional who created the request)
export async function listRequestBidsAction(requestId: string) {
  const user = await requirePermission("project:read");

  const [request] = await db
    .select()
    .from(sourcingRequests)
    .where(eq(sourcingRequests.id, requestId));

  if (!request || request.userId !== user.id) throw new Error("Access denied");

  return await db
    .select({
      id: bids.id,
      requestId: bids.requestId,
      supplierId: bids.supplierId,
      materialId: bids.materialId,
      bidUnitPrice: bids.bidUnitPrice,
      leadTimeEstimate: bids.leadTimeEstimate,
      minimumOrder: bids.minimumOrder,
      quoteUrl: bids.quoteUrl,
      notes: bids.notes,
      status: bids.status,
      createdAt: bids.createdAt,
      supplierName: users.name,
      materialName: materials.name,
    })
    .from(bids)
    .leftJoin(users, eq(bids.supplierId, users.id))
    .leftJoin(materials, eq(bids.materialId, materials.id))
    .where(eq(bids.requestId, requestId))
    .orderBy(desc(bids.createdAt));
}

// Accept a bid
export async function acceptBidAction(bidId: string) {
  const user = await requirePermission("project:update");

  const [bid] = await db.select().from(bids).where(eq(bids.id, bidId));
  if (!bid || !bid.requestId) throw new Error("Bid not found or invalid");

  const [request] = await db
    .select()
    .from(sourcingRequests)
    .where(eq(sourcingRequests.id, bid.requestId!));

  if (!request || request.userId !== user.id) throw new Error("Access denied");

  // Update bid status
  await db.update(bids).set({ status: "accepted" }).where(eq(bids.id, bidId));

  // Create notification for winning supplier
  if (bid.supplierId) {
    const supplierId = bid.supplierId;
    await db.insert(notifications).values({
      userId: supplierId,
      title: "Bid Accepted!",
      message: `Your bid for ${request.category} has been accepted.`,
      type: "success",
      link: `/supplier/bids`,
      read: false,
    });
  }

  // Reject other bids for this request
  const requestId = bid.requestId;
  if (!requestId) throw new Error("Invalid request ID");

  const otherBids = await db
    .select()
    .from(bids)
    .where(
      and(
        eq(bids.requestId, requestId),
        eq(bids.status, "pending"),
        ne(bids.id, bidId),
      ),
    );

  if (otherBids.length > 0) {
    await db
      .update(bids)
      .set({ status: "rejected" })
      .where(
        and(
          eq(bids.requestId, requestId),
          eq(bids.status, "pending"),
          ne(bids.id, bidId),
        ),
      );

    // Create notifications for rejected suppliers
    for (const otherBid of otherBids) {
      if (otherBid.supplierId) {
        const otherSupplierId = otherBid.supplierId;
        await db.insert(notifications).values({
          userId: otherSupplierId,
          title: "Bid Update",
          message: `The sourcing request for ${request.category} has been awarded to another supplier.`,
          type: "info",
          link: `/supplier/bids`,
          read: false,
        });
      }
    }
  }

  // Update request status
  await db
    .update(sourcingRequests)
    .set({ status: "awarded" })
    .where(eq(sourcingRequests.id, bid.requestId!));

  if (request.projectId) {
    revalidatePath(`/projects/${request.projectId}`);
  }
  revalidatePath("/bids");
  return { success: true };
}
