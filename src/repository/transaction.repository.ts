import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type {
  Database,
  Transaction,
  TransactionRowInsert,
  TransactionType,
  TransactionUpdate,
} from "@/types/database";
import { escapeIlikePattern } from "@/utils/escape-ilike";

export type TransactionListFilters = {
  type?: TransactionType;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: Transaction["payment_method"];
  search?: string;
};

export type IncomeSummaryRow = {
  id: string;
  customer_id: string | null;
  total: number;
  transaction_date: string;
};

export type IncomeSummaryFilters = {
  /** Inclusive upper bound (ISO instant). */
  toDate?: string;
  /** Exclusive upper bound (ISO instant). */
  toDateExclusive?: string;
};

/** Columns needed for list views (avoids select("*") overhead on wide rows). */
const TRANSACTION_LIST_COLUMNS =
  "id, business_id, type, service_id, expense_category_id, customer_id, recorded_by_user_id, subtotal, tip, total, payment_method, note, transaction_date, created_at, updated_at" as const;

export class TransactionRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByBusinessId(
    businessId: string,
    filters: TransactionListFilters = {},
  ): Promise<Transaction[]> {
    let query = this.supabase
      .from("transactions")
      .select(TRANSACTION_LIST_COLUMNS)
      .eq("business_id", businessId)
      .order("transaction_date", { ascending: false });

    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.customerId) {
      query = query.eq("customer_id", filters.customerId);
    }
    if (filters.fromDate) {
      query = query.gte("transaction_date", filters.fromDate);
    }
    if (filters.toDate) {
      query = query.lte("transaction_date", filters.toDate);
    }
    if (filters.paymentMethod) {
      query = query.eq("payment_method", filters.paymentMethod);
    }
    if (filters.search) {
      const pattern = `%${escapeIlikePattern(filters.search)}%`;
      query = query.ilike("note", pattern);
    }

    const { data, error } = await query;

    if (error) mapRepositoryError(error);
    return (data ?? []) as Transaction[];
  }

  async listIncomeSummaryByBusinessId(
    businessId: string,
    filters: IncomeSummaryFilters = {},
  ): Promise<IncomeSummaryRow[]> {
    let query = this.supabase
      .from("transactions")
      .select("id, customer_id, total, transaction_date")
      .eq("business_id", businessId)
      .eq("type", "INCOME")
      .order("transaction_date", { ascending: false });

    if (filters.toDateExclusive) {
      query = query.lt("transaction_date", filters.toDateExclusive);
    } else if (filters.toDate) {
      query = query.lte("transaction_date", filters.toDate);
    }

    const { data, error } = await query;

    if (error) mapRepositoryError(error);
    return (data ?? []) as IncomeSummaryRow[];
  }

  async findEarliestTransactionDate(businessId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("transaction_date")
      .eq("business_id", businessId)
      .order("transaction_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data?.transaction_date ?? null;
  }

  async findById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async create(payload: TransactionRowInsert): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from("transactions")
      .insert(payload)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async update(id: string, payload: TransactionUpdate): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from("transactions")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("transactions").delete().eq("id", id);

    if (error) mapRepositoryError(error);
  }

  async countIncomeByCustomerId(customerId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId)
      .eq("type", "INCOME");

    if (error) mapRepositoryError(error);
    return count ?? 0;
  }
}
