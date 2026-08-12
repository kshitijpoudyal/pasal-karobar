import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type {
  Database,
  ExpenseCategory,
  ExpenseCategoryInsert,
  ExpenseCategoryUpdate,
} from "@/types/database";

export class ExpenseCategoryRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByBusinessId(businessId: string): Promise<ExpenseCategory[]> {
    const { data, error } = await this.supabase
      .from("expense_categories")
      .select("*")
      .eq("business_id", businessId)
      .order("display_order", { ascending: true });

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async findById(id: string): Promise<ExpenseCategory | null> {
    const { data, error } = await this.supabase
      .from("expense_categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async create(payload: ExpenseCategoryInsert): Promise<ExpenseCategory> {
    const { data, error } = await this.supabase
      .from("expense_categories")
      .insert(payload)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async update(id: string, payload: ExpenseCategoryUpdate): Promise<ExpenseCategory> {
    const { data, error } = await this.supabase
      .from("expense_categories")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("expense_categories")
      .delete()
      .eq("id", id);

    if (error) mapRepositoryError(error);
  }
}
