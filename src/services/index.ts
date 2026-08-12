import type { SupabaseClient } from "@supabase/supabase-js";

import { createRepositories, type Repositories } from "@/repository";
import { BusinessPaymentMethodService } from "@/services/business-payment-method.service";
import { BusinessService } from "@/services/business.service";
import { BusinessSettingService } from "@/services/business-setting.service";
import { CustomerPhotoService } from "@/services/customer-photo.service";
import { CustomerService } from "@/services/customer.service";
import { DashboardService } from "@/services/dashboard.service";
import { ExpenseCategoryService } from "@/services/expense-category.service";
import { OwnerGuard } from "@/services/owner-guard";
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
  const ownerGuard = new OwnerGuard(repositories.businessMember);
  const customer = new CustomerService(repositories.customer);
  const expenseCategory = new ExpenseCategoryService(
    repositories.expenseCategory,
    ownerGuard,
  );
  const serviceCatalog = new ServiceCatalogService(
    repositories.serviceCatalog,
    ownerGuard,
  );
  const businessPaymentMethod = new BusinessPaymentMethodService(
    repositories.businessPaymentMethod,
    ownerGuard,
  );
  const businessSetting = new BusinessSettingService(
    repositories.businessSetting,
    ownerGuard,
  );
  const customerPhoto = new CustomerPhotoService(
    repositories.customerPhoto,
    repositories.customer,
    ownerGuard,
  );
  const transaction = new TransactionService(
    repositories.transaction,
    customer,
    ownerGuard,
  );
  const business = new BusinessService(
    repositories.business,
    repositories.businessSetting,
    serviceCatalog,
    expenseCategory,
    ownerGuard,
  );

  return {
    business,
    serviceCatalog,
    expenseCategory,
    transaction,
    businessSetting,
    businessPaymentMethod,
    customer,
    customerPhoto,
    dashboard: new DashboardService(transaction, serviceCatalog, business, customer),
  };
}

export function createAppServices(supabase: SupabaseClient<Database>): AppServices {
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
export { OwnerGuard, OwnerPermissionError } from "@/services/owner-guard";
