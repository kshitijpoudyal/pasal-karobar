import type { BusinessRepository } from "@/repository/business.repository";
import type { BusinessSettingRepository } from "@/repository/business-setting.repository";
import type { ExpenseCategoryService } from "@/services/expense-category.service";
import { applyNewBusinessOnboarding } from "@/services/business-onboarding";
import { hydrateBusiness } from "@/services/business-profile-settings";
import type { ServiceCatalogService } from "@/services/service-catalog.service";
import type { OwnerGuard } from "@/services/owner-guard";
import {
  createBusinessSchema,
  updateBusinessSchema,
  type CreateBusinessInput,
  type UpdateBusinessInput,
} from "@/services/schemas";
import type { Business, BusinessSetting } from "@/types/database";
import { profilePatchToUpserts } from "@/services/business-profile-settings";

export class BusinessService {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly businessSettingRepository: BusinessSettingRepository,
    private readonly serviceCatalog: ServiceCatalogService,
    private readonly expenseCategory: ExpenseCategoryService,
    private readonly ownerGuard: OwnerGuard,
  ) {}

  async getById(id: string): Promise<Business | null> {
    const record = await this.businessRepository.findById(id);
    if (!record) return null;
    const settings = await this.businessSettingRepository.listByBusinessId(id);
    return hydrateBusiness(record, settings);
  }

  async listForCurrentUser(): Promise<Business[]> {
    const records = await this.businessRepository.listForCurrentUser();
    if (records.length === 0) return [];
    const settings = await this.businessSettingRepository.listByBusinessIds(
      records.map((r) => r.id),
    );
    return records.map((record) =>
      hydrateBusiness(record, settingsForBusiness(settings, record.id)),
    );
  }

  async create(input: CreateBusinessInput): Promise<Business> {
    const payload = createBusinessSchema.parse(input);
    const record = await this.businessRepository.create(payload);
    await applyNewBusinessOnboarding(record.id, payload, {
      businessSettingRepository: this.businessSettingRepository,
      serviceCatalog: this.serviceCatalog,
      expenseCategory: this.expenseCategory,
    });
    return (await this.getById(record.id))!;
  }

  async update(id: string, input: UpdateBusinessInput): Promise<Business> {
    await this.ownerGuard.requireOwner(id);
    const payload = updateBusinessSchema.parse(input);
    const { name, business_type, calendar_system, currency, timezone } = payload;

    if (name !== undefined) {
      await this.businessRepository.update(id, { name });
    }

    const upserts = profilePatchToUpserts(id, {
      business_type,
      calendar_system,
      currency,
      timezone,
    });
    if (upserts.length > 0) {
      await this.businessSettingRepository.upsertMany(upserts);
    }

    return (await this.getById(id))!;
  }

  async delete(id: string): Promise<void> {
    await this.ownerGuard.requireOwner(id);
    await this.businessRepository.delete(id);
  }
}

function settingsForBusiness(
  settings: BusinessSetting[],
  businessId: string,
): BusinessSetting[] {
  return settings.filter((s) => s.business_id === businessId);
}
