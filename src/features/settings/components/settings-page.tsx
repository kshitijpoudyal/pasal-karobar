import { AppLeftNav } from "@/components/layout/app-left-nav";
import { AppMain } from "@/components/layout/app-main";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { RecordTransactionFab } from "@/components/layout/record-transaction-fab";
import { BusinessIdentitySection } from "@/features/settings/components/business-identity-section";
import { ExpenseTaxonomySection } from "@/features/settings/components/expense-taxonomy-section";
import { ServiceCatalogSection } from "@/features/settings/components/service-catalog-section";

export function SettingsPage() {
  return (
    <div className="curator-activity font-body-md flex min-h-screen overflow-hidden bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <AppLeftNav />
      <AppMain className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-surface">
        <AppPageHeader title="Settings" />
        <div className="w-full space-y-12 px-12 pb-16">
          <BusinessIdentitySection />
          <ServiceCatalogSection />
          <ExpenseTaxonomySection />
        </div>
      </AppMain>
      <RecordTransactionFab />
    </div>
  );
}
