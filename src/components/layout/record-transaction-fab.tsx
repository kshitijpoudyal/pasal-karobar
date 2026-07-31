"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRecordTransactionModal } from "@/features/transactions";
import { cn } from "@/lib/utils";

type RecordTransactionFabProps = {
  className?: string;
  tooltip?: string;
};

export function RecordTransactionFab({
  className,
  tooltip = "New Entry",
}: RecordTransactionFabProps) {
  const { openModal } = useRecordTransactionModal();

  return (
    <Button
      type="button"
      aria-label={tooltip}
      onClick={openModal}
      className={cn(
        "group squircle fixed right-12 bottom-12 z-50 size-20 rounded-[24px] shadow-2xl hover:scale-105 active:scale-95",
        className,
      )}
    >
      <Plus
        className="size-9 transition-transform duration-500 group-hover:rotate-90"
        strokeWidth={2}
      />
      <span className="squircle pointer-events-none absolute right-24 bg-on-surface px-6 py-3 text-sm font-bold tracking-widest whitespace-nowrap text-surface-bright uppercase opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        {tooltip}
      </span>
    </Button>
  );
}
