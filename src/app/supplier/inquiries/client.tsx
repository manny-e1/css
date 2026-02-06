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
  buyerName: string | null;
  buyerEmail: string | null;
  materialName: string;
  materialCategory: string;
  unitPriceRange: string;
  messages: Message[];
}

interface SupplierInquiriesClientProps {
  initialInquiries: Inquiry[];
  supplierEmail: string;
}

export function SupplierInquiriesClient({
  initialInquiries,
  supplierEmail,
}: SupplierInquiriesClientProps) {
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
            className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold uppercase tracking-wider"
          >
            Responded
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-primary border-none text-[10px] font-bold uppercase tracking-wider">
            New
          </Badge>
        );
    }
  };

  return (
    <div className="h-full">
      {inquiries.length === 0 ? (
        <Card className="border-dashed py-24 bg-muted/50 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              No inquiries found
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-[300px] text-center">
              When buyers contact you about your materials, they will appear
              here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Conversations
              </h3>
              <Badge
                variant="secondary"
                className="bg-primary text-primary-foreground border-none text-[10px] font-bold px-2.5 py-1"
              >
                {inquiries.length} Total
              </Badge>
            </div>

            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  className={cn(
                    "w-full text-left rounded-2xl border p-5 relative",
                    selectedInquiryId === inquiry.id
                      ? "border-primary bg-muted/50"
                      : "border-border bg-white hover:border-primary",
                  )}
                  onClick={() => setSelectedInquiryId(inquiry.id)}
                  type="button"
                >
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(inquiry.status)}
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="h-3 w-3" />
                      {inquiry.createdAt
                        ? new Date(inquiry.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <h4
                    className={cn(
                      "text-base font-bold mb-1.5",
                      selectedInquiryId === inquiry.id
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {inquiry.buyerName || "Potential Buyer"}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium line-clamp-1 mb-5">
                    <Package className="h-3.5 w-3.5 text-primary" />
                    {inquiry.materialName}
                  </div>
                  <div className="text-[10px] text-muted-foreground pt-4 border-t border-dashed flex items-center gap-2.5 uppercase font-bold tracking-widest">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Project:</span>
                    <span className="text-foreground truncate">
                      {inquiry.projectName || "General Inquiry"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedInquiry ? (
              <Card className="flex flex-col h-[800px] overflow-hidden border border-border rounded-2xl">
                <CardHeader className="border-b bg-muted/50 p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold tracking-tight mb-1">
                          {selectedInquiry.buyerName || "Potential Buyer"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                          {selectedInquiry.buyerEmail}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <div className="font-bold text-primary flex items-center gap-2.5 text-xl tracking-tight">
                        <Package className="h-5.5 w-5.5" />
                        {selectedInquiry.materialName}
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-muted text-primary border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1"
                      >
                        {selectedInquiry.materialCategory}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-border bg-background">
                  <div className="p-5 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Quantity
                    </div>
                    <div className="text-lg font-bold tracking-tight">
                      {selectedInquiry.quantity || "Not specified"}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Delivery Location
                    </div>
                    <div className="text-lg font-bold tracking-tight truncate flex items-center gap-2.5">
                      <MapPin className="h-4.5 w-4.5 text-primary" />
                      {selectedInquiry.deliveryAddress || "Not specified"}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Requested Date
                    </div>
                    <div className="text-lg font-bold tracking-tight flex items-center gap-2.5">
                      <Clock className="h-4.5 w-4.5 text-primary" />
                      {selectedInquiry.desiredDeliveryDate
                        ? new Date(
                          selectedInquiry.desiredDeliveryDate,
                        ).toLocaleDateString()
                        : "Not specified"}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <ChatComponent
                    inquiryId={selectedInquiry.id}
                    initialMessages={selectedInquiry.messages}
                    currentUserEmail={supplierEmail}
                  />
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center h-[800px] border-dashed py-24 bg-muted/50 rounded-2xl">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Select an inquiry
                </h3>
                <p className="text-muted-foreground mt-2 text-sm max-w-[280px] text-center">
                  Choose a conversation from the list to view details and
                  respond.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
