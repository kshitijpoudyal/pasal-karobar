"use client";

import { AmountVisibilityToggle } from "@/components/amount-visibility-toggle";

type AppPageHeaderProps = {
  title: string;
};

/** Sticky top bar — same layout and typography on every screen. */
export function AppPageHeader({ title }: AppPageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full min-w-0 shrink-0 items-center justify-between gap-4 border-b border-surface-container-high bg-surface/90 px-6 backdrop-blur-xl xl:h-24 xl:px-12">
      <h1 className="font-headline-lg text-headline-lg min-w-0 truncate text-on-surface">
        {title}
      </h1>
      <AmountVisibilityToggle />
    </header>
  );
}
