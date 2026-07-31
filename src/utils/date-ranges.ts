import {
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subYears,
  format,
  parseISO,
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

export type DashboardPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/** Max year buckets shown on the yearly view (current year + prior years). */
export const DASHBOARD_YEARLY_LOOKBACK = 5;

export function getDashboardDateRange(period: DashboardPeriod): {
  from: string;
  to: string;
} {
  const now = new Date();
  const to = endOfDay(now).toISOString();
  switch (period) {
    case "DAILY":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        to,
      };
    case "WEEKLY":
      return {
        from: startOfMonth(now).toISOString(),
        to,
      };
    case "MONTHLY":
      return {
        from: startOfYear(now).toISOString(),
        to,
      };
    case "YEARLY": {
      const from = startOfYear(
        subYears(now, DASHBOARD_YEARLY_LOOKBACK - 1),
      );
      return { from: from.toISOString(), to };
    }
  }
}

export function formatDashboardPeriodLabel(
  period: DashboardPeriod,
  range: { from: string; to: string },
): string {
  const from = parseISO(range.from);
  const to = parseISO(range.to);

  if (period === "DAILY") {
    return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;
  }

  if (period === "WEEKLY") {
    return format(from, "MMMM yyyy");
  }

  if (period === "MONTHLY") {
    return format(from, "yyyy");
  }

  if (period === "YEARLY") {
    if (from.getFullYear() === to.getFullYear()) {
      return format(from, "yyyy");
    }
    return `${format(from, "yyyy")} – ${format(to, "yyyy")}`;
  }

  if (
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth()
  ) {
    return `${format(from, "MMM d")} – ${format(to, "d, yyyy")}`;
  }

  if (from.getFullYear() === to.getFullYear()) {
    return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;
  }

  return `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`;
}
