"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, MoreHorizontal, Plus, Receipt, Settings } from "lucide-react";

import { AppMobileMenuSheet } from "@/components/layout/app-mobile-menu-sheet";
import { Button } from "@/components/ui/button";
import { useRecordTransactionModal } from "@/features/transactions";
import { cn } from "@/lib/utils";

const SIDE_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/activity", label: "Activity", icon: Receipt },
] as const;

const SETTINGS_ITEM = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
} as const;

function NavTab({
  href,
  label,
  icon: Icon,
  active,
  align = "center",
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
  align?: "start" | "center" | "end";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center px-2 py-2 transition-all active:scale-90",
        align === "start" && "rounded-tl-[24px] rounded-tr-2xl rounded-b-2xl",
        align === "end" && "rounded-tr-[24px] rounded-tl-2xl rounded-b-2xl",
        align === "center" && "rounded-t-[24px] rounded-b-2xl",
        active
          ? "bg-primary-container text-on-primary-container"
          : "text-on-surface-variant hover:bg-surface-container-high",
      )}
    >
      <Icon className="mb-1 size-6" strokeWidth={active ? 2.25 : 1.75} />
      <span className="text-label-sm max-w-[4.5rem] truncate text-[10px] sm:max-w-none sm:text-[12px]">
        {label}
      </span>
    </Link>
  );
}

export function AppMobileBottomNav() {
  const pathname = usePathname();
  const { openModal } = useRecordTransactionModal();
  const [menuOpen, setMenuOpen] = useState(false);

  const settingsActive = pathname.startsWith(SETTINGS_ITEM.href);

  return (
    <>
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 rounded-t-[24px] border-t border-surface-container-high/80 bg-surface-container-lowest/90 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(30,58,95,0.08)] backdrop-blur-lg lg:hidden"
      aria-label="Main"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-0.5 px-1 pt-2 sm:gap-1 sm:px-2">
        <div className="flex min-w-0 gap-1">
          {SIDE_ITEMS.map(({ href, label, icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <NavTab
                key={href}
                href={href}
                label={label}
                icon={icon}
                active={active}
                align={href === "/" ? "start" : "center"}
              />
            );
          })}
        </div>

        <div className="flex justify-center px-1 pb-1">
          <Button
            type="button"
            aria-label="New Entry"
            onClick={openModal}
            variant="primary"
            className="size-14 shrink-0 -translate-y-3 rounded-full shadow-[0_8px_24px_rgba(2,36,72,0.35)]"
          >
            <Plus className="size-8" strokeWidth={2.25} />
          </Button>
        </div>

        <div className="flex min-w-0 justify-end gap-1">
          <NavTab
            href={SETTINGS_ITEM.href}
            label={SETTINGS_ITEM.label}
            icon={SETTINGS_ITEM.icon}
            active={settingsActive}
            align="center"
          />
          <button
            type="button"
            aria-label="More"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center rounded-tr-[24px] rounded-tl-2xl rounded-b-2xl px-2 py-2 transition-all active:scale-90",
              menuOpen
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            <MoreHorizontal className="mb-1 size-6" strokeWidth={menuOpen ? 2.25 : 1.75} />
            <span className="text-label-sm max-w-[4.5rem] truncate text-[10px] sm:max-w-none sm:text-[12px]">
              More
            </span>
          </button>
        </div>
      </div>
    </nav>
    <AppMobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
