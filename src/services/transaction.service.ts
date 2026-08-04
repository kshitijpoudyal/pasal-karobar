import type { TransactionRepository } from "@/repository/transaction.repository";
import type { TransactionListFilters } from "@/repository/transaction.repository";
import {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/services/schemas";
import type { Transaction, TransactionRowInsert } from "@/types/database";

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async listByBusinessId(
    businessId: string,
    filters?: TransactionListFilters,
  ): Promise<Transaction[]> {
    return this.transactionRepository.listByBusinessId(businessId, filters);
  }

  async findEarliestTransactionDate(
    businessId: string,
  ): Promise<string | null> {
    return this.transactionRepository.findEarliestTransactionDate(businessId);
  }

  async getById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findById(id);
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const payload = createTransactionSchema.parse(input);

    if (payload.type === "INCOME") {
      const row: TransactionRowInsert = {
        business_id: payload.business_id,
        type: "INCOME",
        service_id: payload.service_id,
        expense_category_id: null,
        subtotal: payload.subtotal,
        tip: payload.tip ?? 0,
        total: payload.total,
        payment_method: payload.payment_method,
        note: payload.note ?? null,
        transaction_date: payload.transaction_date,
      };
      return this.transactionRepository.create(row);
    }

    const row: TransactionRowInsert = {
      business_id: payload.business_id,
      type: "EXPENSE",
      service_id: null,
      expense_category_id: payload.expense_category_id,
      subtotal: payload.subtotal,
      tip: 0,
      total: payload.total,
      payment_method: payload.payment_method,
      note: payload.note ?? null,
      transaction_date: payload.transaction_date,
    };
    return this.transactionRepository.create(row);
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    const payload = updateTransactionSchema.parse(input);
    return this.transactionRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.transactionRepository.delete(id);
  }
}
