import { describe, expect, it, vi } from "vitest";

import {
  CustomerPhotoLimitError,
  CustomerPhotoService,
  CustomerPhotoValidationError,
} from "@/services/customer-photo.service";
import type { CustomerPhotoRepository } from "@/repository/customer-photo.repository";
import type { CustomerRepository } from "@/repository/customer.repository";
import type { Customer } from "@/types/database";

const customer: Customer = {
  id: "cust-1",
  business_id: "biz-1",
  phone: "9841234567",
  phone_normalized: "9841234567",
  name: "Ram",
  profile_note: null,
  first_visit_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function createMocks(photoCount: number) {
  const customerPhotoRepository = {
    listByCustomerId: vi.fn(),
    countByCustomerId: vi.fn().mockResolvedValue(photoCount),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    uploadObject: vi.fn(),
    removeObject: vi.fn(),
    createSignedUrl: vi.fn(),
  } satisfies Record<keyof CustomerPhotoRepository, ReturnType<typeof vi.fn>>;

  const customerRepository = {
    findById: vi.fn().mockResolvedValue(customer),
  } as unknown as CustomerRepository;

  return { customerPhotoRepository, customerRepository };
}

describe("CustomerPhotoService", () => {
  it("rejects more than five photos", async () => {
    const { customerPhotoRepository, customerRepository } = createMocks(5);
    const service = new CustomerPhotoService(
      customerPhotoRepository as unknown as CustomerPhotoRepository,
      customerRepository,
    );

    await expect(
      service.upload({
        business_id: "biz-1",
        customer_id: "cust-1",
        content_type: "image/jpeg",
        byte_length: 1000,
        data: new ArrayBuffer(1000),
      }),
    ).rejects.toBeInstanceOf(CustomerPhotoLimitError);
  });

  it("rejects unsupported mime types", async () => {
    const { customerPhotoRepository, customerRepository } = createMocks(0);
    const service = new CustomerPhotoService(
      customerPhotoRepository as unknown as CustomerPhotoRepository,
      customerRepository,
    );

    await expect(
      service.upload({
        business_id: "biz-1",
        customer_id: "cust-1",
        content_type: "application/pdf",
        byte_length: 1000,
        data: new ArrayBuffer(1000),
      }),
    ).rejects.toBeInstanceOf(CustomerPhotoValidationError);
  });

  it("trims caption to null when empty", async () => {
    const { customerPhotoRepository, customerRepository } = createMocks(0);
    customerPhotoRepository.create.mockResolvedValue({
      id: "photo-1",
      business_id: "biz-1",
      customer_id: "cust-1",
      storage_path: "biz-1/cust-1/photo-1.jpg",
      caption: null,
      sort_order: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    customerPhotoRepository.createSignedUrl.mockResolvedValue("https://signed");

    const service = new CustomerPhotoService(
      customerPhotoRepository as unknown as CustomerPhotoRepository,
      customerRepository,
    );

    await service.upload({
      business_id: "biz-1",
      customer_id: "cust-1",
      content_type: "image/jpeg",
      byte_length: 1000,
      caption: "   ",
      data: new ArrayBuffer(1000),
    });

    expect(customerPhotoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ caption: null, sort_order: 0 }),
    );
  });
});
