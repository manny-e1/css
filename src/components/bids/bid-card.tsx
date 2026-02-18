"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { acceptBidAction } from "@/app/bids/actions";

interface BidCardProps {
  bid: {
    id: string;
    bidUnitPrice: string | null;
    leadTimeEstimate: string | null;
    status: string | null;
    createdAt: Date | null;
    supplierName: string | null;
  };
  isOwner: boolean;
  requestStatus: string | null;
}

export function BidCard({ bid, isOwner, requestStatus }: BidCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleAcceptBid = () => {
    if (!confirm("Are you sure you want to accept this bid? This will reject all other bids.")) {
      return;
    }

    startTransition(async () => {
      try {
        await acceptBidAction(bid.id);
        toast.success("Bid accepted successfully!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to accept bid");
      }
    });
  };

  const canAcceptBid = isOwner && bid.status === "pending" && requestStatus === "open";

  return (
    <div
      className={cn(
        "p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors",
        bid.status === "accepted"
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-border bg-muted/30",
      )}
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
      <div className="flex items-center gap-4 md:gap-8 flex-wrap">
        <div className="text-right">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Price
          </div>
          <div className="text-lg font-bold text-primary">
            ${bid.bidUnitPrice}
            <span className="text-[10px] text-muted-foreground ml-1">/unit</span>
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
          variant={bid.status === "accepted" ? "default" : "secondary"}
          className={cn(
            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg",
            bid.status === "accepted" ? "bg-emerald-500 hover:bg-emerald-600" : "",
          )}
        >
          {bid.status}
        </Badge>
        {canAcceptBid && (
          <Button
            onClick={handleAcceptBid}
            disabled={isPending}
            size="sm"
            className="h-9 rounded-lg font-bold uppercase tracking-wider text-[10px] gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isPending ? "Accepting..." : "Accept Bid"}
          </Button>
        )}
      </div>
    </div>
  );
}

