import { AppShell } from "@/components/layout/app-shell";
import { CustomersMain } from "@/features/customers/components/customers-main";

export function CustomersPageView() {
  return (
    <AppShell
      desktopHeaderTitle="Customers"
      shellClassName="curator-activity text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed"
      mainClassName="flex min-h-0 flex-col overflow-hidden"
    >
      <CustomersMain />
    </AppShell>
  );
}
