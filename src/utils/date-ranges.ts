import {
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";

export type ActivityTimeframe = "Today" | "Yesterday" | "This Week";

export type ActivityCategoryFilter = "All" | "Income" | "Expense";

export function getActivityDateRange(timeframe: ActivityTimeframe): {
  from: string;
  to: string;
} {
  const now = new Date();
  switch (timeframe) {
    case "Today":
      return {
        from: startOfDay(now).toISOString(),
        to: endOfDay(now).toISOString(),
      };
    case "Yesterday": {
      const day = subDays(now, 1);
      return {
        from: startOfDay(day).toISOString(),
        to: endOfDay(day).toISOString(),
      };
    }
    case "This Week":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
  }
}

export type DashboardPeriod =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export function getDashboardDateRange(period: DashboardPeriod): {
  from: string;
  to: string;
} {
  const now = new Date();
  const to = endOfDay(now).toISOString();
  switch (period) {
    case "DAILY":
      return { from: startOfDay(now).toISOString(), to };
    case "WEEKLY":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        to,
      };
    case "MONTHLY": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: from.toISOString(), to };
    }
    case "QUARTERLY": {
      const quarter = Math.floor(now.getMonth() / 3);
      const from = new Date(now.getFullYear(), quarter * 3, 1);
      return { from: from.toISOString(), to };
    }
    case "YEARLY": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: from.toISOString(), to };
    }
  }
}
