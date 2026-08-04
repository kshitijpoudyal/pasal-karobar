"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useState } from "react";
import {
  Banknote,
  Bolt,
  ChevronDown,
  CirclePlus,
  Home,
  Landmark,
  Loader2,
  Package,
  QrCode,
  X,
  type LucideIcon,
  QUICK_CATEGORY_ICONS,
} from "@/features/transactions/components/record-transaction-modal-icons";

import { getServiceIconComponent } from "@/constants/service-icons";
import { useRecordTransactionSubmit } from "@/features/transactions/hooks/use-record-transaction-submit";
import { cn } from "@/lib/utils";
import type { UiPaymentMethod } from "@/utils/payment-method";

type RecordTransactionModalProps = {
  open: boolean;
  onClose: () => void;
};

type Tab = "income" | "expense";

type PaymentMethod = UiPaymentMethod;

const FIELD_LABEL =
  "font-body block text-xs font-light tracking-[0.15em] text-on-surface-variant uppercase";

const rsFormatter = new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 });

function formatRs(amount: number): string {
  return `Rs. ${rsFormatter.format(amount)}`;
}

const PAYMENT_OPTIONS: {
  label: string;
  value: PaymentMethod;
  icon: ReactNode;
}[] = [
  {
    label: "Cash",
    value: "Cash",
    icon: (
      <Banknote className="size-7 text-secondary" strokeWidth={1.75} aria-hidden />
    ),
  },
  {
    label: "eSewa",
    value: "eSewa",
    icon: (
      <div className="flex size-7 items-center justify-center rounded-lg bg-[#4CAF50] text-[10px] font-bold text-white">
        eS
      </div>
    ),
  },
  {
    label: "Khalti",
    value: "Khalti",
    icon: (
      <div className="flex size-7 items-center justify-center rounded-lg bg-[#673AB7] text-[10px] font-bold text-white">
        K
      </div>
    ),
  },
  {
    label: "eBank",
    value: "eBank",
    icon: <Landmark className="size-7 text-primary" strokeWidth={1.75} aria-hidden />,
  },
  {
    label: "fonPay",
    value: "fonPay",
    icon: (
      <QrCode className="size-7 text-tertiary-fixed-dim" strokeWidth={1.75} aria-hidden />
    ),
  },
];

export function RecordTransactionModal({ open, onClose }: RecordTransactionModalProps) {
  const titleId = useId();
  const typeSelectId = useId();
  const [tab, setTab] = useState<Tab>("income");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [tip, setTip] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseCategoryId, setExpenseCategoryId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    servicesQuery,
    categoriesQuery,
    createMutation,
    submitIncome,
    submitExpense,
    resolveCategoryIdByName,
  } = useRecordTransactionSubmit(onClose);

  const resetFormState = useCallback(() => {
    setTab("income");
    setSelectedServiceId(null);
    setPrice("");
    setTip("");
    setPayment("Cash");
    setExpenseAmount("");
    setExpenseDesc("");
    setExpenseCategoryId(null);
    setFormError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      resetFormState();
      void servicesQuery.refetch();
    }
  }, [open, resetFormState, servicesQuery.refetch]);

  if (!open) return null;

  const priceNum = parseFloat(price) || 0;
  const tipNum = parseFloat(tip) || 0;
  const incomeTotal = priceNum + tipNum;

  const submitLabel =
    tab === "income" ? `Add ${formatRs(incomeTotal)}` : "Add Expense";

  function selectService(serviceId: string, servicePrice: number) {
    setSelectedServiceId(serviceId);
    setPrice(String(servicePrice));
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
        const subtotal = parseFloat(price) || 0;
        const tipValue = parseFloat(tip) || 0;
        if (!selectedServiceId) {
          setFormError("Select a service.");
          return;
        }
        await submitIncome({
          serviceId: selectedServiceId,
          subtotal,
          tip: tipValue,
          payment,
        });
        return;
      }
      const amount = parseFloat(expenseAmount) || 0;
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
        payment,
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save transaction.",
      );
    }
  }

  const catalogServices =
    servicesQuery.data?.filter((s) => s.is_active !== false) ?? [];

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
                <p className={`${FIELD_LABEL} mb-4`}>Select Service</p>
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
                      const isActive = selectedServiceId === service.id;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => selectService(service.id, defaultPrice)}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <AmountCard
                  label="Service Price"
                  id="record-income-price"
                  value={price}
                  onChange={setPrice}
                  placeholder="0.00"
                />
                <AmountCard
                  label="Tip (Optional)"
                  id="record-income-tip"
                  value={tip}
                  onChange={setTip}
                  placeholder="0"
                />
              </div>

              <PaymentMethodField payment={payment} onSelect={setPayment} />
            </div>
          ) : (
            <div className="space-y-10">
              <div>
                <p className={`${FIELD_LABEL} mb-4`}>Quick Category</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                  {quickCategories.length > 0
                    ? quickCategories.map((cat, i) => {
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
                    : (
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
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="squircle space-y-3 bg-surface-container-lowest p-5 shadow-sm">
      <label className={FIELD_LABEL} htmlFor={id}>
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="record-entry-amount-input font-headline w-full border-none bg-transparent p-0 text-3xl font-medium text-on-surface outline-none placeholder:text-outline-variant focus:ring-0"
        />
        <span className="font-body ml-2 text-lg font-light text-on-surface-variant">
          Rs.
        </span>
      </div>
    </div>
  );
}

function PaymentMethodField({
  payment,
  onSelect,
}: {
  payment: PaymentMethod;
  onSelect: (value: PaymentMethod) => void;
}) {
  return (
    <div>
      <p className={`${FIELD_LABEL} mb-4`}>Payment Method</p>
      {/* Mobile: horizontal pill strip */}
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 hide-scrollbar sm:hidden">
        {PAYMENT_OPTIONS.map(({ label, value, icon }) => (
          <button
            key={`${value}-pill`}
            type="button"
            data-selected={payment === value}
            onClick={() => onSelect(value)}
            className="payment-method-pill shrink-0 flex cursor-pointer items-center gap-2 rounded-full bg-surface-container-low px-4 py-2.5 shadow-sm active:scale-95"
          >
            <span className="flex shrink-0 items-center justify-center [&_svg]:size-5">
              {icon}
            </span>
            <span className="font-body text-sm font-medium whitespace-nowrap text-on-surface">
              {label}
            </span>
          </button>
        ))}
      </div>
      {/* sm+: tile grid */}
      <div className="hidden flex-wrap gap-3 sm:flex">
        {PAYMENT_OPTIONS.map(({ label, value, icon }) => (
          <button
            key={value}
            type="button"
            data-selected={payment === value}
            onClick={() => onSelect(value)}
            className="payment-method-tile squircle flex min-w-[90px] flex-1 cursor-pointer flex-col items-center gap-2 bg-surface-container-low py-4 shadow-sm hover:shadow-md active:scale-95"
          >
            {icon}
            <span className="font-body text-[12px] font-medium text-on-surface">
              {label}
            </span>
          </button>
        ))}
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
      <span className="font-headline text-base font-medium text-on-surface">{label}</span>
    </button>
  );
}
