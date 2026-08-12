"use client";

import { useCallback, useEffect, useId, useState } from "react";
import {
  Bolt,
  ChevronDown,
  CirclePlus,
  Home,
  Loader2,
  Package,
  X,
  type LucideIcon,
  QUICK_CATEGORY_ICONS,
} from "@/features/transactions/components/record-transaction-modal-icons";

import {
  businessPaymentRowsToPickerOptions,
  PaymentMethodPicker,
  type PaymentMethodPickerOption,
} from "@/components/payment-method-picker";
import { getServiceIconComponent } from "@/constants/service-icons";
import { useConfirmDrawer } from "@/components/confirm-drawer";
import { CustomerPhoneAutocomplete } from "@/features/transactions/components/customer-phone-autocomplete";
import { planCustomerNameSaveOnEntry } from "@/features/transactions/utils/customer-name-on-entry";
import { useRecordTransactionSubmit } from "@/features/transactions/hooks/use-record-transaction-submit";
import { useActiveBusinessPaymentMethodsQuery } from "@/hooks/queries/use-business-payment-method-queries";
import { useCustomersQuery } from "@/hooks/queries/use-customer-queries";
import { cn } from "@/lib/utils";
import { parseNepalPhone } from "@/utils/phone-np";
import { parseNprAmount } from "@/utils/money";
import type { PaymentMethod } from "@/types/database";

type RecordTransactionModalProps = {
  open: boolean;
  onClose: () => void;
  initialCustomerPhone?: string | null;
};

type Tab = "income" | "expense";

const FIELD_LABEL =
  "font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase";

const rsFormatter = new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 });

function formatRs(amount: number): string {
  return `Rs. ${rsFormatter.format(amount)}`;
}

