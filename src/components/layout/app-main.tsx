"use client";

import { useAppNav, appShellTransitionClass } from "@/providers/app-nav-provider";
import { cn } from "@/lib/utils";

type AppMainProps = {
  className?: string;
  children: React.ReactNode;
};

export function AppMain({ className, children }: AppMainProps) {
  const { mainOffsetClass } = useAppNav();

  return (
    <main className={cn(appShellTransitionClass, mainOffsetClass, className)}>
      {children}
    </main>
  );
}
