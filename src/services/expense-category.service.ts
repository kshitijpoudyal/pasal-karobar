import type { ExpenseCategoryRepository } from "@/repository/expense-category.repository";
import type { OwnerGuard } from "@/services/owner-guard";
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
  type CreateExpenseCategoryInput,
  type UpdateExpenseCategoryInput,
} from "@/services/schemas";
import type { ExpenseCategory } from "@/types/database";

export class ExpenseCategoryService {
  constructor(
    private readonly expenseCategoryRepository: ExpenseCategoryRepository,
    private readonly ownerGuard: OwnerGuard,
  ) {}

  async listByBusinessId(businessId: string): Promise<ExpenseCategory[]> {
    return this.expenseCategoryRepository.listByBusinessId(businessId);
  }

  async getById(id: string): Promise<ExpenseCategory | null> {
    return this.expenseCategoryRepository.findById(id);
  }

  async create(input: CreateExpenseCategoryInput): Promise<ExpenseCategory> {
    const payload = createExpenseCategorySchema.parse(input);
    await this.ownerGuard.requireOwner(payload.business_id);
    return this.expenseCategoryRepository.create(payload);
  }

  async update(
    id: string,
    input: UpdateExpenseCategoryInput,
  ): Promise<ExpenseCategory> {
    const payload = updateExpenseCategorySchema.parse(input);
    const existing = await this.expenseCategoryRepository.findById(id);
    if (existing) await this.ownerGuard.requireOwner(existing.business_id);
    return this.expenseCategoryRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.expenseCategoryRepository.findById(id);
    if (existing) await this.ownerGuard.requireOwner(existing.business_id);
    await this.expenseCategoryRepository.delete(id);
  }
}
