import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type {
  Database,
  ServiceInsert,
  ServiceRecord,
  ServiceUpdate,
} from "@/types/database";

export class ServiceCatalogRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByBusinessId(businessId: string): Promise<ServiceRecord[]> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .eq("business_id", businessId)
      .order("display_order", { ascending: true });

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async findById(id: string): Promise<ServiceRecord | null> {
    const { data, error } = await this.supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async create(payload: ServiceInsert): Promise<ServiceRecord> {
    const { data, error } = await this.supabase
      .from("services")
      .insert(payload)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async update(id: string, payload: ServiceUpdate): Promise<ServiceRecord> {
    const { data, error } = await this.supabase
      .from("services")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("services").delete().eq("id", id);

    if (error) mapRepositoryError(error);
  }
}
