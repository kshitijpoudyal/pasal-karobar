"use client";

import { LogOut, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type AppMobileMenuSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function AppMobileMenuSheet({ open, onClose }: AppMobileMenuSheetProps) {
  const { signOut } = useAuth();
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
