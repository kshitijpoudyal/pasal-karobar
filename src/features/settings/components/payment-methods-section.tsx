"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import { PaymentMethodVisual } from "@/components/payment-method-picker";
import { QueryState } from "@/components/layout/query-state";
import { runConfirmedAction, useConfirmDrawer } from "@/components/confirm-drawer";
import { Button } from "@/components/ui/button";
import type { PaymentMethodPresetCode } from "@/constants/payment-method-presets";
import { RegisterPaymentMethodModal } from "@/features/settings/components/register-payment-method-modal";
import { ServiceCatalogAddCard } from "@/features/settings/components/service-catalog-add-card";
import { usePaymentMethodsSection } from "@/features/settings/hooks/use-payment-methods-section";
import { cn } from "@/lib/utils";
import type { BusinessPaymentMethodRecord, PaymentMethod } from "@/types/database";

const wrapClasses = [
  "bg-primary-container text-on-primary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-container text-on-tertiary-container",
];

function paymentMethodSubtitle(methodCode: PaymentMethod): string {
  if (methodCode === "OTHER") return "Custom payment type";
  return methodCode.replace(/_/g, " ");
}

type PaymentMethodMoreMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
  disabled?: boolean;
};

function PaymentMethodMoreMenu({
  onEdit,
  onDelete,
  deleteDisabled = false,
  disabled = false,
}: PaymentMethodMoreMenuProps) {
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
            disabled={disabled || deleteDisabled}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-error transition-colors hover:bg-error-container/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="size-3.5 shrink-0" strokeWidth={1.75} />
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

type PaymentMethodListItemProps = {
  row: BusinessPaymentMethodRecord;
  title: string;
  subtitle: string;
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
  deleteDisabled?: boolean;
};

function PaymentMethodListItem({
  row,
  title,
  subtitle,
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
  deleteDisabled = false,
}: PaymentMethodListItemProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          iconWrapClassName,
        )}
      >
        <PaymentMethodVisual methodCode={row.method_code} size="sm" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-on-surface">{title}</h4>
        <p className="truncate text-[10px] text-on-surface-variant">{subtitle}</p>
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
          <PaymentMethodMoreMenu
            onEdit={onEdit}
            onDelete={onDelete}
            disabled={isRemoving}
            deleteDisabled={deleteDisabled}
          />
        </div>
      ) : null}
    </div>
  );
}

export function PaymentMethodsSection() {
  const { confirm } = useConfirmDrawer();
  const [isEditing, setIsEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"preset" | "custom">("preset");
  const [presetCode, setPresetCode] = useState<PaymentMethodPresetCode>("CASH");
  const [customLabel, setCustomLabel] = useState("");
  const {
    methods,
    methodCount,
    inactivePresets,
    isLoading,
    error,
    refetch,
    deleteError,
    clearDeleteError,
    moveMethod,
    isReordering,
    addPreset,
    addCustom,
    isAdding,
    removeMethod,
    removingId,
    editingMethod,
    editLabel,
    setEditLabel,
    editEntryPosition,
    setEditEntryPosition,
    openEdit,
    closeEdit,
    saveEdit,
    isSavingEdit,
  } = usePaymentMethodsSection();

  function buildItemProps(row: BusinessPaymentMethodRecord, index: number) {
    const iconWrapClassName: string =
      wrapClasses[index % wrapClasses.length] ??
      "bg-primary-container text-on-primary-container";

    return {
      row,
      title: row.label,
      subtitle: paymentMethodSubtitle(row.method_code),
      iconWrapClassName,
      readOnly: !isEditing,
      onEdit: () => openEdit(row),
      ...(isEditing
        ? {
            onMoveUp: () => void moveMethod(row.id, "up"),
            onMoveDown: () => void moveMethod(row.id, "down"),
            canMoveUp: index > 0,
            canMoveDown: index < methods.length - 1,
            isReordering,
          }
        : {}),
      onDelete: () => {
        void runConfirmedAction(
          confirm,
          {
            title: "Remove payment method?",
            description: `"${row.label}" will be hidden from new entries. Past transactions are unchanged.`,
            confirmLabel: "Remove",
            cancelLabel: "Keep",
            tone: "destructive",
          },
          () => removeMethod(row),
        );
      },
      isRemoving: removingId === row.id,
      deleteDisabled: methods.length <= 1,
    };
  }

  async function handleAddSubmit() {
    if (addMode === "preset") {
      await addPreset(presetCode);
    } else {
      await addCustom(customLabel);
      setCustomLabel("");
    }
    setAddOpen(false);
  }

  function openAddModal() {
    setAddMode("preset");
    if (inactivePresets[0]) {
      setPresetCode(inactivePresets[0].code);
    }
    setAddOpen(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    closeEdit();
    setAddOpen(false);
  }

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      <section className="squircle bg-surface-container-low p-5 lg:p-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="squircle shrink-0 bg-primary-container p-3 text-on-primary-container">
              <CreditCard className="size-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-headline text-xl font-semibold">Payment Methods</h3>
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
            Use ↑↓ to reorder. Tap ⋮ to edit or remove a payment method.
          </p>
        ) : null}

        {deleteError ? (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container/30 px-3 py-2"
            role="alert"
          >
            <p className="text-sm text-on-surface">{deleteError}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={clearDeleteError}
            >
              Dismiss
            </Button>
          </div>
        ) : null}

        <RegisterPaymentMethodModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          mode="add"
          addMode={addMode}
          onAddModeChange={setAddMode}
          inactivePresets={inactivePresets}
          presetCode={presetCode}
          onPresetCodeChange={setPresetCode}
          customLabel={customLabel}
          onCustomLabelChange={setCustomLabel}
          editLabel=""
          onEditLabelChange={() => {}}
          onSubmit={() => void handleAddSubmit()}
          isSubmitting={isAdding}
        />

        <RegisterPaymentMethodModal
          open={editingMethod !== null}
          onClose={closeEdit}
          mode="edit"
          addMode="preset"
          onAddModeChange={() => {}}
          inactivePresets={[]}
          presetCode="CASH"
          onPresetCodeChange={() => {}}
          customLabel=""
          onCustomLabelChange={() => {}}
          editLabel={editLabel}
          onEditLabelChange={setEditLabel}
          editEntryPosition={editEntryPosition}
          onEditEntryPositionChange={setEditEntryPosition}
          maxEntryPosition={methodCount}
          onSubmit={() => void saveEdit()}
          isSubmitting={isSavingEdit}
        />

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((row, index) => (
            <li key={row.id}>
              <PaymentMethodListItem {...buildItemProps(row, index)} />
            </li>
          ))}
          {isEditing ? (
            <li className="sm:col-span-2 lg:col-span-3">
              <ServiceCatalogAddCard
                onClick={openAddModal}
                label="Add payment method"
                className="min-h-0 flex-row gap-2.5 rounded-xl px-3 py-2"
              />
            </li>
          ) : null}
        </ul>
      </section>
    </QueryState>
  );
}
