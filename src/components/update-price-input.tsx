"use client";

import { Check, Loader2, RefreshCcw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateMaterialPriceAction } from "@/app/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UpdatePriceInputProps {
  projectId: string;
  materialId: string;
  initialPrice: number;
}

export function UpdatePriceInput({
  projectId,
  materialId,
  initialPrice,
}: UpdatePriceInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(initialPrice.toString());
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const num = parseFloat(price);
    if (Number.isNaN(num) || num < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setLoading(true);
    try {
      await updateMaterialPriceAction({
        projectId,
        materialId,
        priceOverride: num,
      });
      setIsEditing(false);
      toast.success("Price override saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update price",
      );
    } finally {
      setLoading(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 justify-end animate-in fade-in slide-in-from-right-2 duration-300">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40">
            $
          </span>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-32 h-12 pl-8 rounded-xl text-sm font-black border-primary/20 focus:ring-primary/20 transition-all bg-background shadow-sm text-right"
            autoFocus
          />
        </div>
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
              setPrice(initialPrice.toString());
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
    <div className="flex items-center gap-4 justify-end group/price">
      <div className="flex flex-col text-right">
        <span className="text-xl font-black text-foreground tracking-tighter">
          ${initialPrice.toLocaleString()}
        </span>
        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
          per unit
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-10 w-10 rounded-xl opacity-0 group-hover/price:opacity-100 transition-all hover:bg-primary/5 hover:text-primary active:scale-90"
        onClick={() => setIsEditing(true)}
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