export function RecordTransactionModal({
  open,
  onClose,
  initialCustomerPhone,
}: RecordTransactionModalProps) {
  const titleId = useId();
  const typeSelectId = useId();
  const [tab, setTab] = useState<Tab>("income");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [tip, setTip] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseCategoryId, setExpenseCategoryId] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    servicesQuery,
    categoriesQuery,
    createMutation,
    submitIncome,
    submitExpense,
    resolveCategoryIdByName,
    businessId,
  } = useRecordTransactionSubmit(onClose);
  const { confirm } = useConfirmDrawer();
  const customersQuery = useCustomersQuery(businessId);
  const paymentMethodsQuery = useActiveBusinessPaymentMethodsQuery(businessId);
  const paymentPickerOptions = businessPaymentRowsToPickerOptions(
    paymentMethodsQuery.data ?? [],
  );
  const selectedPaymentOption: PaymentMethodPickerOption | null =
    paymentPickerOptions.find((option) => option.id === selectedPaymentMethodId) ??
    paymentPickerOptions[0] ??
    null;
  const selectedPaymentCode: PaymentMethod =
    selectedPaymentOption?.methodCode ?? "CASH";

  const resetFormState = useCallback(() => {
    setTab("income");
    setSelectedServiceIds([]);
    setPrice("");
    setTip("");
    setSelectedPaymentMethodId("");
    setExpenseAmount("");
    setExpenseDesc("");
    setExpenseCategoryId(null);
    setCustomerPhone("");
    setCustomerName("");
    setFormError(null);
  }, []);

  useEffect(() => {
    if (!open || paymentPickerOptions.length === 0) return;
    setSelectedPaymentMethodId((current) => {
      if (current && paymentPickerOptions.some((option) => option.id === current)) {
        return current;
      }
      return paymentPickerOptions[0]?.id ?? "";
    });
  }, [open, paymentPickerOptions]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      resetFormState();
      return;
    }
    resetFormState();
    if (initialCustomerPhone) {
      setTab("income");
      setCustomerPhone(initialCustomerPhone);
      setCustomerName("");
    }
  }, [open, initialCustomerPhone, resetFormState]);

  if (!open) return null;

  const priceNum = parseNprAmount(price);
  const tipNum = parseNprAmount(tip);
  const incomeTotal = priceNum + tipNum;

  const submitLabel = tab === "income" ? `Add ${formatRs(incomeTotal)}` : "Add Expense";

  function sumDefaultPricesForServices(serviceIds: string[]): number {
    const services = servicesQuery.data ?? [];
    return serviceIds.reduce((sum, id) => {
      const service = services.find((row) => row.id === id);
      return sum + (service ? Number(service.default_price) : 0);
    }, 0);
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((previous) => {
      const next = previous.includes(serviceId)
        ? previous.filter((id) => id !== serviceId)
        : [...previous, serviceId];
      const total = sumDefaultPricesForServices(next);
      setPrice(total > 0 ? String(total) : "");
      return next;
    });
    setFormError(null);
  }

  function fillExpense(categoryName: string, categoryId?: string) {
    setExpenseDesc(categoryName);
    if (categoryId) {
      setExpenseCategoryId(categoryId);
    } else {
      const id = resolveCategoryIdByName(categoryName);
      if (id) setExpenseCategoryId(id);
    }
    setFormError(null);
  }

  async function handleSubmit() {
    setFormError(null);
    try {
      if (tab === "income") {
        const subtotal = parseNprAmount(price);
        const tipValue = parseNprAmount(tip);
        if (selectedServiceIds.length === 0) {
          setFormError("Select at least one service.");
          return;
        }

        const customers = customersQuery.data ?? [];
        const nameTrim = customerName.trim();
        const phoneTrim = customerPhone.trim();
        const savePlan = planCustomerNameSaveOnEntry(customers, phoneTrim, nameTrim);
        let saveCustomerName = savePlan === "apply";

        if (savePlan === "needs_confirm") {
          const parsed = parseNepalPhone(phoneTrim);
          const existing = parsed.ok
            ? customers.find((c) => c.phone_normalized === parsed.normalized)
            : undefined;
          const existingName = existing?.name?.trim() ?? "";
          saveCustomerName = await confirm({
            title: "Update customer name?",
            description: `This number is saved as “${existingName}”. Change it to “${nameTrim}”?`,
            confirmLabel: "Update name",
            cancelLabel: "Keep existing",
          });
        }

        await submitIncome({
          serviceIds: selectedServiceIds,
          subtotal,
          tip: tipValue,
          payment: selectedPaymentCode,
          customerPhone,
          customerName: nameTrim || undefined,
          saveCustomerName,
        });
        return;
      }
      const amount = parseNprAmount(expenseAmount);
      let categoryId = expenseCategoryId;
      if (!categoryId && expenseDesc) {
        categoryId = resolveCategoryIdByName(expenseDesc) ?? null;
      }
      if (!categoryId) {
        setFormError("Select or match an expense category.");
        return;
      }
      await submitExpense({
        expenseCategoryId: categoryId,
        amount,
        note: expenseDesc,
        payment: selectedPaymentCode,
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save transaction.",
      );
    }
  }

  const catalogServices = (
    servicesQuery.data?.filter((s) => s.is_active !== false) ?? []
  ).sort(
    (a, b) =>
      a.display_order - b.display_order ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  const quickCategories = (categoriesQuery.data ?? [])
    .filter((c) => c.is_active)
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm lg:items-center lg:bg-black/30 lg:p-8 lg:frosted-vellum"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "record-transaction-modal flex w-full max-w-2xl flex-col overflow-hidden bg-surface-bright shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)]",
          "max-h-[92dvh] animate-[slideUpSheet_0.3s_ease-out] rounded-t-[32px] pb-[env(safe-area-inset-bottom)]",
          "lg:max-h-[90vh] lg:squircle lg:animate-none lg:rounded-[24px] lg:pb-0",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="h-1.5 w-12 rounded-full bg-outline-variant/50" aria-hidden />
        </div>
        <div className="shrink-0 px-6 pt-2 pb-4 lg:px-8 lg:pt-8 lg:pb-6">
          <header className="flex items-center justify-between">
            <h2
              id={titleId}
              className="font-headline text-2xl leading-relaxed font-medium tracking-tight text-on-surface lg:text-3xl"
            >
              Record Transaction
            </h2>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm transition-colors hover:bg-surface-container active:scale-95"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-5 text-on-surface-variant" strokeWidth={1.75} />
            </button>
          </header>

          <div className="mt-6 flex items-center justify-between gap-4 lg:mt-8">
            <label
              htmlFor={typeSelectId}
              className={`${FIELD_LABEL} whitespace-nowrap`}
            >
              Transaction Type
            </label>
            <div className="relative max-w-[200px] flex-1">
              <select
                id={typeSelectId}
                value={tab}
                onChange={(e) => setTab(e.target.value as Tab)}
                className="font-body w-full cursor-pointer appearance-none rounded-lg border-none bg-surface-container-low py-2 pr-10 pl-4 text-sm font-medium text-on-surface outline-none focus:ring-0"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-on-surface-variant"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
          </div>
        </div>

        <div className="hide-scrollbar flex-1 space-y-10 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
          {tab === "income" ? (
            <div className="space-y-10">
              <div>
                <p className={`${FIELD_LABEL} mb-4`}>
                  Select service
                  <span className="normal-case tracking-normal text-on-surface-variant/80">
                    {" "}
                    · tap to select multiple
                  </span>
                </p>
                {servicesQuery.isLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-on-surface-variant">
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    Loading your services…
                  </div>
                ) : catalogServices.length === 0 ? (
                  <p className="squircle bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant shadow-sm">
                    No services yet. Add them under Settings → Service Catalog.
                  </p>
                ) : (
                  <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 hide-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
                    {catalogServices.map((service) => {
                      const Icon = getServiceIconComponent(service.icon);
                      const defaultPrice = Number(service.default_price);
                      const isActive = selectedServiceIds.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className={cn(
                            "service-card group shrink-0 bg-surface-container-lowest shadow-sm transition-all active:scale-95",
                            "flex min-w-[9.5rem] items-center gap-3 rounded-full border border-outline-variant/80 px-4 py-3",
                            "sm:min-w-0 sm:flex-col sm:justify-center sm:squircle sm:rounded-[24px] sm:border-transparent sm:p-6 sm:hover:-translate-y-0.5 sm:hover:shadow-md",
                            isActive && "active",
                          )}
                        >
                          <Icon
                            className="size-6 shrink-0 text-outline transition-colors group-hover:text-primary sm:mb-3 sm:size-10"
                            strokeWidth={1.75}
                          />
                          <div className="min-w-0 text-left sm:text-center">
                            <span className="font-headline block truncate text-sm font-medium text-on-surface sm:text-base">
                              {service.name}
                            </span>
                            <span className="font-body mt-0.5 block text-xs font-light text-on-surface-variant sm:text-sm">
                              {formatRs(defaultPrice)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <AmountCard
                  label="Service Price"
                  id="record-income-price"
                  value={price}
                  onChange={setPrice}
                  placeholder="0.00"
                  compact
                />
                <AmountCard
                  label="Tip (Optional)"
                  id="record-income-tip"
                  value={tip}
                  onChange={setTip}
                  placeholder="0"
                  compact
                />
              </div>

              <CustomerPhoneAutocomplete
                id="record-income-phone"
                label="Phone number (optional)"
                labelClassName={FIELD_LABEL}
                value={customerPhone}
                onChange={setCustomerPhone}
                nameValue={customerName}
                onNameChange={setCustomerName}
                showLinkedNameField
                autoFillNameFromPhone={false}
              />

              <PaymentMethodPicker
                options={paymentPickerOptions}
                valueId={selectedPaymentMethodId}
                onChange={(option) => setSelectedPaymentMethodId(option.id)}
                labelClassName={FIELD_LABEL}
              />
            </div>
          ) : (
            <div className="space-y-10">
              <div>
                <p className={`${FIELD_LABEL} mb-4`}>Quick Category</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                  {quickCategories.length > 0 ? (
                    quickCategories.map((cat, i) => {
                      const Icon =
                        QUICK_CATEGORY_ICONS[i % QUICK_CATEGORY_ICONS.length] ?? Home;
                      const isActive = expenseCategoryId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => fillExpense(cat.name, cat.id)}
                          className={cn(
                            "service-card group squircle flex flex-col items-center justify-center bg-surface-container-lowest p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:p-6",
                            isActive && "active",
                          )}
                        >
                          <Icon
                            className="mb-3 size-9 text-outline transition-colors group-hover:text-primary sm:size-10"
                            strokeWidth={1.75}
                          />
                          <span className="font-headline text-center text-base font-medium text-on-surface">
                            {cat.name}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <>
                      <CategoryFallback
                        label="Rent"
                        icon={Home}
                        onClick={() => fillExpense("Rent")}
                      />
                      <CategoryFallback
                        label="Power"
                        icon={Bolt}
                        onClick={() => fillExpense("Electricity")}
                      />
                      <CategoryFallback
                        label="Supplies"
                        icon={Package}
                        onClick={() => fillExpense("Supplies")}
                      />
                    </>
                  )}
                </div>
              </div>

              <AmountCard
                label="Expense Amount"
                id="record-expense-amount"
                value={expenseAmount}
                onChange={setExpenseAmount}
                placeholder="0.00"
              />

              <div className="squircle space-y-3 bg-surface-container-lowest p-5 shadow-sm">
                <label className={FIELD_LABEL} htmlFor="record-expense-desc">
                  Description
                </label>
                <input
                  id="record-expense-desc"
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => {
                    setExpenseDesc(e.target.value);
                    setExpenseCategoryId(null);
                  }}
                  placeholder="Enter reason for expense..."
                  className="font-body w-full border-none bg-transparent p-0 text-lg font-medium text-on-surface outline-none placeholder:text-outline-variant focus:ring-0"
                />
              </div>

              <PaymentMethodPicker
                options={paymentPickerOptions}
                valueId={selectedPaymentMethodId}
                onChange={(option) => setSelectedPaymentMethodId(option.id)}
                labelClassName={FIELD_LABEL}
              />
            </div>
          )}
        </div>

        <footer className="shrink-0 bg-surface-bright px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:px-8 lg:pt-6 lg:pb-8">
          {formError || createMutation.isError ? (
            <p className="mb-3 text-center text-sm text-error" role="alert">
              {formError ?? createMutation.error?.message}
            </p>
          ) : null}
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={() => void handleSubmit()}
            className="font-headline deep-indigo-gradient squircle flex h-16 w-full items-center justify-center gap-3 text-xl font-medium tracking-wide text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
          >
            <CirclePlus className="size-6" strokeWidth={2} aria-hidden />
            {createMutation.isPending ? "Saving…" : submitLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

function AmountCard({
  label,
  id,
  value,
  onChange,
  placeholder,
  compact = false,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "squircle space-y-2 bg-surface-container-lowest shadow-sm sm:space-y-3",
        compact ? "min-w-0 p-3 sm:p-5" : "p-5",
      )}
    >
      <label
        className={cn(FIELD_LABEL, compact && "text-[10px] tracking-[0.1em]")}
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative flex min-w-0 items-center">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "record-entry-amount-input font-headline w-full min-w-0 border-none bg-transparent p-0 font-medium text-on-surface outline-none placeholder:text-outline-variant focus:ring-0",
            compact ? "text-xl sm:text-3xl" : "text-3xl",
          )}
        />
        <span
          className={cn(
            "font-body ml-1 shrink-0 font-light text-on-surface-variant sm:ml-2",
            compact ? "text-sm sm:text-lg" : "text-lg",
          )}
        >
          Rs.
        </span>
      </div>
    </div>
  );
}

function CategoryFallback({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group squircle flex flex-col items-center justify-center bg-surface-container-lowest p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:p-6"
    >
      <Icon
        className="mb-3 size-9 text-outline transition-colors group-hover:text-primary sm:size-10"
        strokeWidth={1.75}
      />
      <span className="font-headline text-base font-medium text-on-surface">
        {label}
      </span>
    </button>
  );
}
