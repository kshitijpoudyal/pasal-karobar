import type { Transaction } from "@/types/database";
import {
  DEFAULT_BUSINESS_TIMEZONE,
  groupTransactionsByDayInTimeZone,
} from "@/utils/business-datetime";

export function groupTransactionsByDay(
  transactions: Transaction[],
  timeZone: string = DEFAULT_BUSINESS_TIMEZONE,
): [string, Transaction[]][] {
  return groupTransactionsByDayInTimeZone(transactions, timeZone);
}
