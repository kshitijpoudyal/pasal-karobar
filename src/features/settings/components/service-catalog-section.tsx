import type { LucideIcon } from "lucide-react";
import { Baby, Pencil, Plus, Scissors, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ServiceCatalogCardProps = {
  title: string;
  description: string;
  rate: string;
  rateClassName?: string;
  icon: LucideIcon;
  iconWrapClassName: string;
};

function ServiceCatalogCard({
  title,
  description,
  rate,
  rateClassName,
  icon: Icon,
  iconWrapClassName,
}: ServiceCatalogCardProps) {
  return (
    <div className="squircle group bg-surface-container-low p-8 transition-all hover:bg-surface-container-high">
      <div className="mb-8 flex items-start justify-between">
        <div
          className={cn(
            "squircle flex size-14 items-center justify-center",
            iconWrapClassName,
          )}
        >
          <Icon className="size-8" strokeWidth={1.75} />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="squircle text-on-surface-variant hover:bg-surface-container-highest"
          >
            <Pencil className="size-5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="squircle text-error hover:bg-error-container"
          >
            <Trash2 className="size-5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
      <h4 className="font-headline mb-1 text-xl font-semibold">{title}</h4>
      <p className="mb-8 line-clamp-2 text-sm text-on-surface-variant">{description}</p>
      <div className="squircle flex items-center justify-between bg-surface-container-high p-5">
        <span className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
          Rate
        </span>
        <span className={cn("font-headline text-xl font-semibold", rateClassName)}>
          {rate}
        </span>
      </div>
    </div>
  );
}

export function ServiceCatalogSection() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="squircle bg-secondary-container p-3 text-on-secondary-container">
            <Scissors className="size-6" strokeWidth={1.75} />
          </div>
          <h3 className="font-headline text-xl font-semibold">Service Catalog</h3>
        </div>
        <Button
          type="button"
          className="squircle flex h-14 items-center gap-2 border-0 bg-surface-container-high px-8 font-semibold text-primary hover:bg-surface-container-highest active:scale-95"
        >
          <Plus className="size-5" strokeWidth={2.25} />
          Register Service
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <ServiceCatalogCard
          title="Haircut"
          description="Professional curation of facial hair and scalp styling."
          rate="रू 500"
          rateClassName="text-primary"
          icon={Scissors}
          iconWrapClassName="bg-primary-container text-on-primary-container"
        />
        <ServiceCatalogCard
          title="Beard Trim"
          description="Precision facial grooming with archival oil treatment."
          rate="रू 350"
          rateClassName="text-on-secondary-container"
          icon={UserRound}
          iconWrapClassName="bg-secondary-container text-on-secondary-container"
        />
        <ServiceCatalogCard
          title="Junior Cut"
          description="Simplified styling for children under the age of twelve."
          rate="रू 300"
          rateClassName="text-on-tertiary-container"
          icon={Baby}
          iconWrapClassName="bg-tertiary-container text-on-tertiary-container"
        />
      </div>
    </section>
  );
}
