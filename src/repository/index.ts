import type { SupabaseClient } from "@supabase/supabase-js";

import { BusinessPaymentMethodRepository } from "@/repository/business-payment-method.repository";
import { CustomerPhotoRepository } from "@/repository/customer-photo.repository";
import { CustomerRepository } from "@/repository/customer.repository";
import { BusinessRepository } from "@/repository/business.repository";
import { BusinessSettingRepository } from "@/repository/business-setting.repository";
import { ExpenseCategoryRepository } from "@/repository/expense-category.repository";
import { ServiceCatalogRepository } from "@/repository/service-catalog.repository";
import { TransactionRepository } from "@/repository/transaction.repository";
import type { Database } from "@/types/database";

export type Repositories = {
  business: BusinessRepository;
  serviceCatalog: ServiceCatalogRepository;
  expenseCategory: ExpenseCategoryRepository;
  transaction: TransactionRepository;
  businessSetting: BusinessSettingRepository;
  businessPaymentMethod: BusinessPaymentMethodRepository;
  customer: CustomerRepository;
  customerPhoto: CustomerPhotoRepository;
};

export function createRepositories(
  supabase: SupabaseClient<Database>,
): Repositories {
  return {
    business: new BusinessRepository(supabase),
    serviceCatalog: new ServiceCatalogRepository(supabase),
    expenseCategory: new ExpenseCategoryRepository(supabase),
    transaction: new TransactionRepository(supabase),
    businessSetting: new BusinessSettingRepository(supabase),
    businessPaymentMethod: new BusinessPaymentMethodRepository(supabase),
    customer: new CustomerRepository(supabase),
    customerPhoto: new CustomerPhotoRepository(supabase),
  };
}

export { RepositoryError } from "@/repository/errors";
export type { TransactionListFilters } from "@/repository/transaction.repository";
