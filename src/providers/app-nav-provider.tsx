"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "pasal-karobar:nav-collapsed";

/** Matches Tailwind `lg` — viewports below this are treated as tablet. */
const TABLET_MEDIA = "(max-width: 1023px)";

const NAV_WIDTH_EXPANDED = "w-80";
const NAV_WIDTH_COLLAPSED = "w-[4.75rem]";

/** Full class strings (no runtime `lg:${…}`) so Tailwind includes them in the build. */
const MAIN_OFFSET_EXPANDED = "ml-0 lg:ml-80";
const MAIN_OFFSET_COLLAPSED = "ml-0 lg:ml-[4.75rem]";

function isTabletViewport(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia(TABLET_MEDIA).matches;
}

function readStoredCollapsed(): boolean | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return null;
  } catch {
    return null;
  }
}

type AppNavContextValue = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  navWidthClass: string;
  mainOffsetClass: string;
};

const AppNavContext = createContext<AppNavContextValue | null>(null);

export function AppNavProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const stored = readStoredCollapsed();
    if (stored !== null) {
      setCollapsed(stored);
      return;
    }
    setCollapsed(isTabletViewport());
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<AppNavContextValue>(
    () => ({
      collapsed,
      toggleCollapsed,
      navWidthClass: collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH_EXPANDED,
      mainOffsetClass: collapsed ? MAIN_OFFSET_COLLAPSED : MAIN_OFFSET_EXPANDED,
    }),
    [collapsed, toggleCollapsed],
  );

  return <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>;
}

export function useAppNav() {
  const ctx = useContext(AppNavContext);
  if (!ctx) {
    throw new Error("useAppNav must be used within AppNavProvider");
  }
  return ctx;
}

/** Shared transition classes for nav width + main offset */
export const appShellTransitionClass =
  "transition-[width,margin] duration-300 ease-in-out";
