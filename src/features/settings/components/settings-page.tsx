import { AppLeftNav } from "@/components/layout/app-left-nav";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { RecordTransactionFab } from "@/components/layout/record-transaction-fab";
import { BusinessIdentitySection } from "@/features/settings/components/business-identity-section";
import { ExpenseTaxonomySection } from "@/features/settings/components/expense-taxonomy-section";
import { ServiceCatalogSection } from "@/features/settings/components/service-catalog-section";

export function SettingsPage() {
  return (
    <div className="curator-activity font-body-md flex min-h-screen overflow-hidden bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <AppLeftNav />
      <main className="ml-80 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-surface">
        <AppPageHeader title="Settings" />
        <div className="w-full max-w-6xl space-y-12 px-12 pb-16">
          <BusinessIdentitySection />
          <ServiceCatalogSection />
          <ExpenseTaxonomySection />
        </div>
      </main>
      <RecordTransactionFab />
    </div>
  );
}
