"use client";

import {
  Building2,
  Check,
  Globe,
  Leaf,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listMaterialsAction } from "@/app/materials/actions";
import { addMaterialToProjectAction } from "@/app/projects/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Material {
  id: string;
  name: string;
  category: string;
  supplierName: string;
  origin: string;
  unitPriceRange: string;
  embodiedCarbonFactor: string;
}

export function AddMaterialDialog({
  projectId,
  trigger,
}: {
  projectId: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      loadMaterials();
    }
  }, [open]);

  async function loadMaterials() {
    setLoading(true);
    try {
      const res = await listMaterialsAction();
      setMaterials(res as Material[]);
    } catch (error) {
      console.error("Failed to load materials:", error);
      toast.error("Failed to load materials catalog");
    } finally {
      setLoading(false);
    }
  }

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.supplierName.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleAdd() {
    if (!selectedMaterialId) return;
    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    setAdding(true);
    try {
      await addMaterialToProjectAction({
        projectId,
        materialId: selectedMaterialId,
        quantity,
      });
      toast.success("Material added to project");
      setOpen(false);
      setSelectedMaterialId(null);
      setQuantity(1);
    } catch (error) {
      console.error("Failed to add material:", error);
      toast.error("Failed to add material to project");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-sm transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none rounded-[2.5rem]">
        <DialogHeader className="p-8 pb-4 bg-background">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
            <Package className="h-3.5 w-3.5" />
            Specification Catalog
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight">
            Add <span className="text-primary">Material</span>
          </DialogTitle>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, category, or supplier..."
              className="pl-11 h-14 rounded-2xl border-border/40 bg-muted/5 focus-visible:ring-primary/20 transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[2rem] border-2 border-dashed border-border/50">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Scanning Catalog...
              </p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[2rem] border-2 border-dashed border-border/50 text-center">
              <div className="h-16 w-16 rounded-2xl bg-background border border-border/50 flex items-center justify-center mb-6 shadow-sm">
                <Search className="h-6 w-6 text-muted-foreground/20" />
              </div>
              <h3 className="text-lg font-bold mb-1">No materials found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Try adjusting your search or category filters to find what
                you're looking for.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className={cn(
                    "group cursor-pointer border-border/40 hover:border-primary/40 transition-all rounded-2xl overflow-hidden",
                    selectedMaterialId === material.id
                      ? "ring-2 ring-primary ring-offset-2 border-primary/40 bg-primary/[0.02]"
                      : "bg-background",
                  )}
                  onClick={() => setSelectedMaterialId(material.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md"
                      >
                        {material.category}
                      </Badge>
                      {selectedMaterialId === material.id && (
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-lg font-black tracking-tight mb-2 group-hover:text-primary transition-colors">
                      {material.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-4">
                      <Building2 className="h-3.5 w-3.5 opacity-40" />
                      {material.supplierName}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/80 uppercase">
                        <Leaf className="h-3 w-3 text-emerald-600" />
                        {material.embodiedCarbonFactor} kg
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/80 uppercase">
                        <Globe className="h-3 w-3 text-blue-600" />
                        {material.origin}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-muted/5 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-auto space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Quantity Required
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-border/40 bg-background hover:bg-muted"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="h-10 w-24 text-center font-bold rounded-xl border-border/40 focus-visible:ring-primary/20"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-border/40 bg-background hover:bg-muted"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button
              variant="ghost"
              className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50 flex-1 md:flex-none"
              disabled={!selectedMaterialId || adding}
              onClick={handleAdd}
            >
              {adding ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Add to Project"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
