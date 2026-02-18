"use client";

import { Building2, Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MaterialCarousel } from "@/components/material-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { calculateCarbonScore } from "@/lib/carbon";
import { cn } from "@/lib/utils";
import {
  approveMaterialSubmissionAction,
  listMaterialSubmissionsAction,
  rejectMaterialSubmissionAction,
} from "./actions";

interface PendingMaterial {
  id: string;
  name: string;
  category: string | null;
  supplierName: string;
  supplierEmail: string;
  origin: string;
  unit: string | null;
  unitPriceRange: string;
  embodiedCarbonFactor: string;
  imageUrl: string | null;
  images: string[] | null;
  approved: boolean | null;
  rejectionReason?: string | null;
}

export default function AdminMaterialsPage() {
  const [items, setItems] = useState<PendingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      const data = await listMaterialSubmissionsAction();
      console.log(data);
      setItems(data as PendingMaterial[]);
    } catch (error) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  async function handleApprove(id: string) {
    try {
      await approveMaterialSubmissionAction(id);
      toast.success("Material approved successfully");
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, approved: true, rejectionReason: null }
            : item,
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed");
    }
  }

  async function handleReject() {
    if (!selectedId) return;
    setIsRejecting(true);
    try {
      await rejectMaterialSubmissionAction(selectedId, rejectionNote);
      toast.success("Material rejected");
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedId
            ? { ...item, approved: false, rejectionReason: rejectionNote }
            : item,
        ),
      );
      setSelectedId(null);
      setRejectionNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Rejection failed");
    } finally {
      setIsRejecting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-muted-foreground">Loading submissions...</p>
      </div>
    );
  }

  const pendingItems = items.filter((m) => !m.approved && !m.rejectionReason);
  const approvedItems = items.filter((m) => m.approved);
  const rejectedItems = items.filter((m) => !m.approved && m.rejectionReason);

  const renderMaterialGrid = (materialsList: PendingMaterial[]) => {
    if (materialsList.length === 0) {
      return (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Check className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No materials found</p>
              <p className="text-sm text-muted-foreground">
                There are no materials in this category.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {materialsList.map((m) => {
          const { score, grade } = calculateCarbonScore(
            Number(m.embodiedCarbonFactor),
            m.category || "Other",
          );

          return (
            <Card
              key={m.id}
              className="group/card border border-border/60 shadow-sm rounded-xl overflow-hidden bg-background transition-all hover:shadow-md flex flex-col"
            >
              <MaterialCarousel
                images={m.images}
                fallbackImageUrl={m.imageUrl}
                materialName={m.name}
                categoryName={m.category || "Uncategorized"}
              />

              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1"
                  >
                    {m.category || "Uncategorized"}
                  </Badge>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold border-none px-2.5 py-1 uppercase tracking-wider",
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
                    {m.approved ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        Approved
                      </Badge>
                    ) : m.rejectionReason ? (
                      <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-bold uppercase tracking-wider">
                        Rejected
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight line-clamp-1">
                  {m.name}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>
                    {m.supplierName} • {m.origin}
                  </span>
                </div>
                <div className="text-sm font-bold text-primary mt-1">
                  ${m.unitPriceRange}{" "}
                  <span className="text-[10px] text-muted-foreground uppercase">
                    per {m.unit || "unit"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">
                      Price Range
                    </div>
                    <div className="text-sm font-bold">${m.unitPriceRange}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">
                      Carbon Factor
                    </div>
                    <div className="text-sm font-bold">
                      {m.embodiedCarbonFactor}
                    </div>
                  </div>
                </div>

                {m.rejectionReason && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1">
                      Rejection Reason
                    </div>
                    <div className="text-sm text-rose-600 italic">
                      "{m.rejectionReason}"
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-border/40">
                  {!m.approved && (
                    <Button
                      onClick={() => handleApprove(m.id)}
                      className="w-full bg-primary text-white font-bold h-11 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Material
                    </Button>
                  )}

                  {(m.approved || !m.rejectionReason) && (
                    <Dialog
                      open={selectedId === m.id}
                      onOpenChange={(open) => !open && setSelectedId(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedId(m.id)}
                          className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold h-11 rounded-xl transition-all"
                        >
                          <X className="h-4 w-4 mr-2" />
                          {m.approved ? "Revoke Approval" : "Reject Submission"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">
                            {m.approved
                              ? "Revoke Approval"
                              : "Reject Submission"}
                          </DialogTitle>
                          <DialogDescription className="text-sm text-muted-foreground">
                            Provide a reason for rejection. This will hide the
                            material from other users.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectionNote}
                            onChange={(e) => setRejectionNote(e.target.value)}
                            className="min-h-[120px] rounded-xl border-border focus:ring-primary"
                          />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedId(null)}
                            className="rounded-xl font-bold h-11"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isRejecting || !rejectionNote}
                            className="rounded-xl font-bold h-11 bg-rose-600 hover:bg-rose-700"
                          >
                            {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="space-y-2 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Materials Management
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Review, approve, or reject material listings. Only approved materials
          are visible in the main marketplace.
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger
            value="pending"
            className="rounded-lg px-6 py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Pending Review ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-lg px-6 py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Approved ({approvedItems.length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="rounded-lg px-6 py-2 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Rejected ({rejectedItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          {renderMaterialGrid(pendingItems)}
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          {renderMaterialGrid(approvedItems)}
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          {renderMaterialGrid(rejectedItems)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
