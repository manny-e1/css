"use client";

import { Building2, Globe, Leaf, Plus, Search, Tag } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { listMyMaterialSubmissionsAction } from "./actions";

interface Material {
  id: string;
  name: string;
  category: string;
  supplierName: string;
  origin: string;
  unitPriceRange: string;
  leadTimeEstimate: string;
  embodiedCarbonFactor: string;
  certification: string | null;
  approved: boolean | null;
  createdAt: Date | null;
  // Additional properties used in the UI
  status?: string;
  countryOfOrigin?: string;
  unit?: string;
  unitPriceMin?: number;
  unitPriceMax?: number;
  embodiedCarbonFactorPerUnit?: number;
}

export default function SupplierMaterialsPage() {
  const [items, setItems] = useState<Array<Material>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listMyMaterialSubmissionsAction();
      setItems(res ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  authClient.useSession();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider mb-3">
            <Tag className="h-3.5 w-3.5" />
            Inventory Management
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">
            My <span className="text-primary">Materials</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage your high-performance construction materials catalog.
          </p>
        </div>
        <Link href="/materials/create">
          <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            List New Material
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-muted/5 rounded-[2rem] border-2 border-dashed border-border/50">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Loading Catalog...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((m) => (
            <Card
              key={m.id}
              className="group border border-border/50 bg-background rounded-[2rem] overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 flex flex-col"
            >
              <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl"
                  >
                    {m.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-black uppercase tracking-wider border-none px-3 py-1.5 rounded-xl",
                      m.status === "approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600",
                    )}
                  >
                    {m.status || "pending"}
                  </Badge>
                </div>
                <h3 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                  {m.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  <Building2 className="h-3.5 w-3.5 opacity-40" />
                  {m.supplierName}
                </div>
              </div>

              <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="p-5 rounded-2xl bg-muted/5 border border-border/40 group-hover:bg-primary/2 group-hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">
                      <Leaf className="h-3 w-3" />
                      Carbon
                    </div>
                    <div className="text-lg font-black text-foreground">
                      {m.embodiedCarbonFactorPerUnit}
                      <span className="text-[10px] ml-1.5 opacity-40">KG</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/5 border border-border/40 group-hover:bg-primary/2 group-hover:border-primary/10 transition-colors">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">
                      <Globe className="h-3 w-3" />
                      Origin
                    </div>
                    <div className="text-lg font-black text-foreground truncate">
                      {m.countryOfOrigin}
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                      Pricing
                    </div>
                    <div className="h-px flex-1 mx-4 bg-border/30" />
                    <div className="text-xl font-black text-primary">
                      ${m.unitPriceMin}
                      <span className="text-xs font-bold text-muted-foreground/40 mx-1">
                        -
                      </span>
                      ${m.unitPriceMax}
                    </div>
                  </div>
                  <div className="text-[10px] text-right font-bold text-muted-foreground/40 uppercase tracking-widest px-2">
                    Per {m.unit || "Unit"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-32 bg-muted/5 rounded-[3rem] border-2 border-dashed border-border/50 text-center px-6">
              <div className="h-20 w-20 rounded-[2rem] bg-background border border-border/50 flex items-center justify-center mb-8 shadow-xl">
                <Search className="h-8 w-8 text-muted-foreground/20" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">
                Empty Catalog
              </h3>
              <p className="text-sm font-medium text-muted-foreground mb-8 max-w-xs mx-auto leading-relaxed">
                You haven't listed any materials yet. Start by adding your first
                high-performance specification.
              </p>
              <Link href="/materials/create">
                <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-border hover:bg-muted">
                  List Your First Material
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
