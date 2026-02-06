import { Building2 } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSupplierInquiriesAction } from "./actions";
import { SupplierInquiriesClient } from "./client";

export default async function SupplierInquiries() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect("/auth/sign-in");
  }

  // Check if user has supplier role
  if (session.user.role !== "supplier" && session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  // Fetch real data from database
  const inquiries = await getSupplierInquiriesAction();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-3">
            <Building2 className="h-3.5 w-3.5" />
            Supplier Console
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            Material <span className="text-primary">Inquiry</span> Management
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Manage and respond to direct requests from buyers regarding your
            material specifications and availability.
          </p>
        </div>
      </div>

      <SupplierInquiriesClient
        initialInquiries={inquiries}
        supplierEmail={session.user.email}
      />
    </div>
  );
}
