"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AppMobileMenuSheet } from "@/components/layout/app-mobile-menu-sheet";

type AppMobileMenuContextValue = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
};

const AppMobileMenuContext = createContext<AppMobileMenuContextValue | null>(null);

export function AppMobileMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openMenu, closeMenu }),
    [isOpen, openMenu, closeMenu],
  );

  return (
    <AppMobileMenuContext.Provider value={value}>
      {children}
      <AppMobileMenuSheet open={isOpen} onClose={closeMenu} />
    </AppMobileMenuContext.Provider>
  );
}

export function useAppMobileMenu(): AppMobileMenuContextValue {
  const ctx = useContext(AppMobileMenuContext);
  if (!ctx) {
    throw new Error("useAppMobileMenu must be used within AppMobileMenuProvider");
  }
  return ctx;
}
