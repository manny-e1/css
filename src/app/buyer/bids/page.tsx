import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Package,
  Plus,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  listMySourcingRequestsAction,
  listRequestBidsAction,
} from "@/app/bids/actions";
import { SourcingBidsDialog } from "@/components/sourcing-bids-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function BuyerSourcingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const requests = await listMySourcingRequestsAction();

  const requestsWithBids = await Promise.all(
    requests.map(async (req) => {
      const bids = await listRequestBidsAction(req.id);
      return { ...req, bids };
    }),
  );

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">
            Sourcing <span className="text-primary">Requests</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Track your open market requests and review supplier bids.
          </p>
        </div>
        <Link href="/sourcing/create">
          <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            New Sourcing Request
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {requestsWithBids.length === 0 ? (
          <Card className="border-2 border-dashed border-border/50 rounded-[2.5rem] bg-muted/5">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-8">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-black mb-3">No requests found</h3>
              <p className="text-muted-foreground max-w-sm mb-10 font-medium">
                You haven&apos;t created any open sourcing requests yet. Start
                by creating one to receive bids from suppliers.
              </p>
              <Link href="/sourcing/create">
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-xl font-bold uppercase tracking-wider text-[10px] gap-2"
                >
                  Create First Request
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          requestsWithBids.map((req) => (
            <Card
              key={req.id}
              className="group overflow-hidden border-border/50 rounded-[2rem] hover:border-primary/20 transition-all duration-500 bg-background hover:shadow-2xl hover:shadow-primary/5"
            >
              <CardHeader className="p-8 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
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
                            : "border-muted-foreground/20 bg-muted/5 text-muted-foreground",
                        )}
                      >
                        {req.status}
                      </Badge>
                      {!req.projectId && (
                        <Badge
                          variant="outline"
                          className="rounded-full px-4 py-1 border-amber-500/20 bg-amber-500/5 text-amber-600 text-[10px] font-black uppercase tracking-wider"
                        >
                          Independent
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                        <Clock className="h-3 w-3" />
                        Created {new Date(req.createdAt!).toLocaleDateString()}
                      </div>
                      <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                        {req.quantity} {req.unit || "units"}
                      </h3>
                    </div>
                  </div>
                  <div className="w-64">
                    <SourcingBidsDialog
                      category={req.category}
                      bids={req.bids}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-6">
                    {req.notes && (
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2">
                        {req.notes}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2.5 text-xs font-bold text-foreground/70">
                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                          <MapPin className="h-3.5 w-3.5 text-primary/60" />
                        </div>
                        {req.location || "Location TBD"}
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-foreground/70">
                        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                          <Calendar className="h-3.5 w-3.5 text-primary/60" />
                        </div>
                        {req.deadline
                          ? `Deadline: ${new Date(req.deadline).toLocaleDateString()}`
                          : "No deadline set"}
                      </div>
                    </div>
                  </div>
                  {req.projectId && (
                    <div className="flex justify-end">
                      <Link href={`/projects/${req.projectId}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 rounded-lg font-black uppercase tracking-widest text-[9px] gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          View Project Details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
