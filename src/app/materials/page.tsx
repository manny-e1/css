"use client";

import { Building2, Check, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MaterialCarousel } from "@/components/material-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useShortlist } from "@/context/shortlist-context";
import { authClient } from "@/lib/auth-client";
import { calculateCarbonScore } from "@/lib/carbon";
import { cn } from "@/lib/utils";
import {
  deleteMaterialAction,
  getCategoriesAction,
  getMaterialsWithInquiryCountsAction,
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
  supplierEmail: string | null;
  imageUrl: string | null;
  images: string[] | null;
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

export default function MaterialsPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
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

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterialAction(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      toast.success("Material deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete material",
      );
    }
  };

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
              <Link
                href={`/sourcing/create${projectId ? `?projectId=${projectId}` : ""}`}
              >
                <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-sm transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  New Bid
                </Button>
              </Link>
            ) : (
              <UpgradePrompt
                feature="Open sourcing requests and bidding"
                trigger={
                  <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-sm transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    New Bid
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
              className="group/card relative border border-border/60 shadow-sm rounded-xl overflow-hidden py-0 bg-background transition-all hover:shadow-md hover:border-primary/20 flex flex-col"
            >
              {isSupplier && user?.email === m.supplierEmail && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this material?")
                    ) {
                      handleDelete(m.id);
                    }
                  }}
                  className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-sm border border-red-100 opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-50 hover:scale-110 active:scale-95"
                  title="Delete material"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <MaterialCarousel
                images={m.images}
                fallbackImageUrl={m.imageUrl}
                materialName={m.name}
                categoryName={
                  m.subCategory?.name || m.category?.name || "Uncategorized"
                }
              />
              <CardHeader>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <Badge
                      variant="outline"
                      className="w-fit bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                    >
                      {m.inquiryCount} Inquiries
                    </Badge>
                    {!m.approved && (
                      <Badge
                        variant="secondary"
                        className="w-fit bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                      >
                        Pending Approval
                      </Badge>
                    )}
                  </div>
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
                    <Link
                      href={`/inquiries/create?materialId=${m.id}${projectId ? `&projectId=${projectId}` : ""}`}
                    >
                      <Button className="w-full h-10 text-xs font-bold rounded-lg bg-primary text-white shadow-sm hover:shadow-md transition-all">
                        Contact
                      </Button>
                    </Link>
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
