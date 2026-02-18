"use client";

import type { User } from "better-auth";
import { ShoppingCart, Sparkles, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  }, [path]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogout = async () => {
    try {
      router.push("/");
      await authClient.signOut();
      setUser(null);
      router.refresh();
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
          { href: "/admin/dashboard", label: "Dashboard" },
          { href: "/admin/materials", label: "Materials" },
          { href: "/admin/users", label: "Users" },
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
  if (path === "/") {
    return null;
  }

  if (loading) {
    return (
      <header className="border-b">
        <nav className="mx-auto flex max-w-6xl items-center justify-between py-4">
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
    <header className="border-b bg-white sticky top-0 z-40">
      <nav className="mx-auto flex max-w-6xl items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="font-semibold text-base sm:text-lg shrink-0">
          Carbon Smart Spaces
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-4 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-black whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center gap-4">
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
          {user && (user.role === "professional" || user.role === "buyer") && (
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
          {user && user.role !== "admin" && (
            <div className="flex items-center gap-4 border-r pr-4">
              <NotificationBell />
              {/* <RoleSwitcher
                userId={user.id}
                currentRole={(user.role as Role) || "buyer"}
              /> */}
            </div>
          )}
          <div className="flex gap-4 text-sm items-center">
            {user ? (
              <>
                <span className="text-gray-600 hidden xl:inline">
                  {user.email}
                </span>
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
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button & Icons */}
        <div className="flex lg:hidden items-center gap-3">
          {/* Shortlist Icon (Mobile) */}
          {user && (user.role === "professional" || user.role === "buyer") && (
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

          {/* Notification Bell (Mobile) */}
          {user && user.role !== "admin" && <NotificationBell />}

          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-3">
            {/* Navigation Links */}
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-black text-sm"
              >
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t pt-3 mt-3">
              {/* Upgrade Button (Mobile) */}
              {user && user.role === "buyer" && (
                <div className="mb-3">
                  <UpgradePrompt
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary rounded-full px-4 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Sparkles className="h-3 w-3" />
                        Upgrade to Pro
                      </Button>
                    }
                  />
                </div>
              )}

              {/* Auth Section */}
              {user ? (
                <div className="space-y-2 flex items-center">
                  <div className="text-sm text-gray-600 py-2">{user.email}</div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-sm text-gray-600 hover:text-black"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-gray-600 hover:text-black"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm text-gray-600 hover:text-black"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
