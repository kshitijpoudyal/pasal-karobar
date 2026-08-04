"use client";

import { Loader2 } from "lucide-react";

import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { useRecordTransactionModal } from "@/features/transactions";
import { useActiveBusiness } from "@/providers/business-provider";

export function BusinessGate({ children }: { children: React.ReactNode }) {
  const { businessId, isLoading, error } = useActiveBusiness();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-medium">Loading your business…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-8">
        <QueryState
          isLoading={false}
          error={error}
          onRetry={() => window.location.reload()}
        >
          {null}
        </QueryState>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-8">
        <div className="squircle max-w-lg bg-surface-container-low p-10 text-center">
          <h1 className="font-headline text-xl font-semibold text-on-surface">
            No business linked
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            Your account is not linked to a shop yet. If you use seeded demo data,
            add a row in <code className="text-primary">business_members</code> for
            your user, or refresh to retry automatic setup.
          </p>
          <Button type="button" variant="primary" className="mt-6" onClick={() => window.location.reload()}>
            Retry setup
          </Button>
        </div>
      </div>
    );
  }

  return children;
}

export function DashboardEmptyHint() {
  const { openModal } = useRecordTransactionModal();

  return (
    <div className="squircle border border-dashed border-outline-variant bg-surface-container-low p-8 text-center">
      <p className="font-headline text-lg font-semibold text-on-surface">
        No transactions in this period
      </p>
      <p className="mt-2 text-sm text-on-surface-variant">
        Record income or expenses to populate the dashboard. Try a wider period
        filter if you expect older data.
      </p>
      <Button type="button" variant="primary" size="cta" className="mt-6" onClick={openModal}>
        Record transaction
      </Button>
    </div>
  );
}
