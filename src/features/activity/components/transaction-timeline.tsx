"use client";

import { Scissors, ShoppingCart } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import type { LucideIcon } from "lucide-react";

import {
  TimelineDateDivider,
  TransactionActivityCard,
  TransactionActivityMobileRow,
} from "@/features/activity/components/transaction-activity-card";
import type { Transaction } from "@/types/database";
import { formatNpr } from "@/utils/format";
import { dbPaymentToLabel } from "@/utils/payment-method";

type TransactionTimelineProps = {
  grouped: [string, Transaction[]][];
  serviceNames: Map<string, string>;
  categoryNames: Map<string, string>;
  onDelete: (transactionId: string) => Promise<void>;
  isDeleting: boolean;
};

function formatDayLabel(dateKey: string): string {
  const date = parseISO(`${dateKey}T12:00:00`);
  if (isToday(date)) return `Today, ${format(date, "do MMM")}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, "do MMM")}`;
  return format(date, "EEEE, do MMM");
}

function titleForTransaction(
  tx: Transaction,
  serviceNames: Map<string, string>,
  categoryNames: Map<string, string>,
): string {
  if (tx.type === "INCOME") {
    const name = tx.service_id
      ? serviceNames.get(tx.service_id)
      : undefined;
    return name ?? tx.note ?? "Income";
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
  onDelete,
  isDeleting,
}: TransactionTimelineProps) {
  return (
    <div className="flex flex-col gap-6">
      {grouped.map(([dayKey, transactions]) => (
        <div key={dayKey}>
          <TimelineDateDivider label={formatDayLabel(dayKey)} />
          <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:grid lg:grid-cols-1 lg:gap-6">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              const Icon = iconForTransaction(tx);
              const tip = Number(tx.tip);
              const total = Number(tx.total);
              const title = titleForTransaction(tx, serviceNames, categoryNames);
              const time = format(parseISO(tx.transaction_date), "h:mm a");
              const paymentLabel = dbPaymentToLabel(tx.payment_method);

              return (
                <div key={tx.id}>
                  <div className="lg:hidden">
                    <TransactionActivityMobileRow
                      title={title}
                      time={time}
                      paymentLabel={paymentLabel}
                      isIncome={isIncome}
                      amount={
                        isIncome
                          ? formatNpr(total - tip)
                          : `- ${formatNpr(total)}`
                      }
                      tipLabel={
                        isIncome && tip > 0 ? `+ ${formatNpr(tip)} Tip` : null
                      }
                      icon={Icon}
                      iconWrapClassName={
                        isIncome
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-tertiary-container text-on-tertiary-container"
                      }
                    />
                  </div>
                  <div className="hidden lg:block">
                    <TransactionActivityCard
                      title={title}
                      time={time}
                      paymentLabel={paymentLabel}
                      paymentClassName={
                    isIncome
                      ? "bg-secondary-container/50 text-on-secondary-container"
                      : "bg-surface-container-high text-tertiary"
                  }
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
                      onDelete={
                        isDeleting
                          ? undefined
                          : () => {
                              void onDelete(tx.id);
                            }
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="mb-8 lg:mb-24" />
    </div>
  );
}
