"use client";

import { Scissors, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { runConfirmedAction, useConfirmDrawer } from "@/components/confirm-drawer";
import {
  TimelineDateDivider,
  TransactionActivityCard,
} from "@/features/activity/components/transaction-activity-card";
import { incomeTransactionTitle } from "@/features/transactions/utils/income-entry-title";
import type { Transaction } from "@/types/database";
import {
  formatDayLabelForDateKey,
  formatTimeInBusinessZone,
  logTimezoneFormatMismatch,
} from "@/utils/business-datetime";
import { isPendingSyncTransactionId } from "@/offline/pending-transaction";
import { formatNpr } from "@/utils/format";

type TransactionTimelineProps = {
  grouped: [string, Transaction[]][];
  serviceNames: Map<string, string>;
  categoryNames: Map<string, string>;
  customerLabels: Map<string, string>;
  onDelete: (transactionId: string) => Promise<void>;
  isDeleting: boolean;
  timeZone: string;
};

function titleForTransaction(
  tx: Transaction,
  serviceNames: Map<string, string>,
  categoryNames: Map<string, string>,
): string {
  if (tx.type === "INCOME") {
    return incomeTransactionTitle(tx, serviceNames);
  }
  const cat = tx.expense_category_id
    ? categoryNames.get(tx.expense_category_id)
    : undefined;
  return tx.note ?? cat ?? "Expense";
}

function iconForTransaction(tx: Transaction): LucideIcon {
  if (tx.type === "EXPENSE") return ShoppingCart;
  return Scissors;
}

export function TransactionTimeline({
  grouped,
  serviceNames,
  categoryNames,
  customerLabels,
  onDelete,
  isDeleting,
  timeZone,
}: TransactionTimelineProps) {
  const { confirm } = useConfirmDrawer();

  return (
    <div className="flex flex-col gap-4">
      {grouped.map(([dayKey, transactions]) => (
        <div key={dayKey}>
          <TimelineDateDivider
            label={formatDayLabelForDateKey(dayKey, timeZone)}
          />
          <div className="mb-2 flex flex-col gap-2 pt-4 lg:mb-4 lg:gap-3 lg:pt-3">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              const Icon = iconForTransaction(tx);
              const tip = Number(tx.tip);
              const total = Number(tx.total);
              const title = titleForTransaction(tx, serviceNames, categoryNames);
              const customerLabel =
                isIncome && tx.customer_id
                  ? customerLabels.get(tx.customer_id)
                  : undefined;
              logTimezoneFormatMismatch(
                tx.transaction_date,
                timeZone,
                "activity-timeline",
              );
              const time = formatTimeInBusinessZone(
                tx.transaction_date,
                timeZone,
              );

              const pendingSync = isPendingSyncTransactionId(tx.id);

              const deleteHandler =
                isDeleting || pendingSync
                  ? undefined
                  : () => {
                      const entryKind = isIncome ? "income entry" : "expense";
                      void runConfirmedAction(
                        confirm,
                        {
                          title: "Delete this entry?",
                          description: `Remove "${title}" (${formatNpr(total)}) from your activity. This ${entryKind} will be permanently deleted.`,
                          confirmLabel: "Delete",
                          cancelLabel: "Keep",
                          tone: "destructive",
                        },
                        () => onDelete(tx.id),
                      );
                    };

              return (
                <TransactionActivityCard
                  key={tx.id}
                  title={title}
                  customerLabel={customerLabel}
                  time={time}
                  paymentMethod={tx.payment_method}
                  isIncome={isIncome}
                  mobileTotal={total}
                  amountLabel={isIncome ? "Amount / Tip" : "Expense"}
                  amount={
                    isIncome ? (
                      <>
                        <span className="text-on-secondary-container">
                          {formatNpr(total - tip)}
                        </span>{" "}
                        {tip > 0 ? (
                          <span className="text-sm font-normal text-on-surface-variant">
                            + {formatNpr(tip)}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-on-tertiary-container">
                        - {formatNpr(total)}
                      </span>
                    )
                  }
                  icon={Icon}
                  iconWrapClassName={
                    isIncome
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-container-high text-tertiary"
                  }
                  borderClassName={
                    isIncome ? "border-l-secondary" : "border-l-tertiary"
                  }
                  pendingSync={pendingSync}
                  onDelete={deleteHandler}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div className="mb-6 lg:mb-8" />
    </div>
  );
}
