import {
  ArrowLeft,
  Building2,
  Clock,
  Info,
  MapPin,
  MessageSquare,
  Plus,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMaterialByIdAction } from "@/app/materials/actions";
import { ImageGallery } from "@/components/image-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { auth } from "@/lib/auth";
import { calculateCarbonScore } from "@/lib/carbon";
import { cn } from "@/lib/utils";

type Params = { id: string };
type SearchParams = { projectId?: string };

export default async function MaterialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const user = session.user;
  const isPro = user?.role === "professional" || user?.role === "admin";
  const isSupplier = user?.role === "supplier";

  const { id: materialId } = await params;
  const { projectId } = await searchParams;
  const materialResult = await getMaterialByIdAction(materialId);

  if (!materialResult) {
    redirect("/materials");
  }

  const material = materialResult as any;

  // Authorization check for unapproved materials
  if (
    !material.approved &&
    user.role !== "admin" &&
    material.supplierEmail !== user.email
  ) {
    redirect("/materials");
  }

  const { score, grade, color } = calculateCarbonScore(
    Number(material.embodiedCarbonFactor),
    material.category?.name || "Other",
  );

  return (
    <div className="container mx-auto py-10 px-6 lg:px-10 max-w-7xl">
      <Link
        href={projectId ? `/projects/${projectId}` : "/materials"}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 hover:text-primary mb-12 transition-all group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {projectId ? "Back to Project" : "Back to Explorer"}
      </Link>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1 space-y-16">
          {/* Header Block */}
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-primary/5 text-primary border-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider"
              >
                {material.category?.name || "Other"}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "px-4 py-1.5 text-[10px] font-bold border-none uppercase tracking-wider",
                  grade === "A"
                    ? "bg-emerald-50 text-emerald-700"
                    : grade === "B"
                      ? "bg-lime-50 text-lime-700"
                      : grade === "C"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700",
                )}
              >
                Grade {grade} • {score}
              </Badge>
              {material.approved ? (
                <Badge className="bg-blue-50 text-blue-700 border-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-amber-50 text-amber-700 border-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                  Pending Approval
                </Badge>
              )}
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-foreground">
                {material.name}
              </h1>
              <div className="flex flex-wrap items-center gap-10 text-muted-foreground/60">
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary/60" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-40">
                      Supplier
                    </div>
                    <div className="text-sm font-bold text-foreground/80 leading-none">
                      {material.supplierName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary/60" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-40">
                      Origin
                    </div>
                    <div className="text-sm font-bold text-foreground/80 leading-none">
                      {material.origin}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <ImageGallery
                images={
                  material.images ||
                  (material.imageUrl ? [material.imageUrl] : [])
                }
              />
            </div>

            {/* Price & Lead Time Block */}
            <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background group/card transition-all">
              <CardHeader className="pb-6 border-b border-border/40 bg-muted/2">
                <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground/40 tracking-wider">
                  Technical Specs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8 space-y-8">
                <div className="p-6 rounded-2xl bg-muted/5 border border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">
                      Unit Price Range
                    </span>
                    <div className="text-xl font-bold tracking-tight text-emerald-600">
                      ${material.unitPriceRange}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground/40 italic font-medium">
                    Market estimate for standard orders
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-muted/5 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30 mb-3 flex items-center gap-3">
                      <Clock className="h-4 w-4 opacity-40" />
                      Lead Time
                    </div>
                    <div className="text-base font-bold text-foreground tracking-tight">
                      {material.leadTimeEstimate}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-muted/5 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30 mb-3 flex items-center gap-3">
                      <Info className="h-4 w-4 opacity-40" />
                      Standard
                    </div>
                    <div className="text-base font-bold text-foreground truncate tracking-tight">
                      {material.certification || "ISO Compliant"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Carbon Score Block */}
            <Card className="border-border/40 shadow-sm rounded-xl overflow-hidden bg-background group/card transition-all">
              <CardHeader className="pb-6 border-b border-border/40 bg-muted/2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] uppercase font-bold text-muted-foreground/40 tracking-wider">
                    Carbon Performance
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary/5 transition-colors"
                        >
                          <Info className="h-4 w-4 text-muted-foreground/30 hover:text-primary transition-colors" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] p-6 bg-white border-border/50 shadow-sm rounded-xl">
                        <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                          Environmental performance (0-100) compared to global
                          industry benchmarks for{" "}
                          <span className="text-foreground font-bold">
                            {material.category?.name || "Other"}
                          </span>
                          .{" "}
                          <span className="text-primary font-bold uppercase tracking-wider">
                            Lower is better.
                          </span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="pt-8 px-8 pb-8">
                <div className="flex items-end justify-between mb-8">
                  <div
                    className={cn(
                      "text-6xl font-bold px-8 py-6 rounded-2xl tracking-tight transition-all",
                      grade === "A"
                        ? "text-emerald-600 bg-emerald-50/50"
                        : grade === "B"
                          ? "text-lime-600 bg-lime-50/50"
                          : grade === "C"
                            ? "text-amber-600 bg-amber-50/50"
                            : "text-rose-600 bg-rose-50/50",
                    )}
                  >
                    {score}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-muted-foreground/30 mb-2 uppercase tracking-wider">
                      Embodied Carbon
                    </div>
                    <div className="text-3xl font-bold tracking-tight text-foreground">
                      {material.embodiedCarbonFactor}{" "}
                      <span className="text-[10px] font-bold text-muted-foreground/20 uppercase ml-1 tracking-widest">
                        kgCO₂e/unit
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden mb-4">
                  <div
                    className={cn("h-full rounded-full", color)}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-muted-foreground/30 uppercase tracking-wider">
                  <span>High Efficiency</span>
                  <span>Impact Intensive</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Note */}
          <div className="bg-amber-50/20 border border-amber-500/10 rounded-xl p-8 flex gap-8 shadow-sm group">
            <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Info className="h-6 w-6 text-amber-600" />
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-amber-900/40 uppercase tracking-wider">
                Logistics Guidance
              </div>
              <p className="text-base text-amber-900/70 leading-relaxed font-medium">
                Standard delivery schedules apply for materials from{" "}
                <span className="font-bold text-amber-900/90">
                  {material.origin}
                </span>
                . Actual lead times may vary based on order volume and project
                location.{" "}
                <span className="italic opacity-60">
                  Contact the supplier directly for a custom logistics quote.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:w-[380px] space-y-8">
          {!isSupplier ? (
            <Card className="p-10 space-y-10 border-border/40 shadow-sm rounded-xl overflow-hidden bg-background sticky top-10">
              <div className="space-y-4">
                {isPro ? (
                  <Button className="w-full font-bold h-12 gap-3 text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all bg-primary text-white">
                    <Plus className="h-4 w-4" />
                    Add to Project Shortlist
                  </Button>
                ) : (
                  <UpgradePrompt
                    feature="Material categorization by project"
                    trigger={
                      <Button className="w-full font-bold h-12 gap-3 text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all bg-primary text-white">
                        <Plus className="h-4 w-4" />
                        Add to Project Shortlist
                      </Button>
                    }
                  />
                )}
                <Link
                  href={`/inquiries/create?materialId=${material.id}${projectId ? `&projectId=${projectId}` : ""}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full font-bold h-12 gap-3 text-xs uppercase tracking-wider rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Direct Inquiry
                  </Button>
                </Link>
              </div>
              <div className="pt-10 border-t border-dashed border-border/40">
                <p className="text-[10px] text-muted-foreground/30 text-center mb-8 leading-relaxed font-bold uppercase tracking-wider italic">
                  Alternative Sourcing?
                </p>
                {isPro ? (
                  <Link
                    href={`/bids/create${projectId ? `?projectId=${projectId}` : ""}`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className="w-full text-[10px] uppercase font-bold text-primary hover:bg-primary/5 tracking-wider h-12 rounded-xl transition-all"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Post Open Request
                    </Button>
                  </Link>
                ) : (
                  <UpgradePrompt
                    feature="Open sourcing requests and bidding"
                    trigger={
                      <Button
                        variant="ghost"
                        className="w-full text-[10px] uppercase font-bold text-primary hover:bg-primary/5 tracking-wider h-12 rounded-xl transition-all"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Post Open Request
                      </Button>
                    }
                  />
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-10 space-y-10 border-border/40 shadow-sm rounded-xl overflow-hidden bg-background sticky top-10">
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-muted/5 border border-border/40 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mb-2">
                    Supplier View
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    You are viewing this material as a supplier. Buyer actions
                    are disabled.
                  </p>
                </div>
                {material.supplierEmail === user.email && (
                  <Link href={`/supplier/materials`} className="block">
                    <Button className="w-full font-bold h-12 gap-3 text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all bg-primary text-white">
                      Manage My Materials
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          )}

          {/* Market Context */}
          <Card className="p-10 bg-muted/5 border border-border/40 rounded-xl shadow-sm">
            <h3 className="text-[10px] uppercase font-bold text-muted-foreground/30 tracking-wider mb-10">
              Market Insights
            </h3>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                  Interest Level
                </span>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase px-4 py-2 tracking-wider rounded-full">
                  High Demand
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                  Recent Activity
                </span>
                <span className="text-sm font-bold text-foreground tracking-tight">
                  12 Active Projects
                </span>
              </div>
              <div className="pt-8 mt-8 border-t border-dashed border-border/40">
                <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-wider">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Live Marketplace
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
