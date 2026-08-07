"use client";

import { QueryState } from "@/components/layout/query-state";
import {
  ActivityFilters,
  DailyNetRevenueCard,
} from "@/features/activity/components/activity-filters";
import { ActivityHeaderChrome } from "@/features/activity/components/activity-header-chrome";
import { TransactionTimeline } from "@/features/activity/components/transaction-timeline";
import { useActivityPage } from "@/features/activity/hooks/use-activity-page";

export function ActivityMain() {
  const activity = useActivityPage();

  return (
    <>
      <section className="hidden min-h-0 w-full min-w-0 flex-1 flex-col gap-8 overflow-hidden p-6 xl:flex xl:gap-10 xl:p-12">
        <div className="grid shrink-0 grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-10">
          <ActivityFilters
            timeframe={activity.timeframe}
            category={activity.category}
            paymentMethod={activity.paymentMethod}
            searchQuery={activity.searchQuery}
            onTimeframeChange={activity.setTimeframe}
            onCategoryChange={activity.setCategory}
            onPaymentMethodChange={activity.setPaymentMethod}
            onSearchQueryChange={activity.setSearchQuery}
          />
          <DailyNetRevenueCard netRevenue={activity.netRevenue} />
        </div>
        <ActivityTimelineBody activity={activity} />
      </section>

      <section className="hidden min-h-0 w-full min-w-0 flex-1 flex-col gap-6 overflow-hidden p-6 lg:flex xl:hidden">
        <ActivityHeaderChrome activity={activity} layout="tablet" />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <ActivityTimelineBody activity={activity} />
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-5 pt-2 pb-4 lg:hidden">
        <ActivityHeaderChrome activity={activity} layout="mobile" />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
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
      emptyDescription={
        activity.hasSecondaryFilters || activity.hasActiveSearch
          ? "Nothing matches your search or filters. Try clearing them or a wider timeframe."
          : "Record income or expenses to see activity here."
      }
      onRetry={activity.refetch}
    >
      <TransactionTimeline
        grouped={activity.groupedTransactions}
        serviceNames={activity.serviceNames}
        categoryNames={activity.categoryNames}
        customerLabels={activity.customerLabels}
        onDelete={activity.deleteTransaction}
        isDeleting={activity.isDeleting}
        timeZone={activity.timeZone}
      />
    </QueryState>
  );
}
