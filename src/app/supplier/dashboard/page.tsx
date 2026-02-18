import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Gavel,
  MessageSquare,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  listSupplierMaterialsAction,
  listSupplierOrdersAction,
} from "@/app/materials/actions";
import {
  listMyBidsAction,
  listOpenSourcingRequestsAction,
} from "@/app/bids/actions";
import { getSupplierInquiriesAction } from "@/app/supplier/inquiries/actions";
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

export default async function SupplierDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Check if user has supplier role
  if (session.user.role !== "supplier" && session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  // Fetch real data
  const [inquiries, materials, openRequests, myBids, orders] =
    await Promise.all([
      getSupplierInquiriesAction(),
      listSupplierMaterialsAction(),
      listOpenSourcingRequestsAction(),
      listMyBidsAction(),
      listSupplierOrdersAction(),
    ]);

  const stats = [
    {
      label: "New Inquiries",
      value: inquiries.filter((i) => i.status !== "responded").length,
      icon: MessageSquare,
      color: "text-primary",
      bg: "bg-muted",
    },
    {
      label: "Orders Received",
      value: orders.length,
      icon: ShoppingCart,
      color: "text-primary",
      bg: "bg-muted",
    },
    {
      label: "Active Bids",
      value: myBids.filter((b) => b.status === "pending").length,
      icon: Gavel,
      color: "text-primary",
      bg: "bg-muted",
    },
    {
      label: "Awarded Bids",
      value: myBids.filter((b) => b.status === "accepted").length,
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            Supplier Console
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome,{" "}
            <span className="text-primary">
              {session.user.name?.split(" ")[0]}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl font-medium leading-relaxed">
            Manage your materials, respond to inquiries, and bid on new projects
            from your central command center.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/materials/create">
            <Button className="h-12 px-6 rounded-xl font-bold bg-primary text-white transition-all uppercase tracking-wider text-xs">
              <Plus className="h-4 w-4 mr-2" />
              Add New Material
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border rounded-xl bg-background"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div
                  className={cn(
                    "h-12 w-12 rounded-lg flex items-center justify-center",
                    stat.bg,
                  )}
                >
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="text-3xl font-bold mt-2 tracking-tight text-foreground">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-24">
          {/* Recent Inquiries */}
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Recent Inquiries
              </h2>
              <Link
                href="/supplier/inquiries"
                className="text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-70 transition-opacity flex items-center gap-2 group/link"
              >
                View All{" "}
                <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-8">
              {inquiries.length === 0 ? (
                <Card className="border-dashed border-2 py-20 bg-muted rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-background border border-border rounded-xl flex items-center justify-center mb-6">
                    <MessageSquare className="h-6 w-6 text-muted-foreground/20" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    No inquiries received yet.
                  </p>
                </Card>
              ) : (
                inquiries.slice(0, 3).map((inquiry) => (
                  <Card
                    key={inquiry.id}
                    className="rounded-xl border-border bg-background"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-8 space-y-6">
                          <div className="flex items-center gap-4">
                            <Badge
                              variant={
                                inquiry.status === "responded"
                                  ? "secondary"
                                  : "default"
                              }
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider border-none px-3 py-1 rounded-full",
                                inquiry.status === "responded"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-primary text-white",
                              )}
                            >
                              {inquiry.status === "responded"
                                ? "Responded"
                                : "New Inquiry"}
                            </Badge>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {inquiry.materialCategory}
                            </span>
                          </div>
                          <h4 className="font-bold text-2xl tracking-tight">
                            {inquiry.materialName}
                          </h4>
                          <div className="flex items-center gap-8 text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              {inquiry.createdAt
                                ? new Date(
                                    inquiry.createdAt,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              {inquiry.buyerName || "Anonymous Buyer"}
                            </div>
                          </div>
                        </div>
                        <div className="bg-muted md:w-48 border-l border-border p-8 flex items-center justify-center">
                          <Link
                            href={`/supplier/inquiries?id=${inquiry.id}`}
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-wider border-border hover:bg-primary hover:text-white hover:border-primary transition-all"
                            >
                              Respond
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Open Sourcing Requests */}
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Market Opportunities
              </h2>
              <Link
                href="/bids"
                className="text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-70 transition-opacity flex items-center gap-2 group/link"
              >
                Browse All{" "}
                <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {openRequests.length === 0 ? (
                <Card className="md:col-span-2 border-dashed border-2 py-20 bg-muted rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-background border border-border rounded-xl flex items-center justify-center mb-6">
                    <Gavel className="h-6 w-6 text-muted-foreground/20" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    No open sourcing requests matching your profile.
                  </p>
                </Card>
              ) : (
                openRequests.slice(0, 2).map((req) => (
                  <Card
                    key={req.id}
                    className="flex flex-col rounded-xl border-border bg-background"
                  >
                    <CardHeader className="p-8 pb-6">
                      <div className="flex justify-between items-start mb-6">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold uppercase tracking-wider border-primary/10 bg-primary/10 text-primary px-3 py-1 rounded-full"
                        >
                          {req.category}
                        </Badge>
                        {req.deadline && (
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            {new Date(req.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-2xl font-bold tracking-tight">
                        {req.quantity} {req.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                      <p className="text-base text-muted-foreground line-clamp-2 mb-8 leading-relaxed">
                        {req.description}
                      </p>
                      <Link href={`/bids/${req.id}`} className="w-full">
                        <Button className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-wider bg-primary text-white transition-all">
                          View & Bid
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-16">
          {/* Active Bids */}
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                Active Bids
              </h2>
              <Link
                href="/supplier/bids"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-6">
              {myBids.filter((b) => b.status === "pending").length === 0 ? (
                <Card className="border-dashed border-2 bg-muted rounded-xl p-12 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    No pending bids
                  </p>
                </Card>
              ) : (
                myBids
                  .filter((b) => b.status === "pending")
                  .slice(0, 4)
                  .map((bid) => (
                    <Card
                      key={bid.id}
                      className="rounded-xl border-border bg-background overflow-hidden"
                    >
                      <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div className="text-3xl font-bold tracking-tight text-foreground">
                            ${bid.bidUnitPrice}
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 border-none text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                          >
                            Pending
                          </Badge>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate mb-6">
                          {bid.category || "Custom Quote"}
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-6 border-t border-dashed border-border">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Lead:{" "}
                            <span className="text-foreground font-bold">
                              {bid.leadTimeEstimate || "TBD"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </section>

          {/* Performance Card */}
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Latest Orders
              </h2>
            </div>
            <div className="space-y-6">
              {orders.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted rounded-xl p-12 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    No orders received yet
                  </p>
                </Card>
              ) : (
                orders.slice(0, 3).map((order) => (
                  <Card
                    key={order.id}
                    className="rounded-xl border-border bg-background overflow-hidden"
                  >
                    <CardContent className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-xl font-bold tracking-tight text-foreground">
                          {order.material?.name || "Material"}
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-700 border-none text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                        >
                          {order.status || "Pending"}
                        </Badge>
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
                        Qty: {order.quantity} • Buyer:{" "}
                        {order.buyer?.name || "Direct"}
                      </div>
                      <div className="pt-4 border-t border-dashed border-border flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          {order.totalPrice
                            ? `$${order.totalPrice}`
                            : "Price TBD"}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Performance Card */}
          <Card className="bg-primary text-primary-foreground border-none rounded-xl overflow-hidden relative">
            <CardHeader className="p-8 pb-4 relative z-10">
              <CardTitle className="text-2xl font-bold tracking-tight uppercase">
                Market Performance
              </CardTitle>
              <CardDescription className="text-primary-foreground/50 text-[10px] font-bold uppercase tracking-wider mt-2">
                Your activity analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="opacity-50">Response Rate</span>
                  <span>98%</span>
                </div>
                <div className="h-2 w-full bg-primary-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[98%] transition-all" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="opacity-50">Bid Win Rate</span>
                  <span>42%</span>
                </div>
                <div className="h-2 w-full bg-primary-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[42%] transition-all" />
                </div>
              </div>
              <div className="pt-8 border-t border-primary-foreground/10">
                <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed text-center">
                    "Maintain fast response times to stay top-tier"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
