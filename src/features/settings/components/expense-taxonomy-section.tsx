import type { ReactNode } from "react";
import { Bolt, Home, LayoutGrid, Package, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type ExpenseCategoryTileProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
};

function ExpenseCategoryTile({ title, subtitle, icon }: ExpenseCategoryTileProps) {
  return (
    <div className="squircle group flex cursor-pointer items-center gap-4 bg-surface-container-low p-5 transition-all hover:bg-surface-container-high">
      <div className="squircle flex size-12 items-center justify-center transition-transform group-hover:scale-105">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-on-surface">{title}</p>
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase opacity-60">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export function ExpenseTaxonomySection() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="squircle bg-error-container p-3 text-error">
            <LayoutGrid className="size-6" strokeWidth={1.75} />
          </div>
          <h3 className="font-headline text-xl font-semibold">Taxonomy</h3>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-primary underline underline-offset-8 transition-opacity hover:opacity-70"
        >
          Full Archive
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ExpenseCategoryTile
          title="Lease"
          subtitle="Recurring"
          icon={<Home className="size-6 text-orange-600" strokeWidth={1.75} />}
        />
        <ExpenseCategoryTile
          title="Utilities"
          subtitle="Variable"
          icon={<Bolt className="size-6 text-blue-600" strokeWidth={1.75} />}
        />
        <ExpenseCategoryTile
          title="Stock"
          subtitle="Consumables"
          icon={<Package className="size-6 text-purple-600" strokeWidth={1.75} />}
        />
        <Button
          type="button"
          variant="ghost"
          className="squircle group flex h-auto items-center justify-start gap-4 border-2 border-dashed border-outline-variant bg-surface-container-high p-5 hover:border-primary hover:bg-primary-container/20"
        >
          <div className="squircle flex size-12 items-center justify-center bg-surface-container-highest text-on-surface-variant transition-all group-hover:bg-primary group-hover:text-on-primary">
            <Plus className="size-6" strokeWidth={2} />
          </div>
          <p className="font-semibold text-on-surface-variant transition-colors group-hover:text-primary">
            New Category
          </p>
        </Button>
      </div>
    </section>
  );
}
