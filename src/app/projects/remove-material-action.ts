"use server";

import { removeMaterialFromProjectAction } from "./actions";

// Client-callable action for removing materials from projects
export async function removeMaterialAction(
  projectId: string,
  materialId: string,
) {
  try {
    await removeMaterialFromProjectAction(projectId, materialId);
    return { success: true };
  } catch (error) {
    console.error("Error removing material:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove material",
    };
  }
}
