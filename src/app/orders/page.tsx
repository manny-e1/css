import {
  Building2,
  Calendar,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { listOrdersAction } from "../projects/actions";

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }
  console.log(session.user.role);
  // Check if user has professional or admin role
  if (session.user.role !== "professional") {
    redirect("/unauthorized");
  }

  const orders = await listOrdersAction();

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
            My Orders
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Track and manage your material orders and procurement status.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl font-bold"
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/materials">
            <Button className="h-12 px-6 rounded-xl font-bold shadow-sm bg-primary text-white">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Browse Materials
            </Button>
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="border-2 border-dashed border-muted bg-muted/5 py-20">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground max-w-xs mb-8">
              You haven't placed any orders. Start by browsing materials or
              ordering from your projects.
            </p>
            <Link href="/materials">
              <Button className="rounded-xl font-bold">
                Explore Materials
              </Button>
            </Link>
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
                {/* Material Image / Icon */}
                <div className="w-full md:w-48 bg-muted/30 flex items-center justify-center border-b md:border-b-0 md:border-r">
                  {order.material?.imageUrl ? (
                    <img
                      src={order.material.imageUrl}
                      alt={order.material.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  ) : (
                    <div className="h-48 md:h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  )}
                </div>

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
                        <Building2 className="h-3.5 w-3.5 mr-1.5" />
                        {order.material?.supplierName || "Unknown Supplier"}
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
                        Project
                      </p>
                      <p className="text-sm font-medium truncate">
                        {order.project?.name || "Direct Order"}
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
                      {order.shippingAddress || "Shipping details pending"}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/materials/${order.material?.id}`}>
                        <Button variant="ghost" size="sm" className="font-bold">
                          View Product
                        </Button>
                      </Link>
                      {order.project && (
                        <Link href={`/projects/${order.project.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold"
                          >
                            Go to Project
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
