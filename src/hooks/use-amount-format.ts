"use client";

import { useCallback, useMemo } from "react";

import { useAmountVisibility } from "@/providers/amount-visibility-provider";
import {
  formatCompactNpr,
  formatNpr,
  formatNprNumber,
  maskFormattedAmount,
} from "@/utils/format";

export function useAmountFormat() {
  const { amountsHidden } = useAmountVisibility();

  const maybeMask = useCallback(
    (formatted: string) => (amountsHidden ? maskFormattedAmount(formatted) : formatted),
    [amountsHidden],
  );

  return useMemo(
    () => ({
      amountsHidden,
      formatNpr: (amount: number, currency = "NPR") =>
        maybeMask(formatNpr(amount, currency)),
      formatNprNumber: (amount: number) => maybeMask(formatNprNumber(amount)),
      formatCompactNpr: (amount: number, currency = "NPR") =>
        maybeMask(formatCompactNpr(amount, currency)),
    }),
    [amountsHidden, maybeMask],
  );
}
