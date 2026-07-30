import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type {
  Business,
  BusinessInsert,
  BusinessUpdate,
  Database,
} from "@/types/database";

export class BusinessRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: string): Promise<Business | null> {
    const { data, error } = await this.supabase
      .from("business")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async listForCurrentUser(): Promise<Business[]> {
    const { data, error } = await this.supabase.from("business").select("*");

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async create(payload: BusinessInsert): Promise<Business> {
    const { data, error } = await this.supabase
      .from("business")
      .insert(payload)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async update(id: string, payload: BusinessUpdate): Promise<Business> {
    const { data, error } = await this.supabase
      .from("business")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("business").delete().eq("id", id);

    if (error) mapRepositoryError(error);
  }
}
