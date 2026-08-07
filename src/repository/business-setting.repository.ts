import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type { BusinessSetting, Database } from "@/types/database";

export class BusinessSettingRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByBusinessIds(businessIds: string[]): Promise<BusinessSetting[]> {
    if (businessIds.length === 0) return [];
    const { data, error } = await this.supabase
      .from("business_settings")
      .select("*")
      .in("business_id", businessIds);

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async upsertMany(
    rows: Pick<BusinessSetting, "business_id" | "setting_key" | "setting_value">[],
  ): Promise<void> {
    if (rows.length === 0) return;
    const { error } = await this.supabase.from("business_settings").upsert(rows, {
      onConflict: "business_id,setting_key",
    });
    if (error) mapRepositoryError(error);
  }

  async listByBusinessId(businessId: string): Promise<BusinessSetting[]> {
    const { data, error } = await this.supabase
      .from("business_settings")
      .select("*")
      .eq("business_id", businessId);

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async get(
    businessId: string,
    settingKey: string,
  ): Promise<BusinessSetting | null> {
    const { data, error } = await this.supabase
      .from("business_settings")
      .select("*")
      .eq("business_id", businessId)
      .eq("setting_key", settingKey)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async upsert(
    businessId: string,
    settingKey: string,
    settingValue: string,
  ): Promise<BusinessSetting> {
    const { data, error } = await this.supabase
      .from("business_settings")
      .upsert(
        {
          business_id: businessId,
          setting_key: settingKey,
          setting_value: settingValue,
        },
        { onConflict: "business_id,setting_key" },
      )
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async delete(businessId: string, settingKey: string): Promise<void> {
    const { error } = await this.supabase
      .from("business_settings")
      .delete()
      .eq("business_id", businessId)
      .eq("setting_key", settingKey);

    if (error) mapRepositoryError(error);
  }
}
