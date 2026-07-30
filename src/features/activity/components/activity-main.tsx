import {
  ActivityFilters,
  DailyNetRevenueCard,
} from "@/features/activity/components/activity-filters";
import { TransactionTimeline } from "@/features/activity/components/transaction-timeline";

export function ActivityMain() {
  return (
    <section className="flex min-h-0 w-full flex-1 flex-col gap-10 overflow-hidden p-12">
      <div className="grid shrink-0 grid-cols-12 gap-10">
        <ActivityFilters />
        <DailyNetRevenueCard />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-4">
        <TransactionTimeline />
      </div>
    </section>
  );
}
