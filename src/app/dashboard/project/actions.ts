"use server";

import { headers } from "next/headers";
import { db } from "@/db/client";
import { projects } from "@/db/new-schema";
import { auth } from "@/lib/auth";

export async function saveProjectAction(input: {
  name: string;
  projectType: string;
  floorArea: number;
  selectedMaterials: Record<string, string>;
  costLow?: number;
  costHigh?: number;
  carbon?: number;
  baselineCarbon?: number;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  await db.insert(projects).values({
    userId: session.user.id,
    name: input.name,
    projectType: input.projectType,
    floorArea: String(input.floorArea),
    selectedMaterials: input.selectedMaterials,
  });
}
