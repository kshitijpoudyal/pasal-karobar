import type { CalendarSystem } from "@/constants/calendar-system";
import type { Transaction } from "@/types/database";
import {
  DEFAULT_BUSINESS_TIMEZONE,
  formatDayLabelForDateKey,
  groupTransactionsByDayInTimeZone,
} from "@/utils/business-datetime";

export type GroupedTransactionsDay = {
  dayKey: string;
  label: string;
  transactions: Transaction[];
};

export function groupTransactionsByDay(
  transactions: Transaction[],
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
): [string, Transaction[]][] {
  return groupTransactionsByDayInTimeZone(transactions, timeZone);
}

export function groupTransactionsByDayWithLabels(
  transactions: Transaction[],
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
  calendarSystem: CalendarSystem = "AD",
  now: Date = new Date(),
): GroupedTransactionsDay[] {
  return groupTransactionsByDayInTimeZone(transactions, timeZone).map(
    ([dayKey, dayTransactions]) => ({
      dayKey,
      label: formatDayLabelForDateKey(dayKey, timeZone, now, calendarSystem),
      transactions: dayTransactions,
    }),
  );
}
