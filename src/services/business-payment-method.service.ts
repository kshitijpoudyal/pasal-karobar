import type { BusinessPaymentMethodRepository } from "@/repository/business-payment-method.repository";
import type { OwnerGuard } from "@/services/owner-guard";
import {
  createBusinessPaymentMethodSchema,
  updateBusinessPaymentMethodSchema,
  type CreateBusinessPaymentMethodInput,
  type UpdateBusinessPaymentMethodInput,
} from "@/services/schemas";
import type { BusinessPaymentMethodRecord } from "@/types/database";

export class BusinessPaymentMethodMinimumError extends Error {
  constructor() {
    super("Keep at least one payment method active.");
    this.name = "BusinessPaymentMethodMinimumError";
  }
}

export class BusinessPaymentMethodService {
  constructor(
    private readonly repository: BusinessPaymentMethodRepository,
    private readonly ownerGuard: OwnerGuard,
  ) {}

  async listByBusinessId(businessId: string): Promise<BusinessPaymentMethodRecord[]> {
    return this.repository.listByBusinessId(businessId);
  }

  async listActiveByBusinessId(
    businessId: string,
  ): Promise<BusinessPaymentMethodRecord[]> {
    const rows = await this.repository.listByBusinessId(businessId);
    return rows
      .filter((row) => row.is_active)
      .sort(
        (a, b) =>
          a.display_order - b.display_order ||
          a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      );
  }

  async create(
    input: CreateBusinessPaymentMethodInput,
  ): Promise<BusinessPaymentMethodRecord> {
    const payload = createBusinessPaymentMethodSchema.parse(input);
    await this.ownerGuard.requireOwner(payload.business_id);
    return this.repository.create(payload);
  }

  async update(
    id: string,
    input: UpdateBusinessPaymentMethodInput,
  ): Promise<BusinessPaymentMethodRecord> {
    const payload = updateBusinessPaymentMethodSchema.parse(input);
    const existing = await this.repository.findById(id);
    if (existing) await this.ownerGuard.requireOwner(existing.business_id);
    return this.repository.update(id, payload);
  }

  async deactivate(id: string, businessId: string): Promise<void> {
    await this.ownerGuard.requireOwner(businessId);
    const rows = await this.listActiveByBusinessId(businessId);
    if (rows.length <= 1 && rows.some((row) => row.id === id)) {
      throw new BusinessPaymentMethodMinimumError();
    }
    await this.repository.deactivate(id, businessId);
  }
}
