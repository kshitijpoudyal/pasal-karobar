import type { DashboardGranularity } from "@/utils/date-ranges";
import {
  coalescePeakAnalysis,
  EMPTY_PEAK_ANALYSIS,
  type PeakAnalysisInsights,
} from "@/services/peak-analysis";

export type TrajectoryPoint = {
  label: string;
  income: number;
  expense: number;
};

export type MonthHeatmapDay = {
  dateKey: string;
  dayOfMonth: number;
  visitCount: number;
  revenue: number;
  inMonth: boolean;
};

export type MonthDayHeatmap = {
  monthLabel: string;
  days: MonthHeatmapDay[];
};

export type PeriodComparison = {
  priorFrom: string;
  priorTo: string;
  priorNet: number;
  netDelta: number;
  netDeltaPercent: number | null;
};

export type DashboardSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  patronCount: number;
  averageSale: number;
  dailyNetRevenue: number;
  topServiceName: string | null;
  topServiceCount: number;
  serviceRevenue: { name: string; total: number }[];
  trajectory: TrajectoryPoint[];
  peakAnalysis: PeakAnalysisInsights;
  monthDayHeatmap: MonthDayHeatmap | null;
  periodComparison: PeriodComparison | null;
};

export type DashboardSummaryParams = {
  from?: string;
  to?: string;
  granularity?: DashboardGranularity;
  /** @deprecated use granularity */
  period?: never;
};

export const EMPTY_DASHBOARD_SUMMARY: DashboardSummary = {
  revenue: 0,
  expenses: 0,
  profit: 0,
  patronCount: 0,
  averageSale: 0,
  dailyNetRevenue: 0,
  topServiceName: null,
  topServiceCount: 0,
  serviceRevenue: [],
  trajectory: [],
  peakAnalysis: EMPTY_PEAK_ANALYSIS,
  monthDayHeatmap: null,
  periodComparison: null,
};

/** Fills gaps from stale query cache after summary shape changes. */
export function normalizeDashboardSummary(
  data: Partial<DashboardSummary> | undefined,
): DashboardSummary {
  if (!data) return EMPTY_DASHBOARD_SUMMARY;
  return {
    ...EMPTY_DASHBOARD_SUMMARY,
    ...data,
    trajectory: data.trajectory ?? [],
    peakAnalysis: coalescePeakAnalysis(data.peakAnalysis),
    monthDayHeatmap: data.monthDayHeatmap ?? null,
    periodComparison: data.periodComparison ?? null,
  };
}

export type { PeakAnalysisInsights } from "@/services/peak-analysis";
