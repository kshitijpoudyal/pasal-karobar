"use client";

import { AppShell } from "@/components/layout/app-shell";
import { QueryState } from "@/components/layout/query-state";
import { CustomerDirectory } from "@/features/customers/components/customer-directory";
import { CustomerProfileModal } from "@/features/customers/components/customer-profile-modal";
import { CustomerReportCards } from "@/features/customers/components/customer-report-cards";
import { useCustomersPage } from "@/features/customers/hooks/use-customers-page";
import { useRecordTransactionModal } from "@/features/transactions";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";

export function CustomersPageView() {
  const page = useCustomersPage();
  const { openModal } = useRecordTransactionModal();

  function openRecordForPhone(phoneNormalized: string) {
    page.setSelectedCustomerId(null);
    openModal({ customerPhone: phoneNormalized });
  }

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
            displayPhone: formatNepalPhoneDisplay(
              page.selectedCustomer.phone_normalized,
            ),
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
            Everyone who has visited with a phone number on file.
          </p>
        </div>

        <QueryState
          isLoading={page.isLoading}
          error={page.error}
          onRetry={() => void page.refetch()}
        >
          <CustomerReportCards
            insights={page.periodInsights}
            periodLabel={page.statsPeriodLabel}
          />

          <CustomerDirectory
            rows={page.directoryRows}
            searchQuery={page.searchQuery}
            onSearchChange={page.setSearchQuery}
            onSelect={page.setSelectedCustomerId}
            onRecordForPhone={openRecordForPhone}
            selectedId={page.selectedCustomerId}
            timeZone={page.timeZone}
          />
        </QueryState>

        <CustomerProfileModal
          open={Boolean(page.selectedCustomerId && selectedRow)}
          businessId={page.businessId}
          row={selectedRow}
          visits={page.selectedCustomerVisits}
          timeZone={page.timeZone}
          onClose={() => page.setSelectedCustomerId(null)}
          onRecordForPhone={openRecordForPhone}
        />
      </div>
    </AppShell>
  );
}
