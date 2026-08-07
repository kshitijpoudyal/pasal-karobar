"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  ActivityFilters,
  DailyNetRevenueCard,
} from "@/features/activity/components/activity-filters";
import type { useActivityPage } from "@/features/activity/hooks/use-activity-page";

type ActivityHeaderChromeProps = {
  activity: ReturnType<typeof useActivityPage>;
  collapsed: boolean;
  layout: "mobile" | "tablet";
};

const SHELL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function ActivityHeaderChrome({
  activity,
  collapsed,
  layout,
}: ActivityHeaderChromeProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    function measure() {
      setMeasuredHeight(el!.scrollHeight);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    activity.timeframe,
    activity.category,
    activity.paymentMethod,
    activity.netRevenue,
    layout,
  ]);

  const marginBottom = layout === "mobile" ? 16 : 24;
  const durationMs = collapsed ? 460 : 540;

  return (
    <div
      className={cn(
        "activity-header-collapse-shell shrink-0 overflow-hidden motion-reduce:transition-none",
        collapsed && "pointer-events-none",
      )}
      style={{
        maxHeight: collapsed ? 0 : measuredHeight || undefined,
        marginBottom: collapsed ? 0 : marginBottom,
        opacity: collapsed ? 0 : 1,
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: SHELL_EASE,
      }}
      aria-hidden={collapsed}
    >
      <div
        ref={innerRef}
        className="activity-header-collapse-inner motion-reduce:transition-none"
        style={{
          transform: collapsed
            ? "translate3d(0, -10px, 0)"
            : "translate3d(0, 0, 0)",
          transitionDuration: `${durationMs}ms`,
          transitionTimingFunction: SHELL_EASE,
        }}
      >
        {layout === "mobile" ? (
          <div className="flex flex-col gap-6">
            <DailyNetRevenueCard netRevenue={activity.netRevenue} />
            <ActivityFilters
              timeframe={activity.timeframe}
              category={activity.category}
              paymentMethod={activity.paymentMethod}
              onTimeframeChange={activity.setTimeframe}
              onCategoryChange={activity.setCategory}
              onPaymentMethodChange={activity.setPaymentMethod}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <ActivityFilters
              timeframe={activity.timeframe}
              category={activity.category}
              paymentMethod={activity.paymentMethod}
              onTimeframeChange={activity.setTimeframe}
              onCategoryChange={activity.setCategory}
              onPaymentMethodChange={activity.setPaymentMethod}
            />
            <DailyNetRevenueCard netRevenue={activity.netRevenue} />
          </div>
        )}
      </div>
    </div>
  );
}
