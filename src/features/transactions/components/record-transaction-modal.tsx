"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import {
  Banknote,
  Bolt,
  CirclePlus,
  Home,
  Landmark,
  Package,
  Scissors,
  Sparkles,
  UserRound,
  X,
  QrCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RecordTransactionModalProps = {
  open: boolean;
  onClose: () => void;
};

type Tab = "income" | "expense";

type PaymentMethod = "Cash" | "eSewa" | "Khalti" | "eBank" | "fonPay";

const INCOME_SERVICES = [
  { name: "Haircut", price: 500, icon: Scissors },
  { name: "Beard", price: 300, icon: UserRound },
  { name: "Facial", price: 1200, icon: Sparkles },
] as const;

export function RecordTransactionModal({ open, onClose }: RecordTransactionModalProps) {
  const titleId = useId();
  const [tab, setTab] = useState<Tab>("income");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [tip, setTip] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");

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
      setTab("income");
      setSelectedService(null);
      setPrice("");
      setTip("");
      setPayment("Cash");
      setExpenseAmount("");
      setExpenseDesc("");
    }
  }, [open]);

  if (!open) return null;

  const priceNum = parseFloat(price) || 0;
  const tipNum = parseFloat(tip) || 0;
  const incomeTotal = priceNum + tipNum;

  function selectService(name: string, servicePrice: number) {
    setSelectedService(name);
    setPrice(String(servicePrice));
  }

  function fillExpense(category: string) {
    setExpenseDesc(category);
  }

  const submitLabel =
    tab === "income" ? `Add Rs. ${incomeTotal}` : "Add Expense";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md md:p-8"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="record-transaction-modal squircle flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-outline-variant/60 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-outline-variant/40 p-6">
          <h2
            id={titleId}
            className="font-headline text-2xl font-semibold text-on-surface"
          >
            Record Transaction
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 rounded-full hover:bg-surface-container active:scale-95"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5 text-outline" strokeWidth={1.75} />
          </Button>
        </header>

        <div className="px-6 pt-6">
          <div className="relative flex rounded-full bg-surface-container-low p-1">
            <div
              className={cn(
                "squircle absolute inset-y-1 left-1 z-0 w-[calc(50%-4px)] bg-white shadow-sm transition-transform duration-300 ease-out",
                tab === "expense" && "translate-x-full",
              )}
            />
            <button
              type="button"
              onClick={() => setTab("income")}
              className={cn(
                "relative z-10 flex-1 py-3 text-center text-sm font-semibold transition-colors",
                tab === "income" ? "text-primary" : "text-outline",
              )}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setTab("expense")}
              className={cn(
                "relative z-10 flex-1 py-3 text-center text-sm font-semibold transition-colors",
                tab === "expense" ? "text-primary" : "text-outline",
              )}
            >
              Expense
            </button>
          </div>
        </div>

        <div className="hide-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
          {tab === "income" ? (
            <div className="space-y-8">
              <div>
                <p className="font-body mb-3 text-[11px] font-bold tracking-[0.1em] text-outline uppercase">
                  Quick Select Service
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {INCOME_SERVICES.map(({ name, price: p, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => selectService(name, p)}
                      className={cn(
                        "service-card squircle group flex flex-col items-center justify-center border border-transparent bg-surface-container-low p-5 transition-all hover:bg-surface-container active:scale-95",
                        selectedService === name && "active bg-surface-container",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mb-2 size-8 text-outline transition-colors group-hover:text-primary",
                          selectedService === name && "text-primary",
                        )}
                        strokeWidth={1.75}
                      />
                      <span className="font-headline text-sm font-bold text-on-surface">
                        {name}
                      </span>
                      <span className="font-body mt-0.5 text-xs text-outline">
                        Rs. {p}
                      </span>
                    </button>
                  ))}
                </div>
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
                <div className="flex flex-wrap gap-2">
                  <PaymentOption
                    label="Cash"
                    value="Cash"
                    selected={payment}
                    onSelect={setPayment}
                    icon={<Banknote className="size-6 text-secondary" strokeWidth={1.75} />}
                  />
                  <PaymentOption
                    label="eSewa"
                    value="eSewa"
                    selected={payment}
                    onSelect={setPayment}
                    icon={
                      <div className="flex size-6 items-center justify-center rounded-md bg-[#4CAF50] text-[8px] font-bold text-white">
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
                      <div className="flex size-6 items-center justify-center rounded-md bg-[#673AB7] text-[8px] font-bold text-white">
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

        <footer className="border-t border-outline-variant/40 p-6">
          <Button
            type="button"
            className="font-headline flex h-14 w-full items-center justify-center gap-3 rounded-full text-lg font-bold"
          >
            <CirclePlus className="size-6" strokeWidth={2} />
            {submitLabel}
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
        "payment-method squircle flex min-w-[90px] flex-1 cursor-pointer flex-col items-center gap-1 border border-transparent bg-surface-container-low py-3 transition-all hover:bg-surface-container active:scale-95",
        selected === value && "bg-surface-container",
      )}
    >
      {icon}
      <span className="font-body text-[11px] font-bold">{label}</span>
    </button>
  );
}

function QuickExpense({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof Home;
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
