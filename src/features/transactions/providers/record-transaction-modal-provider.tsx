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

type RecordTransactionModalContextValue = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const RecordTransactionModalContext =
  createContext<RecordTransactionModalContextValue | null>(null);

export function RecordTransactionModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openModal, closeModal }),
    [open, openModal, closeModal],
  );

  return (
    <RecordTransactionModalContext.Provider value={value}>
      {children}
      <RecordTransactionModal open={open} onClose={closeModal} />
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
