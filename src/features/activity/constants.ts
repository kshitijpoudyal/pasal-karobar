import type {
  ActivityCategoryFilter,
  ActivityTimeframe,
} from "@/utils/date-ranges";

export type { ActivityCategoryFilter, ActivityTimeframe };

export const TIMEFRAMES = [
  "Today",
  "Yesterday",
  "This Week",
] as const satisfies readonly ActivityTimeframe[];
