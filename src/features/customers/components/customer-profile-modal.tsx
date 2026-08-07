"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

import type { CustomerDirectoryRow } from "@/features/customers/hooks/use-customers-page";
import { useUpdateCustomerMutation } from "@/hooks/queries/use-customer-queries";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/database";
import {
  dateKeyInTimeZone,
  formatDayLabelForDateKey,
  formatTimeInBusinessZone,
} from "@/utils/business-datetime";
import { formatCompactNpr } from "@/utils/format";

type CustomerProfileModalProps = {
  open: boolean;
  businessId: string;
  row: CustomerDirectoryRow | null;
  visits: Transaction[];
  timeZone: string;
  onClose: () => void;
  onRecordForPhone: (phoneNormalized: string) => void;
};

export function CustomerProfileModal({
  open,
  businessId,
  row,
  visits,
  timeZone,
  onClose,
  onRecordForPhone,
}: CustomerProfileModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !row) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm lg:items-center lg:bg-black/30 lg:p-8 lg:frosted-vellum"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "flex w-full max-w-lg flex-col overflow-hidden bg-surface-bright shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)]",
          "max-h-[92dvh] animate-[slideUpSheet_0.3s_ease-out] rounded-t-[32px] pb-[env(safe-area-inset-bottom)]",
          "lg:max-h-[85vh] lg:squircle lg:animate-none lg:rounded-[24px] lg:pb-0",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div
            className="h-1.5 w-12 rounded-full bg-outline-variant/50"
            aria-hidden
          />
        </div>
        <CustomerProfileModalBody
          titleId={titleId}
          businessId={businessId}
          row={row}
          visits={visits}
          timeZone={timeZone}
          onClose={onClose}
          onRecordForPhone={onRecordForPhone}
        />
      </div>
    </div>
  );
}

function CustomerProfileModalBody({
  titleId,
  businessId,
  row,
  visits,
  timeZone,
  onClose,
  onRecordForPhone,
}: {
  titleId: string;
  businessId: string;
  row: CustomerDirectoryRow;
  visits: Transaction[];
  timeZone: string;
  onClose: () => void;
  onRecordForPhone: (phoneNormalized: string) => void;
}) {
  const [nameDraft, setNameDraft] = useState(row.customer.name ?? "");
  const updateMutation = useUpdateCustomerMutation(businessId);

  useEffect(() => {
    setNameDraft(row.customer.name ?? "");
  }, [row.customer.id, row.customer.name]);

  async function saveName() {
    await updateMutation.mutateAsync({
      customerId: row.customer.id,
      input: { name: nameDraft.trim() || null },
    });
  }

  return (
    <>
      <div className="shrink-0 px-6 pt-2 pb-4 lg:px-8 lg:pt-8 lg:pb-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="font-headline text-2xl font-medium tracking-tight text-on-surface lg:text-3xl"
            >
              Customer profile
            </h2>
            <button
              type="button"
              onClick={() => onRecordForPhone(row.customer.phone_normalized)}
              className="mt-1 text-base font-medium text-primary underline-offset-2 hover:underline"
            >
              {row.displayPhone}
            </button>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Tap phone to record new entry
            </p>
          </div>
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm transition-colors hover:bg-surface-container active:scale-95"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5 text-on-surface-variant" strokeWidth={1.75} />
          </button>
        </header>
      </div>

      <div className="hide-scrollbar flex-1 space-y-5 overflow-y-auto px-6 pb-8 lg:px-8 lg:pb-8">
        <div>
          <label
            htmlFor="customer-profile-name"
            className="font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase"
          >
            Name (optional)
          </label>
          <div className="mt-3 flex gap-2">
            <input
              id="customer-profile-name"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              className="font-body min-w-0 flex-1 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2.5 text-base"
            />
            <button
              type="button"
              onClick={() => void saveName()}
              disabled={updateMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary"
            >
              Save
            </button>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant">
          {row.visitCount} visit{row.visitCount === 1 ? "" : "s"} ·{" "}
          {formatCompactNpr(row.revenue)} total
        </p>

        <div>
          <p className="font-body text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase">
            Visits
          </p>
          <ul className="mt-3 space-y-2">
            {visits.length === 0 ? (
              <li className="rounded-xl bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant">
                No visits recorded.
              </li>
            ) : (
              visits.map((tx) => (
                <li
                  key={tx.id}
                  className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm"
                >
                  <span className="font-medium text-on-surface">
                    {formatCompactNpr(Number(tx.total))}
                  </span>
                  <span className="text-on-surface-variant">
                    {" "}
                    ·{" "}
                    {formatDayLabelForDateKey(
                      dateKeyInTimeZone(tx.transaction_date, timeZone),
                      timeZone,
                    )}{" "}
                    {formatTimeInBusinessZone(tx.transaction_date, timeZone)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
