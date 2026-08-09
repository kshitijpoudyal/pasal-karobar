import type { SupabaseClient } from "@supabase/supabase-js";

import { CUSTOMER_PHOTOS_BUCKET } from "@/constants/customer-photos";
import { mapRepositoryError, RepositoryError } from "@/repository/errors";
import type {
  CustomerPhoto,
  CustomerPhotoInsert,
  CustomerPhotoUpdate,
  Database,
} from "@/types/database";

export class CustomerPhotoRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listByCustomerId(customerId: string): Promise<CustomerPhoto[]> {
    const { data, error } = await this.supabase
      .from("customer_photos")
      .select("*")
      .eq("customer_id", customerId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) mapRepositoryError(error);
    return data ?? [];
  }

  async countByCustomerId(customerId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("customer_photos")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    if (error) mapRepositoryError(error);
    return count ?? 0;
  }

  async findById(id: string): Promise<CustomerPhoto | null> {
    const { data, error } = await this.supabase
      .from("customer_photos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) mapRepositoryError(error);
    return data;
  }

  async create(payload: CustomerPhotoInsert): Promise<CustomerPhoto> {
    const { data, error } = await this.supabase
      .from("customer_photos")
      .insert(payload)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async update(id: string, payload: CustomerPhotoUpdate): Promise<CustomerPhoto> {
    const { data, error } = await this.supabase
      .from("customer_photos")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) mapRepositoryError(error);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("customer_photos")
      .delete()
      .eq("id", id);

    if (error) mapRepositoryError(error);
  }

  async uploadObject(
    storagePath: string,
    body: ArrayBuffer,
    contentType: string,
  ): Promise<void> {
    const { error } = await this.supabase.storage
      .from(CUSTOMER_PHOTOS_BUCKET)
      .upload(storagePath, body, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new RepositoryError(error as Error);
    }
  }

  async removeObject(storagePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(CUSTOMER_PHOTOS_BUCKET)
      .remove([storagePath]);

    if (error) {
      throw new RepositoryError(error as Error);
    }
  }

  async createSignedUrl(
    storagePath: string,
    expiresInSec: number,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(CUSTOMER_PHOTOS_BUCKET)
      .createSignedUrl(storagePath, expiresInSec);

    if (error) {
      throw new RepositoryError(error as Error);
    }
    if (!data?.signedUrl) {
      throw new Error("Could not create signed URL for photo.");
    }
    return data.signedUrl;
  }
}
