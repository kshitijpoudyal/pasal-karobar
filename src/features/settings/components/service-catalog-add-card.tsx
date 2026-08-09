"use client";

import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type ServiceCatalogAddCardProps = {
  onClick: () => void;
  className?: string;
  label?: string;
};

export function ServiceCatalogAddCard({
  onClick,
  className,
  label = "Add Service",
}: ServiceCatalogAddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "squircle group flex w-full min-w-0 flex-row items-center justify-center gap-4",
        "border-2 border-dashed border-outline-variant bg-surface-container-high",
        "p-5 transition-colors sm:p-8",
        "hover:border-primary hover:bg-primary-container/20",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
    >
      <div className="squircle flex size-12 items-center justify-center bg-surface-container-highest text-on-surface-variant transition-all group-hover:bg-primary group-hover:text-on-primary">
        <Plus className="size-6" strokeWidth={2} />
      </div>
      <p className="font-semibold text-on-surface-variant transition-colors group-hover:text-primary">
        {label}
      </p>
    </button>
  );
}
