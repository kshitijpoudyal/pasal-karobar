"use client";

import { Clock, UserRound } from "lucide-react";

import { TimelineDateDivider } from "@/features/activity/components/transaction-activity-card";
import type { CustomerDirectoryRow } from "@/features/customers/hooks/use-customers-page";
import type { CalendarSystem } from "@/constants/calendar-system";
import {
  dateKeyInTimeZone,
  formatDayLabelForDateKey,
  formatTimeInBusinessZone,
} from "@/utils/business-datetime";
import { formatNprNumber } from "@/utils/format";

const NO_VISITS_KEY = "__no_visits__";

export function groupCustomersByLastVisit(
  rows: CustomerDirectoryRow[],
  timeZone: string,
): [string, CustomerDirectoryRow[]][] {
  const map = new Map<string, CustomerDirectoryRow[]>();

  for (const row of rows) {
    const key = row.lastVisitAt
      ? dateKeyInTimeZone(row.lastVisitAt, timeZone)
      : NO_VISITS_KEY;
    const bucket = map.get(key) ?? [];
    bucket.push(row);
    map.set(key, bucket);
  }

  const dated = [...map.entries()].filter(([key]) => key !== NO_VISITS_KEY);
  dated.sort((a, b) => b[0].localeCompare(a[0]));

  const noVisits = map.get(NO_VISITS_KEY);
  if (noVisits?.length) {
    dated.push([NO_VISITS_KEY, noVisits]);
  }

  return dated;
}

export type GroupedCustomersDay = {
  dayKey: string;
  label: string;
  rows: CustomerDirectoryRow[];
};

export function groupCustomersByLastVisitWithLabels(
  rows: CustomerDirectoryRow[],
  timeZone: string,
  calendarSystem: CalendarSystem,
  now: Date = new Date(),
): GroupedCustomersDay[] {
  return groupCustomersByLastVisit(rows, timeZone).map(([dayKey, dayRows]) => ({
    dayKey,
    label:
      dayKey === NO_VISITS_KEY
        ? "No visits yet"
        : formatDayLabelForDateKey(dayKey, timeZone, now, calendarSystem),
    rows: dayRows,
  }));
}

type CustomerTimelineProps = {
  grouped: GroupedCustomersDay[];
  timeZone: string;
  onSelect: (phoneNormalized: string) => void;
  onRecordForPhone: (phoneNormalized: string) => void;
};

export function CustomerTimeline({
  grouped,
  timeZone,
  onSelect,
  onRecordForPhone,
}: CustomerTimelineProps) {
  return (
    <div className="flex flex-col gap-4">
      {grouped.map(({ dayKey, label, rows }) => (
        <div key={dayKey}>
          <TimelineDateDivider label={label} />
          <div className="mb-2 flex flex-col gap-2 pt-4 lg:mb-4 lg:gap-3 lg:pt-3">
            {rows.map((row) => (
              <CustomerActivityCard
                key={row.customer.id}
                row={row}
                timeZone={timeZone}
                onSelect={() => onSelect(row.customer.phone_normalized)}
                onRecordForPhone={() => onRecordForPhone(row.customer.phone_normalized)}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="mb-6 lg:mb-8" />
    </div>
  );
}

function CustomerActivityCard({
  row,
  timeZone,
  onSelect,
  onRecordForPhone,
}: {
  row: CustomerDirectoryRow;
  timeZone: string;
  onSelect: () => void;
  onRecordForPhone: () => void;
}) {
  const title = row.customer.name?.trim() || row.displayPhone;
  const phoneLine = row.customer.name?.trim() ? row.displayPhone : null;
  const timeLabel = row.lastVisitAt
    ? formatTimeInBusinessZone(row.lastVisitAt, timeZone)
    : "—";
  const visitMeta =
    row.visitCount === 0
      ? "No visits yet"
      : `${row.visitCount} visit${row.visitCount === 1 ? "" : "s"}`;

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
        className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 lg:hidden"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
            <UserRound className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-body-md font-medium text-on-surface">
              {title}
            </h3>
            {phoneLine ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRecordForPhone();
                }}
                className="truncate text-[11px] text-primary underline-offset-2 hover:underline"
              >
                {phoneLine}
              </button>
            ) : null}
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-on-surface-variant">{visitMeta}</span>
              {row.lastVisitAt ? (
                <span className="text-[10px] text-on-surface-variant">
                  · {timeLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <p className="flex shrink-0 items-baseline gap-0.5 font-bold tracking-tight text-secondary">
          <span className="text-[12px]">रू</span>
          <span className="text-body-md">{formatNprNumber(row.revenue)}</span>
        </p>
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
        className="glass-card group relative hidden min-w-0 cursor-pointer flex-col justify-between gap-3 rounded-2xl border-l-4 border-l-secondary p-4 transition-all duration-300 lg:flex lg:flex-row lg:items-center lg:gap-5 lg:p-5"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container lg:size-12">
            <UserRound className="size-6 lg:size-7" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h4 className="font-headline truncate text-base font-bold text-primary lg:text-lg">
              {title}
            </h4>
            {phoneLine ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRecordForPhone();
                }}
                className="truncate text-xs text-primary underline-offset-2 hover:underline"
              >
                {phoneLine}
              </button>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-on-surface-variant lg:gap-3">
              <span className="text-xs lg:text-sm">{visitMeta}</span>
              {row.lastVisitAt ? (
                <>
                  <span className="hidden size-1 rounded-full bg-outline-variant sm:block" />
                  <span className="flex items-center gap-1 text-xs lg:text-sm">
                    <Clock className="size-3.5" strokeWidth={1.75} />
                    {timeLabel}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-end lg:gap-6">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:min-w-48 lg:flex-none">
            <p className="shrink-0 text-[10px] font-medium tracking-widest text-on-surface-variant uppercase lg:text-label-sm">
              Total spent
            </p>
            <div className="font-headline text-right text-lg font-bold text-on-surface lg:text-xl">
              <span className="text-sm">रू </span>
              {formatNprNumber(row.revenue)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
