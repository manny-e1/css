"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { User, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { User as AuthUser } from "better-auth";
import { useRouter } from "next/navigation";

interface SessionUser extends AuthUser {
  role?: string;
}

export function MinimalHeader() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        setUser(session?.data?.user as SessionUser | null);
      } catch (error) {
        console.error("Failed to get session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/users";
      case "professional":
        return "/professional/dashboard";
      case "supplier":
        return "/supplier/dashboard";
      case "buyer":
        return "/materials";
      default:
        return "/materials";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 min-w-0 shrink hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="Carbon Smart Spaces Logo"
              width={50}
              height={50}
              className="rounded-lg w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-gray-900 font-medium truncate">
                Carbon Smart Spaces
              </div>
              <div className="text-[10px] sm:text-xs text-emerald-700">
                by KINE MODU
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
            {!loading && !user && (
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                <a
                  href="#supplier-signup"
                  className="hover:text-emerald-600 transition-colors whitespace-nowrap"
                >
                  For suppliers
                </a>
                <a
                  href="#partnerships"
                  className="hover:text-emerald-600 transition-colors whitespace-nowrap"
                >
                  Partnerships
                </a>
              </div>
            )}

            {/* Auth Section */}
            {loading ? (
              <div className="px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm text-gray-400">
                ...
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href={getDashboardLink()}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-emerald-600 transition-colors whitespace-nowrap"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/sign-in"
                className="px-3 py-1.5 sm:px-6 sm:py-2 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-sm whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
