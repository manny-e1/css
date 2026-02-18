"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateUserRole } from "@/app/actions/update-user-role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  trigger: React.ReactNode;
  feature?: string;
}

const PRO_FEATURES = [
  "Create and manage projects",
  "Material categorization by project",
  "Cost estimation and overrides",
  "Lead time aggregation and sequencing risk",
  "Embodied carbon estimation",
  "Carbon savings comparison",
  "Advanced material comparison",
  "Open sourcing requests and bidding",
  "Supplier inquiry tracking",
  "Downloadable reports",
  "Export for clients or approvals",
];

export function UpgradePrompt({
  title = "Unlock Pro Features",
  description = "You've discovered a Pro feature! Upgrade your account to professional to unlock our full suite of sustainability tools.",
  trigger,
  feature,
}: UpgradePromptProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);

  const handleUpgrade = async () => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to upgrade");
      return;
    }

    setIsUpgrading(true);
    try {
      const result = await updateUserRole(session.user.id, "professional");
      if (result.success) {
        toast.success(
          "Welcome to Professional! Your account has been upgraded.",
        );
        setIsOpen(false);
        // Refresh the page to update all UI states and permissions
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to upgrade account");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("An unexpected error occurred during upgrade");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        <div className="bg-primary/5 p-8 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary text-white font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                Professional
              </Badge>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-2 text-base leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 bg-background">
          <div className="space-y-4 mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
              What's included in Pro:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {PRO_FEATURES.map((feat) => (
                <div key={feat} className="flex items-start gap-3 group">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-bold transition-colors",
                      feature === feat
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upgrading...
                </>
              ) : (
                "Upgrade to Professional"
              )}
            </Button>
            <p className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              Starting from $49/month • Cancel anytime
            </p>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
