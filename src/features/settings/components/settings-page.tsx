import { AppShell } from "@/components/layout/app-shell";
import { BusinessIdentitySection } from "@/features/settings/components/business-identity-section";
import { ExpenseTaxonomySection } from "@/features/settings/components/expense-taxonomy-section";
import { ServiceCatalogSection } from "@/features/settings/components/service-catalog-section";

export function SettingsPage() {
  return (
    <AppShell
      desktopHeaderTitle="Settings"
      shellClassName="curator-activity text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed"
      mainClassName="overflow-y-auto"
    >
      <div className="px-5 pt-6 pb-8 lg:space-y-12 lg:px-12 lg:pt-12 lg:pb-16">
        <section className="mb-8 lg:hidden">
          <h2 className="font-headline text-[28px] leading-tight font-medium text-primary">
            Settings
          </h2>
          <p className="font-body-md mt-2 text-on-surface-variant">
            Manage your business configuration and service offerings.
          </p>
        </section>
        <div className="space-y-8 lg:space-y-12">
          <BusinessIdentitySection />
          <ServiceCatalogSection />
          <ExpenseTaxonomySection />
        </div>
      </div>
    </AppShell>
  );
}
