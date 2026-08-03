"use client";

import { QueryState } from "@/components/layout/query-state";
import {
  ActivityFilters,
  DailyNetRevenueCard,
} from "@/features/activity/components/activity-filters";
import { ActivityFiltersMobile } from "@/features/activity/components/activity-filters-mobile";
import { ActivitySummaryMobile } from "@/features/activity/components/activity-summary-mobile";
import { TransactionTimeline } from "@/features/activity/components/transaction-timeline";
import { useActivityPage } from "@/features/activity/hooks/use-activity-page";

export function ActivityMain() {
  const activity = useActivityPage();

  return (
    <>
      <section className="hidden min-h-0 w-full flex-1 flex-col gap-10 overflow-hidden p-12 lg:flex">
        <div className="grid shrink-0 grid-cols-12 gap-10">
          <ActivityFilters
            timeframe={activity.timeframe}
            category={activity.category}
            onTimeframeChange={activity.setTimeframe}
            onCategoryChange={activity.setCategory}
          />
          <DailyNetRevenueCard netRevenue={activity.netRevenue} />
        </div>
        <ActivityTimelineBody activity={activity} />
      </section>

      <section className="flex min-h-0 flex-1 flex-col gap-6 px-5 pt-2 pb-4 lg:hidden">
        <ActivitySummaryMobile
          netRevenue={activity.netRevenue}
          transactionCount={activity.transactionCount}
          averageTicket={activity.averageTicket}
        />
        <ActivityFiltersMobile
          timeframe={activity.timeframe}
          category={activity.category}
          onTimeframeChange={activity.setTimeframe}
          onCategoryChange={activity.setCategory}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ActivityTimelineBody activity={activity} />
        </div>
      </section>
    </>
  );
}

function ActivityTimelineBody({
  activity,
}: {
  activity: ReturnType<typeof useActivityPage>;
}) {
  return (
    <QueryState
      isLoading={activity.isLoading}
      error={activity.error}
      isEmpty={!activity.isLoading && activity.groupedTransactions.length === 0}
      emptyTitle="No transactions in this period"
      emptyDescription="Record income or expenses to see activity here."
      onRetry={activity.refetch}
    >
      <TransactionTimeline
        grouped={activity.groupedTransactions}
        serviceNames={activity.serviceNames}
        categoryNames={activity.categoryNames}
        onDelete={activity.deleteTransaction}
        isDeleting={activity.isDeleting}
      />
    </QueryState>
  );
}
