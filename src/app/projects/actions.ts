"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import {
  inquiries,
  materials,
  notifications,
  orders,
  projects,
  users,
} from "@/db/new-schema";
import { auth } from "@/lib/auth";
import { requirePermission, requireRole } from "@/lib/auth-utils";
import {
  compareToBaseline,
  computeCostRange,
  computeMaterialCarbon,
  computeTransportMultiplier,
} from "@/lib/carbon";
import { redirect } from "next/navigation";

// Helper function to map material categories to baseline categories
function mapToBaselineCategory(
  category: string,
): "cement" | "steel" | "timber" | "blocks" | "finishes" {
  const mapping: Record<
    string,
    "cement" | "steel" | "timber" | "blocks" | "finishes"
  > = {
    Concrete: "cement",
    Steel: "steel",
    Wood: "timber",
    Masonry: "blocks",
    Insulation: "finishes",
    Glass: "finishes",
    Aluminum: "steel", // Similar to steel in terms of carbon intensity
    Roofing: "finishes",
    Flooring: "finishes",
    Drywall: "finishes",
    Paint: "finishes",
    Electrical: "finishes",
    HVAC: "finishes",
  };

  return mapping[category] || "finishes"; // Default to finishes if not found
}

// Helpers
async function _getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session;
}

async function _ensureDomainUser(email: string, name?: string) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existing) return existing;

  // Generate a unique ID for the user
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

// Create project (scoped to logged-in user)
export async function createProjectAction(input: {
  name: string;
  projectType: string;
  location: string;
  floorArea: number;
}) {
  const user = await requirePermission("project:create");
  if (!input.name.trim()) throw new Error("Project name is required");
  if (!(input.floorArea > 0)) throw new Error("Floor area must be positive");

  const [project] = await db
    .insert(projects)
    .values({
      name: input.name,
      projectType: input.projectType,
      location: input.location,
      floorArea: String(input.floorArea),
      userId: user.id,
      selectedMaterials: {}, // Initialize empty materials selection
    })
    .returning();

  revalidatePath("/buyer/projects");
  return project;
}

// Delete project
export async function deleteProjectAction(projectId: string) {
  const user = await _getSession();
  if (!user) throw new Error("Not authenticated");

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) throw new Error("Project not found");
  if (project.userId !== user.user.id) throw new Error("Unauthorized");

  await db.delete(projects).where(eq(projects.id, projectId));
  revalidatePath("/projects");
  redirect("/projects");
}

export async function listProjectsAction() {
  const user = await requirePermission("project:read");
  // await ensureDomainUser(email, session.user.name ?? undefined);
  return (
    (await db.select().from(projects).where(eq(projects.userId, user.id))) || []
  );
}

// Add material to a project
export async function addMaterialToProjectAction(input: {
  projectId: string;
  materialId: string;
  quantity: number;
}) {
  const user = await requirePermission("project:update");

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");
  if (!(input.quantity > 0)) throw new Error("Quantity must be positive");
  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, input.materialId));
  if (!material) throw new Error("Material not found");

  // Update the JSONB selectedMaterials field
  const currentMaterials =
    (project.selectedMaterials as Record<
      string,
      { quantity: string; priceOverride?: string } | string
    >) || {};

  const existing = currentMaterials[input.materialId];
  let existingQuantity = 0;
  let priceOverride: string | undefined;

  if (typeof existing === "object" && existing !== null) {
    existingQuantity = Number(existing.quantity || "0");
    priceOverride = existing.priceOverride;
  } else {
    existingQuantity = Number(existing || "0");
  }

  const newQuantity = existingQuantity + input.quantity;

  await db
    .update(projects)
    .set({
      selectedMaterials: {
        ...currentMaterials,
        [input.materialId]: {
          quantity: String(newQuantity),
          priceOverride,
        },
      },
    })
    .where(eq(projects.id, input.projectId));

  revalidatePath("/projects");
  revalidatePath(`/projects/${input.projectId}`);
}

// Update material quantity in a project
export async function updateMaterialQuantityAction(input: {
  projectId: string;
  materialId: string;
  quantity: number;
}) {
  const user = await requirePermission("project:update");

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");
  if (!(input.quantity > 0)) throw new Error("Quantity must be positive");

  const currentMaterials =
    (project.selectedMaterials as Record<
      string,
      { quantity: string; priceOverride?: string } | string
    >) || {};

  if (!currentMaterials[input.materialId]) {
    throw new Error("Material not found in project");
  }

  const existing = currentMaterials[input.materialId];
  let priceOverride: string | undefined;
  if (typeof existing === "object" && existing !== null) {
    priceOverride = existing.priceOverride;
  }

  await db
    .update(projects)
    .set({
      selectedMaterials: {
        ...currentMaterials,
        [input.materialId]: {
          quantity: String(input.quantity),
          priceOverride,
        },
      },
    })
    .where(eq(projects.id, input.projectId));

  revalidatePath(`/projects/${input.projectId}`);
}

