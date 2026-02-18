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
import { cn } from "@/lib/utils";
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
    redirect("/sourcing?success=true");
  }

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10">
      <div className="mb-12 space-y-6">
        <Link
          href="/sourcing"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-border rounded-xl overflow-hidden bg-background">
            <CardHeader className="border-b bg-muted/50 py-6 px-8">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-3">
                <Info className="h-4 w-4 text-primary" />
                Requirement Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-muted border border-border">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Volume
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {request.quantity}
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-2">
                      {request.unit || "Units"}
                    </span>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Target
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {request.targetUnitPrice
                      ? `$${request.targetUnitPrice}`
                      : "Open"}
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-2">
                      /unit
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-muted border border-border">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  <div className="text-xl font-bold tracking-tight">
                    {request.location || "N/A"}
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-muted border border-border">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Deadline
                  </div>
                  <div className="text-xl font-bold tracking-tight text-foreground">
                    {request.deadline
                      ? request.deadline.toLocaleDateString()
                      : "Open"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Item or Scope Description
                </Label>
                <div className="p-8 rounded-xl bg-muted border border-border text-base leading-relaxed text-foreground font-medium relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  {request.description ||
                    "No specific technical requirements provided."}
                </div>
              </div>

              {request.notes && (
                <div className="space-y-4 mt-8">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Additional Notes
                  </Label>
                  <div className="p-6 rounded-xl bg-muted/50 border border-border border-dashed text-sm leading-relaxed text-muted-foreground font-medium">
                    {request.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border rounded-xl overflow-hidden bg-background">
            <CardHeader className="border-b bg-muted/50 py-6 px-8">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-3">
                <Package className="h-4 w-4 text-primary" />
                Bids Received ({allBids.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {allBids.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    No bids received yet for this request.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allBids.map((bid) => (
                    <div
                      key={bid.id}
                      className="p-6 rounded-xl border border-border bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-foreground">
                          {bid.supplierName || "Anonymous Supplier"}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Bid on {bid.createdAt?.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Price
                          </div>
                          <div className="text-lg font-bold text-primary">
                            ${bid.bidUnitPrice}
                            <span className="text-[10px] text-muted-foreground ml-1">
                              /unit
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Lead Time
                          </div>
                          <div className="text-sm font-bold text-foreground">
                            {bid.leadTimeEstimate || "N/A"}
                          </div>
                        </div>
                        <Badge
                          variant={
                            bid.status === "accepted" ? "default" : "secondary"
                          }
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg",
                            bid.status === "accepted"
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "",
                          )}
                        >
                          {bid.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border rounded-xl overflow-hidden bg-background">
            <CardHeader className="border-b bg-muted/50 py-6 px-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">
                    {existingBid ? "Update Response" : "Submit Response"}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {existingBid
                      ? "Modify Your Existing Quotation"
                      : "Official Quotation Portal"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {!session ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">
                    Sign in to Submit a Bid
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                    You must be logged in as a registered supplier to submit a
                    quotation for this request.
                  </p>
                  <Link href={`/sign-in?callbackUrl=/sourcing/${requestId}`}>
                    <Button className="rounded-xl font-bold px-8">
                      Sign In to Continue
                    </Button>
                  </Link>
                </div>
              ) : session.user.role !== "supplier" &&
                session.user.role !== "admin" ? (
                <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Info className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">
                    Supplier Account Required
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                    Only registered suppliers can submit bids for sourcing
                    requests.
                  </p>
                </div>
              ) : (
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
                    <Link href="/sourcing" className="flex-1">
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
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 rounded-xl border border-border bg-primary text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-6">
                Guidelines
              </h3>
              <div className="space-y-6">
                {[
                  "Bids are binding for 30 days. Ensure pricing accounts for market volatility.",
                  "Include all logistics costs or clearly specify terms in notes.",
                  "Selection is based on price, lead time, and carbon profile.",
                ].map((tip, i) => (
                  <div key={tip} className="flex gap-4">
                    <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-8 rounded-xl border border-border bg-background">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-6 border border-border">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-3">
              Direct Inquiry
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-8">
              Need to clarify technical specifications or volume requirements
              before submitting your final bid?
            </p>
            <Link
              href={`/inquiries/create?materialId=${request.id}${project ? `&projectId=${project.id}` : ""}`}
              className="block"
            >
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl font-bold text-[10px] uppercase tracking-wider border-border gap-3"
              >
                Message Project Lead
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </Card>

          <Card className="p-8 rounded-xl bg-muted border border-border">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-6">
              Procurement Health
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-muted-foreground">Competition</span>
                  <span className="text-primary">Medium</span>
                </div>
                <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-primary rounded-full w-[45%]" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border border-dashed">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Active for 4 more days
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
