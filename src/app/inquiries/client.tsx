"use client";

import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Package,
  User,
} from "lucide-react";
import { useState } from "react";
import { ChatComponent } from "@/components/inquiry-chat";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string | null;
  createdAt: Date;
  senderName: string | null;
  senderEmail: string | null;
}

interface Inquiry {
  id: string;
  materialId: string | null;
  notes: string | null;
  status: string | null;
  createdAt: Date | null;
  projectName: string | null;
  quantity: string | null;
  deliveryAddress: string | null;
  desiredDeliveryDate: Date | null;
  materialName: string;
  materialCategory: string;
  supplierName: string;
  supplierEmail: string | null;
  messages: Message[];
}

interface BuyerInquiriesClientProps {
  initialInquiries: Inquiry[];
  currentUserEmail: string;
}

export function BuyerInquiriesClient({
  initialInquiries,
  currentUserEmail,
}: BuyerInquiriesClientProps) {
  const [inquiries] = useState<Inquiry[]>(initialInquiries);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    inquiries[0]?.id || null,
  );

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "responded":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-bold uppercase tracking-widest px-2.5 py-1"
          >
            Responded
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="secondary"
            className="bg-muted text-muted-foreground border-none text-[9px] font-bold uppercase tracking-widest px-2.5 py-1"
          >
            Closed
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase tracking-widest px-2.5 py-1"
          >
            Active
          </Badge>
        );
    }
  };

  return (
    <div className="h-full">
      {inquiries.length === 0 ? (
        <Card className="border-dashed py-20 bg-muted/5 shadow-none rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-2xl bg-white border border-border/50 shadow-sm flex items-center justify-center mb-6">
              <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              No active inquiries
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-[320px] text-center leading-relaxed">
              Once you contact a supplier about a material, the conversation
              will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
                Recent Conversations
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                {inquiries.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  className={cn(
                    "w-full text-left transition-colors",
                    "rounded-2xl border p-5 relative",
                    selectedInquiryId === inquiry.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-white hover:border-primary/30",
                  )}
                  onClick={() => setSelectedInquiryId(inquiry.id)}
                  type="button"
                >
                  <div className="flex justify-between items-center mb-4">
                    {getStatusBadge(inquiry.status)}
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider opacity-60">
                      <Calendar className="h-3 w-3" />
                      {inquiry.createdAt
                        ? new Date(inquiry.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <h4
                    className={cn(
                      "text-base font-bold transition-colors mb-1.5",
                      selectedInquiryId === inquiry.id
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {inquiry.materialName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium line-clamp-1 mb-5">
                    <Building2 className="h-3.5 w-3.5 text-primary/40" />
                    {inquiry.supplierName}
                  </div>
                  <div className="text-[10px] text-muted-foreground pt-4 border-t border-dashed flex items-center gap-2.5 uppercase font-bold tracking-widest">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        selectedInquiryId === inquiry.id
                          ? "bg-primary"
                          : "bg-muted-foreground/20",
                      )}
                    />
                    <span className="opacity-50">Project:</span>
                    <span className="text-foreground/70 truncate">
                      {inquiry.projectName || "General Inquiry"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedInquiry ? (
              <Card className="flex flex-col h-[800px] overflow-hidden border-border/50 rounded-2xl bg-white shadow-sm">
                <CardHeader className="border-b bg-muted/5 p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold tracking-tight mb-1">
                          {selectedInquiry.supplierName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground/70">
                          {selectedInquiry.supplierEmail}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                      <div className="font-bold text-primary flex items-center gap-3 text-xs bg-primary/5 px-6 py-3 rounded-xl border border-primary/10 uppercase tracking-widest shadow-sm">
                        <Package className="h-4 w-4" />
                        {selectedInquiry.materialName}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <div className="px-10 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b bg-muted/2">
                  <div className="p-6 rounded-2xl bg-white border border-border/40 shadow-sm transition-colors hover:border-primary/20 group/stat">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-3 flex items-center gap-2 group-hover/stat:text-primary transition-colors">
                      <Package className="h-3.5 w-3.5" />
                      Quantity
                    </div>
                    <div className="text-base font-bold text-foreground tracking-tight">
                      {selectedInquiry.quantity || "Not specified"}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 shadow-sm transition-colors hover:border-primary/20 group/stat">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-3 flex items-center gap-2 group-hover/stat:text-primary transition-colors">
                      <MapPin className="h-3.5 w-3.5" />
                      Delivery To
                    </div>
                    <div className="text-base font-bold text-foreground truncate tracking-tight">
                      {selectedInquiry.deliveryAddress || "Not specified"}
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-border/40 shadow-sm transition-colors hover:border-primary/20 group/stat">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-3 flex items-center gap-2 group-hover/stat:text-primary transition-colors">
                      <Clock className="h-3.5 w-3.5" />
                      Desired Date
                    </div>
                    <div className="text-base font-bold text-foreground flex items-center gap-2 tracking-tight">
                      {selectedInquiry.desiredDeliveryDate
                        ? new Date(
                            selectedInquiry.desiredDeliveryDate,
                          ).toLocaleDateString()
                        : "Not specified"}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden bg-white">
                  <ChatComponent
                    inquiryId={selectedInquiry.id}
                    initialMessages={selectedInquiry.messages}
                    currentUserEmail={currentUserEmail}
                  />
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center h-[800px] border-dashed bg-muted/5 shadow-none rounded-2xl">
                <div className="h-16 w-16 rounded-2xl bg-white border border-border/50 shadow-sm flex items-center justify-center mb-6">
                  <Package className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Select an inquiry
                </h3>
                <p className="text-muted-foreground mt-2 text-sm max-w-[300px] text-center leading-relaxed">
                  Choose a conversation from the list to view details and
                  history.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
