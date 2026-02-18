"use client";

import {
  ArrowLeft,
  Building2,
  ChevronRight,
  DollarSign,
  Layers,
  LayoutDashboard,
  Leaf,
  Plus,
  Send,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  addMaterialToProjectAction,
  createBulkOrdersAction,
  createProjectAction,
} from "@/app/projects/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useShortlist } from "@/context/shortlist-context";
import { authClient } from "@/lib/auth-client";
import { calculateCarbonScore } from "@/lib/carbon";
import { cn } from "@/lib/utils";

export default function ShortlistPage() {
  const { shortlist, removeFromShortlist, clearShortlist } = useShortlist();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isBulkOrdering, setIsBulkOrdering] = useState(false);
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isPro = user?.role === "professional" || user?.role === "admin";

  const handleBulkOrder = async () => {
    if (shortlist.length === 0) return;

    setIsBulkOrdering(true);
    try {
      const result = await createBulkOrdersAction({
        items: shortlist.map((m) => ({
          materialId: m.id,
          quantity: 1,
        })),
      });

      if (result && result.length > 0) {
        toast.success(
          `Successfully placed orders for all ${shortlist.length} materials!`,
        );
        clearShortlist();
      } else {
        toast.error("Failed to place orders. No orders were created.");
      }
    } catch (error: any) {
      console.error("Failed to place bulk order:", error);
      toast.error(
        error.message || "Failed to place bulk order. Please try again.",
      );
    } finally {
      setIsBulkOrdering(false);
    }
  };

  const handleCreateProject = async () => {
    if (shortlist.length === 0) return;

    const projectName = prompt("Enter project name:");
    if (!projectName) return;

    setIsCreatingProject(true);
    try {
      const project = await createProjectAction({
        name: projectName,
        projectType: "residential",
        location: "Unknown",
        floorArea: 100,
      });

      for (const material of shortlist) {
        await addMaterialToProjectAction({
          projectId: project.id,
          materialId: material.id,
          quantity: 1,
        });
      }

      clearShortlist();
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error("Failed to create project from shortlist:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  if (shortlist.length === 0) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col items-center justify-center py-32 bg-muted/10 rounded-2xl border-2 border-dashed border-muted/50">
          <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Your Shortlist is Empty
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs text-center mb-8">
            Explore our low-carbon material database and add items here to
            compare and start projects.
          </p>
          <Link href="/materials">
            <Button className="font-bold h-12 px-8 rounded-xl shadow-sm">
              Explore Materials
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgCarbonFactor =
    shortlist.reduce((acc, m) => acc + Number(m.embodiedCarbonFactor), 0) /
    shortlist.length;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-wider mb-4 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Explorer
          </Link>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Layers className="h-4 w-4" />
            Selection Console
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Material Shortlist
          </h1>
          <p className="text-muted-foreground font-medium">
            Review and compare your selected materials before initiating a
            project.
          </p>
        </div>
        <div className="flex gap-3">
          {isPro ? (
            <Button
              variant="outline"
              onClick={handleBulkOrder}
              disabled={isBulkOrdering || isCreatingProject}
              className="font-bold h-12 px-6 rounded-xl border-primary text-primary hover:bg-primary/5"
            >
              {isBulkOrdering ? "Ordering..." : "Bulk Order All"}
            </Button>
          ) : (
            <UpgradePrompt
              feature="Cost estimation and overrides"
              trigger={
                <Button
                  variant="outline"
                  className="font-bold h-12 px-6 rounded-xl border-primary text-primary hover:bg-primary/5"
                >
                  Bulk Order All
                </Button>
              }
            />
          )}
          <Button
            variant="outline"
            onClick={clearShortlist}
            disabled={isCreatingProject || isBulkOrdering}
            className="font-bold h-12 px-6 rounded-xl"
          >
            Clear All
          </Button>
          {isPro ? (
            <Button
              onClick={handleCreateProject}
              disabled={isCreatingProject}
              className="font-bold h-12 px-6 gap-2 rounded-xl shadow-sm"
            >
              {isCreatingProject ? (
                "Initializing..."
              ) : (
                <>
                  <LayoutDashboard className="h-4 w-4" />
                  Convert to Project
                </>
              )}
            </Button>
          ) : (
            <UpgradePrompt
              feature="Create and manage projects"
              trigger={
                <Button className="font-bold h-12 px-6 gap-2 rounded-xl shadow-sm">
                  <LayoutDashboard className="h-4 w-4" />
                  Convert to Project
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-background border border-muted/60 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-muted">
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Material Details
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                    Carbon Score
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Est. Pricing
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/30">
                {shortlist.map((material) => {
                  const score = calculateCarbonScore(
                    Number(material.embodiedCarbonFactor),
                    material.category,
                  );
                  return (
                    <tr
                      key={material.id}
                      className="hover:bg-muted/5 transition-colors group"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-primary/40" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
                              {material.category}
                            </div>
                            <div className="text-base font-bold text-foreground truncate">
                              {material.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {material.supplierName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col items-center gap-1">
                          <Badge
                            className={cn(
                              "font-bold text-[11px] uppercase border-none px-3 py-0.5 rounded-full",
                              score.grade === "A"
                                ? "bg-green-100 text-green-700"
                                : score.grade === "B"
                                  ? "bg-lime-100 text-lime-700"
                                  : score.grade === "C"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700",
                            )}
                          >
                            Grade {score.grade}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            {score.score}/100 Score
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-bold text-amber-600">
                          ${material.unitPriceRange}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Est. per unit
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link href={`/materials/${material.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider border-primary/20 text-primary hover:bg-primary/5 rounded-lg"
                            >
                              Details
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            onClick={() => removeFromShortlist(material.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 border-none bg-blue-50/50 shadow-none rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-blue-900">
                    Bulk Sourcing
                  </h4>
                  <p className="text-[10px] font-bold text-blue-700/60 uppercase tracking-tight">
                    Streamlined Procurement
                  </p>
                </div>
              </div>
              <p className="text-sm text-blue-800/80 font-medium leading-relaxed mb-8">
                Request formal quotes from all {shortlist.length} selected
                suppliers simultaneously. Our system will organize responses for
                easy comparison.
              </p>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-bold border-blue-200 bg-white/50 text-blue-700 hover:bg-white"
                disabled
              >
                Initialize Bulk Inquiry
              </Button>
              <p className="text-[10px] text-center mt-4 font-bold text-blue-400 uppercase tracking-wider italic">
                Coming in Next Release
              </p>
            </Card>

            <Card className="p-8 border-none bg-primary/5 shadow-none rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
                      Direct Compare
                    </h4>
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-tight">
                      Side-by-Side Analysis
                    </p>
                  </div>
                </div>
                <p className="text-sm text-primary/80 font-medium leading-relaxed mb-8">
                  View technical specifications and carbon metrics side-by-side
                  to make data-driven decisions for your project.
                </p>
              </div>
              <Link
                href={`/materials/compare?category=${shortlist[0].category}&ids=${shortlist.map((m) => m.id).join(",")}`}
              >
                <Button className="w-full h-12 rounded-xl font-bold gap-2 shadow-sm">
                  Launch Compare View
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-8 border-none bg-muted/20 shadow-none rounded-2xl">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-8 text-center">
              Selection Analytics
            </h3>

            <div className="space-y-8">
              <div className="text-center">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Total Items
                </div>
                <div className="text-4xl font-bold text-foreground">
                  {shortlist.length}
                </div>
              </div>

              <div className="pt-8 border-t border-muted">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4">
                  <Leaf className="h-3 w-3" />
                  Avg Carbon Factor
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  {avgCarbonFactor.toFixed(3)}
                  <span className="text-[10px] ml-1 uppercase">kgCO₂e/kg</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[65%]" />
                </div>
              </div>

              <div className="pt-8 border-t border-muted">
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-4">
                  <DollarSign className="h-3 w-3" />
                  Price Diversity
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">
                      Low Range
                    </div>
                    <div className="text-sm font-bold text-amber-700">
                      $0.45
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">
                      High Range
                    </div>
                    <div className="text-sm font-bold text-amber-700">
                      $12.50
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreatingProject}
                  className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-sm"
                >
                  Create Project
                </Button>
              </div>
            </div>
          </Card>

          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2 mb-3">
              <Plus className="h-3 w-3" />
              Pro Tip
            </h4>
            <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed">
              Materials in your shortlist are temporarily stored. Convert them
              into a project to persist the selection and begin carbon
              calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
