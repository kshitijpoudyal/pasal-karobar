"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TransactionActivityCardProps = {
  title: string;
  time: string;
  paymentLabel: string;
  paymentClassName: string;
  amountLabel: string;
  amount: ReactNode;
  icon: LucideIcon;
  iconWrapClassName: string;
  iconClassName?: string;
  borderClassName: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

type ActivityItemMoreMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
};

function ActivityItemMoreMenu({ onEdit, onDelete }: ActivityItemMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const hasActions = Boolean(onEdit || onDelete);
  if (!hasActions) return null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label="More options"
        onClick={() => setOpen((value) => !value)}
        className="size-9 rounded-full text-on-surface-variant hover:bg-surface-container-low"
      >
        <MoreVertical className="size-5" strokeWidth={1.75} />
      </Button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-40 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            disabled={!onEdit}
            onClick={() => {
              setOpen(false);
              onEdit?.();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Pencil className="size-4 shrink-0" strokeWidth={1.75} />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!onDelete}
            onClick={() => {
              setOpen(false);
              onDelete?.();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error-container/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-4 shrink-0" strokeWidth={1.75} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function TransactionActivityCard({
  title,
  time,
  paymentLabel,
  paymentClassName,
  amountLabel,
  amount,
  icon: Icon,
  iconWrapClassName,
  iconClassName,
  borderClassName,
  onEdit,
  onDelete,
}: TransactionActivityCardProps) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div
      className={cn(
        "glass-card group relative flex min-w-0 flex-col justify-between gap-3 rounded-2xl p-4 transition-all duration-300 lg:flex-row lg:items-center lg:gap-5 lg:p-5",
        "border-l-4",
        borderClassName,
        hasActions && "max-lg:pr-12",
      )}
    >
      {hasActions ? (
        <div className="absolute top-3 right-3 z-10 lg:hidden">
          <ActivityItemMoreMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      ) : null}
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl lg:size-12",
            iconWrapClassName,
          )}
        >
          <Icon className={cn("size-6 lg:size-7", iconClassName)} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h4 className="font-headline truncate text-base font-bold text-primary lg:text-lg">
            {title}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-on-surface-variant lg:gap-3">
            <span className="flex items-center gap-1 text-xs lg:text-sm">
              <Clock className="size-3.5" strokeWidth={1.75} />
              {time}
            </span>
            <span className="hidden size-1 rounded-full bg-outline-variant sm:block" />
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase lg:text-[11px]",
                paymentClassName,
              )}
            >
              {paymentLabel}
            </span>
          </div>
        </div>
      </div>
      <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-end lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:min-w-48 lg:flex-none">
          <p className="shrink-0 text-[10px] font-medium tracking-widest text-on-surface-variant uppercase lg:text-label-sm">
            {amountLabel}
          </p>
          <div className="font-headline text-right text-lg font-bold text-on-surface lg:text-xl">
            {amount}
          </div>
        </div>
        {hasActions ? (
          <div className="hidden shrink-0 lg:block">
            <ActivityItemMoreMenu onEdit={onEdit} onDelete={onDelete} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TimelineDateDivider({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 bg-surface py-2 lg:py-2.5">
      <span className="text-label-sm font-bold tracking-[0.25em] whitespace-nowrap text-outline uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-outline-variant" />
    </div>
  );
}
