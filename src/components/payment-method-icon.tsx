import type { ReactNode } from "react";
import { Banknote, Landmark, QrCode } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database";
import { dbPaymentToLabel } from "@/utils/payment-method";

type PaymentMethodIconProps = {
  method: PaymentMethod;
  className?: string;
  iconClassName?: string;
};

function brandBadge(text: string, className: string, label: string): ReactNode {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[8px] leading-none font-bold text-white",
        className,
      )}
    >
      {text}
    </span>
  );
}

export function PaymentMethodIcon({
  method,
  className,
  iconClassName,
}: PaymentMethodIconProps) {
  const label = dbPaymentToLabel(method);

  switch (method) {
    case "CASH":
      return (
        <Banknote
          className={cn("size-5 shrink-0 text-secondary", iconClassName, className)}
          strokeWidth={1.75}
          aria-label={label}
        />
      );
    case "ESEWA":
      return brandBadge("eS", "bg-[#4CAF50]", label);
    case "KHALTI":
      return brandBadge("K", "bg-[#673AB7]", label);
    case "BANK_TRANSFER":
      return (
        <Landmark
          className={cn("size-5 shrink-0 text-primary", iconClassName, className)}
          strokeWidth={1.75}
          aria-label={label}
        />
      );
    case "FONEPAY":
      return (
        <QrCode
          className={cn(
            "size-5 shrink-0 text-tertiary-fixed-dim",
            iconClassName,
            className,
          )}
          strokeWidth={1.75}
          aria-label={label}
        />
      );
    default:
      return (
        <span
          className={cn(
            "text-[10px] font-semibold text-on-surface-variant uppercase",
            className,
          )}
          title={label}
        >
          {label}
        </span>
      );
  }
}