// Update material price override in a project
export async function updateMaterialPriceAction(input: {
  projectId: string;
  materialId: string;
  priceOverride: number;
}) {
  const user = await requirePermission("project:update");

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");
  if (!(input.priceOverride >= 0))
    throw new Error("Price override must be non-negative");

  const currentMaterials =
    (project.selectedMaterials as Record<
      string,
      { quantity: string; priceOverride?: string } | string
    >) || {};

  if (!currentMaterials[input.materialId]) {
    throw new Error("Material not found in project");
  }

  const existing = currentMaterials[input.materialId];
  let quantity = "0";
  if (typeof existing === "object" && existing !== null) {
    quantity = existing.quantity || "0";
  } else {
    quantity = String(existing || "0");
  }

  await db
    .update(projects)
    .set({
      selectedMaterials: {
        ...currentMaterials,
        [input.materialId]: {
          quantity,
          priceOverride: String(input.priceOverride),
        },
      },
    })
    .where(eq(projects.id, input.projectId));

  revalidatePath(`/projects/${input.projectId}`);
}

// Remove material from a project
export async function removeMaterialFromProjectAction(
  projectId: string,
  materialId: string,
) {
  const user = await requirePermission("project:update");

  // Ensure the project belongs to the user
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");

  // Update the JSONB selectedMaterials field to remove the material
  const currentMaterials =
    (project.selectedMaterials as Record<string, string>) || {};

  // Check if material exists in the project
  if (!currentMaterials[materialId]) {
    throw new Error("Material not found in project");
  }

  const updatedMaterials = { ...currentMaterials };
  delete updatedMaterials[materialId];

  await db
    .update(projects)
    .set({
      selectedMaterials: updatedMaterials,
    })
    .where(eq(projects.id, projectId));

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

// Replace material in a project
export async function replaceMaterialAction(input: {
  projectId: string;
  oldMaterialId: string;
  newMaterialId: string;
  quantity: number;
}) {
  const user = await requirePermission("project:update");

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");

  const currentMaterials =
    (project.selectedMaterials as Record<string, any>) || {};

  // Check if old material exists
  if (!currentMaterials[input.oldMaterialId]) {
    throw new Error("Old material not found in project");
  }

  const updatedMaterials = { ...currentMaterials };
  delete updatedMaterials[input.oldMaterialId];

  // Add new material
  updatedMaterials[input.newMaterialId] = {
    quantity: String(input.quantity),
  };

  await db
    .update(projects)
    .set({
      selectedMaterials: updatedMaterials,
    })
    .where(eq(projects.id, input.projectId));

  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/projects");
}

// Create supplier inquiry
export async function createSupplierInquiryAction(input: {
  projectId: string;
  materialId: string;
  supplierName: string;
  message: string;
}) {
  const user = await requirePermission("inquiry:create");

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");
  if (!input.supplierName.trim()) throw new Error("Supplier name is required");
  if (!input.message.trim()) throw new Error("Message is required");

  await db.insert(inquiries).values({
    materialId: input.materialId,
    userId: user.id,
    projectId: input.projectId,
    projectName: project.name,
    notes: input.message,
    status: "pending",
  });

  // MVP email notification placeholder
  console.log(
    `[Supplier Inquiry] Project ${input.projectId} -> Supplier "${input.supplierName}" for material ${input.materialId}: ${input.message}`,
  );

  revalidatePath("/projects");
}

// List materials in a project
export async function listProjectMaterialsAction(projectId: string) {
  const user = await requirePermission("project:read");
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");

  // Return the selectedMaterials JSONB as an array of material IDs with quantities
  const selectedMaterials =
    (project.selectedMaterials as Record<
      string,
      { quantity: string; priceOverride?: string } | string
    >) || {};
  return Object.entries(selectedMaterials).map(([materialId, data]) => {
    let quantity = "0";
    let priceOverride: string | undefined;
    if (typeof data === "object" && data !== null) {
      quantity = data.quantity;
      priceOverride = data.priceOverride;
    } else {
      quantity = String(data || "0");
    }
    return {
      projectId,
      materialId,
      quantity,
      priceOverride,
    };
  });
}

// List supplier inquiries for a project
export async function listSupplierInquiriesAction(projectId: string) {
  const user = await requirePermission("inquiry:read");
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");

  // Get inquiries for this user that reference the project name
  return await db.select().from(inquiries).where(eq(inquiries.userId, user.id));
}

// Mark inquiry as responded (admin-only)
export async function respondSupplierInquiryAction(inquiryId: string) {
  const _user = await requireRole(["admin"]); // Admin only
  const [existing] = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.id, inquiryId));
  if (!existing) throw new Error("Inquiry not found");
  if (existing.status === "responded") return;
  await db
    .update(inquiries)
    .set({ status: "responded" })
    .where(eq(inquiries.id, inquiryId));
  revalidatePath("/projects");
}

