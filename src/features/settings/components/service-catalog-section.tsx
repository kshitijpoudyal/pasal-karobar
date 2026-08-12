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
};

function ServiceCatalogMoreMenu({
  onEdit,
  onDelete,
  disabled = false,
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
        className="rounded-full p-1.5 text-on-surface-variant transition-all hover:bg-surface-container-high/40 disabled:opacity-50"
      >
        <MoreVertical className="size-4" strokeWidth={1.75} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-36 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <Pencil className="size-3.5 shrink-0" strokeWidth={1.75} />
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
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-error transition-colors hover:bg-error-container/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-3.5 shrink-0" strokeWidth={1.75} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

type ServiceCatalogListItemProps = {
  title: string;
  rate: string;
  icon: LucideIcon;
  iconWrapClassName: string;
  readOnly?: boolean;
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
  readOnly = false,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  isReordering = false,
  isRemoving,
}: ServiceCatalogListItemProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          iconWrapClassName,
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-on-surface">{title}</h4>
        <p className="truncate text-[10px] text-on-surface-variant">{rate}</p>
      </div>
      {!readOnly ? (
        <div className="flex shrink-0 items-center gap-0.5">
          {onMoveUp || onMoveDown ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canMoveUp || isReordering || isRemoving}
                onClick={onMoveUp}
                className="size-7 text-on-surface-variant"
                aria-label={`Move ${title} earlier in list`}
              >
                <ChevronUp className="size-3.5" strokeWidth={1.75} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!canMoveDown || isReordering || isRemoving}
                onClick={onMoveDown}
                className="size-7 text-on-surface-variant"
                aria-label={`Move ${title} later in list`}
              >
                <ChevronDown className="size-3.5" strokeWidth={1.75} />
              </Button>
            </>
          ) : null}
          <ServiceCatalogMoreMenu
            onEdit={onEdit}
            onDelete={onDelete}
            disabled={isRemoving}
          />
        </div>
      ) : null}
    </div>
  );
}

export function ServiceCatalogSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { confirm } = useConfirmDrawer();
  const {
    services,
    serviceCount,
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

  function cancelEditing() {
    setIsEditing(false);
    closeEdit();
    closeRegister();
  }

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      <section className="squircle bg-surface-container-low p-5 lg:p-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="squircle shrink-0 bg-secondary-container p-3 text-on-secondary-container">
              <Scissors className="size-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-headline text-xl font-semibold">Service Catalog</h3>
          </div>
          {isEditing ? (
            <Button
              type="button"
              variant="secondary"
              size="cta"
              className="shrink-0"
              onClick={cancelEditing}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="cta"
              className="shrink-0"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-4" strokeWidth={2} aria-hidden />
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <p className="mb-4 text-xs text-on-surface-variant">
            Use ↑↓ to reorder. Tap ⋮ to edit or remove a service.
          </p>
        ) : null}

        {deleteError ? (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container/30 px-3 py-2"
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
          showEntryPosition
          maxEntryPosition={serviceCount}
        />

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = getServiceIconComponent(service.icon);
            const iconWrapClassName: string =
              wrapClasses[index % wrapClasses.length] ??
              "bg-primary-container text-on-primary-container";
            const itemProps = {
              title: service.name,
              rate: formatNpr(Number(service.default_price)),
              icon: Icon,
              iconWrapClassName,
              readOnly: !isEditing,
              onEdit: () => openEdit(service),
              ...(isEditing
                ? {
                    onMoveUp: () => void moveService(service.id, "up"),
                    onMoveDown: () => void moveService(service.id, "down"),
                    canMoveUp: index > 0,
                    canMoveDown: index < services.length - 1,
                    isReordering,
                  }
                : {}),
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
          {isEditing ? (
            <li className="sm:col-span-2 lg:col-span-3">
              <ServiceCatalogAddCard
                onClick={() => setRegisterOpen(true)}
                className="min-h-0 flex-row gap-2.5 rounded-xl px-3 py-2"
              />
            </li>
          ) : null}
        </ul>
      </section>
    </QueryState>
  );
}
