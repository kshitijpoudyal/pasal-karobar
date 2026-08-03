"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useState } from "react";
import {
  Banknote,
  Bolt,
  CirclePlus,
  Home,
  Landmark,
  Loader2,
  Package,
  QrCode,
  Scissors,
  X,
  type LucideIcon,
  QUICK_CATEGORY_ICONS,
  QUICK_SERVICE_ICONS,
} from "@/features/transactions/components/record-transaction-modal-icons";

import { Button } from "@/components/ui/button";
import { useRecordTransactionSubmit } from "@/features/transactions/hooks/use-record-transaction-submit";
import { cn } from "@/lib/utils";
import type { UiPaymentMethod } from "@/utils/payment-method";

type RecordTransactionModalProps = {
  open: boolean;
  onClose: () => void;
};

type Tab = "income" | "expense";

type PaymentMethod = UiPaymentMethod;

export function RecordTransactionModal({ open, onClose }: RecordTransactionModalProps) {
  const titleId = useId();
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

  function selectService(serviceId: string, servicePrice: number) {
    setSelectedServiceId(serviceId);
    setPrice(String(servicePrice));
    setFormError(null);
  }

  function fillExpense(categoryName: string) {
    setExpenseDesc(categoryName);
    const id = resolveCategoryIdByName(categoryName);
    if (id) setExpenseCategoryId(id);
    setFormError(null);
  }

  async function handleSubmit() {
    setFormError(null);
    try {
      if (tab === "income") {
        const subtotal = parseFloat(price) || 0;
        const tipNum = parseFloat(tip) || 0;
        if (!selectedServiceId) {
          setFormError("Select a service.");
          return;
        }
        await submitIncome({
          serviceId: selectedServiceId,
          subtotal,
          tip: tipNum,
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

  const submitLabel =
    tab === "income" ? `Add Rs. ${incomeTotal}` : "Add Expense";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-md lg:items-center lg:p-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "record-transaction-modal flex w-full max-w-2xl flex-col overflow-hidden border border-outline-variant/60 shadow-2xl",
          "max-h-[92dvh] rounded-t-[32px] bg-surface/95 backdrop-blur-xl lg:max-h-[90vh] lg:rounded-squircle lg:bg-surface-container-lowest",
          "animate-[slideUpSheet_0.3s_ease-out] lg:animate-none",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center py-3 lg:hidden">
          <div className="h-1.5 w-12 rounded-full bg-outline-variant/50" />
        </div>
        <header className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-4 lg:p-6">
          <h2
            id={titleId}
            className="font-headline text-[28px] leading-tight font-medium text-on-surface lg:text-2xl lg:font-semibold"
          >
            <span className="lg:hidden">New Entry</span>
            <span className="hidden lg:inline">Record Transaction</span>
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface active:scale-95"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5 text-outline" strokeWidth={1.75} />
          </Button>
        </header>

        <div className="px-5 pt-2 lg:px-6 lg:pt-6">
          <div className="relative flex rounded-squircle bg-surface-container-high p-1 shadow-[inset_0_2px_4px_rgba(30,58,95,0.08)] lg:rounded-full lg:bg-surface-container-low lg:shadow-none">
            <div
              className={cn(
                "squircle absolute inset-y-1 left-1 z-0 w-[calc(50%-4px)] bg-primary-container shadow-sm transition-transform duration-300 ease-out lg:bg-white",
                tab === "expense" && "translate-x-full",
              )}
            />
            <button
              type="button"
              onClick={() => setTab("income")}
              className={cn(
                "relative z-10 flex-1 py-3 text-center text-label-sm normal-case tracking-[0.12em] transition-colors lg:text-sm lg:font-semibold",
                tab === "income"
                  ? "text-on-primary-container lg:text-primary"
                  : "text-on-surface-variant lg:text-outline",
              )}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setTab("expense")}
              className={cn(
                "relative z-10 flex-1 py-3 text-center text-label-sm normal-case tracking-[0.12em] transition-colors lg:text-sm lg:font-semibold",
                tab === "expense"
                  ? "text-on-primary-container lg:text-primary"
                  : "text-on-surface-variant lg:text-outline",
              )}
            >
              Expense
            </button>
          </div>
        </div>

        <div className="hide-scrollbar flex-1 space-y-8 overflow-y-auto p-5 lg:p-6">
          {tab === "income" ? (
            <div className="space-y-8">
              <div>
                <p className="font-body mb-3 text-[11px] font-bold tracking-[0.1em] text-outline uppercase">
                  Quick Select Service
                </p>
                {servicesQuery.isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-on-surface-variant">
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    Loading your services…
                  </div>
                ) : catalogServices.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant">
                    No services in your catalog yet. Add services under{" "}
                    <span className="font-semibold text-on-surface">Settings</span>
                    {" → "}
                    Service Catalog, then try again.
                  </p>
                ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-4">
                    {catalogServices.map((service, index) => {
                      const Icon =
                        QUICK_SERVICE_ICONS[index % QUICK_SERVICE_ICONS.length] ??
                        Scissors;
                      const price = Number(service.default_price);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => selectService(service.id, price)}
                          className={cn(
                            "service-card squircle group flex flex-col items-center justify-center border border-transparent bg-surface-container p-4 transition-all hover:bg-surface-container-high active:scale-95 sm:p-5",
                            selectedServiceId === service.id &&
                              "border-2 border-primary-container bg-primary-container/10 lg:border-transparent lg:bg-surface-container",
                          )}
                        >
                          <Icon
                            className={cn(
                              "mb-2 size-8 text-outline transition-colors group-hover:text-primary",
                              selectedServiceId === service.id && "text-primary",
                            )}
                            strokeWidth={1.75}
                          />
                          <span className="font-headline line-clamp-2 text-center text-sm font-bold text-on-surface">
                            {service.name}
                          </span>
                          <span className="font-body mt-0.5 text-xs text-outline">
                            Rs. {price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="font-body absolute -top-2 left-4 rounded-full bg-surface-container-lowest px-2 text-[10px] font-bold tracking-wider text-primary uppercase">
                    Service Price
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="font-headline squircle h-14 w-full border border-outline-variant/50 bg-surface-container-low px-4 pr-12 text-xl font-bold outline-none transition-all focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0"
                  />
                  <span className="font-body absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-outline">
                    Rs.
                  </span>
                </div>
                <div className="relative">
                  <label className="font-body absolute -top-2 left-4 rounded-full bg-surface-container-lowest px-2 text-[10px] font-bold tracking-wider text-outline uppercase">
                    Tip (Optional)
                  </label>
                  <input
                    type="number"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    placeholder="0"
                    className="font-headline squircle h-14 w-full border border-outline-variant/50 bg-surface-container-low px-4 pr-12 text-xl font-bold outline-none transition-all focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0"
                  />
                  <span className="font-body absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-outline">
                    Rs.
                  </span>
                </div>
              </div>

              <div>
                <p className="font-body mb-3 text-[11px] font-bold tracking-[0.1em] text-outline uppercase">
                  Payment Method
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                  <PaymentOption
                    label="Cash"
                    value="Cash"
                    selected={payment}
                    onSelect={setPayment}
                    icon={<Banknote className="size-6 text-on-secondary-container lg:text-secondary" strokeWidth={1.75} />}
                  />
                  <PaymentOption
                    label="eSewa"
                    value="eSewa"
                    selected={payment}
                    onSelect={setPayment}
                    icon={
                      <div className="flex size-6 items-center justify-center rounded-md bg-[#4CAF50] text-[8px] font-bold text-surface-bright">
                        eS
                      </div>
                    }
                  />
                  <PaymentOption
                    label="Khalti"
                    value="Khalti"
                    selected={payment}
                    onSelect={setPayment}
                    icon={
                      <div className="flex size-6 items-center justify-center rounded-md bg-[#673AB7] text-[8px] font-bold text-surface-bright">
                        K
                      </div>
                    }
                  />
                  <PaymentOption
                    label="eBank"
                    value="eBank"
                    selected={payment}
                    onSelect={setPayment}
                    icon={<Landmark className="size-6 text-primary" strokeWidth={1.75} />}
                  />
                  <PaymentOption
                    label="fonPay"
                    value="fonPay"
                    selected={payment}
                    onSelect={setPayment}
                    icon={
                      <QrCode className="size-6 text-tertiary-fixed-dim" strokeWidth={1.75} />
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <p className="font-body mb-3 text-[11px] font-bold tracking-[0.1em] text-outline uppercase">
                  Quick Category
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {quickCategories.length > 0
                    ? quickCategories.map((cat, i) => {
                        const Icon =
                          QUICK_CATEGORY_ICONS[i % QUICK_CATEGORY_ICONS.length] ?? Home;
                        return (
                          <QuickExpense
                            key={cat.id}
                            label={cat.name}
                            icon={Icon}
                            onClick={() => {
                              setExpenseCategoryId(cat.id);
                              setExpenseDesc(cat.name);
                              setFormError(null);
                            }}
                          />
                        );
                      })
                    : (
                      <>
                        <QuickExpense
                          label="Rent"
                          icon={Home}
                          onClick={() => fillExpense("Rent")}
                        />
                        <QuickExpense
                          label="Power"
                          icon={Bolt}
                          onClick={() => fillExpense("Electricity")}
                        />
                        <QuickExpense
                          label="Supplies"
                          icon={Package}
                          onClick={() => fillExpense("Supplies")}
                        />
                      </>
                    )}
                </div>
              </div>
              <div className="relative">
                <label className="font-body absolute -top-2 left-4 rounded-full bg-surface-container-lowest px-2 text-[10px] font-bold tracking-wider text-primary uppercase">
                  Expense Amount
                </label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0.00"
                  className="font-headline squircle h-14 w-full border border-outline-variant/50 bg-surface-container-low px-4 pr-12 text-xl font-bold outline-none transition-all focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0"
                />
                <span className="font-body absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-outline">
                  Rs.
                </span>
              </div>
              <div className="relative">
                <label className="font-body absolute -top-2 left-4 rounded-full bg-surface-container-lowest px-2 text-[10px] font-bold tracking-wider text-outline uppercase">
                  Description
                </label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Enter reason for expense..."
                  className="font-body squircle h-14 w-full border border-outline-variant/50 bg-surface-container-low px-4 text-sm outline-none transition-all focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-0"
                />
              </div>
            </div>
          )}
        </div>

        <footer className="space-y-3 border-t border-surface-container-high bg-surface/80 p-5 backdrop-blur-xl lg:border-outline-variant/40 lg:bg-transparent lg:p-6 lg:backdrop-blur-none">
          {formError ? (
            <p className="text-center text-sm text-error" role="alert">
              {formError}
            </p>
          ) : null}
          {createMutation.isError ? (
            <p className="text-center text-sm text-error" role="alert">
              {createMutation.error.message}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={createMutation.isPending}
            onClick={handleSubmit}
            className="font-headline flex h-14 w-full items-center justify-center gap-3 rounded-squircle text-lg font-bold lg:rounded-full"
          >
            <CirclePlus className="size-6" strokeWidth={2} />
            {createMutation.isPending ? "Saving…" : submitLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function PaymentOption({
  label,
  value,
  selected,
  onSelect,
  icon,
}: {
  label: string;
  value: PaymentMethod;
  selected: PaymentMethod;
  onSelect: (value: PaymentMethod) => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
        className={cn(
        "payment-method squircle flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 border border-transparent py-2 transition-all hover:bg-surface-container-high active:scale-95 lg:min-w-[90px] lg:bg-surface-container-low lg:py-3",
        selected === value &&
          "bg-primary-container text-on-primary-container lg:bg-surface-container lg:text-inherit",
      )}
    >
      {icon}
      <span className="font-body text-[10px] font-bold uppercase lg:text-[11px]">{label}</span>
    </button>
  );
}

function QuickExpense({
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
      className="squircle group flex flex-col items-center justify-center bg-surface-container-low p-5 transition-all hover:bg-surface-container active:scale-95"
    >
      <Icon
        className="mb-2 size-8 text-outline transition-colors group-hover:text-primary"
        strokeWidth={1.75}
      />
      <span className="font-headline text-sm font-bold text-on-surface">{label}</span>
    </button>
  );
}
