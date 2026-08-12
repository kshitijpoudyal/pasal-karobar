"use client";

import {
  ActivityFilters,
  DailyNetRevenueCard,
} from "@/features/activity/components/activity-filters";
import type { useActivityPage } from "@/features/activity/hooks/use-activity-page";

type ActivityHeaderChromeProps = {
  activity: ReturnType<typeof useActivityPage>;
  layout: "mobile" | "tablet";
};

export function ActivityHeaderChrome({ activity, layout }: ActivityHeaderChromeProps) {
  if (layout === "mobile") {
    return (
      <div className="flex shrink-0 flex-col gap-6">
        <DailyNetRevenueCard netRevenue={activity.netRevenue} />
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
      </div>
    );
  }

  return (
    <div className="grid shrink-0 grid-cols-1 gap-6">
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
  );
}
