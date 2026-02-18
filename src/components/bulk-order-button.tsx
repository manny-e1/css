"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createBulkOrdersAction } from "@/app/projects/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BulkOrderButtonProps {
  projectId: string;
  items: {
    materialId: string;
    quantity: number;
    materialName: string;
  }[];
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BulkOrderButton({
  projectId,
  items,
  className,
  variant = "default",
  size = "default",
}: BulkOrderButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBulkOrder = async () => {
    if (items.length === 0) {
      toast.error("No items to order");
      return;
    }

    setLoading(true);
    try {
      const result = await createBulkOrdersAction({
        projectId,
        items: items.map((item) => ({
          materialId: item.materialId,
          quantity: item.quantity,
        })),
      });

      if (result && result.length > 0) {
        toast.success(`Bulk order placed for ${items.length} items!`);
      } else {
        toast.error("Failed to place order. No orders were created.");
      }
    } catch (error: any) {
      console.error("Failed to place bulk order:", error);
      toast.error(
        error.message || "Failed to place bulk order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBulkOrder}
      disabled={loading || items.length === 0}
      className={cn(
        "font-bold uppercase tracking-wider gap-2 transition-all shadow-sm",
        className,
      )}
    >
      {loading ? (
        "Processing..."
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Bulk Order {items.length > 0 ? `(${items.length} items)` : ""}
        </>
      )}
    </Button>
  );
}
