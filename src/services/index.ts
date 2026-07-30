import type { SupabaseClient } from "@supabase/supabase-js";

import { createRepositories, type Repositories } from "@/repository";
import { BusinessService } from "@/services/business.service";
import { BusinessSettingService } from "@/services/business-setting.service";
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
  dashboard: DashboardService;
};

export function createServices(repositories: Repositories): AppServices {
  const transaction = new TransactionService(repositories.transaction);
  const serviceCatalog = new ServiceCatalogService(repositories.serviceCatalog);

  return {
    business: new BusinessService(
      repositories.business,
      serviceCatalog,
      new ExpenseCategoryService(repositories.expenseCategory),
    ),
    serviceCatalog,
    expenseCategory: new ExpenseCategoryService(repositories.expenseCategory),
    transaction,
    businessSetting: new BusinessSettingService(repositories.businessSetting),
    dashboard: new DashboardService(transaction, serviceCatalog),
  };
}

export function createAppServices(
  supabase: SupabaseClient<Database>,
): AppServices {
  return createServices(createRepositories(supabase));
}

export {
  BusinessService,
  BusinessSettingService,
  ExpenseCategoryService,
  ServiceCatalogService,
  TransactionService,
  DashboardService,
};
