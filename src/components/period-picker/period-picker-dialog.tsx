"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import {
  MONTH_LABELS,
  WEEKDAY_HEADERS,
  addMonths,
  addYears,
  calendarCellsForMonth,
  format,
  getYear,
  isDayInSelectedWeek,
  isFutureDay,
  isFutureMonth,
  isFutureYear,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfDay,
  subMonths,
  type PeriodPickerMode,
  yearPageStartFor,
  yearsOnPage,
  YEARS_PER_PAGE,
} from "@/components/period-picker/period-picker-utils";
import { cn } from "@/lib/utils";
import { clampAnchorToToday } from "@/utils/date-ranges";

export type PeriodPickerDialogProps = {
  open: boolean;
  mode: PeriodPickerMode;
  anchorDate: Date;
  onClose: () => void;
  onApply: (date: Date) => void;
  /** When set, popover opens below this element, left-aligned. */
  anchorRef?: RefObject<HTMLElement | null>;
};

const PICKER_WIDTH_PX = 272;

function usePickerAnchorPosition(
  open: boolean,
  anchorRef?: RefObject<HTMLElement | null>,
) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function update() {
      const el = anchorRef?.current;
      if (!el) {
        setPosition(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      const margin = 12;
      const left = Math.max(
        margin,
        Math.min(rect.left, window.innerWidth - PICKER_WIDTH_PX - margin),
      );
      setPosition({ top: rect.bottom + 8, left });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  return position;
}

function PickerShell({
  children,
  onClose,
  onApply,
  anchorRef,
}: {
  children: React.ReactNode;
  onClose: () => void;
  onApply: () => void;
  anchorRef?: RefObject<HTMLElement | null>;
}) {
  const anchorPosition = usePickerAnchorPosition(true, anchorRef);
  const isAnchored = Boolean(anchorRef);

  return (
    <div className="fixed inset-0 z-[200]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-transparent"
        aria-label="Close picker"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "period-picker-glass z-10 overflow-hidden rounded-2xl border border-surface-container-highest/20 p-0.5 shadow-natural-ink",
          isAnchored
            ? "fixed"
            : "absolute top-1/2 left-1/2 w-[calc(100%-2.5rem)] max-w-[272px] -translate-x-1/2 -translate-y-1/2",
        )}
        style={
          isAnchored && anchorPosition
            ? {
                top: anchorPosition.top,
                left: anchorPosition.left,
                width: PICKER_WIDTH_PX,
              }
            : isAnchored
              ? { visibility: "hidden" as const, width: PICKER_WIDTH_PX }
              : undefined
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4 rounded-[14px] bg-surface p-4">
          {children}
          <PickerFooter onClose={onClose} onApply={onApply} />
        </div>
      </div>
    </div>
  );
}

function PickerFooter({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: () => void;
}) {
  return (
    <div className="mt-1 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg bg-surface-container-highest px-4 py-2 text-[11px] font-semibold tracking-[0.1em] text-on-surface uppercase transition-colors hover:bg-surface-container-high"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onApply}
        className="rounded-lg bg-primary-container px-4 py-2 text-[11px] font-semibold tracking-[0.1em] text-on-primary uppercase transition-colors hover:bg-primary"
      >
        Apply
      </button>
    </div>
  );
}

