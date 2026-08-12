import { formatCompactNpr } from "@/utils/format";
import { formatTimeInBusinessZone } from "@/utils/business-datetime";
import type { GroupedTransactionsDay } from "@/utils/group-transactions-by-day";

type CustomerVisitsListProps = {
  groupedVisits: GroupedTransactionsDay[];
  timeZone: string;
};

export function CustomerVisitsList({
  groupedVisits,
  timeZone,
}: CustomerVisitsListProps) {
  const visitCount = groupedVisits.reduce(
    (sum, group) => sum + group.transactions.length,
    0,
  );

  return (
    <div>
      <p className="font-body text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase">
        Visit history
      </p>
      <ul className="mt-3 space-y-2">
        {visitCount === 0 ? (
          <li className="rounded-xl bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant">
            No visits recorded yet.
          </li>
        ) : (
          groupedVisits.flatMap((group) =>
            group.transactions.map((tx) => (
              <li
                key={tx.id}
                className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm"
              >
                <span className="font-medium text-on-surface">
                  {formatCompactNpr(Number(tx.total))}
                </span>
                <span className="text-on-surface-variant">
                  {" "}
                  · {group.label}{" "}
                  {formatTimeInBusinessZone(tx.transaction_date, timeZone)}
                </span>
              </li>
            )),
          )
        )}
      </ul>
    </div>
  );
}
