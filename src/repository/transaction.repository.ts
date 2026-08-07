import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type {
  Database,
  Transaction,
  TransactionRowInsert,
  TransactionType,
  TransactionUpdate,
} from "@/types/database";

export type TransactionListFilters = {
  type?: TransactionType;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: Transaction["payment_method"];
  search?: string;
};

export class TransactionRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByBusinessId(
    businessId: string,
    filters: TransactionListFilters = {},
  ): Promise<Transaction[]> {
    let query = this.supabase
      .from("transactions")
      .select("*")
      .eq("business_id", businessId)
      .order("transaction_date", { ascending: false });

    if (filters.type) {
      query = query.eq("type", filters.type);
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
      query = query.ilike("note", `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async findEarliestTransactionDate(
    businessId: string,
  ): Promise<string | null> {
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
    const { error } = await this.supabase
      .from("transactions")
      .delete()
      .eq("id", id);

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
