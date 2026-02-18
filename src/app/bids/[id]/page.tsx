import { and, desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Send,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BidActivitySidebar } from "@/components/bids/bid-activity-sidebar";
import { BidCard } from "@/components/bids/bid-card";
import { DeleteSourcingRequestButton } from "@/components/bids/delete-request-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/db/client";
import {
  bids,
  materials,
  projects,
  sourcingRequests,
  users,
} from "@/db/new-schema";
import { auth } from "@/lib/auth";
import { submitBidAction } from "../actions";

export default async function SourcingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  const requestId = (await params).id;

  const [request] = await db
    .select()
    .from(sourcingRequests)
    .where(eq(sourcingRequests.id, requestId));

  if (!request) notFound();

  // Get project info for context
  const [project] = request.projectId
    ? await db.select().from(projects).where(eq(projects.id, request.projectId))
    : [null];

  // Get user's materials to allow bidding with an existing material (only for suppliers)
  const userMaterials = session?.user.id
    ? await db.select().from(materials).where(eq(materials.approved, true))
    : [];

  // Get existing bid if any for the current user
  const [existingBid] = session?.user.id
    ? await db
        .select()
        .from(bids)
        .where(
          and(
            eq(bids.requestId, requestId),
            eq(bids.supplierId, session.user.id),
          ),
        )
    : [null];

  // Get all bids for this request
  const allBids = await db
    .select({
      id: bids.id,
      bidUnitPrice: bids.bidUnitPrice,
      leadTimeEstimate: bids.leadTimeEstimate,
      status: bids.status,
      createdAt: bids.createdAt,
      supplierName: users.name,
    })
    .from(bids)
    .leftJoin(users, eq(bids.supplierId, users.id))
    .where(eq(bids.requestId, requestId))
    .orderBy(desc(bids.createdAt));

  async function submitBid(formData: FormData) {
    "use server";
    const materialId = formData.get("materialId")
      ? String(formData.get("materialId"))
      : undefined;
    const bidUnitPrice = Number(formData.get("bidUnitPrice") ?? 0);
    const leadTimeEstimate = String(formData.get("leadTimeEstimate") ?? "");
    const minimumOrder = String(formData.get("minimumOrder") ?? "");
    const quoteUrl = String(formData.get("quoteUrl") ?? "");
    const notes = String(formData.get("notes") ?? "");

    await submitBidAction({
      requestId,
      materialId,
      bidUnitPrice,
      leadTimeEstimate,
      minimumOrder,
      quoteUrl,
      notes,
    });
    redirect("/bids?success=true");
  }

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10">
      <div className="mb-12 space-y-6">
        <Link
          href="/bids"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hub
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-wider">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Sourcing Module
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {request.category} <span className="text-primary">Request</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Badge
                variant="outline"
                className="bg-muted text-primary border-primary px-4 py-2 text-[10px] font-bold uppercase tracking-wider gap-2.5 rounded-xl"
              >
                {request.requestType === "service"
                  ? "Service Work"
                  : "Material Supply"}
              </Badge>
              {project ? (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted border border-border">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      Project Site
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {project.name}
                    </span>
                  </div>
                </div>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground border-none font-bold text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-xl"
                >
                  Independent
                </Badge>
              )}
              <Badge
                variant="outline"
                className="bg-muted text-primary border-primary px-4 py-2 text-[10px] font-bold uppercase tracking-wider gap-2.5 rounded-xl"
              >
                Status: {request.status}
              </Badge>
              {session?.user?.id === request.userId && (
                <DeleteSourcingRequestButton
                  requestId={request.id}
                  category={request.category}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Description & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Full Description */}
          <Card className="border-border rounded-2xl overflow-hidden bg-background">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 py-6 px-8">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                <Info className="h-5 w-5 text-primary" />
                Full Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed text-foreground font-medium">
                  {request.description ||
                    "No detailed description provided for this sourcing request."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Notes / Specifications */}
          {request.notes && (
            <Card className="border-border rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b bg-muted/50 py-6 px-8">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Complete Buyer Notes / Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="p-6 rounded-xl bg-muted/30 border border-dashed border-border">
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap">
                    {request.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Context */}
          {project && (
            <Card className="border-border rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b bg-muted/50 py-6 px-8">
                <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  Project Context
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Project Name
                    </Label>
                    <p className="text-lg font-bold text-foreground mt-1">
                      {project.name}
                    </p>
                  </div>
                  {project.location && (
                    <div>
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Project Location
                      </Label>
                      <p className="text-base font-medium text-foreground mt-1">
                        {project.location}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card className="border-border rounded-2xl overflow-hidden bg-background">
            <CardHeader className="border-b bg-muted/50 py-6 px-8">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                <Layers className="h-5 w-5 text-primary" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantity + Unit */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <Label className="text-xs font-black text-primary uppercase tracking-wider mb-2 block">
                    Quantity + Unit
                  </Label>
                  <p className="text-3xl font-black text-foreground">
                    {request.quantity}{" "}
                    <span className="text-lg text-muted-foreground">
                      {request.unit || "units"}
                    </span>
                  </p>
                </div>

                {/* Delivery Address */}
                <div className="p-6 rounded-xl bg-muted border border-border">
                  <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address (Approximate)
                  </Label>
                  <p className="text-lg font-bold text-foreground">
                    {request.location || "Not specified"}
                  </p>
                </div>

                {/* Project Type */}
                <div className="p-6 rounded-xl bg-muted border border-border">
                  <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 block">
                    Project Type
                  </Label>
                  <p className="text-lg font-bold text-foreground">
                    {request.requestType === "service"
                      ? "Service Work"
                      : "Material Supply"}
                  </p>
                </div>

                {/* Target Price */}
                {request.targetUnitPrice && (
                  <div className="p-6 rounded-xl bg-muted border border-border">
                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Preferred Brands (Optional)
                    </Label>
                    <p className="text-lg font-bold text-primary">
                      ${request.targetUnitPrice}
                      <span className="text-sm text-muted-foreground ml-1">
                        /unit
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Quality Requirements */}
              <div className="mt-6 p-6 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Label className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2 block">
                  Quality Requirements
                </Label>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Standard construction grade or better. Must meet local
                  building codes and regulations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery / Execution Window */}
          <Card className="border-border rounded-2xl overflow-hidden bg-background">
            <CardHeader className="border-b bg-muted/50 py-6 px-8">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                Delivery / Execution Window
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Deadline
                  </Label>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {request.deadline
                      ? request.deadline.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Open / Flexible"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bid Activity & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <BidActivitySidebar
            requestId={requestId}
            allBids={allBids}
            session={session}
            existingBid={existingBid}
          />
        </div>
      </div>

      {/* All Bids Section (Below the grid) */}
      {allBids.length > 0 && (
        <div id="all-bids" className="mt-12">
          <Card className="border-border rounded-2xl overflow-hidden bg-background">
            <CardHeader className="border-b bg-muted/50 py-6 px-8">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                All Bids Received ({allBids.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {allBids.map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    isOwner={session?.user.id === request.userId}
                    requestStatus={request.status}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bid Submission Form (Below All Bids) */}
      {session &&
        (session.user.role === "supplier" || session.user.role === "admin") && (
          <div id="bid-form" className="mt-12">
            <Card className="border-border rounded-2xl overflow-hidden bg-background">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 py-6 px-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">
                      {existingBid ? "Update Your Bid" : "Submit Your Bid"}
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-primary mt-1">
                      {existingBid
                        ? "Modify Your Existing Quotation"
                        : "Official Quotation Portal"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <form action={submitBid} className="space-y-8">
                  <div className="space-y-4">
                    <Label
                      htmlFor="materialId"
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Select Corresponding Material (Optional)
                    </Label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <select
                        id="materialId"
                        name="materialId"
                        defaultValue={existingBid?.materialId || ""}
                        className="w-full h-11 pl-12 pr-10 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">
                          -- Manual Entry / Custom Quote --
                        </option>
                        {userMaterials
                          .filter(
                            (m) =>
                              m.category.toLowerCase() ===
                              request.category.toLowerCase(),
                          )
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} (${m.unitPriceRange}/unit)
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label
                        htmlFor="bidUnitPrice"
                        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Offered Price ($)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="bidUnitPrice"
                          name="bidUnitPrice"
                          type="number"
                          step="0.01"
                          required
                          defaultValue={existingBid?.bidUnitPrice || ""}
                          placeholder="0.00"
                          className="pl-12 h-11 rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label
                        htmlFor="leadTimeEstimate"
                        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Lead Time or Availability
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="leadTimeEstimate"
                          name="leadTimeEstimate"
                          defaultValue={existingBid?.leadTimeEstimate || ""}
                          placeholder="e.g. 2-3 weeks or Immediate"
                          className="pl-12 h-11 rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label
                        htmlFor="minimumOrder"
                        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Minimum Order (If applicable)
                      </Label>
                      <div className="relative">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="minimumOrder"
                          name="minimumOrder"
                          defaultValue={existingBid?.minimumOrder || ""}
                          placeholder="e.g. 50 units"
                          className="pl-12 h-11 rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label
                        htmlFor="quoteUrl"
                        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                      >
                        Quote or Invoice Link (Optional)
                      </Label>
                      <div className="relative">
                        <Info className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="quoteUrl"
                          name="quoteUrl"
                          defaultValue={existingBid?.quoteUrl || ""}
                          placeholder="https://..."
                          className="pl-12 h-11 rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label
                      htmlFor="notes"
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Additional Remarks
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="notes"
                        name="notes"
                        defaultValue={existingBid?.notes || ""}
                        placeholder="Provide any additional context or terms..."
                        className="min-h-[120px] rounded-xl border-border font-bold focus-visible:ring-0 focus-visible:border-primary resize-none p-6"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 h-11 rounded-xl bg-primary text-white font-bold text-[10px] uppercase tracking-wider"
                    >
                      {existingBid ? "Update Response" : "Submit Response"}
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                    <Link href="/bids" className="flex-1">
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full h-11 rounded-xl font-bold text-[10px] uppercase tracking-wider border-border"
                      >
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}
