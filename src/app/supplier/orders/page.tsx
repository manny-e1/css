import {
  Building2,
  Calendar,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Mail,
  Package,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listSupplierOrdersAction } from "@/app/materials/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function SupplierOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Check if user has supplier role
  if (session.user.role !== "supplier" && session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  const orders = await listSupplierOrdersAction();

  const getStatusBadge = (status: string | null) => {
    const s = status || "pending";
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-blue-100 text-blue-700",
      paid: "bg-emerald-100 text-emerald-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return (
      <Badge
        className={cn(
          "border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full",
          colors[s] || colors.pending,
        )}
      >
        {s}
      </Badge>
    );
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Received Orders
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Manage material orders from buyers and update fulfillment status.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/supplier/dashboard">
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl font-bold"
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Console
            </Button>
          </Link>
          <Link href="/supplier/materials">
            <Button className="h-12 px-6 rounded-xl font-bold shadow-sm bg-primary text-white">
              <Package className="h-5 w-5 mr-2" />
              My Materials
            </Button>
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="border-2 border-dashed border-muted bg-muted/5 py-20">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No orders received yet</h3>
            <p className="text-muted-foreground max-w-xs">
              When buyers purchase your materials, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden border-2 hover:border-primary/20 transition-all"
            >
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">
                          {order.material?.name || "Unknown Material"}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-muted-foreground text-sm flex items-center">
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        Buyer: {order.buyer?.name || "Unknown"} (
                        {order.buyer?.email})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        Order Date
                      </p>
                      <p className="text-sm font-medium flex items-center justify-end">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-y border-muted/50 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        Quantity
                      </p>
                      <p className="text-lg font-bold">{order.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        Total Price
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {order.totalPrice
                          ? `$${order.totalPrice}`
                          : "Quote Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        Status
                      </p>
                      <p className="text-sm font-medium capitalize">
                        {order.status || "Pending"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        Order ID
                      </p>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {order.id.split("-")[0]}...
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Truck className="h-4 w-4 mr-2" />
                      {order.shippingAddress || "No shipping address provided"}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`mailto:${order.buyer?.email}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Buyer
                        </Button>
                      </Link>
                      <Button variant="default" size="sm" className="font-bold">
                        Update Status
                      </Button>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground italic">
                      " {order.notes} "
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
