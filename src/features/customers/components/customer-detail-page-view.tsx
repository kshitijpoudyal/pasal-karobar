"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { EditCustomerProfileModal } from "@/features/customers/components/edit-customer-profile-modal";
import { CustomerProfilePhotoGallery } from "@/features/customers/components/customer-profile-photo-gallery";
import { CustomerVisitsList } from "@/features/customers/components/customer-visits-list";
import { useCustomerDetailPage } from "@/features/customers/hooks/use-customer-detail-page";
import { useRecordTransactionModal } from "@/features/transactions";
import { formatNprNumber } from "@/utils/format";

type CustomerDetailPageViewProps = {
  phoneRouteParam: string;
};

export function CustomerDetailPageView({
  phoneRouteParam,
}: CustomerDetailPageViewProps) {
  const page = useCustomerDetailPage(phoneRouteParam);
  const { openModal } = useRecordTransactionModal();
  const [editOpen, setEditOpen] = useState(false);

  const title = page.customer?.name?.trim() || page.displayPhone || "Customer";

  function openRecord() {
    if (!page.customer) return;
    openModal({
      customerPhone: page.customer.phone_normalized,
      customerName: page.customer.name?.trim() || undefined,
    });
  }

  return (
    <AppShell
      desktopHeaderTitle={title}
      shellClassName="curator-activity text-on-surface"
      mainClassName="flex min-h-0 flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 px-5 py-6 lg:gap-8 lg:p-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
              Customers
            </Link>
            {!page.parsedPhone.ok ? (
              <h1 className="font-headline mt-3 text-2xl font-bold text-error">
                Invalid phone
              </h1>
            ) : null}
          </div>
          {page.customer ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="cta"
                className="w-full sm:w-auto"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" strokeWidth={2} aria-hidden />
                Edit profile
              </Button>
              <Button
                type="button"
                variant="primary"
                size="cta"
                className="w-full sm:w-auto"
                onClick={openRecord}
              >
                <Plus className="size-5" strokeWidth={2.25} aria-hidden />
                Record visit
              </Button>
            </div>
          ) : null}
        </div>

        <QueryState
          isLoading={page.isLoading}
          error={page.error}
          onRetry={() => void page.refetch()}
        >
          {!page.parsedPhone.ok ? (
            <p className="text-sm text-on-surface-variant">{page.parsedPhone.reason}</p>
          ) : !page.customer && !page.isLoading ? (
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-8 text-center">
              <p className="text-sm text-on-surface-variant">
                No customer found for {page.displayPhone ?? "this number"}.
              </p>
              <Link
                href="/customers"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Back to directory
              </Link>
            </div>
          ) : page.customer ? (
            <>
              <header className="space-y-1">
                <h1 className="font-headline text-2xl font-bold text-primary lg:text-3xl">
                  {page.customer.name?.trim() || page.displayPhone}
                </h1>
                {page.customer.name?.trim() ? (
                  <button
                    type="button"
                    onClick={openRecord}
                    className="text-base font-medium text-on-surface-variant underline-offset-2 hover:text-primary hover:underline"
                  >
                    {page.displayPhone}
                  </button>
                ) : null}
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="squircle flex flex-col gap-2 bg-surface-container-low p-5 shadow-natural-ink">
                  <span className="text-label-sm text-on-surface-variant">
                    Total visits
                  </span>
                  <span className="font-headline text-2xl font-bold text-primary lg:text-3xl">
                    {page.visitCount}
                  </span>
                </div>
                <div className="squircle flex flex-col gap-2 bg-surface-container-low p-5 shadow-natural-ink">
                  <span className="text-label-sm text-on-surface-variant">
                    Total revenue
                  </span>
                  <span className="font-headline text-2xl font-bold text-primary lg:text-3xl">
                    <span className="text-lg">रू </span>
                    {formatNprNumber(page.revenue)}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {page.customer.profile_note?.trim() ? (
                  <div className="squircle bg-surface-container-lowest p-5 shadow-sm">
                    <p className="font-body text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase">
                      Note
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-on-surface">
                      {page.customer.profile_note}
                    </p>
                  </div>
                ) : null}

                <CustomerProfilePhotoGallery customerId={page.customer.id} />

                <CustomerVisitsList
                  groupedVisits={page.groupedVisits}
                  transactions={page.visitTransactions}
                  serviceNames={page.serviceNames}
                  timeZone={page.timeZone}
                />
              </div>

              <EditCustomerProfileModal
                open={editOpen}
                businessId={page.businessId}
                customer={page.customer}
                onClose={() => setEditOpen(false)}
                onSaved={() => void page.refetch()}
              />
            </>
          ) : null}
        </QueryState>
      </div>
    </AppShell>
  );
}
