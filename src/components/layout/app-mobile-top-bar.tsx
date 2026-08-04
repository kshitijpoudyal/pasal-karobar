"use client";

import { APP_NAME } from "@/constants/app";

export function AppMobileTopBar() {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-center border-b border-surface-container-high/60 bg-surface-container-low/70 px-5 shadow-[0_4px_20px_rgba(30,58,95,0.06)] backdrop-blur-md lg:hidden">
      <span className="font-headline max-w-full truncate text-center text-xs font-bold tracking-[0.12em] text-primary uppercase">
        {APP_NAME}
      </span>
    </header>
  );
}
