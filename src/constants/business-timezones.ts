import { DEFAULT_BUSINESS_TIMEZONE } from "@/utils/business-datetime";

export { DEFAULT_BUSINESS_TIMEZONE };

/** Curated IANA zones for shop settings (default: Kathmandu). */
export const BUSINESS_TIMEZONE_OPTIONS = [
  { value: "Asia/Kathmandu", label: "Kathmandu, Nepal" },
  { value: "Asia/Kolkata", label: "India (Kolkata)" },
  { value: "Asia/Dhaka", label: "Bangladesh (Dhaka)" },
  { value: "Asia/Colombo", label: "Sri Lanka (Colombo)" },
  { value: "Asia/Bangkok", label: "Thailand (Bangkok)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Dubai", label: "UAE (Dubai)" },
  { value: "Asia/Tokyo", label: "Japan (Tokyo)" },
  { value: "Europe/London", label: "United Kingdom (London)" },
  { value: "America/New_York", label: "US Eastern (New York)" },
  { value: "America/Chicago", label: "US Central (Chicago)" },
  { value: "America/Los_Angeles", label: "US Pacific (Los Angeles)" },
  { value: "UTC", label: "UTC" },
] as const;

export function businessTimezoneLabel(iana: string): string {
  const match = BUSINESS_TIMEZONE_OPTIONS.find((o) => o.value === iana);
  return match?.label ?? iana;
}

export function timezoneOptionsIncludingCurrent(current: string | undefined) {
  const trimmed = current?.trim();
  if (!trimmed) return [...BUSINESS_TIMEZONE_OPTIONS];
  if (BUSINESS_TIMEZONE_OPTIONS.some((o) => o.value === trimmed)) {
    return [...BUSINESS_TIMEZONE_OPTIONS];
  }
  return [
    { value: trimmed, label: `${trimmed} (saved)` },
    ...BUSINESS_TIMEZONE_OPTIONS,
  ];
}
