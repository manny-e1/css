"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface RemoveMaterialButtonProps {
  projectId: string;
  materialId: string;
  onRemove: (
    projectId: string,
    materialId: string,
  ) => Promise<{ success: boolean; error?: string } | undefined>;
}

export function RemoveMaterialButton({
  projectId,
  materialId,
  onRemove,
}: RemoveMaterialButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (
      !confirm(
        "Are you sure you want to remove this material from the project?",
      )
    )
      return;
    startTransition(async () => {
      try {
        const result = await onRemove(projectId, materialId);
        if (result && !result.success) {
          alert(result.error || "Failed to remove material. Please try again.");
        }
      } catch (error) {
        console.error("Failed to remove material:", error);
        alert("Failed to remove material. Please try again.");
      }
    });
  };

  return (
    <Button
      onClick={handleRemove}
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
      disabled={isPending}
      title="Remove from project"
    >
      <Trash2 className={isPending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
    </Button>
  );
}
