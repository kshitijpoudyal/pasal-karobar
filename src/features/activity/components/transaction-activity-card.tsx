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
        "glass-card group flex min-w-0 flex-col justify-between gap-3 rounded-2xl p-4 transition-all duration-300 lg:flex-row lg:items-center lg:gap-5 lg:p-5",
        "border-l-4",
        borderClassName,
      )}
    >
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
        <div className="text-left lg:text-right">
          <p className="text-[10px] font-medium tracking-widest text-on-surface-variant uppercase lg:text-label-sm">
            {amountLabel}
          </p>
          <div className="font-headline text-lg font-bold text-on-surface lg:text-xl">{amount}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-on-surface-variant hover:bg-surface-container-low"
          >
            <Eye className="size-5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-on-surface-variant hover:bg-surface-container-low"
          >
            <Pencil className="size-5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={!onDelete}
            onClick={onDelete}
            className="size-9 rounded-full text-error hover:bg-error-container disabled:opacity-40"
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
    <div className="sticky top-0 z-10 flex items-center gap-3 bg-surface py-2 lg:py-2.5">
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
    <div className="squircle flex items-center gap-3 rounded-2xl bg-surface-container-low px-3 py-2.5 transition-colors hover:bg-surface-container">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          iconWrapClassName,
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-headline min-w-0 truncate text-sm font-semibold text-on-surface">
            {title}
          </h3>
          <p
            className={cn(
              "shrink-0 font-headline text-sm font-semibold tabular-nums",
              isIncome ? "text-primary" : "text-on-tertiary-container",
            )}
          >
            {amount}
          </p>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-on-surface-variant">{time}</span>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className="rounded-full bg-surface-container-highest px-2 py-px text-[10px] font-semibold text-on-surface">
              {paymentLabel}
            </span>
            {tipLabel ? (
              <span className="text-[10px] font-medium text-on-secondary-container">
                {tipLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
