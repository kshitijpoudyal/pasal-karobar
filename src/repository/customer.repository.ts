import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
  Database,
} from "@/types/database";

export class CustomerRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByBusinessId(businessId: string): Promise<Customer[]> {
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .order("updated_at", { ascending: false });

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async findByIds(ids: string[]): Promise<Customer[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .in("id", ids);

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async findByNormalizedPhone(
    businessId: string,
    phoneNormalized: string,
  ): Promise<Customer | null> {
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .eq("phone_normalized", phoneNormalized)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async create(payload: CustomerInsert): Promise<Customer> {
    const { data, error } = await this.supabase
      .from("customers")
      .insert(payload)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async update(id: string, payload: CustomerUpdate): Promise<Customer> {
    const { data, error } = await this.supabase
      .from("customers")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("customers").delete().eq("id", id);

    if (error) mapRepositoryError(error);
  }
}
