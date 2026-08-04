"use client";

import type { LucideIcon } from "lucide-react";
import { Pencil, Scissors, Trash2 } from "lucide-react";
import { useState } from "react";

import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { runConfirmedAction, useConfirmDrawer } from "@/components/confirm-drawer";
import { getServiceIconComponent, DEFAULT_SERVICE_ICON_ID } from "@/constants/service-icons";
import { ServiceCatalogAddCard } from "@/features/settings/components/service-catalog-add-card";
import { RegisterServiceModal } from "@/features/settings/components/register-service-modal";
import { useServiceCatalogSection } from "@/features/settings/hooks/use-service-catalog-section";
import { cn } from "@/lib/utils";
import { formatNpr } from "@/utils/format";

const wrapClasses = [
  "bg-primary-container text-on-primary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-container text-on-tertiary-container",
];

type ServiceCatalogCardProps = {
  title: string;
  description: string;
  rate: string;
  rateClassName?: string;
  icon: LucideIcon;
  iconWrapClassName: string;
  onEdit: () => void;
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
  onEdit,
  onDelete,
  isRemoving,
}: ServiceCatalogCardProps) {
  return (
    <div className="squircle group min-w-0 bg-surface-container-low p-5 transition-all hover:bg-surface-container-high sm:p-8">
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
            onClick={onEdit}
            className="squircle text-on-surface-variant hover:bg-surface-container-highest"
            aria-label={`Edit ${title}`}
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
      <h4 className="font-headline mb-1 truncate text-xl font-semibold">{title}</h4>
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

export function ServiceCatalogSection() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const { confirm } = useConfirmDrawer();
  const {
    services,
    isLoading,
    error,
    deleteError,
    clearDeleteError,
    refetch,
    registerForm,
    submitRegister,
    isRegistering,
    editingService,
    editForm,
    closeEdit,
    submitEdit,
    isUpdating,
    openEdit,
    removeService,
    removingServiceId,
  } = useServiceCatalogSection({
    onServiceCreated: () => setRegisterOpen(false),
  });

  const closeRegister = () => {
    setRegisterOpen(false);
    registerForm.reset({
      name: "",
      default_price: 0,
      icon: DEFAULT_SERVICE_ICON_ID,
    });
  };

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="squircle bg-secondary-container p-3 text-on-secondary-container">
            <Scissors className="size-6" strokeWidth={1.75} />
          </div>
          <h3 className="font-headline text-xl font-semibold">Service Catalog</h3>
        </div>

        {deleteError ? (
          <div
            className="squircle flex flex-wrap items-center justify-between gap-3 border border-error/30 bg-error-container/30 px-4 py-3"
            role="alert"
          >
            <p className="text-sm text-on-surface">{deleteError}</p>
            <Button type="button" variant="secondary" size="sm" onClick={clearDeleteError}>
              Dismiss
            </Button>
          </div>
        ) : null}

        <RegisterServiceModal
          open={registerOpen}
          onClose={closeRegister}
          form={registerForm}
          onSubmit={submitRegister}
          isSubmitting={isRegistering}
        />

        <RegisterServiceModal
          open={editingService !== null}
          onClose={closeEdit}
          form={editForm}
          onSubmit={submitEdit}
          isSubmitting={isUpdating}
          title="Edit Service"
          submitLabel="Save changes"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = getServiceIconComponent(service.icon);
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
                onEdit={() => openEdit(service)}
                onDelete={() => {
                  void runConfirmedAction(
                    confirm,
                    {
                      title: "Remove service?",
                      description: `"${service.name}" will be removed from your catalog. Past income entries will still reference this service for reporting.`,
                      confirmLabel: "Delete",
                      cancelLabel: "Keep",
                      tone: "destructive",
                    },
                    () => removeService(service.id, service.name),
                  );
                }}
                isRemoving={removingServiceId === service.id}
              />
            );
          })}
          <ServiceCatalogAddCard onClick={() => setRegisterOpen(true)} />
        </div>
      </section>
    </QueryState>
  );
}
