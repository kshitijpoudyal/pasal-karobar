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
          <div className="font-headline text-2xl font-bold">{amount}</div>
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
            className="size-11 rounded-full text-error hover:bg-error-container"
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
    <div className="sticky top-0 z-10 flex items-center gap-6 bg-surface py-4">
      <span className="text-label-sm font-bold tracking-[0.25em] whitespace-nowrap text-outline uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-outline-variant" />
    </div>
  );
}
