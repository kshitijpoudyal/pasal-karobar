"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { QueryState } from "@/components/layout/query-state";
import { AddCustomerModal } from "@/features/customers/components/add-customer-modal";
import { CustomerFilters } from "@/features/customers/components/customer-filters";
import { CustomerHeaderChrome } from "@/features/customers/components/customer-header-chrome";
import { CustomerInsightsStrip } from "@/features/customers/components/customer-insights-strip";
import { CustomerTimeline } from "@/features/customers/components/customer-timeline";
import { useCustomersPage } from "@/features/customers/hooks/use-customers-page";
import { useRecordTransactionModal } from "@/features/transactions";
import { customerDetailPath } from "@/utils/customer-routes";

export function CustomersMain() {
  const page = useCustomersPage();
  const router = useRouter();
  const { openModal } = useRecordTransactionModal();
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  function openRecordForPhone(phoneNormalized: string) {
    openModal({ customerPhone: phoneNormalized });
  }

  function openAddCustomer() {
    setAddCustomerOpen(true);
  }

  return (
    <>
      <section className="hidden min-h-0 w-full min-w-0 flex-1 flex-col gap-8 overflow-hidden p-6 xl:flex xl:gap-10 xl:p-12">
        <div className="flex shrink-0 flex-col gap-4">
          <CustomerInsightsStrip
            insights={page.periodInsights}
            totalCustomers={page.totalCustomers}
            onAddCustomer={openAddCustomer}
            layout="desktop"
          />
          <CustomerFilters
            timeframe={page.timeframe}
            visitFilter={page.visitFilter}
            searchQuery={page.searchQuery}
            onTimeframeChange={page.setTimeframe}
            onVisitFilterChange={page.setVisitFilter}
            onSearchQueryChange={page.setSearchQuery}
            onAddCustomer={openAddCustomer}
            showDesktopAdd
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <CustomerListBody
            page={page}
            onSelect={(phone) => router.push(customerDetailPath(phone))}
            onRecordForPhone={openRecordForPhone}
          />
        </div>
      </section>

      <section className="hidden min-h-0 w-full min-w-0 flex-1 flex-col gap-6 overflow-hidden p-6 lg:flex xl:hidden">
        <CustomerHeaderChrome
          page={page}
          layout="tablet"
          onAddCustomer={openAddCustomer}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <CustomerListBody
            page={page}
            onSelect={(phone) => router.push(customerDetailPath(phone))}
            onRecordForPhone={openRecordForPhone}
          />
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-5 pt-2 pb-4 lg:hidden">
        <CustomerHeaderChrome
          page={page}
          layout="mobile"
          onAddCustomer={openAddCustomer}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <CustomerListBody
            page={page}
            onSelect={(phone) => router.push(customerDetailPath(phone))}
            onRecordForPhone={openRecordForPhone}
          />
        </div>
      </section>

      <AddCustomerModal
        open={addCustomerOpen}
        businessId={page.businessId}
        onClose={() => setAddCustomerOpen(false)}
        onCreated={(customer) => {
          router.push(customerDetailPath(customer.phone_normalized));
        }}
      />
    </>
  );
}

function CustomerListBody({
  page,
  onSelect,
  onRecordForPhone,
}: {
  page: ReturnType<typeof useCustomersPage>;
  onSelect: (phoneNormalized: string) => void;
  onRecordForPhone: (phoneNormalized: string) => void;
}) {
  return (
    <QueryState
      isLoading={page.isLoading}
      error={page.error}
      isEmpty={!page.isLoading && page.groupedCustomers.length === 0}
      emptyTitle="No customers match"
      emptyDescription={
        page.hasSecondaryFilters || page.hasActiveSearch
          ? "Nothing matches your search or filters. Try clearing them or a wider timeframe."
          : "Add a customer or link a phone when recording income."
      }
      onRetry={() => void page.refetch()}
    >
      <CustomerTimeline
        grouped={page.groupedCustomers}
        timeZone={page.timeZone}
        onSelect={onSelect}
        onRecordForPhone={onRecordForPhone}
      />
    </QueryState>
  );
}
