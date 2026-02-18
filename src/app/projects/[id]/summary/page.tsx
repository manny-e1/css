"use server";

import {
  ArrowLeft,
  Building2,
  Download,
  FileText,
  Layers,
  Leaf,
  MapPin,
  Package,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  getProjectSummaryAction,
  removeMaterialFromProjectAction,
} from "../../actions";

type Params = { id: string };

export default async function ProjectSummaryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const projectId = (await params).id;
  const summary = await getProjectSummaryAction(projectId);

  async function removeMaterial(formData: FormData) {
    "use server";
    const pmId = String(formData.get("projectMaterialId") ?? "");
    // Parse projectMaterialId format: "projectId-materialId"
    const [_, materialId] = pmId.split("-");
    if (!materialId) throw new Error("Invalid material ID");
    await removeMaterialFromProjectAction(projectId, materialId);
    revalidatePath(`/projects/${projectId}/summary`);
  }

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary mb-8 transition-all group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Project
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
            <FileText className="h-3.5 w-3.5" />
            Project Performance Report
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            {summary.project.name} <span className="text-primary">Summary</span>
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground/80 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <MapPin className="h-4 w-4 opacity-60 text-primary" />
              {summary.project.locationCountry}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Layers className="h-4 w-4 opacity-60 text-primary" />
              {summary.project.floorAreaM2} m² GFA
            </div>
          </div>
        </div>
        <a
          href={`/projects/${projectId}/summary.pdf`}
          className="h-14 px-8 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-foreground/10 hover:shadow-foreground/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Export Analysis
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-foreground flex items-center gap-3 uppercase tracking-widest">
                <Package className="h-4 w-4 text-primary" />
                Material Specification
              </h3>
              <Badge
                variant="outline"
                className="rounded-lg font-bold text-[10px] px-3 py-1 uppercase tracking-wider border-border/50"
              >
                {summary.items.length} Specifications
              </Badge>
            </div>

            <div className="space-y-4">
              {summary.items.map(
                (it) =>
                  it && (
                    <Card
                      key={it.projectMaterialId}
                      className="group border-border/40 shadow-sm rounded-[2rem] overflow-hidden bg-background hover:border-primary/20 transition-all"
                    >
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                                  {it.category}
                                </Badge>
                                <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                  <Building2 className="h-3 w-3" />
                                  {it.supplierName}
                                </div>
                              </div>
                              <h4 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {it.name}
                              </h4>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">
                                  Quantity
                                </div>
                                <div className="text-sm font-bold">
                                  {it.quantity}{" "}
                                  <span className="text-[10px] opacity-40">
                                    {it.unit}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">
                                  Lead Time
                                </div>
                                <div className="text-sm font-bold">
                                  {it.leadTimeEstimate || "—"}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">
                                  Carbon
                                </div>
                                <div className="text-sm font-bold text-emerald-600">
                                  {Math.round(it.carbon)}{" "}
                                  <span className="text-[10px] opacity-40 uppercase">
                                    KG
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">
                                  Budget
                                </div>
                                <div className="text-sm font-bold text-primary">
                                  ${Math.round(it.costMin)} - $
                                  {Math.round(it.costMax)}
                                </div>
                              </div>
                            </div>

                            <div className="pt-6 border-t border-dashed border-border/40">
                              <div className="flex items-center justify-between mb-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                  Baseline Comparison
                                </div>
                                <div className="h-px flex-1 mx-4 bg-border/20" />
                              </div>
                              <div className="flex flex-wrap gap-8">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "h-8 w-8 rounded-xl flex items-center justify-center",
                                      it.baseline.carbonDiffPct <= 0
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600",
                                    )}
                                  >
                                    {it.baseline.carbonDiffPct <= 0 ? (
                                      <TrendingDown className="h-4 w-4" />
                                    ) : (
                                      <TrendingUp className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                                      Carbon Δ
                                    </div>
                                    <div className="text-xs font-bold">
                                      {(
                                        it.baseline.carbonDiffPct * 100
                                      ).toFixed(1)}
                                      %
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "h-8 w-8 rounded-xl flex items-center justify-center",
                                      it.baseline.costMidDiffPct <= 0
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600",
                                    )}
                                  >
                                    {it.baseline.costMidDiffPct <= 0 ? (
                                      <TrendingDown className="h-4 w-4" />
                                    ) : (
                                      <TrendingUp className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                                      Cost Δ
                                    </div>
                                    <div className="text-xs font-bold">
                                      {(
                                        it.baseline.costMidDiffPct * 100
                                      ).toFixed(1)}
                                      %
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-border/40 pt-6 md:pt-0 md:pl-6">
                            <form action={removeMaterial}>
                              <input
                                type="hidden"
                                name="projectMaterialId"
                                value={it.projectMaterialId}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl text-muted-foreground/20 hover:text-rose-600 hover:bg-rose-50 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ),
              )}
              {summary.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-[3rem] border-2 border-dashed border-border/50 text-center px-6">
                  <div className="h-16 w-16 rounded-2xl bg-background border border-border/50 flex items-center justify-center mb-6 shadow-sm">
                    <Package className="h-6 w-6 text-muted-foreground/20" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    No Materials Selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none bg-primary text-primary-foreground rounded-[2.5rem] shadow-2xl shadow-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Leaf className="h-24 w-24" />
            </div>
            <CardHeader className="p-10 pb-0 relative z-10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60">
                Project Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8 relative z-10">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Cumulative Carbon
                </div>
                <div className="text-5xl font-black tracking-tighter">
                  {Math.round(summary.totals.carbon)}
                  <span className="text-xs font-bold ml-3 opacity-40 uppercase tracking-widest">
                    kgCO₂e
                  </span>
                </div>
              </div>
              <div className="h-px w-full bg-white/10" />
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Budget Estimate
                </div>
                <div className="text-4xl font-black tracking-tighter">
                  ${Math.round(summary.totals.costMin).toLocaleString()}
                  <span className="text-xs font-bold mx-2 opacity-20">-</span>$
                  {Math.round(summary.totals.costMax).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-muted/5 rounded-[2.5rem] p-10 space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-sm">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              Technical Data
            </h3>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              This summary provides a consolidated view of embodied carbon and
              cost implications for all specified materials.
            </p>
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] border-border/50 bg-background hover:bg-muted"
              >
                Detailed Export
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
