import { z } from "zod";

import { CALENDAR_SYSTEMS } from "@/constants/calendar-system";
import { SERVICE_ICON_IDS } from "@/constants/service-icons";

export const serviceIconIdSchema = z.enum(SERVICE_ICON_IDS);

export const businessTypeSchema = z.enum([
  "BARBER",
  "SALON",
  "GROCERY",
  "PHARMACY",
  "RESTAURANT",
  "OTHER",
]);

export const paymentMethodSchema = z.enum([
  "CASH",
  "ESEWA",
  "KHALTI",
  "FONEPAY",
  "BANK_TRANSFER",
  "OTHER",
]);

export const createBusinessPaymentMethodSchema = z.object({
  business_id: z.string().uuid(),
  method_code: paymentMethodSchema,
  label: z.string().trim().min(1).max(80),
  display_order: z.coerce.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

export const updateBusinessPaymentMethodSchema = createBusinessPaymentMethodSchema
  .omit({ business_id: true })
  .partial();

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const calendarSystemSchema = z.enum(CALENDAR_SYSTEMS);

export const createBusinessSchema = z.object({
  name: z.string().trim().min(1).max(200),
  business_type: businessTypeSchema.default("BARBER"),
  calendar_system: calendarSystemSchema.default("BS"),
  currency: z.string().trim().min(3).max(3).default("NPR"),
  timezone: z.string().trim().min(1).default("Asia/Kathmandu"),
  display_name: z.string().trim().min(1).max(120).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export const createServiceSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  default_price: z.coerce.number().nonnegative(),
  icon: serviceIconIdSchema.nullable().optional(),
  color: z.string().trim().max(32).nullable().optional(),
  display_order: z.coerce.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema
  .omit({ business_id: true })
  .partial();

export const createExpenseCategorySchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  icon: z.string().trim().max(64).nullable().optional(),
  color: z.string().trim().max(32).nullable().optional(),
  display_order: z.coerce.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

export const updateExpenseCategorySchema = createExpenseCategorySchema
  .omit({ business_id: true })
  .partial();

export const updateCustomerSchema = z.object({
  name: z.string().trim().max(200).nullable().optional(),
  profile_note: z.string().trim().max(2000).nullable().optional(),
});

export const updateCustomerPhotoCaptionSchema = z.object({
  caption: z.string().trim().max(100).nullable(),
});

export const uploadCustomerPhotoSchema = z.object({
  business_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  content_type: z.string(),
  byte_length: z.number().int().positive(),
  caption: z.string().trim().max(100).nullable().optional(),
  data: z.instanceof(ArrayBuffer),
});

export const createCustomerSchema = z.object({
  phone: z.string().trim().min(1).max(32),
  name: z.string().trim().max(200).optional(),
  profile_note: z.string().trim().max(2000).nullable().optional(),
});

const transactionBaseSchema = z.object({
  business_id: z.string().uuid(),
  payment_method: paymentMethodSchema,
  note: z.string().trim().max(2000).nullable().optional(),
  transaction_date: z.string().datetime({ offset: true }),
});

export const createIncomeTransactionSchema = transactionBaseSchema.extend({
  type: z.literal("INCOME"),
  service_id: z.string().uuid(),
  customer_phone: z.string().trim().max(32).optional(),
  subtotal: z.coerce.number().nonnegative(),
  tip: z.coerce.number().nonnegative().default(0),
  total: z.coerce.number().nonnegative(),
});

export const createExpenseTransactionSchema = transactionBaseSchema.extend({
  type: z.literal("EXPENSE"),
  expense_category_id: z.string().uuid(),
  subtotal: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
});

export const createTransactionSchema = z
  .discriminatedUnion("type", [
    createIncomeTransactionSchema,
    createExpenseTransactionSchema,
  ])
  .superRefine((data, ctx) => {
    if (data.type === "INCOME") {
      if (data.total !== data.subtotal + (data.tip ?? 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total must equal subtotal plus tip",
          path: ["total"],
        });
      }
      return;
    }
    if (data.total !== data.subtotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total must equal subtotal",
        path: ["total"],
      });
    }
  });

export const updateTransactionSchema = z
  .object({
    service_id: z.string().uuid().nullable().optional(),
    expense_category_id: z.string().uuid().nullable().optional(),
    subtotal: z.coerce.number().nonnegative().optional(),
    tip: z.coerce.number().nonnegative().optional(),
    total: z.coerce.number().nonnegative().optional(),
    payment_method: paymentMethodSchema.optional(),
    note: z.string().trim().max(2000).nullable().optional(),
    transaction_date: z.string().datetime({ offset: true }).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const upsertBusinessSettingSchema = z.object({
  business_id: z.string().uuid(),
  setting_key: z.string().trim().min(1).max(128),
  setting_value: z.string().max(4000),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>;
export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategorySchema>;
export type CreateBusinessPaymentMethodInput = z.infer<
  typeof createBusinessPaymentMethodSchema
>;
export type UpdateBusinessPaymentMethodInput = z.infer<
  typeof updateBusinessPaymentMethodSchema
>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerPhotoCaptionInput = z.infer<
  typeof updateCustomerPhotoCaptionSchema
>;
export type UploadCustomerPhotoInput = z.infer<typeof uploadCustomerPhotoSchema>;
export type CreateTransactionInput =
  | z.infer<typeof createIncomeTransactionSchema>
  | z.infer<typeof createExpenseTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type UpsertBusinessSettingInput = z.infer<typeof upsertBusinessSettingSchema>;
