"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, Receipt, Settings, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRecordTransactionModal } from "@/features/transactions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutGrid, match: "exact" as const },
  { href: "/activity", label: "Activity", icon: Receipt, match: "prefix" as const },
  { href: "/customers", label: "Customer", icon: Users, match: "prefix" as const },
  { href: "/settings", label: "Settings", icon: Settings, match: "prefix" as const },
] as const;

function NavTab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-0 flex-col items-center justify-center px-1 py-2 transition-all active:scale-90 sm:px-2",
        active
          ? "text-on-primary-container"
          : "text-on-surface-variant hover:text-on-surface",
      )}
    >
      <span
        className={cn(
          "mb-1 flex size-10 items-center justify-center rounded-2xl transition-colors",
          active && "bg-primary-container",
        )}
      >
        <Icon className="size-5 sm:size-6" strokeWidth={active ? 2.25 : 1.75} />
      </span>
      <span className="text-label-sm max-w-[3.5rem] truncate text-[9px] sm:max-w-none sm:text-[11px]">
        {label}
      </span>
    </Link>
  );
}

function isNavActive(
  pathname: string,
  href: string,
  match: "exact" | "prefix",
): boolean {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppMobileBottomNav() {
  const pathname = usePathname();
  const { openModal } = useRecordTransactionModal();

  const [dashboard, activity, customers, settings] = NAV_ITEMS;

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 rounded-t-[24px] border-t border-surface-container-high/80 bg-surface-container-lowest/90 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(30,58,95,0.08)] backdrop-blur-lg lg:hidden"
      aria-label="Main"
    >
      <div className="grid grid-cols-5 items-end gap-0 px-0.5 pt-2 sm:px-1">
        <NavTab
          href={dashboard.href}
          label={dashboard.label}
          icon={dashboard.icon}
          active={isNavActive(pathname, dashboard.href, dashboard.match)}
        />
        <NavTab
          href={activity.href}
          label={activity.label}
          icon={activity.icon}
          active={isNavActive(pathname, activity.href, activity.match)}
        />
        <div className="flex justify-center pb-1">
          <Button
            type="button"
            aria-label="New Entry"
            onClick={openModal}
            variant="primary"
            className="size-12 shrink-0 -translate-y-3 rounded-full shadow-[0_8px_24px_rgba(2,36,72,0.35)] sm:size-14"
          >
            <Plus className="size-7 sm:size-8" strokeWidth={2.25} />
          </Button>
        </div>
        <NavTab
          href={customers.href}
          label={customers.label}
          icon={customers.icon}
          active={isNavActive(pathname, customers.href, customers.match)}
        />
        <NavTab
          href={settings.href}
          label={settings.label}
          icon={settings.icon}
          active={isNavActive(pathname, settings.href, settings.match)}
        />
      </div>
    </nav>
  );
}
