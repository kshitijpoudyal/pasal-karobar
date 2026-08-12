"use client";

import { Loader2 } from "lucide-react";

import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { useRecordTransactionModal } from "@/features/transactions";
import { useAuth } from "@/providers/auth-provider";
import { useActiveBusiness } from "@/providers/business-provider";
import { canCreateBusiness } from "@/utils/auth-metadata";

export function BusinessGate({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const { businessId, isLoading, error } = useActiveBusiness();
  const isOwnerCandidate = canCreateBusiness(session?.user ?? null);

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
            {isOwnerCandidate ? "Setting up your shop" : "No shop linked"}
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            {isOwnerCandidate
              ? "Your account is not linked to a shop yet. Refresh to retry automatic setup, or sign out and create a shop owner account."
              : "Your account is not linked to a shop yet. Ask your shop admin to add you as staff, then sign in again with the credentials they provide."}
          </p>
          <Button
            type="button"
            variant="primary"
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            {isOwnerCandidate ? "Retry setup" : "Refresh"}
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
        Record income or expenses to populate the dashboard. Try a wider period filter
        if you expect older data.
      </p>
      <Button
        type="button"
        variant="primary"
        size="cta"
        className="mt-6"
        onClick={() => openModal()}
      >
        Record transaction
      </Button>
    </div>
  );
}
