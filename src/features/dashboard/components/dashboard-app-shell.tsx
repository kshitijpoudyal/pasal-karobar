"use client";

import { AppLeftNav } from "@/components/layout/app-left-nav";
import { AppMain } from "@/components/layout/app-main";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { RecordTransactionFab } from "@/components/layout/record-transaction-fab";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

export function DashboardAppShell() {
  return (
    <div className="curator-dashboard font-body-md flex h-screen overflow-hidden bg-surface text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <AppLeftNav />
      <AppMain className="hide-scrollbar min-w-0 flex-1 overflow-y-auto bg-surface">
        <AppPageHeader title="Financial Landscape" />
        <DashboardContent />
      </AppMain>
      <RecordTransactionFab />
    </div>
  );
}
