"use client";

import { MessageSquare, Package, Send, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface BidActivitySidebarProps {
  requestId: string;
  allBids: Array<{
    id: string;
    bidUnitPrice: string | null;
  }>;
  session: {
    user: {
      id: string;
      role: string;
    };
  } | null;
  existingBid: {
    id: string;
  } | null;
}

export function BidActivitySidebar({
  requestId,
  allBids,
  session,
  existingBid,
}: BidActivitySidebarProps) {
  const scrollToBidForm = () => {
    const formElement = document.getElementById("bid-form");
    formElement?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAllBids = () => {
    const bidsElement = document.getElementById("all-bids");
    bidsElement?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Card className="border-border rounded-2xl overflow-hidden bg-background sticky top-8">
      <CardHeader className="border-b bg-gradient-to-br from-primary/10 to-primary/5 py-6 px-6">
        <CardTitle className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          Bid Activity Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Number of Bids Received */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <Label className="text-xs font-black text-primary uppercase tracking-wider mb-2 block">
            Bids Received
          </Label>
          <p className="text-4xl font-black text-foreground">
            {allBids.length}
            <span className="text-lg text-muted-foreground ml-2">
              {allBids.length === 1 ? "bid" : "bids"}
            </span>
          </p>
        </div>

        {/* Latest Bid Range (Optional for MVP) */}
        {allBids.length > 0 && (
          <div className="p-6 rounded-xl bg-muted border border-border">
            <Label className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3 block">
              Latest Bid Range
            </Label>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  Lowest:
                </span>
                <span className="text-lg font-black text-green-600">
                  $
                  {Math.min(
                    ...allBids.map((b) => Number(b.bidUnitPrice)),
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  Highest:
                </span>
                <span className="text-lg font-black text-orange-600">
                  $
                  {Math.max(
                    ...allBids.map((b) => Number(b.bidUnitPrice)),
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-border">
          {!session ? (
            <Link href={`/sign-in?callbackUrl=/bids/${requestId}`}>
              <Button className="w-full h-12 rounded-xl font-black uppercase tracking-wider text-xs gap-2 shadow-lg shadow-primary/20">
                <Send className="h-4 w-4" />
                Submit Bid
              </Button>
            </Link>
          ) : session.user.role === "supplier" ||
            session.user.role === "admin" ? (
            <Button
              onClick={scrollToBidForm}
              className="w-full h-12 rounded-xl font-black uppercase tracking-wider text-xs gap-2 shadow-lg shadow-primary/20"
            >
              <Send className="h-4 w-4" />
              {existingBid ? "Update Bid" : "Submit Bid"}
            </Button>
          ) : null}

          {/* Contact Buyer (Optional Phase 2) */}
          <Button
            variant="outline"
            disabled
            className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs gap-2 border-border"
          >
            <MessageSquare className="h-4 w-4" />
            Contact Buyer
            <Badge className="ml-2 text-[8px] bg-muted text-muted-foreground">
              Phase 2
            </Badge>
          </Button>
        </div>

        {/* View All Bids */}
        {allBids.length > 0 && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={scrollToAllBids}
              className="w-full h-10 rounded-xl font-bold uppercase tracking-wider text-xs gap-2"
            >
              <Package className="h-4 w-4" />
              View All Bids ({allBids.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

