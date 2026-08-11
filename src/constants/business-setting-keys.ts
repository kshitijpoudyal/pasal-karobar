/** Keys in `business_settings` for shop profile (formerly on `business`). */
export const BUSINESS_SETTING_KEYS = {
  businessType: "business_type",
  calendarSystem: "calendar_system",
  currency: "currency",
  timezone: "timezone",
} as const;

export type BusinessProfileSettingKey =
  (typeof BUSINESS_SETTING_KEYS)[keyof typeof BUSINESS_SETTING_KEYS];
