import { AppLeftNav } from "@/components/layout/app-left-nav";
import { AppMain } from "@/components/layout/app-main";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { RecordTransactionFab } from "@/components/layout/record-transaction-fab";
import { ActivityMain } from "@/features/activity/components/activity-main";

export function ActivityPage() {
  return (
    <div className="curator-activity font-body-md flex h-screen overflow-hidden bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <AppLeftNav />
      <AppMain className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface">
        <AppPageHeader title="Activity" />
        <ActivityMain />
      </AppMain>
      <RecordTransactionFab />
    </div>
  );
}
