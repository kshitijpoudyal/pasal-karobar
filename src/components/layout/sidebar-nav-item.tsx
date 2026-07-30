import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
};

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  active,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "squircle flex flex-row items-center gap-4 px-6 py-5 transition-all active:scale-[0.98]",
        active
          ? "bg-primary text-on-primary"
          : "text-on-surface-variant hover:bg-surface-container-high",
      )}
    >
      <Icon className="size-6 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
