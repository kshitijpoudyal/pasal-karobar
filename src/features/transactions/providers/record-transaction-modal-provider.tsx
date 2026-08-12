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

export type OpenRecordTransactionOptions = {
  customerPhone?: string;
  customerName?: string;
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

  const openModal = useCallback((options?: OpenRecordTransactionOptions) => {
    const phone = options?.customerPhone?.trim();
    const name = options?.customerName?.trim();
    setInitialCustomerPhone(phone ? phone : null);
    setInitialCustomerName(name ? name : null);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setInitialCustomerPhone(null);
    setInitialCustomerName(null);
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
