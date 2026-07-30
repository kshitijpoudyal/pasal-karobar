import type { BusinessRepository } from "@/repository/business.repository";
import {
  createBusinessSchema,
  updateBusinessSchema,
  type CreateBusinessInput,
  type UpdateBusinessInput,
} from "@/services/schemas";
import type { Business } from "@/types/database";

export class BusinessService {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async getById(id: string): Promise<Business | null> {
    return this.businessRepository.findById(id);
  }

  async listForCurrentUser(): Promise<Business[]> {
    return this.businessRepository.listForCurrentUser();
  }

  async create(input: CreateBusinessInput): Promise<Business> {
    const payload = createBusinessSchema.parse(input);
    return this.businessRepository.create(payload);
  }

  async update(id: string, input: UpdateBusinessInput): Promise<Business> {
    const payload = updateBusinessSchema.parse(input);
    return this.businessRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.businessRepository.delete(id);
  }
}
