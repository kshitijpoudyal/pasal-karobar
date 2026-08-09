"use client";

import { CustomerFilters } from "@/features/customers/components/customer-filters";
import { CustomerSummaryCard } from "@/features/customers/components/customer-summary-card";
import { CustomerInsightsStrip } from "@/features/customers/components/customer-insights-strip";
import type { useCustomersPage } from "@/features/customers/hooks/use-customers-page";

type CustomerHeaderChromeProps = {
  page: ReturnType<typeof useCustomersPage>;
  layout: "mobile" | "tablet";
  onAddCustomer: () => void;
};

export function CustomerHeaderChrome({
  page,
  layout,
  onAddCustomer,
}: CustomerHeaderChromeProps) {
  if (layout === "mobile") {
    return (
      <div className="flex shrink-0 flex-col gap-6">
        <CustomerInsightsStrip
          insights={page.periodInsights}
          onAddCustomer={onAddCustomer}
          layout="mobile"
        />
        <CustomerFilters
          timeframe={page.timeframe}
          visitFilter={page.visitFilter}
          searchQuery={page.searchQuery}
          onTimeframeChange={page.setTimeframe}
          onVisitFilterChange={page.setVisitFilter}
          onSearchQueryChange={page.setSearchQuery}
        />
      </div>
    );
  }

  return (
    <div className="grid shrink-0 grid-cols-1 gap-6">
      <CustomerInsightsStrip
        insights={page.periodInsights}
        onAddCustomer={onAddCustomer}
        layout="desktop"
      />
      <CustomerFilters
        timeframe={page.timeframe}
        visitFilter={page.visitFilter}
        searchQuery={page.searchQuery}
        onTimeframeChange={page.setTimeframe}
        onVisitFilterChange={page.setVisitFilter}
        onSearchQueryChange={page.setSearchQuery}
        onAddCustomer={onAddCustomer}
        showDesktopAdd
      />
      <CustomerSummaryCard
        trackedVisits={page.periodInsights.trackedVisits}
        totalCustomers={page.totalCustomers}
      />
    </div>
  );
}
