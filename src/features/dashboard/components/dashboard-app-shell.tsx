"use client";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

export function DashboardAppShell() {
  return (
    <AppShell
      desktopHeaderTitle="Financial Landscape"
      shellClassName="curator-dashboard"
      mainClassName="hide-scrollbar"
    >
      <DashboardContent />
    </AppShell>
  );
}
