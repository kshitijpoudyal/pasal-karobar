import type { LucideIcon } from "lucide-react";
import {
  ArrowUp,
  Banknote,
  Gauge,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type KpiCardProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value: string;
  footer: ReactNode;
  emphasis?: boolean;
};

function KpiCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  footer,
  emphasis,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "squircle flex flex-col gap-4 p-8",
        emphasis ? "bg-surface-container-high" : "bg-surface-container-low",
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className={cn("size-6", iconClassName)} strokeWidth={1.75} />
        <span className="text-label-sm text-on-surface-variant">{label}</span>
      </div>
      <p className="text-4xl font-bold text-on-surface">{value}</p>
      {footer}
    </div>
  );
}

export function KpiGrid() {
  return (
    <section className="grid grid-cols-5 gap-6">
      <KpiCard
        icon={Banknote}
        iconClassName="text-primary"
        label="Revenue"
        value="रू 42k"
        footer={
          <div className="text-label-sm flex items-center gap-1 font-bold text-secondary">
            <ArrowUp className="size-3.5" strokeWidth={2.5} />
            +12%
          </div>
        }
      />
      <KpiCard
        icon={ShoppingBag}
        iconClassName="text-on-surface-variant"
        label="Outflow"
        value="रू 8.4k"
        footer={
          <div className="text-label-sm font-medium text-on-surface-variant uppercase">
            Stable Ops
          </div>
        }
      />
      <KpiCard
        icon={Wallet}
        iconClassName="text-secondary"
        label="Net Yield"
        value="रू 33.6k"
        emphasis
        footer={
          <div className="text-label-sm font-bold text-secondary uppercase">
            80% Efficiency
          </div>
        }
      />
      <KpiCard
        icon={Users}
        iconClassName="text-on-surface-variant"
        label="Patrons"
        value="148"
        footer={
          <div className="text-label-sm flex items-center gap-1 font-bold text-secondary">
            <TrendingUp className="size-3.5" strokeWidth={2.5} />
            +15 Growth
          </div>
        }
      />
      <KpiCard
        icon={Gauge}
        iconClassName="text-on-surface-variant"
        label="Unit Value"
        value="रू 285"
        footer={
          <div className="text-label-sm font-medium text-on-surface-variant uppercase">
            Avg Session
          </div>
        }
      />
    </section>
  );
}
