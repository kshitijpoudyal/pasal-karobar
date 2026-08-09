import type { CustomerRepository } from "@/repository/customer.repository";
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from "@/services/schemas";
import type { Customer } from "@/types/database";
import {
  parseNepalPhone,
  parseOptionalNepalPhone,
  type ParsedNepalPhone,
} from "@/utils/phone-np";

export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async listByBusinessId(businessId: string): Promise<Customer[]> {
    return this.customerRepository.listByBusinessId(businessId);
  }

  async getById(id: string): Promise<Customer | null> {
    return this.customerRepository.findById(id);
  }

  async mapByIds(ids: string[]): Promise<Map<string, Customer>> {
    const unique = [...new Set(ids.filter(Boolean))];
    const rows = await this.customerRepository.findByIds(unique);
    return new Map(rows.map((row) => [row.id, row]));
  }

  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const payload = updateCustomerSchema.parse(input);
    return this.customerRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async create(businessId: string, input: CreateCustomerInput): Promise<Customer> {
    const payload = createCustomerSchema.parse(input);
    const parsed = parseNepalPhone(payload.phone);
    if (!parsed.ok) {
      throw new CustomerPhoneError(parsed.reason);
    }

    const existing = await this.customerRepository.findByNormalizedPhone(
      businessId,
      parsed.normalized,
    );
    if (existing) {
      throw new CustomerDuplicateError(
        "A customer with this phone number already exists.",
      );
    }

    return this.customerRepository.create({
      business_id: businessId,
      phone: parsed.display,
      phone_normalized: parsed.normalized,
      name: payload.name?.trim() ? payload.name.trim() : null,
      profile_note: payload.profile_note?.trim()
        ? payload.profile_note.trim()
        : null,
      first_visit_at: null,
    });
  }

  /**
   * Resolve optional phone to a customer id for income. Returns null when empty.
   * Throws when phone is present but invalid.
   */
  async resolveCustomerForIncome(
    businessId: string,
    phoneRaw: string | null | undefined,
    visitAt: string,
  ): Promise<string | null> {
    const parsed = parseOptionalNepalPhone(phoneRaw);
    if ("empty" in parsed && parsed.empty) {
      return null;
    }
    if (!parsed.ok) {
      throw new CustomerPhoneError(parsed.reason);
    }
    return this.findOrCreateByNormalizedPhone(
      businessId,
      parsed as Extract<ParsedNepalPhone, { ok: true }>,
      visitAt,
    );
  }

  async ensureFirstVisitAt(
    customerId: string,
    visitAt: string,
  ): Promise<void> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.first_visit_at) return;
    await this.customerRepository.update(customerId, {
      first_visit_at: visitAt,
    });
  }

  /** After income entry: set display name when phone matches and name is provided. */
  async applyNameForNormalizedPhone(
    businessId: string,
    phoneRaw: string,
    nameRaw: string,
  ): Promise<void> {
    const name = nameRaw.trim();
    if (!name) return;

    const parsed = parseNepalPhone(phoneRaw);
    if (!parsed.ok) return;

    const customer = await this.customerRepository.findByNormalizedPhone(
      businessId,
      parsed.normalized,
    );
    if (!customer) return;
    if ((customer.name?.trim() ?? "") === name) return;

    await this.update(customer.id, { name });
  }

  private async findOrCreateByNormalizedPhone(
    businessId: string,
    parsed: Extract<ParsedNepalPhone, { ok: true }>,
    visitAt: string,
  ): Promise<string> {
    const existing = await this.customerRepository.findByNormalizedPhone(
      businessId,
      parsed.normalized,
    );
    if (existing) {
      if (!existing.first_visit_at) {
        await this.customerRepository.update(existing.id, {
          first_visit_at: visitAt,
        });
      }
      return existing.id;
    }

    const created = await this.customerRepository.create({
      business_id: businessId,
      phone: parsed.display,
      phone_normalized: parsed.normalized,
      first_visit_at: visitAt,
    });
    return created.id;
  }
}

export class CustomerPhoneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerPhoneError";
  }
}

export class CustomerDuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerDuplicateError";
  }
}
