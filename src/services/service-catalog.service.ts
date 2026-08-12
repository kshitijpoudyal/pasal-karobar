import type { ServiceCatalogRepository } from "@/repository/service-catalog.repository";
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "@/services/schemas";
import type { ServiceRecord } from "@/types/database";

export class ServiceCatalogService {
  constructor(private readonly serviceCatalogRepository: ServiceCatalogRepository) {}

  async listByBusinessId(businessId: string): Promise<ServiceRecord[]> {
    return this.serviceCatalogRepository.listByBusinessId(businessId);
  }

  async getById(id: string): Promise<ServiceRecord | null> {
    return this.serviceCatalogRepository.findById(id);
  }

  async create(input: CreateServiceInput): Promise<ServiceRecord> {
    const payload = createServiceSchema.parse(input);
    return this.serviceCatalogRepository.create(payload);
  }

  async update(id: string, input: UpdateServiceInput): Promise<ServiceRecord> {
    const payload = updateServiceSchema.parse(input);
    return this.serviceCatalogRepository.update(id, payload);
  }

  async delete(id: string, businessId: string): Promise<void> {
    await this.serviceCatalogRepository.delete(id, businessId);
  }
}
