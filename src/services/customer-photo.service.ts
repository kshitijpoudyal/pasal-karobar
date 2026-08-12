import type { CustomerRepository } from "@/repository/customer.repository";
import type { CustomerPhotoRepository } from "@/repository/customer-photo.repository";
import type { OwnerGuard } from "@/services/owner-guard";
import {
  ALLOWED_CUSTOMER_PHOTO_MIME_TYPES,
  buildCustomerPhotoStoragePath,
  CUSTOMER_PHOTO_SIGNED_URL_TTL_SEC,
  MAX_CUSTOMER_PHOTO_BYTES,
  MAX_CUSTOMER_PHOTOS,
  type AllowedCustomerPhotoMimeType,
} from "@/constants/customer-photos";
import {
  updateCustomerPhotoCaptionSchema,
  type UpdateCustomerPhotoCaptionInput,
  type UploadCustomerPhotoInput,
} from "@/services/schemas";
import type { CustomerPhoto, CustomerPhotoWithUrl } from "@/types/database";

export class CustomerPhotoLimitError extends Error {
  constructor() {
    super(`You can add up to ${MAX_CUSTOMER_PHOTOS} photos per customer.`);
    this.name = "CustomerPhotoLimitError";
  }
}

export class CustomerPhotoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerPhotoValidationError";
  }
}

export class CustomerPhotoNotFoundError extends Error {
  constructor() {
    super("Photo not found.");
    this.name = "CustomerPhotoNotFoundError";
  }
}

function isAllowedMimeType(value: string): value is AllowedCustomerPhotoMimeType {
  return (ALLOWED_CUSTOMER_PHOTO_MIME_TYPES as readonly string[]).includes(value);
}

export class CustomerPhotoService {
  constructor(
    private readonly customerPhotoRepository: CustomerPhotoRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ownerGuard: OwnerGuard,
  ) {}

  async listWithSignedUrls(customerId: string): Promise<CustomerPhotoWithUrl[]> {
    const rows = await this.customerPhotoRepository.listByCustomerId(customerId);
    const withUrls = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        signed_url: await this.customerPhotoRepository.createSignedUrl(
          row.storage_path,
          CUSTOMER_PHOTO_SIGNED_URL_TTL_SEC,
        ),
      })),
    );
    return withUrls;
  }

  async upload(input: UploadCustomerPhotoInput): Promise<CustomerPhotoWithUrl> {
    const payload = input;
    if (!isAllowedMimeType(payload.content_type)) {
      throw new CustomerPhotoValidationError("Use a JPEG, PNG, or WebP image.");
    }
    if (payload.byte_length > MAX_CUSTOMER_PHOTO_BYTES) {
      throw new CustomerPhotoValidationError("Image must be 4 MB or smaller.");
    }

    const customer = await this.customerRepository.findById(payload.customer_id);
    if (!customer || customer.business_id !== payload.business_id) {
      throw new CustomerPhotoNotFoundError();
    }

    const count = await this.customerPhotoRepository.countByCustomerId(
      payload.customer_id,
    );
    if (count >= MAX_CUSTOMER_PHOTOS) {
      throw new CustomerPhotoLimitError();
    }

    const photoId = crypto.randomUUID();
    const storagePath = buildCustomerPhotoStoragePath(
      payload.business_id,
      payload.customer_id,
      photoId,
      payload.content_type,
    );

    const caption =
      payload.caption !== undefined && payload.caption !== null
        ? payload.caption.trim() || null
        : null;

    try {
      await this.customerPhotoRepository.uploadObject(
        storagePath,
        payload.data,
        payload.content_type,
      );

      const row = await this.customerPhotoRepository.create({
        id: photoId,
        business_id: payload.business_id,
        customer_id: payload.customer_id,
        storage_path: storagePath,
        caption,
        sort_order: count,
      });

      const signed_url = await this.customerPhotoRepository.createSignedUrl(
        storagePath,
        CUSTOMER_PHOTO_SIGNED_URL_TTL_SEC,
      );

      return { ...row, signed_url };
    } catch (error) {
      try {
        await this.customerPhotoRepository.removeObject(storagePath);
      } catch {
        // best-effort cleanup
      }
      throw error;
    }
  }

  async updateCaption(
    businessId: string,
    photoId: string,
    input: UpdateCustomerPhotoCaptionInput,
  ): Promise<CustomerPhoto> {
    const parsed = updateCustomerPhotoCaptionSchema.parse(input);
    const row = await this.customerPhotoRepository.findById(photoId);
    if (!row || row.business_id !== businessId) {
      throw new CustomerPhotoNotFoundError();
    }
    return this.customerPhotoRepository.update(photoId, {
      caption: parsed.caption,
    });
  }

  async delete(businessId: string, photoId: string): Promise<void> {
    await this.ownerGuard.requireOwner(businessId);
    const row = await this.customerPhotoRepository.findById(photoId);
    if (!row || row.business_id !== businessId) {
      throw new CustomerPhotoNotFoundError();
    }
    await this.customerPhotoRepository.removeObject(row.storage_path);
    await this.customerPhotoRepository.delete(photoId);
  }
}
