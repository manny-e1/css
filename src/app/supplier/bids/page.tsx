import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  Gavel,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Search,
  XCircle,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listMyBidsAction } from "@/app/bids/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function SupplierBidsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  if (session.user.role !== "supplier" && session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  const bids = await listMyBidsAction();

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider mb-3">
            <Gavel className="h-3.5 w-3.5" />
            Quotation Management
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">
            My <span className="text-primary">Bids</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Track and manage your responses to sourcing requests.
          </p>
        </div>
        <Link href="/bids">
          <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Search className="h-4 w-4" />
            Find More Requests
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {bids.length === 0 ? (
          <Card className="border-dashed border-2 py-32 bg-muted/30 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-background border border-border rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
              <Gavel className="h-8 w-8 text-muted-foreground/20" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">
              No Bids Submitted
            </h3>
            <p className="text-sm font-medium text-muted-foreground max-w-xs">
              You haven't submitted any bids yet. Explore the sourcing board to
              find opportunities.
            </p>
            <Link href="/bids" className="mt-8">
              <Button
                variant="outline"
                className="rounded-xl font-bold text-xs uppercase tracking-wider px-8 border-border"
              >
                Go to Sourcing Board
              </Button>
            </Link>
          </Card>
        ) : (
          bids.map((bid) => (
            <Card
              key={bid.id}
              className="group border-border/50 bg-background hover:border-primary/20 transition-all duration-300 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5"
            >
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Status & Category Side */}
                  <div className="lg:w-1/3 p-10 bg-muted/5 group-hover:bg-primary/[0.02] transition-colors border-b lg:border-b-0 lg:border-r border-border/50">
                    <div className="flex flex-col h-full justify-between gap-8">
                      <div>
                        <Badge
                          className={cn(
                            "mb-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none",
                            bid.status === "accepted"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : bid.status === "rejected"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-amber-500/10 text-amber-600",
                          )}
                        >
                          {bid.status === "accepted" ? (
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3" /> Accepted
                            </span>
                          ) : bid.status === "rejected" ? (
                            <span className="flex items-center gap-2">
                              <XCircle className="h-3 w-3" /> Rejected
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Clock className="h-3 w-3" /> Pending Review
                            </span>
                          )}
                        </Badge>
                        <h3 className="text-3xl font-black tracking-tighter text-foreground mb-2 group-hover:text-primary transition-colors">
                          {bid.category}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-2">
                          {bid.description ||
                            "Official response to sourcing request."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <Layers className="h-4 w-4 text-primary" />
                          <span>
                            Request Vol: {bid.quantity} {bid.unit || "Units"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>
                            Submitted:{" "}
                            {bid.createdAt
                              ? new Date(bid.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Side */}
                  <div className="lg:w-2/3 p-10 flex flex-col justify-between gap-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                          Offered Price
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black tracking-tighter text-foreground">
                            ${bid.bidUnitPrice}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            /unit
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                          Lead Time
                        </p>
                        <div className="flex items-center gap-3 text-lg font-bold text-foreground">
                          <Clock className="h-5 w-5 text-primary" />
                          {bid.leadTimeEstimate || "Not Specified"}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                          Min. Order
                        </p>
                        <div className="flex items-center gap-3 text-lg font-bold text-foreground">
                          <Package className="h-5 w-5 text-primary" />
                          {bid.minimumOrder || "None"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-border/50">
                      <div className="flex-1 w-full">
                        {bid.notes ? (
                          <p className="text-sm font-medium text-muted-foreground italic line-clamp-2">
                            "{bid.notes}"
                          </p>
                        ) : (
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/30">
                            No additional remarks
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                        {bid.quoteUrl && (
                          <a
                            href={bid.quoteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              className="h-12 rounded-xl border-border font-bold text-[10px] uppercase tracking-wider gap-2.5"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Quote
                            </Button>
                          </a>
                        )}
                        <Link
                          href={`/bids/${bid.requestId}`}
                          className="flex-1 md:flex-none"
                        >
                          <Button className="w-full h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2.5 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98]">
                            Edit Quotation
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
