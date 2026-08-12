"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { RecordTransactionModal } from "@/features/transactions/components/record-transaction-modal";
import type { Transaction } from "@/types/database";

export type EditTransactionPrefill = {
  transaction: Transaction;
  customerPhone?: string | null;
  customerName?: string | null;
};

export type OpenRecordTransactionOptions = {
  customerPhone?: string;
  customerName?: string;
  edit?: EditTransactionPrefill;
};

type RecordTransactionModalContextValue = {
  open: boolean;
  openModal: (options?: OpenRecordTransactionOptions) => void;
  closeModal: () => void;
};

const RecordTransactionModalContext =
  createContext<RecordTransactionModalContextValue | null>(null);

export function RecordTransactionModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialCustomerPhone, setInitialCustomerPhone] = useState<string | null>(null);
  const [initialCustomerName, setInitialCustomerName] = useState<string | null>(null);
  const [editPrefill, setEditPrefill] = useState<EditTransactionPrefill | null>(null);

  const openModal = useCallback((options?: OpenRecordTransactionOptions) => {
    if (options?.edit) {
      setEditPrefill(options.edit);
      setInitialCustomerPhone(null);
      setInitialCustomerName(null);
      setOpen(true);
      return;
    }

    const phone = options?.customerPhone?.trim();
    const name = options?.customerName?.trim();
    setEditPrefill(null);
    setInitialCustomerPhone(phone ? phone : null);
    setInitialCustomerName(name ? name : null);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setInitialCustomerPhone(null);
    setInitialCustomerName(null);
    setEditPrefill(null);
  }, []);

  const value = useMemo(
    () => ({ open, openModal, closeModal }),
    [open, openModal, closeModal],
  );

  return (
    <RecordTransactionModalContext.Provider value={value}>
      {children}
      <RecordTransactionModal
        open={open}
        onClose={closeModal}
        initialCustomerPhone={initialCustomerPhone}
        initialCustomerName={initialCustomerName}
        editPrefill={editPrefill}
      />
    </RecordTransactionModalContext.Provider>
  );
}

export function useRecordTransactionModal() {
  const context = useContext(RecordTransactionModalContext);
  if (!context) {
    throw new Error(
      "useRecordTransactionModal must be used within RecordTransactionModalProvider",
    );
  }
  return context;
}
