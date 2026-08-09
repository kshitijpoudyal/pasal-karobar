import type { SupabaseClient } from "@supabase/supabase-js";

import { createRepositories, type Repositories } from "@/repository";
import { BusinessPaymentMethodService } from "@/services/business-payment-method.service";
import { BusinessService } from "@/services/business.service";
import { BusinessSettingService } from "@/services/business-setting.service";
import { CustomerPhotoService } from "@/services/customer-photo.service";
import { CustomerService } from "@/services/customer.service";
import { DashboardService } from "@/services/dashboard.service";
import { ExpenseCategoryService } from "@/services/expense-category.service";
import { ServiceCatalogService } from "@/services/service-catalog.service";
import { TransactionService } from "@/services/transaction.service";
import type { Database } from "@/types/database";

export type AppServices = {
  business: BusinessService;
  serviceCatalog: ServiceCatalogService;
  expenseCategory: ExpenseCategoryService;
  transaction: TransactionService;
  businessSetting: BusinessSettingService;
  businessPaymentMethod: BusinessPaymentMethodService;
  customer: CustomerService;
  customerPhoto: CustomerPhotoService;
  dashboard: DashboardService;
};

export function createServices(repositories: Repositories): AppServices {
  const customer = new CustomerService(repositories.customer);
  const customerPhoto = new CustomerPhotoService(
    repositories.customerPhoto,
    repositories.customer,
  );
  const transaction = new TransactionService(repositories.transaction, customer);
  const serviceCatalog = new ServiceCatalogService(repositories.serviceCatalog);
  const businessPaymentMethod = new BusinessPaymentMethodService(
    repositories.businessPaymentMethod,
  );

  const business = new BusinessService(
    repositories.business,
    repositories.businessSetting,
    serviceCatalog,
    new ExpenseCategoryService(repositories.expenseCategory),
  );

  return {
    business,
    serviceCatalog,
    expenseCategory: new ExpenseCategoryService(repositories.expenseCategory),
    transaction,
    businessSetting: new BusinessSettingService(repositories.businessSetting),
    businessPaymentMethod,
    customer,
    customerPhoto,
    dashboard: new DashboardService(transaction, serviceCatalog, business, customer),
  };
}

export function createAppServices(
  supabase: SupabaseClient<Database>,
): AppServices {
  return createServices(createRepositories(supabase));
}

export {
  BusinessPaymentMethodService,
  BusinessService,
  BusinessSettingService,
  CustomerPhotoService,
  CustomerService,
  ExpenseCategoryService,
  ServiceCatalogService,
  TransactionService,
  DashboardService,
};
