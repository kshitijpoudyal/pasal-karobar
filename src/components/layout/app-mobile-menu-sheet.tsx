"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserCog, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PwaInstallCard } from "@/components/pwa/pwa-install-card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useActiveMember } from "@/providers/active-member-provider";

type AppMobileMenuSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function AppMobileMenuSheet({ open, onClose }: AppMobileMenuSheetProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { isOwner } = useActiveMember();
  const [signingOut, setSigningOut] = useState(false);

  if (!open) return null;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      onClose();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-surface/50 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="More"
        className={cn(
          "absolute top-0 left-0 h-full w-[min(100%,20rem)] bg-surface-container-lowest shadow-natural-ink",
          "animate-[slideInLeft_0.25s_ease-out]",
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-container-high px-5 py-4">
          <span className="font-headline text-lg font-bold text-primary">More</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </Button>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <PwaInstallCard variant="compact" />
          {isOwner ? (
            <Link
              href="/staff-manager"
              onClick={onClose}
              className={cn(
                "squircle flex h-12 w-full items-center gap-3 px-4 text-sm font-medium transition-colors",
                pathname.startsWith("/staff-manager")
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <UserCog className="size-5 shrink-0" strokeWidth={1.75} />
              Staff Manager
            </Link>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            disabled={signingOut}
            className="squircle h-12 w-full justify-start gap-3 text-on-surface-variant"
            onClick={() => {
              void handleSignOut();
            }}
          >
            <LogOut className="size-5" strokeWidth={1.75} />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
