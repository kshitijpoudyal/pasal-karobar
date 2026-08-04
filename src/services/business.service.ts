import type { BusinessRepository } from "@/repository/business.repository";
import type { ExpenseCategoryService } from "@/services/expense-category.service";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_SERVICES,
} from "@/services/onboarding-defaults";
import type { ServiceCatalogService } from "@/services/service-catalog.service";
import {
  createBusinessSchema,
  updateBusinessSchema,
  type CreateBusinessInput,
  type UpdateBusinessInput,
} from "@/services/schemas";
import type { Business } from "@/types/database";

export class BusinessService {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly serviceCatalog: ServiceCatalogService,
    private readonly expenseCategory: ExpenseCategoryService,
  ) {}

  async getById(id: string): Promise<Business | null> {
    return this.businessRepository.findById(id);
  }

  async listForCurrentUser(): Promise<Business[]> {
    return this.businessRepository.listForCurrentUser();
  }

  async create(input: CreateBusinessInput): Promise<Business> {
    const payload = createBusinessSchema.parse(input);
    const business = await this.businessRepository.create(payload);
    await this.seedStarterCatalog(business.id);
    return business;
  }

  async update(id: string, input: UpdateBusinessInput): Promise<Business> {
    const payload = updateBusinessSchema.parse(input);
    return this.businessRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.businessRepository.delete(id);
  }

  private async seedStarterCatalog(businessId: string): Promise<void> {
    const [existingServices, existingCategories] = await Promise.all([
      this.serviceCatalog.listByBusinessId(businessId),
      this.expenseCategory.listByBusinessId(businessId),
    ]);

    if (existingServices.length === 0) {
      await Promise.all(
        DEFAULT_SERVICES.map((service) =>
          this.serviceCatalog.create({
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
          this.expenseCategory.create({
            business_id: businessId,
            name: category.name,
            display_order: category.display_order,
            is_active: true,
          }),
        ),
      );
    }
  }
}
