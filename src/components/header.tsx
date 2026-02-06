"use client";

import type { User } from "better-auth";
import { ShoppingCart, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RoleSwitcher } from "@/components/role-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { useShortlist } from "@/context/shortlist-context";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

import { type Role } from "@/lib/roles";

interface SessionUser extends User {
  role?: Role;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { shortlist } = useShortlist();

  const checkSession = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      setUser(session?.data?.user as SessionUser | null);
    } catch (error) {
      console.error("Failed to get session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getRoleBasedNavigation = () => {
    if (!user) {
      return [
        { href: "/materials", label: "Materials" },
        { href: "/bids", label: "Bids" },
      ];
    }

    switch (user.role) {
      case "admin":
        return [
          { href: "/professional/dashboard", label: "Dashboard" },
          { href: "/projects", label: "Projects" },
          { href: "/materials", label: "Materials" },
          { href: "/bids", label: "Bids" },
          { href: "/inquiries", label: "Inquiries" },
          { href: "/orders", label: "Orders" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/range-adjustment", label: "Range Adjustment" },
        ];
      case "professional":
        return [
          { href: "/professional/dashboard", label: "Dashboard" },
          { href: "/projects", label: "Projects" },
          { href: "/materials", label: "Materials" },
          { href: "/bids", label: "Bids" },
          { href: "/inquiries", label: "Inquiries" },
          { href: "/orders", label: "Orders" },
        ];
      case "supplier":
        return [
          { href: "/supplier/dashboard", label: "Dashboard" },
          { href: "/supplier/materials", label: "My Materials" },
          { href: "/bids", label: "Bids" },
          { href: "/supplier/inquiries", label: "Inquiries" },
          { href: "/supplier/orders", label: "Orders" },
        ];
      case "buyer":
        return [
          { href: "/materials", label: "Materials" },
          { href: "/bids", label: "Bids" },
        ];
      default:
        return [
          { href: "/materials", label: "Materials" },
          { href: "/bids", label: "Bids" },
        ];
    }
  };

  if (loading) {
    return (
      <header className="border-b">
        <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link href="/" className="font-semibold">
            Carbon Smart Spaces
          </Link>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-500">Loading...</span>
          </div>
        </nav>
      </header>
    );
  }

  const navigation = getRoleBasedNavigation();

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-semibold">
            Carbon Smart Spaces
          </Link>
          <div className="flex gap-4 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && user.role === "buyer" && (
            <UpgradePrompt
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary rounded-full px-4 text-[10px] font-black uppercase tracking-widest"
                >
                  <Sparkles className="h-3 w-3" />
                  Upgrade to Pro
                </Button>
              }
            />
          )}
          {user &&
            (user.role === "professional" ||
              user.role === "admin" ||
              user.role === "buyer") && (
              <Link
                href="/materials/shortlist"
                className="relative p-2 text-gray-600 hover:text-black"
              >
                <ShoppingCart className="w-5 h-5" />
                {shortlist.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {shortlist.length}
                  </span>
                )}
              </Link>
            )}
          {user && (
            <div className="flex items-center gap-4 border-r pr-4">
              <NotificationBell />
              {/* <RoleSwitcher
                userId={user.id}
                currentRole={(user.role as Role) || "buyer"}
              /> */}
            </div>
          )}
          <div className="flex gap-4 text-sm">
            {user ? (
              <>
                <span className="text-gray-600">{user.email}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-black"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  className="text-gray-600 hover:text-black"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="text-gray-600 hover:text-black"
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/sign-up?role=supplier"
                  className="text-gray-600 hover:text-black border-l pl-4"
                >
                  Become a Supplier
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
