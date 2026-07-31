"use client";

import type { LucideIcon } from "lucide-react";
import { Baby, Pencil, Plus, Scissors, Trash2, UserRound } from "lucide-react";
import { useState } from "react";

import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { useServiceCatalogSection } from "@/features/settings/hooks/use-service-catalog-section";
import { cn } from "@/lib/utils";
import { formatNpr } from "@/utils/format";

const ICON_CYCLE: LucideIcon[] = [Scissors, UserRound, Baby];

type ServiceCatalogCardProps = {
  title: string;
  description: string;
  rate: string;
  rateClassName?: string;
  icon: LucideIcon;
  iconWrapClassName: string;
  onDelete: () => void;
  isRemoving: boolean;
};

function ServiceCatalogCard({
  title,
  description,
  rate,
  rateClassName,
  icon: Icon,
  iconWrapClassName,
  onDelete,
  isRemoving,
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
            disabled
            aria-label="Edit service (coming soon)"
          >
            <Pencil className="size-5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isRemoving}
            onClick={onDelete}
            className="squircle text-error hover:bg-error-container"
            aria-label="Remove service"
          >
            <Trash2 className="size-5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
      <h4 className="font-headline mb-1 text-xl font-semibold">{title}</h4>
      <p className="mb-8 line-clamp-2 text-sm text-on-surface-variant">
        {description || "Catalog service"}
      </p>
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

const wrapClasses = [
  "bg-primary-container text-on-primary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-container text-on-tertiary-container",
];

export function ServiceCatalogSection() {
  const [showRegister, setShowRegister] = useState(false);
  const {
    services,
    isLoading,
    error,
    refetch,
    registerForm,
    submitRegister,
    isRegistering,
    removeService,
    isRemoving,
  } = useServiceCatalogSection();

  const {
    register,
    formState: { errors },
  } = registerForm;

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
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
            onClick={() => setShowRegister((v) => !v)}
            className="squircle deep-indigo-gradient flex h-14 items-center gap-2 border-0 px-8 font-semibold text-on-primary shadow-primary/20 hover:brightness-110 active:scale-95"
          >
            <Plus className="size-5" strokeWidth={2.25} />
            Register Service
          </Button>
        </div>

        {showRegister ? (
          <form
            className="squircle grid gap-4 bg-surface-container-low p-6 md:grid-cols-3"
            onSubmit={submitRegister}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                Name
              </label>
              <input
                className="squircle h-12 w-full bg-surface-container-high px-4"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-xs text-error">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                Default price
              </label>
              <input
                type="number"
                className="squircle h-12 w-full bg-surface-container-high px-4"
                {...register("default_price", { valueAsNumber: true })}
              />
              {errors.default_price ? (
                <p className="text-xs text-error">{errors.default_price.message}</p>
              ) : null}
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isRegistering} className="h-12 w-full">
                {isRegistering ? "Saving…" : "Add service"}
              </Button>
            </div>
          </form>
        ) : null}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = ICON_CYCLE[index % ICON_CYCLE.length] ?? Scissors;
            const iconWrapClassName: string =
              wrapClasses[index % wrapClasses.length] ??
              "bg-primary-container text-on-primary-container";
            return (
              <ServiceCatalogCard
                key={service.id}
                title={service.name}
                description=""
                rate={formatNpr(Number(service.default_price))}
                rateClassName={
                  index % 3 === 0
                    ? "text-primary"
                    : index % 3 === 1
                      ? "text-on-secondary-container"
                      : "text-on-tertiary-container"
                }
                icon={Icon}
                iconWrapClassName={iconWrapClassName}
                onDelete={() => {
                  void removeService(service.id);
                }}
                isRemoving={isRemoving}
              />
            );
          })}
        </div>
      </section>
    </QueryState>
  );
}
