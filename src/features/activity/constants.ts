import type {
  ActivityCategoryFilter,
  ActivityTimeframe,
} from "@/utils/date-ranges";

export type { ActivityCategoryFilter, ActivityTimeframe };

export const TIMEFRAMES = [
  "This Week",
  "This Month",
  "This Year",
] as const satisfies readonly ActivityTimeframe[];