function DayWeekPickerBody({
  mode,
  draft,
  setDraft,
  viewMonth,
  setViewMonth,
}: {
  mode: "day" | "week";
  draft: Date;
  setDraft: (date: Date) => void;
  viewMonth: Date;
  setViewMonth: (date: Date) => void;
}) {
  const today = startOfDay(new Date());
  const cells = calendarCellsForMonth(viewMonth);

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setViewMonth(subMonths(viewMonth, 1))}
          className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          <ChevronLeft className="size-4" strokeWidth={1.75} />
        </button>
        <h2 className="font-headline text-sm font-medium tracking-tight text-primary uppercase">
          {format(viewMonth, "MMMM yyyy")}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="w-full">
        <div className="mb-2 grid grid-cols-7">
          {WEEKDAY_HEADERS.map((label, index) => (
            <div
              key={`${label}-${index}`}
              className="text-center text-[10px] font-semibold tracking-wider text-outline uppercase"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-x-0.5 gap-y-1">
          {cells.map((day) => {
            const inMonth = isSameMonth(day, viewMonth);
            const future = isFutureDay(day, today);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, draft);
            const inWeek = isDayInSelectedWeek(day, draft, mode);
            const notSelectable = !inMonth || future;
            const futureInMonth = inMonth && future;

            return (
              <button
                key={day.toISOString()}
                type="button"
                aria-disabled={notSelectable || undefined}
                tabIndex={notSelectable ? -1 : 0}
                onClick={() => {
                  if (notSelectable) return;
                  setDraft(startOfDay(day));
                }}
                className={cn(
                  "flex h-8 w-full items-center justify-center rounded-full text-sm transition-colors",
                  !inMonth &&
                    "pointer-events-none text-outline-variant",
                  inMonth &&
                    !future &&
                    "text-on-surface hover:bg-surface-container",
                  futureInMonth &&
                    "pointer-events-none cursor-not-allowed text-on-surface-variant",
                  isToday &&
                    inMonth &&
                    !isSelected &&
                    "bg-surface-container-low font-semibold text-primary ring-1 ring-inset ring-outline-variant/30",
                  mode === "week" &&
                    inWeek &&
                    inMonth &&
                    !isSelected &&
                    !future &&
                    "bg-surface-container-low/80",
                  isSelected &&
                    inMonth &&
                    !future &&
                    "bg-primary-container font-semibold text-on-primary shadow-sm hover:bg-primary",
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function MonthPickerBody({
  draft,
  setDraft,
  viewYear,
  setViewYear,
}: {
  draft: Date;
  setDraft: (date: Date) => void;
  viewYear: number;
  setViewYear: (year: number) => void;
}) {
  const now = new Date();
  const draftMonth = draft.getMonth();
  const draftYear = getYear(draft);

  return (
    <>
      <div className="flex items-center justify-between border-b border-surface-container pb-3">
        <button
          type="button"
          aria-label="Previous year"
          onClick={() => setViewYear(viewYear - 1)}
          className="rounded-full p-0.5 text-on-surface-variant transition-colors hover:text-primary"
        >
          <ChevronLeft className="size-5" strokeWidth={1.75} />
        </button>
        <h2 className="font-headline text-lg font-medium text-primary">
          {viewYear}
        </h2>
        <button
          type="button"
          aria-label="Next year"
          disabled={viewYear >= getYear(now)}
          onClick={() => setViewYear(viewYear + 1)}
          className="rounded-full p-1 text-on-surface-variant transition-colors hover:text-primary disabled:opacity-30"
        >
          <ChevronRight className="size-5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-x-2 gap-y-3">
        {MONTH_LABELS.map((label, monthIndex) => {
          const selected = draftYear === viewYear && draftMonth === monthIndex;
          const disabled = isFutureMonth(viewYear, monthIndex, now);
          return (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() =>
                setDraft(clampAnchorToToday(new Date(viewYear, monthIndex, 1, 12)))
              }
              className={cn(
                "rounded-lg py-1.5 text-center text-sm transition-colors",
                selected
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary",
                disabled && "opacity-40",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </>
  );
}

function YearPickerBody({
  draft,
  setDraft,
  pageStart,
  setPageStart,
}: {
  draft: Date;
  setDraft: (date: Date) => void;
  pageStart: number;
  setPageStart: (start: number) => void;
}) {
  const now = new Date();
  const draftYear = getYear(draft);
  const years = yearsOnPage(pageStart);
  const pageEnd = pageStart + YEARS_PER_PAGE - 1;

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous years"
          onClick={() => setPageStart(pageStart - YEARS_PER_PAGE)}
          className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          <ChevronLeft className="size-4" strokeWidth={1.75} />
        </button>
        <h2 className="font-headline text-sm font-medium tracking-tight text-primary">
          {pageStart} – {pageEnd}
        </h2>
        <button
          type="button"
          aria-label="Next years"
          disabled={pageStart + YEARS_PER_PAGE > getYear(now)}
          onClick={() => setPageStart(pageStart + YEARS_PER_PAGE)}
          className="flex size-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30"
        >
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-x-2 gap-y-2">
        {years.map((year) => {
          const selected = draftYear === year;
          const disabled = isFutureYear(year, now);
          return (
            <button
              key={year}
              type="button"
              disabled={disabled}
              onClick={() =>
                setDraft(clampAnchorToToday(new Date(year, 6, 1, 12)))
              }
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors",
                selected
                  ? "bg-primary-container font-semibold text-on-primary shadow-sm hover:bg-primary"
                  : "text-on-surface hover:bg-surface-container",
                disabled && "opacity-40",
              )}
            >
              {year}
            </button>
          );
        })}
      </div>
    </>
  );
}

export function PeriodPickerDialog({
  open,
  mode,
  anchorDate,
  onClose,
  onApply,
  anchorRef,
}: PeriodPickerDialogProps) {
  const [draft, setDraft] = useState(anchorDate);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(anchorDate));
  const [viewYear, setViewYear] = useState(() => getYear(anchorDate));
  const [yearPageStart, setYearPageStart] = useState(() =>
    yearPageStartFor(getYear(anchorDate)),
  );

  useEffect(() => {
    if (!open) return;
    setDraft(anchorDate);
    setViewMonth(startOfMonth(anchorDate));
    setViewYear(getYear(anchorDate));
    setYearPageStart(yearPageStartFor(getYear(anchorDate)));
  }, [open, anchorDate]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  function handleApply() {
    onApply(clampAnchorToToday(draft));
    onClose();
  }

  const body =
    mode === "day" || mode === "week" ? (
      <DayWeekPickerBody
        mode={mode}
        draft={draft}
        setDraft={setDraft}
        viewMonth={viewMonth}
        setViewMonth={setViewMonth}
      />
    ) : mode === "month" ? (
      <MonthPickerBody
        draft={draft}
        setDraft={setDraft}
        viewYear={viewYear}
        setViewYear={setViewYear}
      />
    ) : (
      <YearPickerBody
        draft={draft}
        setDraft={setDraft}
        pageStart={yearPageStart}
        setPageStart={setYearPageStart}
      />
    );

  return createPortal(
    <PickerShell onClose={onClose} onApply={handleApply} anchorRef={anchorRef}>
      {body}
    </PickerShell>,
    document.body,
  );
}
