"use client";

import { Search, UserRound } from "lucide-react";

import type { CustomerDirectoryRow } from "@/features/customers/hooks/use-customers-page";
import { cn } from "@/lib/utils";
import {
  dateKeyInTimeZone,
  formatDayLabelForDateKey,
  formatTimeInBusinessZone,
} from "@/utils/business-datetime";
import { formatNprNumber } from "@/utils/format";

type CustomerDirectoryProps = {
  rows: CustomerDirectoryRow[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (customerId: string) => void;
  onRecordForPhone: (phoneNormalized: string) => void;
  selectedId: string | null;
  timeZone: string;
};

export function CustomerDirectory({
  rows,
  searchQuery,
  onSearchChange,
  onSelect,
  onRecordForPhone,
  selectedId,
  timeZone,
}: CustomerDirectoryProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="relative flex w-full min-w-0 items-center rounded-full border border-outline-variant bg-surface-container-lowest shadow-sm">
        <Search
          className="pointer-events-none absolute left-4 size-5 text-on-surface-variant"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id="customer-search"
          type="search"
          placeholder="Search customers…"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="font-body w-full rounded-full border-none bg-transparent py-3 pr-4 pl-12 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
          aria-label="Search customers"
        />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-8 text-center text-sm text-on-surface-variant">
          No customers yet. Add a phone when recording income.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto pb-4 lg:gap-3">
          {rows.map((row) => (
            <li key={row.customer.id}>
              <CustomerListItem
                row={row}
                timeZone={timeZone}
                selected={selectedId === row.customer.id}
                onSelect={() => onSelect(row.customer.id)}
                onRecordForPhone={onRecordForPhone}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CustomerListItem({
  row,
  timeZone,
  selected,
  onSelect,
  onRecordForPhone,
}: {
  row: CustomerDirectoryRow;
  timeZone: string;
  selected: boolean;
  onSelect: () => void;
  onRecordForPhone: (phoneNormalized: string) => void;
}) {
  const title = row.customer.name ?? row.displayPhone;
  const lastVisitLabel = row.lastVisitAt
    ? `${formatDayLabelForDateKey(dateKeyInTimeZone(row.lastVisitAt, timeZone), timeZone)} · ${formatTimeInBusinessZone(row.lastVisitAt, timeZone)}`
    : "No visits";

  const visitMeta =
    row.visitCount === 0
      ? "No visits yet"
      : `${row.visitCount} visit${row.visitCount === 1 ? "" : "s"} · ${lastVisitLabel}`;

  const iconWrap = "bg-secondary-container text-on-secondary-container";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 transition-colors lg:hidden",
          selected && "border-primary ring-1 ring-primary/20",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              iconWrap,
            )}
          >
            <UserRound className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            {row.customer.name ? (
              <h3 className="truncate text-body-md font-medium text-on-surface">
                {title}
              </h3>
            ) : (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRecordForPhone(row.customer.phone_normalized);
                }}
                className="truncate text-left text-body-md font-medium text-primary underline-offset-2 hover:underline"
              >
                {row.displayPhone}
              </button>
            )}
            {row.customer.name ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRecordForPhone(row.customer.phone_normalized);
                }}
                className="truncate text-[11px] text-primary underline-offset-2 hover:underline"
              >
                {row.displayPhone}
              </button>
            ) : null}
            <p className="mt-0.5 truncate text-[10px] text-on-surface-variant">
              {visitMeta}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <p className="flex items-baseline gap-0.5 font-bold tracking-tight text-secondary">
            <span className="text-[12px]">रू</span>
            <span className="text-body-md">{formatNprNumber(row.revenue)}</span>
          </p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "glass-card group relative hidden min-w-0 cursor-pointer flex-row items-center justify-between gap-5 rounded-2xl border-l-4 border-l-secondary p-5 transition-all duration-300 lg:flex",
          selected && "ring-2 ring-primary/25",
        )}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              iconWrap,
            )}
          >
            <UserRound className="size-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            {row.customer.name ? (
              <h4 className="font-headline truncate text-lg font-bold text-primary">
                {title}
              </h4>
            ) : (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRecordForPhone(row.customer.phone_normalized);
                }}
                className="font-headline truncate text-left text-lg font-bold text-primary underline-offset-2 hover:underline"
              >
                {row.displayPhone}
              </button>
            )}
            {row.customer.name ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRecordForPhone(row.customer.phone_normalized);
                }}
                className="truncate text-xs text-primary underline-offset-2 hover:underline"
              >
                {row.displayPhone}
              </button>
            ) : null}
            <p className="mt-1 truncate text-xs text-on-surface-variant">
              {visitMeta}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium tracking-widest text-on-surface-variant uppercase">
            Total spent
          </p>
          <p className="font-headline text-xl font-bold text-on-surface">
            <span className="text-sm">रू </span>
            {formatNprNumber(row.revenue)}
          </p>
        </div>
      </div>
    </>
  );
}
