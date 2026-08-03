"use client";

import { Calendar, Menu } from "lucide-react";
import { useState } from "react";

import { AppMobileMenuSheet } from "@/components/layout/app-mobile-menu-sheet";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";

export function AppMobileTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-surface-container-high/60 bg-surface-container-low/70 px-5 shadow-[0_4px_20px_rgba(30,58,95,0.06)] backdrop-blur-md lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-full text-primary active:scale-95"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-6" strokeWidth={1.75} />
        </Button>
        <span className="font-headline max-w-[50%] truncate text-center text-xs font-bold tracking-[0.12em] text-primary uppercase">
          {APP_NAME}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-full text-primary active:scale-95"
          aria-label="Open calendar"
        >
          <Calendar className="size-6" strokeWidth={1.75} />
        </Button>
      </header>
      <AppMobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
