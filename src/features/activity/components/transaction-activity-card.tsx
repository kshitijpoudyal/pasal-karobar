import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, Eye, Pencil, Trash2 } from "lucide-react";

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
  onDelete?: () => void;
};

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
  onDelete,
}: TransactionActivityCardProps) {
  return (
    <div
      className={cn(
        "glass-card group flex flex-col justify-between gap-6 rounded-squircle p-8 transition-all duration-300 hover:-translate-y-1 md:flex-row md:items-center",
        "border-l-8",
        borderClassName,
      )}
    >
      <div className="flex items-center gap-6">
        <div
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl",
            iconWrapClassName,
          )}
        >
          <Icon className={cn("size-8", iconClassName)} strokeWidth={1.75} />
        </div>
        <div>
          <h4 className="font-headline text-xl font-bold text-primary">{title}</h4>
          <div className="text-label-sm mt-2 flex items-center gap-4 text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" strokeWidth={1.75} />
              {time}
            </span>
            <span className="size-1.5 rounded-full bg-outline-variant" />
            <span
              className={cn(
                "rounded-full px-4 py-1 text-[11px] font-bold tracking-wider uppercase",
                paymentClassName,
              )}
            >
              {paymentLabel}
            </span>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center gap-12 md:w-auto">
        <div className="hidden text-right sm:block">
          <p className="text-label-sm mb-1 font-medium tracking-widest text-on-surface-variant uppercase">
            {amountLabel}
          </p>
          <div className="font-headline text-2xl font-bold text-on-surface">{amount}</div>
        </div>
        <div className="ml-auto flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100 md:ml-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full text-on-surface-variant hover:bg-surface-container-low"
          >
            <Eye className="size-5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full text-on-surface-variant hover:bg-surface-container-low"
          >
            <Pencil className="size-5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!onDelete}
            onClick={onDelete}
            className="size-11 rounded-full text-error hover:bg-error-container disabled:opacity-40"
          >
            <Trash2 className="size-5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TimelineDateDivider({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 bg-surface py-3 lg:gap-6 lg:py-4">
      <span className="text-label-sm font-bold tracking-[0.25em] whitespace-nowrap text-outline uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-outline-variant" />
    </div>
  );
}

type TransactionActivityMobileRowProps = {
  title: string;
  time: string;
  paymentLabel: string;
  amount: ReactNode;
  tipLabel?: string | null;
  icon: LucideIcon;
  iconWrapClassName: string;
  isIncome: boolean;
};

export function TransactionActivityMobileRow({
  title,
  time,
  paymentLabel,
  amount,
  tipLabel,
  icon: Icon,
  iconWrapClassName,
  isIncome,
}: TransactionActivityMobileRowProps) {
  return (
    <div className="squircle flex items-center gap-4 bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          iconWrapClassName,
        )}
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-headline truncate text-base font-semibold text-on-surface">
            {title}
          </h3>
          <p
            className={cn(
              "shrink-0 font-headline text-base font-semibold",
              isIncome ? "text-primary" : "text-on-tertiary-container",
            )}
          >
            {amount}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-label-sm normal-case tracking-normal text-on-surface-variant">
            {time}
          </span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full bg-surface-container-highest px-2 py-0.5 text-label-sm normal-case tracking-normal text-on-surface">
              {paymentLabel}
            </span>
            {tipLabel ? (
              <span className="text-label-sm normal-case tracking-normal text-on-secondary-container">
                {tipLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
