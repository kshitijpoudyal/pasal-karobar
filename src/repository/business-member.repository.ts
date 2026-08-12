import type { SupabaseClient } from "@supabase/supabase-js";

import { mapRepositoryError } from "@/repository/errors";
import type { BusinessMember, Database, MemberRole, Profile } from "@/types/database";

export class BusinessMemberRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findForUserAndBusiness(
    businessId: string,
    userId: string,
  ): Promise<BusinessMember | null> {
    const { data, error } = await this.supabase
      .from("business_members")
      .select("*")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async listByBusinessId(businessId: string): Promise<BusinessMember[]> {
    const { data, error } = await this.supabase
      .from("business_members")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true });

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async insertMember(input: {
    business_id: string;
    user_id: string;
    role: MemberRole;
  }): Promise<BusinessMember> {
    const { data, error } = await this.supabase
      .from("business_members")
      .insert(input)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("business_members")
      .delete()
      .eq("id", id);

    if (error) mapRepositoryError(error);
  }

  async isOwner(businessId: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("is_business_owner", {
      p_business_id: businessId,
    });

    if (error) mapRepositoryError(error);
    return Boolean(data);
  }
}

export class ProfileRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async findByIds(ids: string[]): Promise<Profile[]> {
    const unique = [...new Set(ids.filter(Boolean))];
    if (unique.length === 0) return [];

    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .in("id", unique);

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async upsert(profile: {
    id: string;
    display_name: string;
    email?: string | null;
  }): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .upsert(profile)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }
}
