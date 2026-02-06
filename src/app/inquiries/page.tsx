import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBuyerInquiriesAction } from "@/app/materials/actions";
import { auth } from "@/lib/auth";
import { BuyerInquiriesClient } from "./client";

export default async function BuyerInquiriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect("/auth/sign-in");
  }

  const inquiries = await getBuyerInquiriesAction();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inquiry Messages
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Track technical inquiries, clarify specifications, and manage
            conversations with suppliers.
          </p>
        </div>
      </div>

      <BuyerInquiriesClient
        initialInquiries={inquiries}
        currentUserEmail={session.user.email}
      />
    </div>
  );
}
