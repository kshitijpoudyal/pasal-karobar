import type { ExpenseCategoryRepository } from "@/repository/expense-category.repository";
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
  ) {}

  async listByBusinessId(businessId: string): Promise<ExpenseCategory[]> {
    return this.expenseCategoryRepository.listByBusinessId(businessId);
  }

  async getById(id: string): Promise<ExpenseCategory | null> {
    return this.expenseCategoryRepository.findById(id);
  }

  async create(input: CreateExpenseCategoryInput): Promise<ExpenseCategory> {
    const payload = createExpenseCategorySchema.parse(input);
    return this.expenseCategoryRepository.create(payload);
  }

  async update(
    id: string,
    input: UpdateExpenseCategoryInput,
  ): Promise<ExpenseCategory> {
    const payload = updateExpenseCategorySchema.parse(input);
    return this.expenseCategoryRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.expenseCategoryRepository.delete(id);
  }
}
