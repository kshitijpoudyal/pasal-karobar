"use client";

import { Menu } from "lucide-react";

import { useAppMobileMenu } from "@/components/layout/app-mobile-menu-provider";
import { APP_NAME } from "@/constants/app";
import { cn } from "@/lib/utils";

export function AppMobileTopBar() {
  const { isOpen, openMenu } = useAppMobileMenu();

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center border-b border-surface-container-high/60 bg-surface-container-low/70 px-3 shadow-[0_4px_20px_rgba(30,58,95,0.06)] backdrop-blur-md lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={openMenu}
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full transition-colors active:scale-95",
          isOpen
            ? "bg-primary-container text-on-primary-container"
            : "text-on-surface-variant hover:bg-surface-container-high",
        )}
      >
        <Menu className="size-6" strokeWidth={isOpen ? 2.25 : 1.75} />
      </button>
      <span className="font-headline pointer-events-none absolute left-1/2 max-w-[calc(100%-6rem)] -translate-x-1/2 truncate text-center text-xs font-bold tracking-[0.12em] text-primary uppercase">
        {APP_NAME}
      </span>
      <span className="size-11 shrink-0" aria-hidden />
    </header>
  );
}
