"use client";

import {
  ArrowRight,
  Building2,
  Clock,
  DollarSign,
  Globe,
  Leaf,
  RefreshCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { replaceMaterialAction } from "@/app/projects/actions";
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
import { cn } from "@/lib/utils";

interface Alternative {
  materialId: string;
  name: string;
  supplierName: string;
  origin: string;
  unit: string;
  leadTimeEstimate: string | null;
  factorPerUnit: number;
  unitPriceMin: number;
  unitPriceMax: number;
  carbon: number;
  costMin: number;
  costMax: number;
  imageUrl: string | null;
  cheaper: boolean;
  lowerCarbon: boolean;
}

interface MaterialItem {
  projectMaterialId: string;
  materialId: string;
  name: string;
  category: string;
  carbon: number;
  costMax: number;
  quantity: number;
  alternatives: Alternative[];
}

export function MaterialAlternativesDialog({
  projectId,
  item,
}: {
  projectId: string;
  item: MaterialItem;
}) {
  const [open, setOpen] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);

  if (!item.alternatives || item.alternatives.length === 0) return null;

  async function handleReplace(alt: Alternative) {
    setReplacing(alt.materialId);
    try {
      await replaceMaterialAction({
        projectId,
        oldMaterialId: item.materialId,
        newMaterialId: alt.materialId,
        quantity: item.quantity,
      });
      toast.success(`Switched to ${alt.name}`);
      setOpen(false);
    } catch (error) {
      console.error("Failed to replace material:", error);
      toast.error("Failed to switch material");
    } finally {
      setReplacing(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-[10px] font-bold uppercase tracking-wider text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 rounded-lg mt-2"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {item.alternatives.length} Sustainable Alternatives
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-none rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-10 pb-6 bg-background">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Sustainability Insights
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight">
            Suggested <span className="text-primary">Alternatives</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-medium mt-2">
            Optimizing for{" "}
            <span className="font-bold text-foreground">{item.name}</span>
          </p>
        </DialogHeader>

        <div className="px-10 pb-10 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {item.alternatives.map((alt) => {
              const carbonSaved = item.carbon - alt.carbon;
              const carbonSavedPct = (carbonSaved / item.carbon) * 100;
              const costDiff = alt.costMax - item.costMax;
              const costDiffPct = (costDiff / item.costMax) * 100;

              return (
                <Card
                  key={alt.materialId}
                  className="group relative border-border/40 hover:border-primary/40 transition-all rounded-[2rem] overflow-hidden bg-background"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row gap-0">
                      {alt.imageUrl ? (
                        <div className="h-48 md:h-auto md:w-48 overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-border/40">
                          <img
                            src={alt.imageUrl}
                            alt={alt.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-48 md:h-auto md:w-48 bg-muted/20 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-border/40">
                          <Building2 className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="flex-1 p-8">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                                  Alternative
                                </Badge>
                                <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                  <Building2 className="h-3 w-3" />
                                  {alt.supplierName}
                                </div>
                              </div>
                              <h4 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {alt.name}
                              </h4>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              <div className="space-y-1">
                                <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                  Carbon Impact
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "h-6 w-6 rounded-lg flex items-center justify-center",
                                      carbonSaved > 0
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600",
                                    )}
                                  >
                                    {carbonSaved > 0 ? (
                                      <TrendingDown className="h-3.5 w-3.5" />
                                    ) : (
                                      <TrendingUp className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                  <div className="text-sm font-bold">
                                    {Math.abs(carbonSavedPct).toFixed(1)}%{" "}
                                    {carbonSaved > 0 ? "Reduction" : "Increase"}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                  Cost Delta
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "h-6 w-6 rounded-lg flex items-center justify-center",
                                      costDiff < 0
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600",
                                    )}
                                  >
                                    {costDiff < 0 ? (
                                      <TrendingDown className="h-3.5 w-3.5" />
                                    ) : (
                                      <TrendingUp className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                  <div className="text-sm font-bold">
                                    {Math.abs(costDiffPct).toFixed(1)}%{" "}
                                    {costDiff < 0 ? "Cheaper" : "Premium"}
                                  </div>
                                </div>
                              </div>
                              <div className="hidden md:block space-y-1">
                                <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                  Lead Time
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />
                                  {alt.leadTimeEstimate || "Unknown"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col justify-end items-center gap-4 border-t md:border-t-0 md:border-l border-border/40 pt-6 md:pt-0 md:pl-8">
                            <div className="text-right hidden md:block">
                              <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">
                                New Total
                              </div>
                              <div className="text-xl font-black text-primary">
                                ${alt.costMax.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                              <Button
                                className="h-12 px-8 flex-1 md:flex-none rounded-xl font-black uppercase tracking-widest text-[10px] bg-foreground text-background shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
                                onClick={() => handleReplace(alt)}
                                disabled={replacing === alt.materialId}
                              >
                                {replacing === alt.materialId ? (
                                  <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCcw className="h-3.5 w-3.5" />
                                )}
                                Switch to this Alternative
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 text-center uppercase tracking-widest">
            Switching will automatically update your project BOM and carbon
            analysis.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
