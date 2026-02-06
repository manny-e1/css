"use client";

import { Building2, Check, Plus, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useShortlist } from "@/context/shortlist-context";
import { calculateCarbonScore } from "@/lib/carbon";
import { cn } from "@/lib/utils";
import {
  getMaterialsWithInquiryCountsAction,
  getCategoriesAction,
} from "./actions";

interface MaterialWithInquiryCount {
  id: string;
  categoryId: string | null;
  subCategoryId: string | null;
  category: { id: string; name: string } | null;
  subCategory: { id: string; name: string } | null;
  name: string;
  supplierName: string;
  origin: string;
  unitPriceRange: string;
  leadTimeEstimate: string;
  embodiedCarbonFactor: string;
  imageUrl: string | null;
  certification: string | null;
  approved: boolean | null;
  createdAt: Date | null;
  inquiryCount: number;
}

interface CategoryWithSubs {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

function SourcingLink() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  return (
    <Link
      href={`/sourcing/create${projectId ? `?projectId=${projectId}` : ""}`}
    >
      <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-sm transition-all">
        <Plus className="h-4 w-4 mr-2" />
        New Request
      </Button>
    </Link>
  );
}
function InquiryLink({ materialId }: { materialId: string }) {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  return (
    <Link
      href={`/inquiries/create?materialId=${materialId}${projectId ? `&projectId=${projectId}` : ""}`}
    >
      <Button className="w-full h-10 text-xs font-bold rounded-lg bg-primary text-white shadow-sm hover:shadow-md transition-all">
        Contact
      </Button>
    </Link>
  );
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialWithInquiryCount[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubs[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();

  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isSupplier = user?.role === "supplier";
  const isBuyer = user?.role === "buyer";
  const isPro = user?.role === "professional" || user?.role === "admin";

  useEffect(() => {
    async function loadData() {
      try {
        const [materialsData, categoriesData] = await Promise.all([
          getMaterialsWithInquiryCountsAction(),
          getCategoriesAction(),
        ]);
        setMaterials(materialsData as any[]);
        setCategories(categoriesData as any[]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load data",
        );
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.supplierName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || m.category?.name === selectedCategory;

    const matchesSubCategory =
      selectedSubCategory === "All" ||
      m.subCategory?.name === selectedSubCategory;

    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  const activeCategory = categories.find((c) => c.name === selectedCategory);
  const subCategories = activeCategory
    ? ["All", ...activeCategory.subCategories.map((s) => s.name)]
    : ["All"];

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-center py-20">
        <p className="text-gray-500">Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Discover Materials
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Discover, compare, and shortlist high-performance, low-carbon
            construction materials for your projects.
          </p>
        </div>
        <div className="flex gap-4">
          {isSupplier && (
            <Link href="/materials/create">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl font-bold border-border hover:bg-muted transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                List Material
              </Button>
            </Link>
          )}
          {!isSupplier &&
            (isPro ? (
              <Suspense
                fallback={
                  <div className="h-12 w-40 bg-muted rounded-xl animate-pulse" />
                }
              >
                <SourcingLink />
              </Suspense>
            ) : (
              <UpgradePrompt
                feature="Open sourcing requests and bidding"
                trigger={
                  <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-sm transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                }
              />
            ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search materials or suppliers..."
              className="pl-10 h-12 rounded-xl border-border bg-muted/5 focus:bg-background transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Main Category
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                className={cn(
                  "h-10 px-5 whitespace-nowrap text-xs font-bold rounded-xl transition-all",
                  selectedCategory === "All"
                    ? "bg-primary text-white shadow-sm"
                    : "border-border hover:bg-muted",
                )}
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedSubCategory("All");
                }}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={
                    selectedCategory === cat.name ? "default" : "outline"
                  }
                  className={cn(
                    "h-10 px-5 whitespace-nowrap text-xs font-bold rounded-xl transition-all",
                    selectedCategory === cat.name
                      ? "bg-primary text-white shadow-sm"
                      : "border-border hover:bg-muted",
                  )}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedSubCategory("All");
                  }}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {selectedCategory !== "All" && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Subcategory
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {subCategories.map((sub) => (
                  <Button
                    key={sub}
                    variant={
                      selectedSubCategory === sub ? "secondary" : "outline"
                    }
                    className={cn(
                      "h-9 px-4 whitespace-nowrap text-xs font-medium rounded-lg transition-all",
                      selectedSubCategory === sub
                        ? "bg-muted text-foreground shadow-sm"
                        : "border-border hover:bg-muted/50",
                    )}
                    onClick={() => setSelectedSubCategory(sub)}
                  >
                    {sub}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((m) => {
          const { score, grade } = calculateCarbonScore(
            Number(m.embodiedCarbonFactor),
            m.category?.name || "Other",
          );

          return (
            <Card
              key={m.id}
              className="group/card border border-border/60 shadow-sm rounded-xl overflow-hidden py-0 bg-background transition-all hover:shadow-md hover:border-primary/20 flex flex-col"
            >
              {m.imageUrl ? (
                <div className="relative h-48 w-full overflow-hidden border-b border-border/40">
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-background/90 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm"
                    >
                      {m.subCategory?.name ||
                        m.category?.name ||
                        "Uncategorized"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 w-full bg-muted/20 flex items-center justify-center border-b border-border/40 overflow-hidden">
                  <Building2 className="h-12 w-12 text-muted-foreground/20" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-background/90 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm"
                    >
                      {m.subCategory?.name ||
                        m.category?.name ||
                        "Uncategorized"}
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start gap-4 mb-4">
                  {!m.imageUrl && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                    >
                      {m.subCategory?.name ||
                        m.category?.name ||
                        "Uncategorized"}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold border-none px-2.5 py-1 rounded-md uppercase tracking-wider ml-auto",
                      grade === "A"
                        ? "bg-emerald-50 text-emerald-700"
                        : grade === "B"
                          ? "bg-lime-50 text-lime-700"
                          : grade === "C"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700",
                    )}
                  >
                    Carbon rating {grade} • {score}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight group-hover/card:text-primary transition-colors line-clamp-1 mb-2">
                  {m.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60">
                  <Building2 className="h-3.5 w-3.5 opacity-60" />
                  <span className="truncate">
                    {m.supplierName} • {m.origin}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-lg bg-muted/5 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">
                      Price Range
                    </div>
                    <div className="text-base font-bold text-foreground">
                      ${m.unitPriceRange}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/5 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-1">
                      Lead Time
                    </div>
                    <div className="text-base font-bold text-foreground">
                      {m.leadTimeEstimate}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-auto pt-6 border-t border-border/40">
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/materials/${m.id}`}>
                      <Button
                        variant="outline"
                        className="w-full h-10 text-xs font-bold rounded-lg border-border hover:bg-muted transition-all"
                      >
                        Details
                      </Button>
                    </Link>
                    <Suspense
                      fallback={
                        <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
                      }
                    >
                      <InquiryLink materialId={m.id} />
                    </Suspense>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {isPro ? (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full h-12 text-[10px] font-bold uppercase tracking-wider gap-2 rounded-xl transition-all",
                          isInShortlist(m.id)
                            ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                            : "text-muted-foreground/60 hover:text-primary hover:bg-primary/5",
                        )}
                        onClick={() =>
                          isInShortlist(m.id)
                            ? removeFromShortlist(m.id)
                            : addToShortlist({
                                id: m.id,
                                name: m.name,
                                category: m.category?.name || "Other",
                                supplierName: m.supplierName,
                                unitPriceRange: m.unitPriceRange,
                                embodiedCarbonFactor: m.embodiedCarbonFactor,
                              })
                        }
                      >
                        {isInShortlist(m.id) ? (
                          <>
                            <Check className="h-4 w-4" /> Added to Shortlist
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" /> Add to Shortlist
                          </>
                        )}
                      </Button>
                    ) : (
                      <UpgradePrompt
                        feature="Material categorization by project"
                        trigger={
                          <Button
                            variant="ghost"
                            className="w-full h-12 text-[10px] font-bold uppercase tracking-wider gap-2 rounded-xl text-muted-foreground/60 hover:text-primary hover:bg-primary/5 transition-all"
                          >
                            <Plus className="h-4 w-4" /> Add to Shortlist
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <Card className="border-dashed border-2 py-24 shadow-none bg-muted/2 rounded-xl flex flex-col items-center justify-center">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-xl bg-muted/10 flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-muted-foreground/20" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              No materials found
            </h2>
            <p className="text-muted-foreground/60 max-w-sm font-medium leading-relaxed">
              Check back later or try adjusting your search terms and category
              filters.
            </p>
            <Link href="/materials/create" className="mt-8">
              <Button className="h-12 px-8 rounded-xl font-bold bg-primary text-white shadow-sm transition-all">
                List Your First Material
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
