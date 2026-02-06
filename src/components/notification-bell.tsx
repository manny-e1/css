"use client";

import { Bell, Check, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  listMyNotificationsAction,
  markNotificationAsReadAction,
  clearAllNotificationsAction,
} from "@/app/bids/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  link: string | null;
  createdAt: Date;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await listMyNotificationsAction();
      // Ensure data is typed correctly
      const typedData = data.map((n) => ({
        ...n,
        createdAt: new Date(n.createdAt),
      })) as Notification[];

      setNotifications(typedData);
      setUnreadCount(typedData.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Refresh every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotificationsAction();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const getIcon = (type: string | null) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 rounded-3xl border-border/50 shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border/50 bg-muted/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge
                variant="outline"
                className="rounded-full text-[10px] font-bold border-primary/20 text-primary"
              >
                {unreadCount} New
              </Badge>
            )}
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-muted-foreground/20" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                All caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-5 border-b border-border/50 transition-colors hover:bg-muted/30 relative group",
                  !notification.read && "bg-primary/2",
                )}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs font-black tracking-tight mb-1 truncate",
                          !notification.read
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {notification.title}
                      </p>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter whitespace-nowrap mt-0.5">
                        {notification.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="absolute top-4 right-4 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-4 bg-muted/5 text-center">
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
            >
              Clear All
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function XCircle(props: any) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
