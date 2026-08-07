"use client";

import { useUpdateCustomerMutation } from "@/hooks/queries/use-customer-queries";
import type { CustomerDirectoryRow } from "@/features/customers/hooks/use-customers-page";
import { cn } from "@/lib/utils";
import { formatCompactNpr } from "@/utils/format";
import { formatNepalPhoneDisplay } from "@/utils/phone-np";
import {
  formatTimeInBusinessZone,
  dateKeyInTimeZone,
  formatDayLabelForDateKey,
} from "@/utils/business-datetime";
import type { Transaction } from "@/types/database";
import { useEffect, useState } from "react";

type CustomerDirectoryProps = {
  rows: CustomerDirectoryRow[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (customerId: string) => void;
  selectedId: string | null;
};

export function CustomerDirectory({
  rows,
  searchQuery,
  onSearchChange,
  onSelect,
  selectedId,
}: CustomerDirectoryProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <label htmlFor="customer-search" className="sr-only">
          Search customers
        </label>
        <input
          id="customer-search"
          type="search"
          placeholder="Search phone or name"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="font-body w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-base text-on-surface outline-none focus:border-primary"
        />
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl bg-surface-container-low px-4 py-8 text-center text-sm text-on-surface-variant">
          No customers yet. Add a phone when recording income.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto pb-4">
          {rows.map((row) => (
            <li key={row.customer.id}>
              <button
                type="button"
                onClick={() => onSelect(row.customer.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-xl border border-outline-variant/80 bg-surface-container-lowest px-4 py-3 text-left transition-colors hover:bg-surface-container-low",
                  selectedId === row.customer.id && "border-primary bg-primary/5",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-on-surface">
                    {row.customer.name ?? row.displayPhone}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {row.customer.name ? row.displayPhone : null}
                    {row.customer.name ? " · " : ""}
                    {row.visitCount} visit{row.visitCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-secondary">
                    {formatCompactNpr(row.revenue)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type CustomerProfilePanelProps = {
  businessId: string;
  row: CustomerDirectoryRow | null;
  visits: Transaction[];
  timeZone: string;
  onClose: () => void;
};

export function CustomerProfilePanel({
  businessId,
  row,
  visits,
  timeZone,
  onClose,
}: CustomerProfilePanelProps) {
  const [nameDraft, setNameDraft] = useState(row?.customer.name ?? "");
  const updateMutation = useUpdateCustomerMutation(businessId);

  useEffect(() => {
    setNameDraft(row?.customer.name ?? "");
  }, [row?.customer.id, row?.customer.name]);

  if (!row) {
    return (
      <div className="hidden min-h-[12rem] items-center justify-center rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low/50 p-8 text-sm text-on-surface-variant lg:flex">
        Select a customer to view profile and visit history.
      </div>
    );
  }

  async function saveName() {
    if (!row) return;
    await updateMutation.mutateAsync({
      customerId: row.customer.id,
      input: { name: nameDraft.trim() || null },
    });
  }

  return (
    <aside className="squircle flex flex-col gap-4 bg-surface-container-low p-5 shadow-natural-ink lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-headline text-lg font-bold text-primary">
            Customer profile
          </h3>
          <p className="text-sm text-on-surface-variant">{row.displayPhone}</p>
        </div>
        <button
          type="button"
          className="text-sm text-primary lg:hidden"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div>
        <label htmlFor="customer-name" className="text-label-sm text-on-surface-variant">
          Name (optional)
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="customer-name"
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            className="font-body min-w-0 flex-1 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void saveName()}
            disabled={updateMutation.isPending}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-on-primary"
          >
            Save
          </button>
        </div>
      </div>
      <div className="text-sm text-on-surface-variant">
        <p>
          {row.visitCount} visit{row.visitCount === 1 ? "" : "s"} ·{" "}
          {formatCompactNpr(row.revenue)} total
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <p className="text-label-sm font-semibold tracking-wide text-on-surface-variant uppercase">
          Visits
        </p>
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto lg:max-h-96">
          {visits.length === 0 ? (
            <li className="text-sm text-on-surface-variant">No visits recorded.</li>
          ) : (
            visits.map((tx) => (
              <li
                key={tx.id}
                className="rounded-lg bg-surface-container-lowest px-3 py-2 text-sm"
              >
                <span className="font-medium text-on-surface">
                  {formatCompactNpr(Number(tx.total))}
                </span>
                <span className="text-on-surface-variant">
                  {" "}
                  · {formatDayLabelForDateKey(dateKeyInTimeZone(tx.transaction_date, timeZone), timeZone)}{" "}
                  {formatTimeInBusinessZone(tx.transaction_date, timeZone)}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
