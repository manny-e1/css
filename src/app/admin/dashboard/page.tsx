import {
  Users,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { authUser } from "@/db/auth-schema";
import { materials, supplierProfiles } from "@/db/new-schema";
import { eq, count, and } from "drizzle-orm";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/sign-in");
  }

  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  // Fetch statistics
  const [
    totalUsersResult,
    totalMaterialsResult,
    pendingMaterialsResult,
    approvedMaterialsResult,
    rejectedMaterialsResult,
    pendingSuppliersResult,
    approvedSuppliersResult,
    rejectedSuppliersResult,
    bannedUsersResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(authUser),
    db.select({ count: count() }).from(materials),
    db
      .select({ count: count() })
      .from(materials)
      .where(eq(materials.approved, false)),
    db
      .select({ count: count() })
      .from(materials)
      .where(eq(materials.approved, true)),
    db
      .select({ count: count() })
      .from(materials)
      .where(
        and(eq(materials.approved, false), eq(materials.rejectionReason, "")),
      ),
    db
      .select({ count: count() })
      .from(supplierProfiles)
      .where(eq(supplierProfiles.approvalStatus, "pending")),
    db
      .select({ count: count() })
      .from(supplierProfiles)
      .where(eq(supplierProfiles.approvalStatus, "approved")),
    db
      .select({ count: count() })
      .from(supplierProfiles)
      .where(eq(supplierProfiles.approvalStatus, "rejected")),
    db
      .select({ count: count() })
      .from(authUser)
      .where(eq(authUser.banned, true)),
  ]);

  const stats = {
    totalUsers: totalUsersResult[0]?.count || 0,
    totalMaterials: totalMaterialsResult[0]?.count || 0,
    pendingMaterials: pendingMaterialsResult[0]?.count || 0,
    approvedMaterials: approvedMaterialsResult[0]?.count || 0,
    rejectedMaterials: rejectedMaterialsResult[0]?.count || 0,
    pendingSuppliers: pendingSuppliersResult[0]?.count || 0,
    approvedSuppliers: approvedSuppliersResult[0]?.count || 0,
    rejectedSuppliers: rejectedSuppliersResult[0]?.count || 0,
    bannedUsers: bannedUsersResult[0]?.count || 0,
  };

  return (
    <div className="mx-auto py-12 px-6 lg:px-10 max-w-7xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider mb-4">
          <Building2 className="h-3.5 w-3.5" />
          Admin Console
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl font-medium leading-relaxed">
          Monitor system activity, approve materials and suppliers, and manage
          users.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.bannedUsers} banned
            </p>
          </CardContent>
        </Card>

        {/* Pending Suppliers */}
        <Link href="/admin/users?filter=pending-suppliers">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Suppliers
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingSuppliers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Approved Suppliers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Suppliers
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedSuppliers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active suppliers
            </p>
          </CardContent>
        </Card>

        {/* Pending Materials */}
        <Link href="/admin/materials?filter=pending">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Materials
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingMaterials}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Approved Materials */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Materials
            </CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedMaterials}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Live on platform
            </p>
          </CardContent>
        </Card>

        {/* Total Materials */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Materials
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/materials?filter=pending"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">
                    Review Pending Materials
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingMaterials} awaiting approval
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{stats.pendingMaterials}</Badge>
            </Link>

            <Link
              href="/admin/users?filter=pending-suppliers"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">
                    Review Pending Suppliers
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingSuppliers} awaiting approval
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{stats.pendingSuppliers}</Badge>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Manage Users</p>
                  <p className="text-xs text-muted-foreground">
                    View all users and permissions
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Active Suppliers</span>
              </div>
              <span className="font-semibold">{stats.approvedSuppliers}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-sm">Live Materials</span>
              </div>
              <span className="font-semibold">{stats.approvedMaterials}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Banned Users</span>
              </div>
              <span className="font-semibold">{stats.bannedUsers}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Total Users</span>
              </div>
              <span className="font-semibold">{stats.totalUsers}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
