import { AppLeftNav } from "@/components/layout/app-left-nav";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { RecordTransactionFab } from "@/components/layout/record-transaction-fab";
import { DashboardBottomSection } from "@/features/dashboard/components/dashboard-bottom-section";
import { InsightsSection } from "@/features/dashboard/components/insights-section";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { PeriodFilter } from "@/features/dashboard/components/period-filter";

export function DashboardPage() {
  return (
    <div className="curator-dashboard font-body-md flex h-screen overflow-hidden bg-surface text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <AppLeftNav />
      <main className="hide-scrollbar ml-80 min-w-0 flex-1 overflow-y-auto bg-surface">
        <AppPageHeader title="Financial Landscape" />
        <div className="space-y-12 p-12">
          <PeriodFilter />
          <KpiGrid />
          <InsightsSection />
          <DashboardBottomSection />
        </div>
      </main>
      <RecordTransactionFab />
    </div>
  );
}
