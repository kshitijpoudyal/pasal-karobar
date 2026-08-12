"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarDays, Clock, Sparkles } from "lucide-react";

import { PerformanceTrajectoryCard } from "@/features/dashboard/components/performance-trajectory-card";
import {
  coalescePeakAnalysis,
  EMPTY_PEAK_ANALYSIS,
  type PeakAnalysisInsights,
} from "@/services/peak-analysis";
import type { TrajectoryPoint } from "@/services/dashboard-summary";
import { useAmountFormat } from "@/hooks/use-amount-format";
import { cn } from "@/lib/utils";

type InsightCardProps = {
  category: string;
  title: string;
  body: string;
  icon: LucideIcon;
  className: string;
  iconClassName?: string;
  mobile?: boolean;
};

function InsightCard({
  category,
  title,
  body,
  icon: Icon,
  className,
  iconClassName,
  mobile = false,
}: InsightCardProps) {
  if (mobile) {
    return (
      <div
        className={cn(
          "squircle flex items-start gap-4 bg-surface-container p-5 shadow-natural-ink lg:hidden",
          className,
        )}
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary-container">
          <Icon className="size-6 text-on-secondary-container" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-label-sm mb-1 opacity-70">{category}</p>
          <h4 className="font-headline mb-1 text-lg font-medium">{title}</h4>
          <p className="text-sm leading-relaxed text-on-surface-variant">{body}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "squircle relative overflow-hidden border-none p-6 shadow-sm md:p-8",
        className,
      )}
    >
      <div className="relative z-10">
        <p className="text-label-sm mb-2 font-bold tracking-widest opacity-70">
          {category}
        </p>
        <h4 className="mb-2 text-xl font-bold md:text-2xl">{title}</h4>
        <p className="text-sm leading-relaxed opacity-90">{body}</p>
      </div>
      <Icon
        className={cn(
          "absolute -right-6 -bottom-6 size-[120px] opacity-10 md:size-[140px]",
          iconClassName,
        )}
        strokeWidth={1}
      />
    </div>
  );
}

type CuratedInsightsPanelProps = {
  peakAnalysis?: PeakAnalysisInsights | null;
};

export function CuratedInsightsPanel(props: CuratedInsightsPanelProps) {
  const { formatCompactNpr } = useAmountFormat();
  const peak = coalescePeakAnalysis(props.peakAnalysis) ?? EMPTY_PEAK_ANALYSIS;
  const busiestDayOfWeek = peak.busiestDayOfWeek;
  const busiestWeekOfMonth = peak.busiestWeekOfMonth;
  const busiestHourRange = peak.busiestHourRange;

  const dayBody = busiestDayOfWeek
    ? `${busiestDayOfWeek.visitCount} customer visit${busiestDayOfWeek.visitCount === 1 ? "" : "s"} on ${busiestDayOfWeek.dayLabel}s (${formatCompactNpr(busiestDayOfWeek.revenue)} income on that weekday). ${busiestDayOfWeek.periodVisitCount} total visits in this period.`
    : "Record income in this period to see your busiest weekday.";

  const weekBody = busiestWeekOfMonth
    ? `${busiestWeekOfMonth.visitCount} visit${busiestWeekOfMonth.visitCount === 1 ? "" : "s"} (${formatCompactNpr(busiestWeekOfMonth.revenue)} income) during ${busiestWeekOfMonth.rangeLabel} in ${busiestWeekOfMonth.monthLabel}.`
    : "No income in the current month yet for week-level peaks.";

  const hourBody = busiestHourRange
    ? `${busiestHourRange.visitCount} visit${busiestHourRange.visitCount === 1 ? "" : "s"} between ${busiestHourRange.windowStart} and ${busiestHourRange.windowEnd} across this period (${busiestHourRange.periodVisitCount} total). Staff up for that window.`
    : "Record income in this period to see peak hour ranges.";

  return (
    <div className="col-span-12 min-w-0 space-y-4 xl:col-span-4 xl:space-y-6">
      <h3 className="font-headline-md text-headline-md text-on-surface">
        Peak Analysis
      </h3>
      <div className="flex flex-col gap-4 lg:hidden">
        <InsightCard
          category="Busiest day of week"
          title={busiestDayOfWeek?.dayLabel ?? "—"}
          body={dayBody}
          icon={Sparkles}
          className="bg-[#F3E5F5] text-[#4A148C]"
          mobile
        />
        <InsightCard
          category="Busiest week of month"
          title={
            busiestWeekOfMonth
              ? `${busiestWeekOfMonth.weekLabel} · ${busiestWeekOfMonth.rangeLabel}`
              : "—"
          }
          body={weekBody}
          icon={CalendarDays}
          className="bg-[#E3F2FD] text-[#0D47A1]"
          mobile
        />
        <InsightCard
          category="Busiest hour range"
          title={
            busiestHourRange
              ? `${busiestHourRange.windowStart} – ${busiestHourRange.windowEnd}`
              : "—"
          }
          body={hourBody}
          icon={Clock}
          className="bg-[#FFF3E0] text-[#E65100]"
          mobile
        />
      </div>
      <div className="hidden space-y-4 lg:block lg:space-y-6">
        <InsightCard
          category="Busiest day of week"
          title={busiestDayOfWeek?.dayLabel ?? "—"}
          body={dayBody}
          icon={Sparkles}
          className="bg-[#F3E5F5] text-[#4A148C]"
        />
        <InsightCard
          category="Busiest week of month"
          title={
            busiestWeekOfMonth
              ? `${busiestWeekOfMonth.weekLabel} · ${busiestWeekOfMonth.rangeLabel}`
              : "—"
          }
          body={weekBody}
          icon={CalendarDays}
          className="bg-[#E3F2FD] text-[#0D47A1]"
        />
        <InsightCard
          category="Busiest hour range"
          title={
            busiestHourRange
              ? `${busiestHourRange.windowStart} – ${busiestHourRange.windowEnd}`
              : "—"
          }
          body={hourBody}
          icon={Clock}
          className="bg-[#FFF3E0] text-[#E65100]"
        />
      </div>
    </div>
  );
}

type InsightsSectionProps = {
  trajectory: TrajectoryPoint[];
  peakAnalysis?: PeakAnalysisInsights | null;
  chartTitle?: string;
};

export function InsightsSection({
  trajectory,
  peakAnalysis,
  chartTitle,
}: InsightsSectionProps) {
  return (
    <section>
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        <PerformanceTrajectoryCard points={trajectory} title={chartTitle} />
        <CuratedInsightsPanel peakAnalysis={peakAnalysis} />
      </div>
    </section>
  );
}