// Compute total embodied carbon for a project
export async function computeProjectEmbodiedCarbonAction(projectId: string) {
  const user = await requirePermission("project:read");
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");

  const selectedMaterials =
    (project.selectedMaterials as Record<
      string,
      { quantity: string; priceOverride?: string } | string
    >) || {};
  const materialIds = Object.keys(selectedMaterials);

  if (materialIds.length === 0) {
    return { totalEmbodiedCarbon: 0 };
  }

  // Get all materials for this project
  const materialRows = await db
    .select({
      id: materials.id,
      factor: materials.embodiedCarbonFactor,
    })
    .from(materials)
    .where(inArray(materials.id, materialIds));

  const materialMap = new Map(
    materialRows.map((m) => [m.id, Number(m.factor)]),
  );

  const total = materialIds.reduce((sum, materialId) => {
    const data = selectedMaterials[materialId];
    let qty = 0;
    if (typeof data === "object" && data !== null) {
      qty = Number(data.quantity || "0");
    } else {
      qty = Number(data || "0");
    }
    const factor = materialMap.get(materialId) || 0;
    return sum + qty * factor;
  }, 0);

  return { totalEmbodiedCarbon: Number(total.toFixed(4)) };
}

// Create an order for a material
export async function createOrderAction(input: {
  materialId: string;
  projectId?: string;
  quantity: number;
  totalPrice?: number;
  shippingAddress?: string;
  notes?: string;
}) {
  const user = await requirePermission("project:update"); // Reusing this permission for buying

  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, input.materialId));
  if (!material) throw new Error("Material not found");

  const [order] = await db
    .insert(orders)
    .values({
      materialId: input.materialId,
      userId: user.id,
      projectId: input.projectId,
      quantity: String(input.quantity),
      totalPrice: input.totalPrice ? String(input.totalPrice) : null,
      shippingAddress: input.shippingAddress,
      notes: input.notes,
      status: "pending",
    })
    .returning();

  // MVP notification placeholder
  console.log(
    `[Order Placed] Order ${order.id} for ${input.quantity} units of ${material.name} (Supplier: ${material.supplierName})`,
  );

  // In a real system, we would send an email to material.supplierEmail here
  if (material.supplierEmail) {
    console.log(
      `[Email Sent] To: ${material.supplierEmail} about order ${order.id}`,
    );

    // Create notification for supplier if they exist in our system
    const [supplierUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, material.supplierEmail));

    if (supplierUser) {
      await db.insert(notifications).values({
        userId: supplierUser.id,
        title: "New Order Received",
        message: `You have received a new order for ${input.quantity} units of ${material.name}.`,
        type: "success",
        link: "/supplier/orders",
        read: false,
      });
    }
  }

  revalidatePath("/projects");
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/materials/shortlist");

  return order;
}

// Create bulk orders for multiple materials
export async function createBulkOrdersAction(input: {
  projectId?: string;
  items: {
    materialId: string;
    quantity: number;
    totalPrice?: number;
    notes?: string;
  }[];
  shippingAddress?: string;
}) {
  const user = await requirePermission("project:update");

  if (input.items.length === 0)
    throw new Error("No items provided for bulk order");

  const materialIds = input.items.map((item) => item.materialId);
  const materialRows = await db
    .select()
    .from(materials)
    .where(inArray(materials.id, materialIds));

  const materialMap = new Map(materialRows.map((m) => [m.id, m]));

  const createdOrders = [];

  for (const item of input.items) {
    const material = materialMap.get(item.materialId);
    if (!material) continue;

    const [order] = await db
      .insert(orders)
      .values({
        materialId: item.materialId,
        userId: user.id,
        projectId: input.projectId,
        quantity: String(item.quantity),
        totalPrice: item.totalPrice ? String(item.totalPrice) : null,
        shippingAddress: input.shippingAddress,
        notes: item.notes,
        status: "pending",
      })
      .returning();

    console.log(
      `[Bulk Order Item] Order ${order.id} for ${item.quantity} units of ${material.name} (Supplier: ${material.supplierName})`,
    );

    if (material.supplierEmail) {
      console.log(
        `[Email Sent] To: ${material.supplierEmail} about order ${order.id}`,
      );

      // Create notification for supplier if they exist in our system
      const [supplierUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, material.supplierEmail));

      if (supplierUser) {
        await db.insert(notifications).values({
          userId: supplierUser.id,
          title: "New Order Received",
          message: `You have received a new order for ${item.quantity} units of ${material.name}.`,
          type: "success",
          link: "/supplier/orders",
          read: false,
        });
      }
    }

    createdOrders.push(order);
  }

  revalidatePath("/projects");
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/materials/shortlist");
  revalidatePath("/orders");

  return createdOrders;
}

