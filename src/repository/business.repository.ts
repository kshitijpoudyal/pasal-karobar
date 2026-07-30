import type { SupabaseClient } from "@supabase/supabase-js";

import { isMissingRpcFunctionError, mapRepositoryError } from "@/repository/errors";
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
    const rpc = await this.supabase.rpc("create_business_for_owner", {
      p_name: payload.name,
      p_business_type: payload.business_type,
      p_currency: payload.currency,
      p_timezone: payload.timezone,
    });

    if (!rpc.error && rpc.data) {
      return rpc.data;
    }

    if (isMissingRpcFunctionError(rpc.error, "create_business_for_owner")) {
      const { error: insertError } = await this.supabase
        .from("business")
        .insert(payload);

      if (insertError) mapRepositoryError(insertError);

      const businesses = await this.listForCurrentUser();
      const created = [...businesses]
        .filter((b) => b.name === payload.name)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

      if (created) {
        return created;
      }

      throw new Error(
        "Business may have been created but is not visible. Run migrations/20260730194500_create_business_for_owner.sql in Supabase SQL Editor, or add a business_members row for your user.",
      );
    }

    if (rpc.error) mapRepositoryError(rpc.error);
    throw new Error("Business was not created");
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
