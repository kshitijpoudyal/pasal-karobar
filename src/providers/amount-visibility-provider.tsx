"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "pasal-karobar:amounts-hidden";

type AmountVisibilityContextValue = {
  amountsHidden: boolean;
  setAmountsHidden: (hidden: boolean) => void;
  toggleAmountsHidden: () => void;
};

const AmountVisibilityContext = createContext<AmountVisibilityContextValue | null>(
  null,
);

export function AmountVisibilityProvider({ children }: { children: ReactNode }) {
  const [amountsHidden, setAmountsHiddenState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setAmountsHiddenState(true);
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(amountsHidden));
    } catch {
      // ignore storage errors
    }
  }, [amountsHidden, hydrated]);

  const setAmountsHidden = useCallback((hidden: boolean) => {
    setAmountsHiddenState(hidden);
  }, []);

  const toggleAmountsHidden = useCallback(() => {
    setAmountsHiddenState((value) => !value);
  }, []);

  return (
    <AmountVisibilityContext.Provider
      value={{ amountsHidden, setAmountsHidden, toggleAmountsHidden }}
    >
      {children}
    </AmountVisibilityContext.Provider>
  );
}

export function useAmountVisibility() {
  const context = useContext(AmountVisibilityContext);
  if (!context) {
    throw new Error("useAmountVisibility must be used within AmountVisibilityProvider");
  }
  return context;
}
