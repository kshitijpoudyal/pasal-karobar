import type { BusinessSettingRepository } from "@/repository/business-setting.repository";
import {
  upsertBusinessSettingSchema,
  type UpsertBusinessSettingInput,
} from "@/services/schemas";
import type { BusinessSetting } from "@/types/database";

export class BusinessSettingService {
  constructor(private readonly businessSettingRepository: BusinessSettingRepository) {}

  async listByBusinessId(businessId: string): Promise<BusinessSetting[]> {
    return this.businessSettingRepository.listByBusinessId(businessId);
  }

  async get(businessId: string, settingKey: string): Promise<BusinessSetting | null> {
    return this.businessSettingRepository.get(businessId, settingKey);
  }

  async upsert(input: UpsertBusinessSettingInput): Promise<BusinessSetting> {
    const payload = upsertBusinessSettingSchema.parse(input);
    return this.businessSettingRepository.upsert(
      payload.business_id,
      payload.setting_key,
      payload.setting_value,
    );
  }

  async delete(businessId: string, settingKey: string): Promise<void> {
    await this.businessSettingRepository.delete(businessId, settingKey);
  }
}
