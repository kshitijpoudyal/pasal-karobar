"use client";

import { Scissors } from "lucide-react";

import {
  TimelineDateDivider,
  TransactionActivityCard,
} from "@/features/activity/components/transaction-activity-card";
import { incomeTransactionTitle } from "@/features/transactions/utils/income-entry-title";
import { isPendingSyncTransactionId } from "@/offline/pending-transaction";
import { formatTimeInBusinessZone } from "@/utils/business-datetime";
import { countDistinctVisits, toIncomeVisitRows } from "@/utils/customer-visits";
import type { GroupedTransactionsDay } from "@/utils/group-transactions-by-day";
import type { Transaction } from "@/types/database";
import { useAmountFormat } from "@/hooks/use-amount-format";

type CustomerVisitsListProps = {
  groupedVisits: GroupedTransactionsDay[];
  transactions: Transaction[];
  serviceNames: Map<string, string>;
  timeZone: string;
};

export function CustomerVisitsList({
  groupedVisits,
  transactions,
  serviceNames,
  timeZone,
}: CustomerVisitsListProps) {
  const { formatNpr } = useAmountFormat();
  const visitCount = countDistinctVisits(toIncomeVisitRows(transactions));

  if (visitCount === 0) {
    return (
      <div>
        <p className="font-body text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase">
          Visit history
        </p>
        <div className="mt-3 rounded-xl bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant">
          No visits recorded yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="font-body text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase">
        Visit history
      </p>
      <div className="mt-3 flex flex-col gap-4">
        {groupedVisits.map(({ dayKey, label, transactions: dayTransactions }) => (
          <div key={dayKey}>
            <TimelineDateDivider label={label} />
            <div className="mb-2 flex flex-col gap-2 pt-4 lg:mb-4 lg:gap-3 lg:pt-3">
              {dayTransactions.map((tx) => {
                const title = incomeTransactionTitle(tx, serviceNames);
                const tip = Number(tx.tip);
                const total = Number(tx.total);
                const time = formatTimeInBusinessZone(tx.transaction_date, timeZone);
                const pendingSync = isPendingSyncTransactionId(tx.id);

                return (
                  <TransactionActivityCard
                    key={tx.id}
                    title={title}
                    time={time}
                    paymentMethod={tx.payment_method}
                    isIncome
                    mobileTotal={total}
                    amountLabel="Amount / Tip"
                    amount={
                      <>
                        <span className="text-on-secondary-container">
                          {formatNpr(total - tip)}
                        </span>
                        {tip > 0 ? (
                          <span className="text-sm font-normal text-on-surface-variant">
                            {" "}
                            + {formatNpr(tip)}
                          </span>
                        ) : null}
                      </>
                    }
                    icon={Scissors}
                    iconWrapClassName="bg-secondary-container text-on-secondary-container"
                    borderClassName="border-l-secondary"
                    pendingSync={pendingSync}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
