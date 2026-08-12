import type { CustomerService } from "@/services/customer.service";
import type { TransactionRepository } from "@/repository/transaction.repository";
import type {
  IncomeSummaryRow,
  IncomeSummaryFilters,
  TransactionListFilters,
} from "@/repository/transaction.repository";
import {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/services/schemas";
import type { Transaction, TransactionRowInsert } from "@/types/database";

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly customerService: CustomerService,
  ) {}

  async listByBusinessId(
    businessId: string,
    filters?: TransactionListFilters,
  ): Promise<Transaction[]> {
    return this.transactionRepository.listByBusinessId(businessId, filters);
  }

  async listIncomeSummaryByBusinessId(
    businessId: string,
    filters?: IncomeSummaryFilters,
  ): Promise<IncomeSummaryRow[]> {
    return this.transactionRepository.listIncomeSummaryByBusinessId(
      businessId,
      filters,
    );
  }

  async findEarliestTransactionDate(businessId: string): Promise<string | null> {
    return this.transactionRepository.findEarliestTransactionDate(businessId);
  }

  async getById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findById(id);
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const payload = createTransactionSchema.parse(input);

    if (payload.type === "INCOME") {
      const customerId = await this.customerService.resolveCustomerForIncome(
        payload.business_id,
        payload.customer_phone,
        payload.transaction_date,
      );

      const row: TransactionRowInsert = {
        business_id: payload.business_id,
        type: "INCOME",
        service_id: payload.service_id,
        expense_category_id: null,
        customer_id: customerId,
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
      customer_id: null,
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
    const existing = await this.transactionRepository.findById(id);
    await this.transactionRepository.delete(id);

    const customerId = existing?.customer_id;
    if (!customerId) return;

    const remaining =
      await this.transactionRepository.countIncomeByCustomerId(customerId);
    if (remaining === 0) {
      await this.customerService.delete(customerId);
    }
  }
}
