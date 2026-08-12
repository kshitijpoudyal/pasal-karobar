import { BUSINESS_SETTING_KEYS } from "@/constants/business-setting-keys";
import {
  DEFAULT_CALENDAR_SYSTEM,
  resolveCalendarSystem,
} from "@/constants/calendar-system";
import { businessTypeSchema } from "@/services/schemas";
import type {
  Business,
  BusinessRecord,
  BusinessSetting,
  BusinessType,
} from "@/types/database";
import { DEFAULT_BUSINESS_TIMEZONE } from "@/utils/business-datetime";

export const DEFAULT_BUSINESS_CURRENCY = "NPR";
export const DEFAULT_BUSINESS_TYPE: BusinessType = "BARBER";

function settingsMap(settings: BusinessSetting[]): Map<string, string> {
  return new Map(settings.map((s) => [s.setting_key, s.setting_value]));
}

export function hydrateBusiness(
  record: BusinessRecord,
  settings: BusinessSetting[],
): Business {
  const map = settingsMap(settings);
  const typeRaw = map.get(BUSINESS_SETTING_KEYS.businessType);
  const business_type = typeRaw
    ? businessTypeSchema.parse(typeRaw)
    : DEFAULT_BUSINESS_TYPE;

  return {
    ...record,
    business_type,
    calendar_system: resolveCalendarSystem(
      map.get(BUSINESS_SETTING_KEYS.calendarSystem),
    ),
    currency:
      map.get(BUSINESS_SETTING_KEYS.currency)?.trim() || DEFAULT_BUSINESS_CURRENCY,
    timezone:
      map.get(BUSINESS_SETTING_KEYS.timezone)?.trim() || DEFAULT_BUSINESS_TIMEZONE,
  };
}

export function profileFieldsFromSettings(
  settings: BusinessSetting[],
): Pick<Business, "business_type" | "calendar_system" | "currency" | "timezone"> {
  return hydrateBusiness(
    {
      id: "",
      name: "",
      created_at: "",
      updated_at: "",
    },
    settings,
  );
}

export type BusinessProfilePatch = Partial<
  Pick<Business, "business_type" | "calendar_system" | "currency" | "timezone">
>;

export function profilePatchToUpserts(
  businessId: string,
  patch: BusinessProfilePatch,
): { business_id: string; setting_key: string; setting_value: string }[] {
  const rows: { business_id: string; setting_key: string; setting_value: string }[] =
    [];
  if (patch.business_type !== undefined) {
    rows.push({
      business_id: businessId,
      setting_key: BUSINESS_SETTING_KEYS.businessType,
      setting_value: patch.business_type,
    });
  }
  if (patch.calendar_system !== undefined) {
    rows.push({
      business_id: businessId,
      setting_key: BUSINESS_SETTING_KEYS.calendarSystem,
      setting_value: patch.calendar_system,
    });
  }
  if (patch.currency !== undefined) {
    rows.push({
      business_id: businessId,
      setting_key: BUSINESS_SETTING_KEYS.currency,
      setting_value: patch.currency,
    });
  }
  if (patch.timezone !== undefined) {
    rows.push({
      business_id: businessId,
      setting_key: BUSINESS_SETTING_KEYS.timezone,
      setting_value: patch.timezone,
    });
  }
  return rows;
}

export function defaultProfileUpserts(businessId: string): {
  business_id: string;
  setting_key: string;
  setting_value: string;
}[] {
  return profilePatchToUpserts(businessId, {
    business_type: DEFAULT_BUSINESS_TYPE,
    calendar_system: DEFAULT_CALENDAR_SYSTEM,
    currency: DEFAULT_BUSINESS_CURRENCY,
    timezone: DEFAULT_BUSINESS_TIMEZONE,
  });
}
