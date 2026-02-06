"use client";

import { Check, Loader2, RefreshCcw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateMaterialQuantityAction } from "@/app/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UpdateQuantityInputProps {
  projectId: string;
  materialId: string;
  initialQuantity: number;
}

export function UpdateQuantityInput({
  projectId,
  materialId,
  initialQuantity,
}: UpdateQuantityInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity.toString());
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const num = parseFloat(quantity);
    if (Number.isNaN(num) || num <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    setLoading(true);
    try {
      await updateMaterialQuantityAction({
        projectId,
        materialId,
        quantity: num,
      });
      setIsEditing(false);
      toast.success("Quantity updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update quantity",
      );
    } finally {
      setLoading(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24 h-12 rounded-xl text-sm font-black border-primary/20 focus:ring-primary/20 transition-all bg-background shadow-sm"
          autoFocus
        />
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all active:scale-95"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-5 w-5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
            onClick={() => {
              setQuantity(initialQuantity.toString());
              setIsEditing(false);
            }}
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 group/qty">
      <div className="flex flex-col">
        <span className="text-xl font-black text-foreground tracking-tighter">
          {initialQuantity.toLocaleString()}
        </span>
        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
          Units
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 rounded-xl opacity-0 group-hover/qty:opacity-100 transition-all hover:bg-primary/5 hover:text-primary active:scale-90"
        onClick={() => setIsEditing(true)}
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
