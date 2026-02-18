import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  Layers,
  Leaf,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  RefreshCcw,
  TrendingDown,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { getBuyerInquiriesAction } from "@/app/materials/actions";
import { getProjectSummaryAction } from "@/app/projects/actions";
import { removeMaterialAction } from "@/app/projects/remove-material-action";
import {
  listProjectSourcingRequestsAction,
  listRequestBidsAction,
} from "@/app/bids/actions";
import { AddMaterialDialog } from "@/components/add-material-dialog";
import { BulkOrderButton } from "@/components/bulk-order-button";
import { MaterialAlternativesDialog } from "@/components/material-alternatives-dialog";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { RemoveMaterialButton } from "@/components/remove-material-button";
import { SourcingBidsDialog } from "@/components/sourcing-bids-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdatePriceInput } from "@/components/update-price-input";
import { UpdateQuantityInput } from "@/components/update-quantity-input";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Params = { id: string };

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const user = session.user;
  const isPro = user?.role === "professional" || user?.role === "admin";

  if (!isPro) {
    redirect("/materials");
  }

  const projectId = (await params).id;
  const currentTab = (await searchParams).tab || "overview";
  const summary = await getProjectSummaryAction(projectId);
  const sourcingRequests = await listProjectSourcingRequestsAction(projectId);
  const allInquiries = await getBuyerInquiriesAction();

  // Filter inquiries for this project
  const projectInquiries = allInquiries.filter(
    (i) => i.projectId === projectId,
  );

  // Fetch bids for each sourcing request
  const requestsWithBids = await Promise.all(
    sourcingRequests.map(async (req) => {
      const bids = await listRequestBidsAction(req.id);
      return { ...req, bids };
    }),
  );

  // Calculate Primary delay risk based on longest lead time material
  const longestLeadTimeItem = summary.items.reduce((prev, current) => {
    const prevDays = parseInt(prev.leadTimeEstimate, 10) || 0;
    const currentDays = parseInt(current.leadTimeEstimate, 10) || 0;
    return currentDays > prevDays ? current : prev;
  }, summary.items[0]);

  const carbonTarget = 10000; // Example target
  const carbonPercent = Math.min(
    100,
    (summary.totals.carbon / carbonTarget) * 100,
  );

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary mb-8 transition-all group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Portfolio
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {summary.project.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <MapPin className="h-4 w-4 opacity-60" />
              {summary.project.locationCountry}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Layers className="h-4 w-4 opacity-60" />
              {summary.project.floorAreaM2} m² GFA
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href={`/projects/${projectId}/summary`}>
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl font-bold border-border hover:bg-muted transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              Project Report
            </Button>
          </Link>
          <DeleteProjectButton
            projectId={projectId}
            projectName={summary.project.name}
          />
          <AddMaterialDialog projectId={projectId} />
        </div>
      </div>

      {/* Top Summary Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Leaf className="h-6 w-6" />
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
              >
                On Track
              </Badge>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
              Project Carbon
            </div>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(summary.totals.carbon)}
              <span className="text-xs font-bold ml-1.5 opacity-40 uppercase">
                kgCO₂e
              </span>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                <span>Progress</span>
                <span className="text-primary">
                  {Math.round(carbonPercent)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${carbonPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
              >
                Active
              </Badge>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
              Budget Est.
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${(summary.totals.costMax / 1000).toFixed(1)}k
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              <TrendingDown className="h-3.5 w-3.5" />
              7% Under Market
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <Badge
                variant="secondary"
                className="bg-rose-500/10 text-rose-600 border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
              >
                High Risk
              </Badge>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
              Supply Risk
            </div>
            <div className="text-xl font-bold text-foreground truncate">
              {longestLeadTimeItem
                ? longestLeadTimeItem.leadTimeEstimate
                : "No Risk"}
            </div>
            <div className="mt-6 text-[10px] font-medium text-muted-foreground/40 uppercase tracking-wider truncate">
              {longestLeadTimeItem
                ? `Ref: ${longestLeadTimeItem.name}`
                : "All items on schedule"}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden bg-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-500/10 text-blue-600 border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
              >
                Q3 2026
              </Badge>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
              Next Milestone
            </div>
            <div className="text-2xl font-bold text-foreground">
              Material Order
            </div>
            <div className="mt-6 text-[10px] font-bold text-primary uppercase tracking-wider">
              12 Days Remaining
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-xl mb-12 w-fit border border-border/40">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "costs", label: "Costs", icon: DollarSign },
          { id: "sourcing", label: "Sourcing", icon: Building2 },
          { id: "carbon", label: "Carbon", icon: Leaf },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/projects/${projectId}?tab=${tab.id}`}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all",
              currentTab === tab.id
                ? "bg-background text-primary shadow-sm border border-border/40"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-background/40",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        ))}
      </div>

      {currentTab === "overview" && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Material Breakdown
                </h3>
                <Link
                  href={`/projects/${projectId}?tab=costs`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group/link"
                >
                  View Bill of Materials
                  <ChevronRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {summary.items.slice(0, 5).map((item) => (
                  <Card
                    key={item.projectMaterialId}
                    className="group/item border-border/40 shadow-sm rounded-xl overflow-hidden bg-background transition-all hover:border-primary/20"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row items-center gap-0">
                        {item.imageUrl ? (
                          <div className="h-32 w-full sm:w-32 overflow-hidden shrink-0 border-b sm:border-b-0 sm:border-r border-border/40">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="h-32 w-full sm:w-32 bg-muted/20 flex items-center justify-center shrink-0 border-b sm:border-b-0 sm:border-r border-border/40">
                            <Building2 className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="flex-1 w-full p-6">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] font-bold text-primary/60 uppercase tracking-wider mb-1">
                                {item.category}
                              </div>
                              <div className="text-xl font-bold text-foreground group-hover/item:text-primary transition-colors truncate">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-3">
                                <MaterialAlternativesDialog
                                  projectId={projectId}
                                  item={item}
                                />
                              </div>
                            </div>
                            <div className="hidden md:block text-right px-6 border-x border-dashed border-border/40">
                              <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider mb-1">
                                Carbon
                              </div>
                              <div className="text-xl font-bold text-foreground">
                                {Math.round(item.carbon)}{" "}
                                <span className="text-xs opacity-40">kg</span>
                              </div>
                            </div>
                            <div className="hidden sm:block text-right min-w-[120px]">
                              <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider mb-1">
                                Est. Cost
                              </div>
                              <div className="text-xl font-bold text-foreground">
                                ${item.costMax.toLocaleString()}
                              </div>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-muted/30 flex items-center justify-center group-hover/item:bg-primary/10 group-hover/item:text-primary transition-all">
                              <ChevronRight className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {summary.items.length > 5 && (
                  <Link
                    href={`/projects/${projectId}?tab=costs`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className="w-full h-16 border-dashed border-2 rounded-xl text-xs font-bold text-muted-foreground/40 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
                    >
                      + {summary.items.length - 5} more materials in BOM
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="px-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Active Sourcing
                </h3>
              </div>

              <div className="space-y-6">
                {requestsWithBids.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-xl border-2 border-dashed border-border/40 bg-muted/2 shadow-sm">
                    <div className="h-12 w-12 rounded-xl bg-background border border-border/40 flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Building2 className="h-6 w-6 text-muted-foreground/20" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-8">
                      No active sourcing requests.
                    </p>
                    <Link href={`/sourcing/create?projectId=${projectId}`}>
                      <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-sm transition-all">
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                      </Button>
                    </Link>
                  </div>
                ) : (
                  requestsWithBids.map((req) => (
                    <Card
                      key={req.id}
                      className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background hover:border-primary/20 transition-all group/source"
                    >
                      <CardHeader className="p-6 bg-muted/2 border-b border-border/40">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="bg-white border-border/50 text-primary text-[10px] font-bold uppercase tracking-wider"
                          >
                            {req.category}
                          </Badge>
                          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider">
                            {req.bids.length} Bids
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-10">
                          {req.description}
                        </div>
                        <SourcingBidsDialog
                          category={req.category}
                          bids={req.bids}
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
                <Link
                  href={`/sourcing/create?projectId=${projectId}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full h-16 border-dashed border-2 rounded-xl text-xs font-bold gap-2 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all shadow-sm"
                  >
                    <Plus className="h-5 w-5" />
                    New Sourcing Request
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === "costs" && (
        <div className="space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Overview
              </h3>
              <h4 className="text-4xl font-bold tracking-tight text-foreground">
                Bill of Materials
              </h4>
              <p className="text-sm text-muted-foreground max-w-xl">
                Comprehensive cost analysis and quantity management for all
                project specifications. Use the overrides to refine estimates.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <BulkOrderButton
                projectId={projectId}
                items={summary.items.map((item) => ({
                  materialId: item.materialId,
                  quantity: item.quantity,
                  materialName: item.name,
                }))}
                className="h-12 px-6 rounded-xl"
              />
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl font-bold border-border hover:bg-muted transition-all shadow-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export BOM
              </Button>
              <AddMaterialDialog
                projectId={projectId}
                trigger={
                  <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-white shadow-sm transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Specification
                  </Button>
                }
              />
            </div>
          </div>

          <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/[0.02] text-left font-bold text-muted-foreground/60 uppercase text-[10px] tracking-wider">
                      <th className="px-6 py-4">Material Specification</th>
                      <th className="px-6 py-4">Supplier Source</th>
                      <th className="px-4 py-4">Quantity</th>
                      <th className="px-4 py-4">Unit Rate</th>
                      <th className="px-4 py-4">Total Estimate</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {Array.from(
                      new Set(summary.items.map((i) => i.category)),
                    ).map((category) => (
                      <React.Fragment key={category}>
                        <tr className="bg-muted/[0.01]">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <Badge
                                variant="outline"
                                className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                              >
                                {category}
                              </Badge>
                              <div className="h-px flex-1 bg-border/20" />
                            </div>
                          </td>
                        </tr>
                        {summary.items
                          .filter((i) => i.category === category)
                          .map((item) => (
                            <tr
                              key={item.projectMaterialId}
                              className="hover:bg-muted/[0.02] transition-colors group/row"
                            >
                              <td className="px-6 py-6">
                                <div className="flex flex-col gap-2">
                                  <div className="text-lg font-bold text-foreground group-hover/row:text-primary transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                                      <Leaf className="h-3.5 w-3.5 text-emerald-500/60" />
                                      {Math.round(item.carbon)} kgCO₂e
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                                      <Clock className="h-3.5 w-3.5 text-primary/60" />
                                      {item.leadTimeEstimate}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center">
                                    <Building2 className="h-4 w-4 text-muted-foreground/40" />
                                  </div>
                                  <span className="text-muted-foreground/60 font-bold text-xs">
                                    {item.supplierName || "Pending Source"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-6">
                                <UpdateQuantityInput
                                  projectId={projectId}
                                  materialId={item.projectMaterialId}
                                  initialQuantity={item.quantity}
                                />
                              </td>
                              <td className="px-4 py-6">
                                <UpdatePriceInput
                                  projectId={projectId}
                                  materialId={item.projectMaterialId}
                                  initialPrice={item.unitPriceMin}
                                />
                              </td>
                              <td className="px-4 py-6 font-bold text-foreground text-lg">
                                ${item.costMax.toLocaleString()}
                              </td>
                              <td className="px-6 py-6 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                  <Link
                                    href={`/materials?category=${item.category}&replace=${item.projectMaterialId}&projectId=${projectId}`}
                                  >
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10 rounded-lg text-primary border-border/50 hover:bg-primary/5 transition-all shadow-sm"
                                      title="Replace material"
                                    >
                                      <RefreshCcw className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                  <Link
                                    href={`/sourcing/create?category=${item.category}&quantity=${item.quantity}&projectId=${projectId}`}
                                  >
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10 rounded-lg text-primary border-border/50 hover:bg-primary/5 transition-all shadow-sm"
                                      title="Source this item"
                                    >
                                      <Building2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                  <RemoveMaterialButton
                                    projectId={projectId}
                                    materialId={item.projectMaterialId}
                                    onRemove={removeMaterialAction}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/4 font-bold border-t border-border/60">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-right text-xs uppercase tracking-wider text-muted-foreground/40"
                      >
                        Total Estimated Project Value
                      </td>
                      <td className="px-4 py-12 text-5xl tracking-tight text-primary font-bold">
                        ${summary.totals.costMax.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentTab === "carbon" && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background sticky top-8">
                <CardHeader className="p-6">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                    Impact Analysis
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    Carbon Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative h-48 w-48">
                      <svg
                        className="h-full w-full -rotate-90"
                        viewBox="0 0 100 100"
                        role="img"
                        aria-labelledby="carbon-summary-title"
                      >
                        <title id="carbon-summary-title">
                          Carbon Summary Chart
                        </title>
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-muted/10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray="263.89"
                          strokeDashoffset={
                            263.89 -
                            (263.89 * Math.min(carbonPercent, 100)) / 100
                          }
                          strokeLinecap="round"
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold tracking-tight">
                          {Math.round(carbonPercent)}%
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider mt-1">
                          of Target
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/40">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        Total Carbon
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {Math.round(summary.totals.carbon).toLocaleString()}{" "}
                        <span className="text-xs text-muted-foreground/40">
                          kg
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        Intensity
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {(
                          summary.totals.carbon / summary.project.floorAreaM2
                        ).toFixed(1)}{" "}
                        <span className="text-xs text-muted-foreground/40">
                          / m²
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-12">
              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Category Impact Distribution
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from(
                    new Set(summary.items.map((i) => i.category)),
                  ).map((category) => {
                    const catCarbon = summary.items
                      .filter((i) => i.category === category)
                      .reduce((sum, i) => sum + i.carbon, 0);
                    const percent = (catCarbon / summary.totals.carbon) * 100;

                    return (
                      <Card
                        key={category}
                        className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background hover:border-primary/20"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground/60">
                              {category}
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {Math.round(catCarbon).toLocaleString()}{" "}
                              <span className="text-xs font-medium text-muted-foreground/40 uppercase">
                                kg
                              </span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden mb-4">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider text-right">
                            {Math.round(percent)}% of total impact
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Optimization Opportunities
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-6 p-6 rounded-xl bg-emerald-50/30 border border-emerald-100/50 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                      01
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        Material Substitution
                      </h5>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        Consider replacing{" "}
                        <span className="font-bold text-emerald-700">
                          Standard Concrete
                        </span>{" "}
                        with{" "}
                        <span className="font-bold text-emerald-700">
                          30% GGBS Concrete
                        </span>{" "}
                        to save approximately{" "}
                        <span className="font-bold text-foreground">
                          1,200 kg CO₂e
                        </span>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 p-6 rounded-xl bg-primary/5 border border-primary/10 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                      02
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Structural Analysis
                      </h5>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        Timber frame alternatives for partitions could reduce
                        structural carbon by up to{" "}
                        <span className="font-bold text-foreground">45%</span>{" "}
                        compared to steel studs.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {currentTab === "sourcing" && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-8 px-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Active Sourcing Requests
                  </h3>
                  <Link href={`/sourcing/create?projectId=${projectId}`}>
                    <Button
                      variant="outline"
                      className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary border-border/50 hover:bg-primary/5 transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </Link>
                </div>

                <div className="space-y-6">
                  {sourcingRequests.length === 0 ? (
                    <Card className="border-dashed border-2 py-20 rounded-xl bg-muted/5 shadow-none flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 rounded-xl bg-background border border-border/40 shadow-sm flex items-center justify-center mb-6">
                        <Package className="h-8 w-8 text-muted-foreground/20" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground/60 mb-8">
                        No active sourcing requests for this project.
                      </p>
                      <Link href={`/sourcing/create?projectId=${projectId}`}>
                        <Button className="h-12 px-8 rounded-xl font-bold bg-primary text-white shadow-sm transition-all uppercase tracking-wider text-xs">
                          <Plus className="h-4 w-4 mr-2" />
                          Start Sourcing
                        </Button>
                      </Link>
                    </Card>
                  ) : (
                    requestsWithBids.map((req) => (
                      <Card
                        key={req.id}
                        className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background"
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-8 space-y-6">
                              <div className="flex items-center gap-4">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-primary/5 border-primary/10 text-primary"
                                >
                                  {req.category}
                                </Badge>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                                  <Calendar className="h-3.5 w-3.5" />
                                  Posted {req.createdAt?.toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xl font-bold tracking-tight mb-2">
                                  {req.quantity} units of {req.category}
                                </h4>
                                <p className="text-sm text-muted-foreground/70 leading-relaxed line-clamp-2">
                                  {req.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-12 pt-6 border-t border-border/40">
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                                    Received Bids
                                  </div>
                                  <div className="text-2xl font-bold text-primary tracking-tight">
                                    {req.bids.length}
                                  </div>
                                </div>
                                <div className="space-y-1 border-l border-border/40 pl-12">
                                  <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                                    Target Price
                                  </div>
                                  <div className="text-2xl font-bold text-foreground tracking-tight">
                                    {req.targetUnitPrice
                                      ? `$${req.targetUnitPrice}`
                                      : "Open"}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="md:w-64 bg-muted/5 border-l border-border/40 p-8 flex flex-col gap-3 justify-center">
                              <SourcingBidsDialog
                                category={req.category}
                                bids={req.bids}
                              />
                              <Button
                                variant="outline"
                                className="h-10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary border-border/50 hover:bg-primary/5 transition-all gap-2"
                              >
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Request Update
                              </Button>
                              <Button
                                variant="ghost"
                                className="h-10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 hover:bg-background hover:text-primary transition-all"
                              >
                                Edit Request
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-8 px-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Direct Supplier Inquiries
                  </h3>
                </div>

                <div className="space-y-4">
                  {projectInquiries.length === 0 ? (
                    <Card className="border-dashed border-2 py-16 rounded-xl bg-muted/5 shadow-none flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-xl bg-background border border-border/40 shadow-sm flex items-center justify-center mb-4">
                        <MessageSquare className="h-6 w-6 text-muted-foreground/20" />
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wider">
                        No direct inquiries for this project.
                      </p>
                    </Card>
                  ) : (
                    projectInquiries.map((inquiry) => (
                      <Card
                        key={inquiry.id}
                        className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between gap-8">
                            <div className="space-y-3 flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <Badge
                                  className={cn(
                                    "text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 border-none shadow-sm",
                                    inquiry.status === "responded"
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-primary/10 text-primary",
                                  )}
                                >
                                  {inquiry.status}
                                </Badge>
                                <span className="text-lg font-bold tracking-tight truncate">
                                  {inquiry.materialName}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="h-4 w-4 opacity-40" />
                                Inquiry to {inquiry.supplierName || "Supplier"}
                              </div>
                            </div>
                            <Link href={`/inquiries/${inquiry.id}`}>
                              <Button
                                variant="outline"
                                className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all shadow-sm border-border/50"
                              >
                                View Thread
                                <ChevronRight className="h-4 w-4 ml-1.5" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background">
                <CardHeader className="p-6 pb-4 bg-muted/5 border-b border-border/40">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                    Market Data
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    Supply Chain Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                        Avg. Lead Time
                      </span>
                      <span className="text-lg font-bold text-foreground tracking-tight">
                        14.2 Days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                        Volatility
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 text-amber-600 border-amber-500/20 bg-amber-500/5"
                      >
                        Medium
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/40 space-y-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
                      Risk Indicators
                    </div>
                    <div className="space-y-4">
                      {[
                        {
                          label: "Steel Prices",
                          color: "bg-rose-500",
                          text: "are trending up (+5% in last 30 days).",
                        },
                        {
                          label: "Logistics",
                          color: "bg-amber-500",
                          text: "Moderate delays reported in Northern region routes.",
                        },
                        {
                          label: "Timber Supply",
                          color: "bg-amber-500",
                          text: "from local region experiencing delays.",
                        },
                      ].map((risk) => (
                        <div
                          key={risk.label}
                          className="flex items-start gap-4"
                        >
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full mt-1.5 shrink-0 shadow-sm",
                              risk.color,
                            )}
                          />
                          <div className="text-xs leading-relaxed">
                            <span className="font-bold text-foreground uppercase tracking-tight text-[10px]">
                              {risk.label}
                            </span>{" "}
                            <span className="text-muted-foreground/60 font-medium">
                              {risk.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/40 space-y-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
                      Category Lead Times
                    </div>
                    <div className="space-y-4">
                      {Array.from(
                        new Set(summary.items.map((i) => i.category)),
                      ).map((category) => {
                        const items = summary.items.filter(
                          (i) => i.category === category,
                        );
                        const avgLeadTime =
                          items.reduce((sum, i) => {
                            const days =
                              parseInt(i.leadTimeEstimate.split(" ")[0], 10) ||
                              0;
                            return sum + days;
                          }, 0) / items.length;

                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between"
                          >
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                              {category}
                            </span>
                            <span className="text-xs font-bold text-foreground tracking-tight">
                              {Math.round(avgLeadTime)} Days
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-8 bg-primary text-white rounded-xl shadow-sm">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-bold uppercase tracking-tight text-xl flex items-center gap-3">
                      <Plus className="h-5 w-5" />
                      Quick Sourcing
                    </h4>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                      Need a custom quote for something not in the material
                      explorer?
                    </p>
                  </div>
                  <Link href={`/sourcing/create?projectId=${projectId}`}>
                    <Button className="w-full h-12 bg-white text-primary rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-white/90 transition-all">
                      Create Open Request
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
