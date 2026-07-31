export type BusiestDayOfWeekInsight = {
  dayLabel: string;
  visitCount: number;
  revenue: number;
  periodVisitCount: number;
};

export type BusiestWeekOfMonthInsight = {
  weekLabel: string;
  rangeLabel: string;
  monthLabel: string;
  visitCount: number;
  revenue: number;
};

export type BusiestHourRangeInsight = {
  windowStart: string;
  windowEnd: string;
  visitCount: number;
  periodVisitCount: number;
};

export type PeakAnalysisInsights = {
  busiestDayOfWeek: BusiestDayOfWeekInsight | null;
  busiestWeekOfMonth: BusiestWeekOfMonthInsight | null;
  busiestHourRange: BusiestHourRangeInsight | null;
};

export const EMPTY_PEAK_ANALYSIS: PeakAnalysisInsights = {
  busiestDayOfWeek: null,
  busiestWeekOfMonth: null,
  busiestHourRange: null,
};

export function coalescePeakAnalysis(
  value: PeakAnalysisInsights | null | undefined,
): PeakAnalysisInsights {
  if (value != null && typeof value === "object") {
    return {
      busiestDayOfWeek: value.busiestDayOfWeek ?? null,
      busiestWeekOfMonth: value.busiestWeekOfMonth ?? null,
      busiestHourRange: value.busiestHourRange ?? null,
    };
  }
  return EMPTY_PEAK_ANALYSIS;
}
