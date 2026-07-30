"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Plus,
  Receipt,
  Scissors,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";
import { useRecordTransactionModal } from "@/features/transactions";
import { cn } from "@/lib/utils";

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

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-full w-80 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low py-8">
      <div className="mb-12 px-8">
        <div className="flex items-center gap-4">
          <div className="squircle flex size-12 items-center justify-center bg-primary text-on-primary">
            <Scissors className="size-7" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold tracking-tight text-primary">
              {APP_NAME}
            </h1>
            <p className="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase opacity-60">
              Barber cash management
            </p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2 px-4" aria-label="Main">
        {APP_LEFT_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "squircle flex flex-row items-center gap-4 px-6 py-4 transition-all",
                active
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                  : "text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              <Icon className="size-6 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-6">
          <Button
            type="button"
            onClick={openModal}
            className="squircle flex h-14 w-full items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl active:scale-95"
          >
          <Plus className="size-5" strokeWidth={2.25} />
          {NEW_ENTRY_LABEL}
        </Button>
      </div>
    </aside>
  );
}
