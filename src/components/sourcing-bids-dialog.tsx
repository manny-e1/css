"use client";

import {
  Calendar,
  Check,
  Clock,
  DollarSign,
  ExternalLink,
  MessageSquare,
  Package,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { acceptBidAction } from "@/app/sourcing/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Bid {
  id: string;
  requestId: string | null;
  supplierId: string | null;
  materialId: string | null;
  bidUnitPrice: string;
  leadTimeEstimate: string | null;
  minimumOrder: string | null;
  quoteUrl: string | null;
  notes: string | null;
  status: string | null;
  createdAt: Date | null;
  supplierName: string | null;
  materialName: string | null;
}

interface SourcingBidsDialogProps {
  category: string;
  bids: Bid[];
}

export function SourcingBidsDialog({
  category,
  bids,
}: SourcingBidsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const router = useRouter();

  const handleAccept = async (bidId: string) => {
    if (
      !confirm(
        "Are you sure you want to accept this bid? This will close the request and reject other bids.",
      )
    ) {
      return;
    }

    setIsAccepting(bidId);
    try {
      await acceptBidAction(bidId);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to accept bid:", error);
      alert("Failed to accept bid. Please try again.");
    } finally {
      setIsAccepting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-12 rounded-[1.25rem] border-border/50 font-black uppercase tracking-[0.2em] text-[10px] gap-3 hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-[0.98]"
        >
          <MessageSquare className="h-4 w-4" />
          Review {bids.length} Bids
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-transparent shadow-none">
        <div className="bg-background rounded-[3rem] border border-border/50 shadow-2xl overflow-hidden flex flex-col h-full relative">
          <DialogHeader className="p-12 border-b border-border/50 bg-muted/5 relative">
            <div className="flex items-center justify-between pr-10">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-4 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Supplier Responses
                </div>
                <DialogTitle className="text-4xl font-black tracking-tighter">
                  Review <span className="text-primary">Bids</span>
                </DialogTitle>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  Comparing {bids.length} submissions for {category}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="grid gap-6">
              {bids.length === 0 ? (
                <div className="text-center py-24 bg-muted/5 rounded-[2.5rem] border border-dashed border-border/50">
                  <div className="h-20 w-20 bg-muted/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/10" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                    No bids received yet
                  </p>
                </div>
              ) : (
                bids.map((bid) => (
                  <div
                    key={bid.id}
                    className={cn(
                      "group relative p-8 rounded-[2rem] border transition-all duration-300",
                      bid.status === "accepted"
                        ? "bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                        : "bg-muted/5 border-border/50 hover:border-primary/20 hover:bg-primary/[0.01] hover:shadow-xl hover:shadow-primary/5",
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-6 flex-1">
                        <div className="flex items-center justify-between md:justify-start gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Supplier</p>
                            <h4 className="text-lg font-black tracking-tight text-foreground">
                              {bid.supplierName || "Independent Supplier"}
                            </h4>
                          </div>
                          {bid.status === "accepted" && (
                            <div className="ml-auto md:ml-4 bg-emerald-500 text-white border-none px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                              Accepted
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Price</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black tracking-tighter text-foreground">${bid.bidUnitPrice}</span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">/unit</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Lead Time</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                              <Clock className="h-4 w-4 text-primary" />
                              {bid.leadTimeEstimate || "TBD"}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Min Order</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                              <Package className="h-4 w-4 text-primary" />
                              {bid.minimumOrder || "None"}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Status</p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                              {bid.status || "Pending"}
                            </div>
                          </div>
                        </div>

                        {bid.notes && (
                          <div className="p-5 rounded-2xl bg-white/50 border border-border/50 text-sm font-medium text-muted-foreground leading-relaxed italic">
                            "{bid.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 shrink-0">
                        {bid.status !== "accepted" && (
                          <Button
                            onClick={() => handleAccept(bid.id)}
                            disabled={isAccepting !== null}
                            className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95]"
                          >
                            {isAccepting === bid.id ? (
                              <Clock className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Accept Bid
                          </Button>
                        )}

                        {bid.quoteUrl && (
                          <a href={bid.quoteUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                              variant="outline"
                              className="w-full h-12 rounded-xl border-border font-bold text-[10px] uppercase tracking-wider gap-2.5"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Quote
                            </Button>
                          </a>
                        )}

                        <Button
                          variant="ghost"
                          className="h-12 rounded-xl font-bold text-[10px] uppercase tracking-wider gap-2.5 text-muted-foreground hover:text-primary"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-8 border-t border-border/50 bg-muted/5 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-12 px-8 rounded-xl border-border font-black uppercase tracking-widest text-[10px]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
