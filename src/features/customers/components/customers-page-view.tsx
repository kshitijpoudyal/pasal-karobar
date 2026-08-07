"use client";

import { AppShell } from "@/components/layout/app-shell";
import { QueryState } from "@/components/layout/query-state";
import { DashboardTimeNavigator } from "@/features/dashboard/components/dashboard-time-navigator";
import { CustomerDirectory, CustomerProfilePanel } from "@/features/customers/components/customer-directory";
import { CustomerReportCards } from "@/features/customers/components/customer-report-cards";
import { useCustomersPage } from "@/features/customers/hooks/use-customers-page";

export function CustomersPageView() {
  const page = useCustomersPage();

  const selectedRow = page.selectedCustomerId
    ? (page.directoryRows.find((row) => row.customer.id === page.selectedCustomerId) ??
      (page.selectedCustomer
        ? {
            customer: page.selectedCustomer,
            visitCount: page.selectedCustomerVisits.length,
            revenue: page.selectedCustomerVisits.reduce(
              (sum, tx) => sum + Number(tx.total),
              0,
            ),
            lastVisitAt:
              page.selectedCustomerVisits[0]?.transaction_date ?? null,
            displayPhone: page.selectedCustomer.phone_normalized,
          }
        : null))
    : null;

  return (
    <AppShell
      desktopHeaderTitle="Customers"
      shellClassName="curator-activity text-on-surface"
      mainClassName="flex min-h-0 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 px-5 py-6 lg:gap-8 lg:p-12">
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary lg:hidden">
            Customers
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant lg:mt-2">
            Track repeat visits and see new vs returning customers for each period.
          </p>
        </div>

        <DashboardTimeNavigator
          granularity={page.granularity}
          anchorDate={page.anchorDate}
          minSelectableDate={page.minSelectableDate}
          timeZone={page.timeZone}
          onGranularityChange={(next) => {
            page.setGranularity(next);
            page.clampAnchorToToday();
          }}
          onAnchorChange={page.setAnchorDate}
        />

        <QueryState
          isLoading={page.isLoading}
          error={page.error}
          onRetry={() => void page.refetch()}
        >
          <CustomerReportCards insights={page.periodInsights} />

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="flex min-h-0 flex-col lg:col-span-5 xl:col-span-4">
              <h2 className="mb-3 font-headline text-lg font-bold text-on-surface">
                Directory
              </h2>
              <CustomerDirectory
                rows={page.directoryRows}
                searchQuery={page.searchQuery}
                onSearchChange={page.setSearchQuery}
                onSelect={page.setSelectedCustomerId}
                selectedId={page.selectedCustomerId}
              />
            </div>
            <div className="lg:col-span-7 xl:col-span-8">
              <CustomerProfilePanel
                businessId={page.businessId}
                row={selectedRow}
                visits={page.selectedCustomerVisits}
                timeZone={page.timeZone}
                onClose={() => page.setSelectedCustomerId(null)}
              />
            </div>
          </div>
        </QueryState>
      </div>
    </AppShell>
  );
}
