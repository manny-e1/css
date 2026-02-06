"use server";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Info,
  Leaf,
  MapPin,
  Scale,
  TrendingDown,
  Zap,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { calculateCarbonScore } from "@/lib/carbon";
import { cn } from "@/lib/utils";
import { getMaterialCategoriesAction, listMaterialsAction } from "../actions";

export default async function MaterialsComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const params = await searchParams;
  const categoryParam = String(params.category ?? "");
  const idsParam = String(params.ids ?? "");
  const selectedIds = idsParam ? idsParam.split(",").filter(Boolean) : [];

  const all = await listMaterialsAction();
  const categories = await getMaterialCategoriesAction();

  // Set default category if none provided
  const activeCategory =
    categoryParam ||
    (categories.length > 0 ? categories[0].toLowerCase() : "cement");

  const items = all.filter(
    (m) => m.category.toLowerCase() === activeCategory.toLowerCase(),
  );
  const selected = all.filter((m) => selectedIds.includes(m.id)).slice(0, 3);

  async function compare(formData: FormData) {
    "use server";
    const category = String(formData.get("category") ?? activeCategory);
    const ids = (formData.getAll("id") as string[]).slice(0, 3);
    redirect(
      `/materials/compare?category=${encodeURIComponent(category)}&ids=${ids.join(",")}`,
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <Link
            href="/materials/shortlist"
            className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-wider mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Shortlist
          </Link>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Scale className="h-4 w-4" />
            Comparison Engine
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Side-by-Side Analysis
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl">
            Evaluate technical specifications, supply chain logistics, and
            carbon performance metrics across your selected materials.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/materials">
            <Button
              variant="outline"
              className="font-bold h-11 px-6 rounded-xl border-border"
            >
              Explorer
            </Button>
          </Link>
          <Link href="/materials/shortlist">
            <Button className="font-bold h-11 px-6 rounded-xl uppercase tracking-wider text-[11px]">
              Finalize Shortlist
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-8 border-border bg-muted/50 rounded-2xl mb-12">
        <form action={compare} className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-3 space-y-3">
              <label
                htmlFor="category"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
              >
                1. Filter by Category
              </label>
              <select
                id="category"
                name="category"
                className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold focus:outline-none focus:border-primary appearance-none cursor-pointer"
                defaultValue={activeCategory}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-7">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-4 block">
                2. Select up to 3 Materials to Compare
              </span>
              <div className="flex flex-wrap gap-3">
                {items.length > 0 ? (
                  items.map((m) => (
                    <label
                      key={m.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer",
                        selectedIds.includes(m.id)
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-background border-border hover:border-muted-foreground text-muted-foreground",
                      )}
                    >
                      <input
                        type="checkbox"
                        name="id"
                        value={m.id}
                        className="hidden"
                        defaultChecked={selectedIds.includes(m.id)}
                      />
                      <div
                        className={cn(
                          "h-5 w-5 rounded-lg border flex items-center justify-center",
                          selectedIds.includes(m.id)
                            ? "border-primary bg-primary"
                            : "border-border",
                        )}
                      >
                        {selectedIds.includes(m.id) && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-xs font-bold">{m.name}</span>
                    </label>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-dashed border-border">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-bold text-muted-foreground italic">
                      No materials discovered in this category yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-2 pt-0 xl:pt-7">
              <Button
                className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-[12px]"
                type="submit"
              >
                Run Analysis
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {selected.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {selected.map((m) => {
            const score = calculateCarbonScore(
              Number(m.embodiedCarbonFactor),
              m.category,
            );
            return (
              <Card
                key={m.id}
                className="group relative flex flex-col overflow-hidden border-border rounded-2xl bg-background"
              >
                <div className={cn("h-1.5 w-full", score.color)} />

                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="rounded-md px-2 py-0 text-[9px] font-bold uppercase tracking-wider bg-muted border-none text-muted-foreground"
                        >
                          {m.category}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                        {m.name}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-11 w-11 rounded-xl flex items-center justify-center text-lg font-bold",
                          score.color
                            .replace("bg-", "text-")
                            .replace("500", "700"),
                          "bg-muted",
                        )}
                      >
                        {score.grade}
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-2">
                        Grade
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="relative">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted border border-border">
                        <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border">
                          <Leaf className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                            Carbon Score
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold text-foreground">
                              {score.score}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                              / 100 Index
                            </span>
                          </div>
                        </div>
                        <TrendingDown className="h-4 w-4 text-emerald-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted border border-border">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          <DollarSign className="h-3 w-3" />
                          Unit Price
                        </div>
                        <div className="text-base font-bold text-foreground tracking-tight">
                          ${m.unitPriceRange}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">
                          Per Unit
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted border border-border">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          <Clock className="h-3 w-3" />
                          Lead Time
                        </div>
                        <div className="text-base font-bold text-foreground tracking-tight">
                          {m.leadTimeEstimate || "—"}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">
                          Est. Days
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 px-1">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          <MapPin className="h-3 w-3" /> Origin
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          {m.origin}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          <Building2 className="h-3 w-3" /> Supplier
                        </div>
                        <span className="text-sm font-bold text-foreground truncate max-w-[120px]">
                          {m.supplierName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          <Zap className="h-3 w-3" /> EC Factor
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          {Number(m.embodiedCarbonFactor).toFixed(3)}{" "}
                          <span className="text-[10px] text-muted-foreground">
                            kgCO₂e
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-muted border-t border-border space-y-3">
                  <Link href={`/materials/${m.id}`}>
                    <Button
                      variant="outline"
                      className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-[11px] gap-2 border-border"
                    >
                      Detailed Specs
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/inquiries/create?materialId=${m.id}`}>
                    <Button className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-[11px] gap-2">
                      Request Quotation
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-muted/50 rounded-2xl border border-dashed border-border text-center px-6">
          <div className="h-20 w-20 bg-background rounded-2xl flex items-center justify-center mb-8 border border-border">
            <Scale className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            No Materials Selected
          </h2>
          <p className="text-muted-foreground font-medium max-w-md mb-10 leading-relaxed">
            Choose up to 3 materials from the panel above to begin your
            comparative analysis and carbon auditing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/materials">
              <Button
                variant="outline"
                className="h-11 px-8 rounded-xl font-bold border-border"
              >
                Browse All Categories
              </Button>
            </Link>
            <Link href="/materials">
              <Button className="h-11 px-8 rounded-xl font-bold uppercase tracking-wider text-[11px]">
                Go to Materials Explorer
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
