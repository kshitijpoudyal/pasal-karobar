"use client";

import type { ReactNode } from "react";

import { AppLeftNav } from "@/components/layout/app-left-nav";
import { AppMain } from "@/components/layout/app-main";
import { AppMobileBottomNav } from "@/components/layout/app-mobile-bottom-nav";
import { AppMobileMenuProvider } from "@/components/layout/app-mobile-menu-provider";
import { AppMobileTopBar } from "@/components/layout/app-mobile-top-bar";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { cn } from "@/lib/utils";

type AppShellProps = {
  desktopHeaderTitle: string;
  children: ReactNode;
  mainClassName?: string;
  shellClassName?: string;
};

export function AppShell({
  desktopHeaderTitle,
  children,
  mainClassName,
  shellClassName,
}: AppShellProps) {
  return (
    <AppMobileMenuProvider>
      <div
        className={cn(
          "font-body-md flex h-[100dvh] max-w-[100vw] overflow-hidden bg-surface text-on-background selection:bg-primary-container selection:text-on-primary-container",
          shellClassName,
        )}
      >
        <div className="hidden lg:contents">
          <AppLeftNav />
        </div>
        <AppMobileTopBar />
        <AppMain
          className={cn(
            "min-w-0 flex-1 overflow-y-auto bg-surface pt-16 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pt-0 lg:pb-0",
            mainClassName,
          )}
        >
          <div className="hidden lg:block">
            <AppPageHeader title={desktopHeaderTitle} />
          </div>
          {children}
        </AppMain>
        <AppMobileBottomNav />
      </div>
    </AppMobileMenuProvider>
  );
}
