"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronUp, MoreVertical, Pencil, Scissors, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

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

type ServiceCatalogMoreMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  triggerClassName?: string;
};

function ServiceCatalogMoreMenu({
  onEdit,
  onDelete,
  disabled = false,
  triggerClassName,
}: ServiceCatalogMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label="More options"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-high/40 disabled:opacity-50",
          triggerClassName,
        )}
      >
        <MoreVertical className="size-5" strokeWidth={1.75} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-40 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <Pencil className="size-4 shrink-0" strokeWidth={1.75} />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error-container/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-4 shrink-0" strokeWidth={1.75} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

type ServiceCatalogItemProps = {
  title: string;
  rate: string;
  rateClassName?: string;
  icon: LucideIcon;
  iconWrapClassName: string;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isReordering?: boolean;
  isRemoving: boolean;
};

function ServiceCatalogListItem({
  title,
  rate,
  icon: Icon,
  iconWrapClassName,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isReordering = false,
  isRemoving,
}: ServiceCatalogItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          iconWrapClassName,
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-body-md font-medium text-on-surface">{title}</h4>
        <p className="truncate text-[11px] text-on-surface-variant">Default rate · {rate}</p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {onMoveUp || onMoveDown ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canMoveUp || isReordering || isRemoving}
              onClick={onMoveUp}
              className="size-8 text-on-surface-variant"
              aria-label={`Move ${title} earlier in list`}
            >
              <ChevronUp className="size-4" strokeWidth={1.75} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canMoveDown || isReordering || isRemoving}
              onClick={onMoveDown}
              className="size-8 text-on-surface-variant"
              aria-label={`Move ${title} later in list`}
            >
              <ChevronDown className="size-4" strokeWidth={1.75} />
            </Button>
          </>
        ) : null}
        <ServiceCatalogMoreMenu
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={isRemoving}
          triggerClassName="size-8"
        />
      </div>
    </div>
  );
}

type ServiceCatalogCardProps = ServiceCatalogItemProps & {
  description: string;
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
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isReordering = false,
  isRemoving,
}: ServiceCatalogCardProps) {
  return (
    <div className="squircle group hidden min-w-0 bg-surface-container-low p-5 transition-all hover:bg-surface-container-high md:block sm:p-8">
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
          {onMoveUp || onMoveDown ? (
            <div className="flex flex-col gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canMoveUp || isReordering || isRemoving}
                onClick={onMoveUp}
                className="squircle size-9 text-on-surface-variant hover:bg-surface-container-highest"
                aria-label={`Move ${title} earlier in list`}
              >
                <ChevronUp className="size-5" strokeWidth={1.75} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canMoveDown || isReordering || isRemoving}
                onClick={onMoveDown}
                className="squircle size-9 text-on-surface-variant hover:bg-surface-container-highest"
                aria-label={`Move ${title} later in list`}
              >
                <ChevronDown className="size-5" strokeWidth={1.75} />
              </Button>
            </div>
          ) : null}
          <ServiceCatalogMoreMenu
            onEdit={onEdit}
            onDelete={onDelete}
            disabled={isRemoving}
          />
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
    moveService,
    isReordering,
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
        <p className="text-sm text-on-surface-variant">
          <span className="md:hidden">
            Use the arrows on each row to set order in the new entry form.
          </span>
          <span className="hidden md:inline">
            Use the arrows on each card to set order in the new entry form (first
            service appears first).
          </span>
        </p>

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

        <ul className="flex flex-col gap-2 md:hidden">
          {services.map((service, index) => {
            const Icon = getServiceIconComponent(service.icon);
            const iconWrapClassName: string =
              wrapClasses[index % wrapClasses.length] ??
              "bg-primary-container text-on-primary-container";
            const itemProps = {
              title: service.name,
              rate: formatNpr(Number(service.default_price)),
              rateClassName:
                index % 3 === 0
                  ? "text-primary"
                  : index % 3 === 1
                    ? "text-on-secondary-container"
                    : "text-on-tertiary-container",
              icon: Icon,
              iconWrapClassName,
              onEdit: () => openEdit(service),
              onMoveUp: () => void moveService(service.id, "up"),
              onMoveDown: () => void moveService(service.id, "down"),
              canMoveUp: index > 0,
              canMoveDown: index < services.length - 1,
              isReordering,
              onDelete: () => {
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
              },
              isRemoving: removingServiceId === service.id,
            };
            return (
              <li key={service.id}>
                <ServiceCatalogListItem {...itemProps} />
              </li>
            );
          })}
          <li>
            <ServiceCatalogAddCard
              onClick={() => setRegisterOpen(true)}
              className="min-h-0 flex-row gap-3 rounded-xl p-3"
            />
          </li>
        </ul>

        <div className="hidden md:grid md:grid-cols-2 md:gap-6 xl:grid-cols-3">
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
                onMoveUp={() => void moveService(service.id, "up")}
                onMoveDown={() => void moveService(service.id, "down")}
                canMoveUp={index > 0}
                canMoveDown={index < services.length - 1}
                isReordering={isReordering}
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
          <ServiceCatalogAddCard
            onClick={() => setRegisterOpen(true)}
            className="h-full min-h-[16.5rem]"
          />
        </div>
      </section>
    </QueryState>
  );
}
