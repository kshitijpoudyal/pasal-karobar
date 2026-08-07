"use client";

import { businessTimeZoneShortLabel } from "@/utils/business-datetime";
import { useBusinessTimeZone } from "@/hooks/use-business-timezone";

type BusinessTimeZoneCaptionProps = {
  className?: string;
};

export function BusinessTimeZoneCaption({
  className,
}: BusinessTimeZoneCaptionProps) {
  const timeZone = useBusinessTimeZone();
  const label = businessTimeZoneShortLabel(timeZone);

  return (
    <p
      className={
        className ??
        "text-sm text-on-surface-variant"
      }
    >
      Times shown in {label}
    </p>
  );
}
