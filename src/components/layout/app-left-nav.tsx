"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Plus,
  Receipt,
  Scissors,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";
import { useRecordTransactionModal } from "@/features/transactions";
import { cn } from "@/lib/utils";
import {
  appShellTransitionClass,
  useAppNav,
} from "@/providers/app-nav-provider";
import { useAuth } from "@/providers/auth-provider";

const APP_LEFT_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/activity", label: "Activity", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

const NEW_ENTRY_LABEL = "NEW ENTRY";

/** Fixed left navigation — single layout used on every app screen (Dashboard reference). */
export function AppLeftNav() {
  const pathname = usePathname();
  const { openModal } = useRecordTransactionModal();
  const { signOut } = useAuth();
  const { collapsed, toggleCollapsed, navWidthClass } = useAppNav();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 flex h-full shrink-0 flex-col border-r border-outline-variant bg-surface-container-low py-8",
        appShellTransitionClass,
        navWidthClass,
      )}
    >
      <div className={cn("mb-10", collapsed ? "px-2" : "px-6")}>
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed ? "flex-col" : "flex-row",
          )}
        >
          <div
            className={cn(
              "squircle flex size-12 shrink-0 items-center justify-center bg-primary text-on-primary",
              collapsed && "mx-auto",
            )}
          >
            <Scissors className="size-7" strokeWidth={1.75} />
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <h1 className="font-headline truncate text-xl font-bold tracking-tight text-primary">
                {APP_NAME}
              </h1>
              <p className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase opacity-60">
                Barber cash management
              </p>
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "squircle shrink-0 text-on-surface-variant hover:bg-surface-container-high",
              collapsed && "mx-auto",
            )}
          >
            {collapsed ? (
              <ChevronRight className="size-5" strokeWidth={2} />
            ) : (
              <ChevronLeft className="size-5" strokeWidth={2} />
            )}
          </Button>
        </div>
      </div>
      <nav
        className={cn("flex flex-1 flex-col gap-2", collapsed ? "px-2" : "px-4")}
        aria-label="Main"
      >
        {APP_LEFT_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className={cn(
                "squircle flex flex-row items-center gap-4 py-4 transition-colors",
                collapsed ? "justify-center px-0" : "px-6",
                active
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <Icon className="size-6 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              {!collapsed ? (
                <span className="font-medium">{label}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div
        className={cn(
          "mt-auto flex flex-col gap-3",
          collapsed ? "px-2" : "px-6",
        )}
      >
        <Button
          type="button"
          onClick={openModal}
          aria-label={NEW_ENTRY_LABEL}
          title={NEW_ENTRY_LABEL}
          className={cn(
            "squircle flex h-14 w-full items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl active:scale-95",
            collapsed && "px-0",
          )}
        >
          <Plus className="size-5 shrink-0" strokeWidth={2.25} />
          {!collapsed ? NEW_ENTRY_LABEL : null}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={signingOut}
          onClick={() => {
            void handleSignOut();
          }}
          aria-label={signingOut ? "Signing out" : "Sign out"}
          title="Sign out"
          className={cn(
            "squircle flex h-12 w-full items-center justify-center gap-2 font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
            collapsed && "px-0",
          )}
        >
          <LogOut className="size-5 shrink-0" strokeWidth={1.75} />
          {!collapsed ? (
            <span>{signingOut ? "Signing out…" : "Sign out"}</span>
          ) : null}
        </Button>
      </div>
    </aside>
  );
}
