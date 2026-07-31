import { Package, Sparkles } from "lucide-react";

import { PerformanceTrajectoryCard } from "@/features/dashboard/components/performance-trajectory-card";
import type {
  PeakHourInsight,
  TrajectoryPoint,
} from "@/services/dashboard.service";
import { cn } from "@/lib/utils";

type PeakAnalysisCardProps = {
  insight: PeakHourInsight | null;
};

function PeakAnalysisCard({ insight }: PeakAnalysisCardProps) {
  const hasInsight = insight !== null;

  return (
    <div
      className={cn(
        "squircle relative overflow-hidden border-none bg-[#F3E5F5] p-8 text-[#4A148C] shadow-sm",
        hasInsight &&
          "cursor-pointer transition-transform active:scale-[0.98]",
      )}
    >
      <div className="relative z-10">
        <p className="text-label-sm mb-3 font-bold tracking-widest opacity-70">
          Peak Analysis
        </p>
        {hasInsight ? (
          <>
            <h4 className="mb-2 text-2xl font-bold">
              {insight.peakDayLabel} peak
            </h4>
            <p className="text-sm leading-relaxed opacity-90">
              {insight.visitCountOnPeakDay} visit
              {insight.visitCountOnPeakDay === 1 ? "" : "s"} on{" "}
              {insight.peakDayLabel}s in this period ({insight.periodIncomeCount}{" "}
              total). Busiest window: {insight.windowStart} – {insight.windowEnd}.
              Consider aligning staff for that block.
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed opacity-90">
            Record income in this period to see peak hours.
          </p>
        )}
      </div>
      <Sparkles
        className="absolute -right-6 -bottom-6 size-[140px] opacity-10"
        strokeWidth={1}
      />
    </div>
  );
}

type CuratedInsightsPanelProps = {
  peakHourInsight: PeakHourInsight | null;
};

export function CuratedInsightsPanel({
  peakHourInsight,
}: CuratedInsightsPanelProps) {
  return (
    <div className="col-span-4 space-y-8">
      <h3 className="font-headline-md text-headline-md text-on-surface">
        Curated Insights
      </h3>
      <PeakAnalysisCard insight={peakHourInsight} />
      <div className="squircle relative cursor-pointer overflow-hidden border-none bg-[#E8F5E9] p-8 text-[#1B5E20] shadow-sm transition-transform active:scale-[0.98]">
        <div className="relative z-10">
          <p className="text-label-sm mb-3 font-bold tracking-widest opacity-70">
            Resource Warning
          </p>
          <h4 className="mb-2 text-2xl font-bold">Stock Critical: Pomade</h4>
          <p className="text-sm leading-relaxed opacity-90">
            Inventory forecast suggests replenishment before the weekend cycle
            commences.
          </p>
        </div>
        <Package
          className="absolute -right-6 -bottom-6 size-[140px] opacity-10"
          strokeWidth={1}
        />
      </div>
    </div>
  );
}

type InsightsSectionProps = {
  trajectory: TrajectoryPoint[];
  peakHourInsight: PeakHourInsight | null;
};

export function InsightsSection({
  trajectory,
  peakHourInsight,
}: InsightsSectionProps) {
  return (
    <section>
      <div className="grid grid-cols-12 gap-8">
        <PerformanceTrajectoryCard points={trajectory} />
        <CuratedInsightsPanel peakHourInsight={peakHourInsight} />
      </div>
    </section>
  );
}
