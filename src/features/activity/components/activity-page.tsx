import { AppShell } from "@/components/layout/app-shell";
import { ActivityMain } from "@/features/activity/components/activity-main";

export function ActivityPage() {
  return (
    <AppShell
      desktopHeaderTitle="Activity"
      shellClassName="curator-activity text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed"
      mainClassName="flex min-h-0 flex-col"
    >
      <ActivityMain />
    </AppShell>
  );
}
