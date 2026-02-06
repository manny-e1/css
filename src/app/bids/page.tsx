import {
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  Layers,
  Plus,
  Search,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import {
  listAllSourcingRequestsWithBidsAction,
  listMyBidsAction,
  listMySourcingRequestsAction,
} from "./actions";

export default async function SourcingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; location?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const params = await searchParams;

  const allRequests = await listAllSourcingRequestsWithBidsAction();

  // Filter allRequests based on searchParams if needed
  const filteredRequests = allRequests.filter((req) => {
    const matchCategory =
      !params.category ||
      params.category === "All Categories" ||
      req.category === params.category;
    const matchLocation =
      !params.location ||
      (req.location?.toLowerCase() || "").includes(
        params.location.toLowerCase(),
      );
    return matchCategory && matchLocation;
  });

  const user = session?.user;
  const isBuyer = user?.role === "buyer";
  const isPro = user?.role === "professional" || user?.role === "admin";
  const isSupplier = user?.role === "supplier" || user?.role === "admin";

  // Fetch role-specific data if logged in
  const myRequests = isPro ? await listMySourcingRequestsAction() : [];
  const myBids = isSupplier ? await listMyBidsAction() : [];

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-4">
            <Building2 className="h-4 w-4" />
            Supply Chain Hub
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
            Sourcing <span className="text-primary">Center</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Browse active material requests, track your bids, and explore market
            activity across the construction network.
          </p>
        </div>
        {!isSupplier &&
          (!user || isPro ? (
            <div className="flex gap-4">
              <Link
                href={
                  session ? "/bids/create" : "/sign-in?callbackUrl=/bids/create"
                }
              >
                <Button className="gap-2 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                  <Plus className="h-4 w-4" />
                  New Request
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4">
              <UpgradePrompt
                feature="Open sourcing requests and bidding"
                trigger={
                  <Button className="gap-2 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" />
                    New Request
                  </Button>
                }
              />
            </div>
          ))}
      </div>

      <Tabs defaultValue="explore" className="w-full">
        <div className="flex items-center justify-between mb-10 border-b pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger
              value="explore"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
            >
              Explore Board
            </TabsTrigger>
            {isPro && (
              <TabsTrigger
                value="my-requests"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
              >
                My Requests
              </TabsTrigger>
            )}
            {isBuyer && (
              <UpgradePrompt
                feature="Open sourcing requests and bidding"
                trigger={
                  <button
                    type="button"
                    className="px-0 pb-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-all"
                  >
                    My Requests
                  </button>
                }
              />
            )}
            {(isSupplier || user?.role === "admin") && (
              <TabsTrigger
                value="my-bids"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
              >
                My Bids
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="explore" className="mt-0">
          <div className="flex gap-2 overflow-x-auto pb-6 mb-8 scrollbar-hide">
            {[
              "All Categories",
              "Concrete",
              "Steel",
              "Timber",
              "Glass",
              "Electrical",
            ].map((cat) => (
              <Link
                key={cat}
                href={`/bids?${new URLSearchParams({
                  ...params,
                  category: cat,
                }).toString()}`}
              >
                <Button
                  variant={
                    params.category === cat ||
                    (!params.category && cat === "All Categories")
                      ? "default"
                      : "outline"
                  }
                  className={cn(
                    "h-10 px-6 whitespace-nowrap rounded-xl font-bold transition-colors text-[10px] uppercase tracking-widest",
                    params.category === cat ||
                      (!params.category && cat === "All Categories")
                      ? "shadow-lg shadow-primary/20"
                      : "border-border/50 hover:bg-muted",
                  )}
                >
                  {cat}
                </Button>
              </Link>
            ))}
          </div>

          <div className="grid gap-12">
            {filteredRequests.length === 0 ? (
              <Card className="border-dashed py-24 bg-muted/30 rounded-[2.5rem]">
                <CardContent className="flex flex-col items-center justify-center">
                  <Search className="h-12 w-12 text-muted-foreground/30 mb-6" />
                  <h2 className="text-xl font-bold tracking-tight">
                    No activity yet
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm text-center max-w-xs">
                    Check back soon to see new requests and bidding activity.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((req) => (
                <div key={req.id} className="space-y-6">
                  <div className="flex items-center gap-4 px-2">
                    <Badge
                      variant="outline"
                      className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider"
                    >
                      {req.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-wider",
                        req.status === "open"
                          ? "border-green-500/20 bg-green-500/5 text-green-600"
                          : "border-amber-500/20 bg-amber-500/5 text-amber-600",
                      )}
                    >
                      {req.status}
                    </Badge>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-auto">
                      <Clock className="h-3 w-3" />
                      Posted {req.createdAt?.toLocaleDateString()}
                    </div>
                  </div>

                  <Card className="rounded-[2.5rem] border-border/50 overflow-hidden bg-background shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      {/* Left Side: Request Info */}
                      <div className="lg:col-span-4 p-10 bg-muted/30 border-r border-border/50">
                        <h3 className="text-2xl font-black tracking-tight mb-8">
                          {req.quantity} {req.unit || "Units"}
                        </h3>

                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-sm">
                              <Target className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                                Location
                              </p>
                              <p className="text-sm font-bold">
                                {req.location || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-sm">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                                Deadline
                              </p>
                              <p className="text-sm font-bold">
                                {req.deadline?.toLocaleDateString() || "Open"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-border/50">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-4">
                            Description
                          </p>
                          <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-4">
                            {req.description ||
                              "No detailed specifications provided."}
                          </p>
                        </div>

                        <Link href={`/bids/${req.id}`} className="block mt-10">
                          <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-border/50"
                          >
                            View Full Details
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>

                      {/* Right Side: Bids Info */}
                      <div className="lg:col-span-8 p-10">
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Bidding Activity ({req.bids.length})
                          </h4>
                        </div>

                        {req.bids.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center py-12 text-center bg-muted/10 rounded-[2rem] border border-dashed border-border/50">
                            <p className="text-sm font-medium text-muted-foreground">
                              No bids submitted yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {req.bids.map((bid) => (
                              <div
                                key={bid.id}
                                className={cn(
                                  "p-6 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6",
                                  bid.status === "accepted"
                                    ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm"
                                    : "border-border/50 bg-background hover:border-primary/20",
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={cn(
                                      "h-12 w-12 rounded-xl flex items-center justify-center border",
                                      bid.status === "accepted"
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : "bg-muted border-border/50",
                                    )}
                                  >
                                    {bid.status === "accepted" ? (
                                      <Trophy className="h-6 w-6 text-emerald-600" />
                                    ) : (
                                      <Building2 className="h-6 w-6 text-muted-foreground/60" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <p className="text-sm font-black text-foreground">
                                        {bid.supplierName ||
                                          "Anonymous Supplier"}
                                      </p>
                                      {bid.status === "accepted" && (
                                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[8px] font-black uppercase tracking-wider px-2 py-0">
                                          Awarded
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                                      Bid on{" "}
                                      {bid.createdAt?.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-12">
                                  <div className="text-right">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                                      Price Offer
                                    </p>
                                    <p className="text-lg font-black text-primary">
                                      ${bid.bidUnitPrice}
                                      <span className="text-[10px] text-muted-foreground ml-1">
                                        /unit
                                      </span>
                                    </p>
                                  </div>
                                  <div className="text-right min-w-[100px]">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                                      Lead Time
                                    </p>
                                    <p className="text-sm font-black text-foreground">
                                      {bid.leadTimeEstimate || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-requests" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myRequests.length === 0 ? (
              <div className="col-span-full">
                <Card className="border-dashed py-24 bg-muted/30 rounded-[2.5rem]">
                  <CardContent className="flex flex-col items-center justify-center text-center">
                    <Layers className="h-12 w-12 text-muted-foreground/30 mb-6" />
                    <h2 className="text-xl font-bold tracking-tight">
                      No requests created
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
                      You haven&apos;t created any sourcing requests yet.
                    </p>
                    <Link href="/bids/create" className="mt-8">
                      <Button className="rounded-xl font-black uppercase tracking-widest text-[10px]">
                        Create Your First Request
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ) : (
              myRequests.map((req) => (
                <Card
                  key={req.id}
                  className="rounded-[2rem] border-border/50 bg-background overflow-hidden group hover:border-primary/30 transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <Badge
                        variant="secondary"
                        className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1"
                      >
                        {req.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full",
                          req.status === "open"
                            ? "border-green-500/20 text-green-600"
                            : "border-amber-500/20 text-amber-600",
                        )}
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-2">
                      {req.quantity} {req.unit || "Units"}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {req.createdAt?.toLocaleDateString()}
                    </p>
                    <div className="pt-6 border-t border-dashed border-border/50 flex items-center justify-between">
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                        Location:{" "}
                        <span className="text-foreground">
                          {req.location || "N/A"}
                        </span>
                      </div>
                      <Link href={`/bids/${req.id}`}>
                        <Button
                          variant="ghost"
                          className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-primary/5 text-primary"
                        >
                          Manage
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-bids" className="mt-0">
          <div className="grid gap-6">
            {myBids.length === 0 ? (
              <Card className="border-dashed py-24 bg-muted/30 rounded-[2.5rem]">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground/30 mb-6" />
                  <h2 className="text-xl font-bold tracking-tight">
                    No bids submitted
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
                    You haven&apos;t submitted any bids for sourcing requests
                    yet.
                  </p>
                  <Link href="/bids" className="mt-8">
                    <Button className="rounded-xl font-black uppercase tracking-widest text-[10px]">
                      Browse Requests
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              myBids.map((bid) => (
                <Card
                  key={bid.id}
                  className="rounded-[2rem] border-border/50 bg-background overflow-hidden hover:border-primary/30 transition-all duration-300"
                >
                  <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div
                        className={cn(
                          "h-16 w-16 rounded-[1.25rem] flex items-center justify-center border-2",
                          bid.status === "accepted"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                            : "bg-muted border-border/50 text-muted-foreground/40",
                        )}
                      >
                        {bid.status === "accepted" ? (
                          <Trophy className="h-8 w-8" />
                        ) : (
                          <Building2 className="h-8 w-8" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-black tracking-tight">
                            {bid.category}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2 py-0",
                              bid.status === "accepted"
                                ? "bg-emerald-500 text-white border-none"
                                : "",
                            )}
                          >
                            {bid.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {bid.quantity} {bid.unit || "Units"} • Submitted{" "}
                          {bid.createdAt?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                          Your Price
                        </p>
                        <p className="text-2xl font-black text-primary">
                          ${bid.bidUnitPrice}
                          <span className="text-[10px] text-muted-foreground ml-1">
                            /unit
                          </span>
                        </p>
                      </div>
                      <Link href={`/bids/${bid.requestId}`}>
                        <Button
                          variant="outline"
                          className="h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] gap-2"
                        >
                          View Request
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