// List orders for the current user (as buyer)
export async function listOrdersAction() {
  const user = await requirePermission("project:read"); // Standard permission to see own data

  const userOrders = await db
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
        category: materials.category,
        supplierName: materials.supplierName,
        imageUrl: materials.imageUrl,
      },
      project: {
        id: projects.id,
        name: projects.name,
      },
    })
    .from(orders)
    .leftJoin(materials, eq(orders.materialId, materials.id))
    .leftJoin(projects, eq(orders.projectId, projects.id))
    .where(eq(orders.userId, user.id))
    .orderBy(orders.createdAt);

  return userOrders;
}

// Full project summary with per-material carbon, cost, transport, and baseline comparison
export async function getProjectSummaryAction(projectId: string) {
  const user = await requirePermission("project:read");
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project || project.userId !== user.id) throw new Error("Access denied");

  const selectedMaterials =
    (project.selectedMaterials as Record<
      string,
      { quantity: string; priceOverride?: string } | string
    >) || {};
  const materialIds = Object.keys(selectedMaterials);

  if (materialIds.length === 0) {
    return {
      project: {
        id: project.id,
        name: project.name,
        floorAreaM2: Number(project.floorArea || 0),
        locationCountry: project.location || "Unknown",
      },
      items: [],
      totals: { carbon: 0, costMin: 0, costMax: 0 },
    };
  }

  // Get all materials for this project
  const materialRows = await db
    .select({
      id: materials.id,
      name: materials.name,
      category: materials.category,
      supplierName: materials.supplierName,
      origin: materials.origin,
      unitPriceRange: materials.unitPriceRange,
      leadTimeEstimate: materials.leadTimeEstimate,
      factor: materials.embodiedCarbonFactor,
      imageUrl: materials.imageUrl,
    })
    .from(materials)
    .where(inArray(materials.id, materialIds));

  const materialMap = new Map(materialRows.map((m) => [m.id, m]));

  const items = await Promise.all(
    materialIds.map(async (materialId) => {
      const material = materialMap.get(materialId);
      if (!material) return null;

      const data = selectedMaterials[materialId];
      let quantity = 0;
      let priceOverride: number | undefined;

      if (typeof data === "object" && data !== null) {
        quantity = Number(data.quantity || "0");
        if (data.priceOverride) {
          priceOverride = parseFloat(data.priceOverride);
        }
      } else {
        quantity = Number(data || "0");
      }

      const factorPerUnit = Number(material.factor);

      // Parse price range from unitPriceRange (assuming format like "100-200")
      const priceRange = material.unitPriceRange
        .split("-")
        .map((p) => parseFloat(p.trim()));
      const unitPriceMin =
        priceOverride !== undefined ? priceOverride : priceRange[0] || 0;
      const unitPriceMax =
        priceOverride !== undefined
          ? priceOverride
          : priceRange[1] || unitPriceMin;

      const transportMultiplier = computeTransportMultiplier(
        project.location || "Unknown",
        material.origin,
      );
      const carbon = computeMaterialCarbon(
        quantity,
        factorPerUnit,
        transportMultiplier,
      );
      const cost = computeCostRange(quantity, unitPriceMin, unitPriceMax);
      const baseline = compareToBaseline({
        category: mapToBaselineCategory(material.category),
        quantity,
        factorPerUnit,
        unitPriceMin,
        unitPriceMax,
      });

      // Get alternatives in the same category
      const altRows = await db
        .select({
          id: materials.id,
          name: materials.name,
          category: materials.category,
          supplierName: materials.supplierName,
          origin: materials.origin,
          unitPriceRange: materials.unitPriceRange,
          leadTimeEstimate: materials.leadTimeEstimate,
          factor: materials.embodiedCarbonFactor,
          imageUrl: materials.imageUrl,
        })
        .from(materials)
        .where(eq(materials.category, material.category));

      const alternatives = altRows
        .filter((a) => a.id !== material.id)
        .map((a) => {
          const aPriceRange = a.unitPriceRange
            .split("-")
            .map((p) => parseFloat(p.trim()));
          const aUnitPriceMin = aPriceRange[0] || 0;
          const aUnitPriceMax = aPriceRange[1] || aUnitPriceMin;

          const aMid = (aUnitPriceMin + aUnitPriceMax) / 2;
          const sMid = (unitPriceMin + unitPriceMax) / 2;
          const aFactor = Number(a.factor);
          const aTM = computeTransportMultiplier(
            project.location || "Unknown",
            a.origin,
          );
          const aCarbon = computeMaterialCarbon(quantity, aFactor, aTM);
          const aCost = computeCostRange(
            quantity,
            aUnitPriceMin,
            aUnitPriceMax,
          );
          return {
            materialId: a.id,
            name: a.name,
            supplierName: a.supplierName,
            origin: a.origin,
            unit: "unit", // We don't have unit in new schema
            leadTimeEstimate: a.leadTimeEstimate ?? null,
            factorPerUnit: aFactor,
            unitPriceMin: aUnitPriceMin,
            unitPriceMax: aUnitPriceMax,
            transportMultiplier: aTM,
            imageUrl: a.imageUrl,
            carbon: Number(aCarbon.toFixed(4)),
            costMin: Number(aCost.min.toFixed(2)),
            costMax: Number(aCost.max.toFixed(2)),
            cheaper: aMid < sMid,
            lowerCarbon: aFactor < factorPerUnit,
            sortKey: `${aMid.toFixed(4)}:${aFactor.toFixed(4)}:${aTM.toFixed(2)}`,
          };
        })
        .filter((a) => a.cheaper || a.lowerCarbon)
        .sort((x, y) => {
          const xm = (x.unitPriceMin + x.unitPriceMax) / 2;
          const ym = (y.unitPriceMin + y.unitPriceMax) / 2;
          if (xm !== ym) return xm - ym;
          if (x.factorPerUnit !== y.factorPerUnit)
            return x.factorPerUnit - y.factorPerUnit;
          return x.transportMultiplier - y.transportMultiplier;
        })
        .slice(0, 2);

      return {
        projectMaterialId: `${projectId}-${materialId}`,
        materialId: material.id,
        name: material.name,
        category: material.category,
        supplierName: material.supplierName,
        origin: material.origin,
        unit: "unit", // We don't have unit in new schema
        leadTimeEstimate: material.leadTimeEstimate ?? null,
        quantity,
        unitPriceMin,
        unitPriceMax,
        transportMultiplier,
        imageUrl: material.imageUrl,
        carbon: Number(carbon.toFixed(4)),
        costMin: Number(cost.min.toFixed(2)),
        costMax: Number(cost.max.toFixed(2)),
        baseline,
        alternatives,
      };
    }),
  ).then((results) =>
    results.filter((result): result is NonNullable<typeof result> =>
      Boolean(result),
    ),
  );

  const totals = items.reduce(
    (acc, it) => {
      if (it) {
        acc.carbon += it.carbon;
        acc.costMin += it.costMin;
        acc.costMax += it.costMax;

        // Add category-wise breakdown
        if (!acc.byCategory[it.category]) {
          acc.byCategory[it.category] = { carbon: 0, costMin: 0, costMax: 0 };
        }
        acc.byCategory[it.category].carbon += it.carbon;
        acc.byCategory[it.category].costMin += it.costMin;
        acc.byCategory[it.category].costMax += it.costMax;
      }
      return acc;
    },
    {
      carbon: 0,
      costMin: 0,
      costMax: 0,
      byCategory: {} as Record<
        string,
        { carbon: number; costMin: number; costMax: number }
      >,
    },
  );

  return {
    project: {
      id: project.id,
      name: project.name,
      floorAreaM2: Number(project.floorArea || 0),
      locationCountry: project.location || "Unknown",
    },
    items,
    totals: {
      carbon: Number(totals.carbon.toFixed(4)),
      costMin: Number(totals.costMin.toFixed(2)),
      costMax: Number(totals.costMax.toFixed(2)),
      byCategory: Object.entries(totals.byCategory).map(([category, data]) => ({
        category,
        carbon: Number(data.carbon.toFixed(4)),
        costMin: Number(data.costMin.toFixed(2)),
        costMax: Number(data.costMax.toFixed(2)),
        percentage: totals.carbon > 0 ? (data.carbon / totals.carbon) * 100 : 0,
      })),
    },
  };
}
