import type { ServiceCatalogRepository } from "@/repository/service-catalog.repository";
import type { OwnerGuard } from "@/services/owner-guard";
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "@/services/schemas";
import type { ServiceRecord } from "@/types/database";

export class ServiceCatalogService {
  constructor(
    private readonly serviceCatalogRepository: ServiceCatalogRepository,
    private readonly ownerGuard: OwnerGuard,
  ) {}

  async listByBusinessId(businessId: string): Promise<ServiceRecord[]> {
    return this.serviceCatalogRepository.listByBusinessId(businessId);
  }

  async getById(id: string): Promise<ServiceRecord | null> {
    return this.serviceCatalogRepository.findById(id);
  }

  async create(input: CreateServiceInput): Promise<ServiceRecord> {
    const payload = createServiceSchema.parse(input);
    await this.ownerGuard.requireOwner(payload.business_id);
    return this.serviceCatalogRepository.create(payload);
  }

  async update(id: string, input: UpdateServiceInput): Promise<ServiceRecord> {
    const payload = updateServiceSchema.parse(input);
    const existing = await this.serviceCatalogRepository.findById(id);
    if (existing) await this.ownerGuard.requireOwner(existing.business_id);
    return this.serviceCatalogRepository.update(id, payload);
  }

  async delete(id: string, businessId: string): Promise<void> {
    await this.ownerGuard.requireOwner(businessId);
    await this.serviceCatalogRepository.delete(id, businessId);
  }
}
