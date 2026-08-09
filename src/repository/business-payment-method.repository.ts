import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type {
  BusinessPaymentMethodInsert,
  BusinessPaymentMethodRecord,
  BusinessPaymentMethodUpdate,
  Database,
} from "@/types/database";

export class BusinessPaymentMethodRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByBusinessId(
    businessId: string,
  ): Promise<BusinessPaymentMethodRecord[]> {
    const { data, error } = await this.supabase
      .from("business_payment_methods")
      .select("*")
      .eq("business_id", businessId)
      .order("display_order", { ascending: true });

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async findById(id: string): Promise<BusinessPaymentMethodRecord | null> {
    const { data, error } = await this.supabase
      .from("business_payment_methods")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async create(
    payload: BusinessPaymentMethodInsert,
  ): Promise<BusinessPaymentMethodRecord> {
    const { data, error } = await this.supabase
      .from("business_payment_methods")
      .insert(payload)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async update(
    id: string,
    payload: BusinessPaymentMethodUpdate,
  ): Promise<BusinessPaymentMethodRecord> {
    const { data, error } = await this.supabase
      .from("business_payment_methods")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async deactivate(id: string, businessId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("business_payment_methods")
      .update({ is_active: false })
      .eq("id", id)
      .eq("business_id", businessId)
      .select("id")
      .maybeSingle();

    if (error) mapRepositoryError(error);
    if (!data) {
      throw new Error(
        "Payment method could not be removed. It may have already been removed or you may not have permission.",
      );
    }
  }
}
