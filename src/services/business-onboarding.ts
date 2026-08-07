import type { BusinessSettingRepository } from "@/repository/business-setting.repository";
import type { ExpenseCategoryService } from "@/services/expense-category.service";
import {
  DEFAULT_BOOTSTRAP_BUSINESS,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_SERVICES,
} from "@/services/onboarding-defaults";
import {
  defaultProfileUpserts,
  profilePatchToUpserts,
} from "@/services/business-profile-settings";
import type { ServiceCatalogService } from "@/services/service-catalog.service";
import type { CreateBusinessInput } from "@/services/schemas";

type OnboardingDeps = {
  businessSettingRepository: BusinessSettingRepository;
  serviceCatalog: ServiceCatalogService;
  expenseCategory: ExpenseCategoryService;
};

/** Profile settings + starter services/categories for a newly created business. */
export async function applyNewBusinessOnboarding(
  businessId: string,
  input: CreateBusinessInput,
  deps: OnboardingDeps,
): Promise<void> {
  await ensureDefaultProfileSettings(businessId, input, deps.businessSettingRepository);
  await seedDefaultCatalogIfEmpty(businessId, deps);
}

async function ensureDefaultProfileSettings(
  businessId: string,
  input: CreateBusinessInput,
  repository: BusinessSettingRepository,
): Promise<void> {
  await repository.upsertMany(
    profilePatchToUpserts(businessId, {
      business_type: input.business_type,
      currency: input.currency,
      timezone: input.timezone,
    }),
  );

  const existing = await repository.listByBusinessId(businessId);
  const keys = new Set(existing.map((s) => s.setting_key));
  const missing = defaultProfileUpserts(businessId).filter(
    (row) => !keys.has(row.setting_key),
  );
  if (missing.length > 0) {
    await repository.upsertMany(missing);
  }
}

async function seedDefaultCatalogIfEmpty(
  businessId: string,
  deps: OnboardingDeps,
): Promise<void> {
  const [existingServices, existingCategories] = await Promise.all([
    deps.serviceCatalog.listByBusinessId(businessId),
    deps.expenseCategory.listByBusinessId(businessId),
  ]);

  if (existingServices.length === 0) {
    await Promise.all(
      DEFAULT_SERVICES.map((service) =>
        deps.serviceCatalog.create({
          business_id: businessId,
          name: service.name,
          default_price: service.default_price,
          icon: service.icon,
          display_order: service.display_order,
          is_active: true,
        }),
      ),
    );
  }

  if (existingCategories.length === 0) {
    await Promise.all(
      DEFAULT_EXPENSE_CATEGORIES.map((category) =>
        deps.expenseCategory.create({
          business_id: businessId,
          name: category.name,
          display_order: category.display_order,
          is_active: true,
        }),
      ),
    );
  }
}

export { DEFAULT_BOOTSTRAP_BUSINESS };
