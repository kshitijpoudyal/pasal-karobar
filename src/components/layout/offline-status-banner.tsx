"use client";

import { Loader2, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useConnectivityOptional } from "@/providers/connectivity-provider";
import { cn } from "@/lib/utils";

export function OfflineStatusBanner() {
  const connectivity = useConnectivityOptional();

  if (!connectivity) return null;

  const { isOnline, syncStatus, syncError, pendingCount, retrySync } =
    connectivity;

  const showOffline = !isOnline;
  const showSyncing = isOnline && syncStatus === "syncing";
  const showSyncError = isOnline && syncStatus === "error";
  const showPending =
    isOnline && syncStatus === "idle" && pendingCount > 0 && !showSyncError;

  if (!showOffline && !showSyncing && !showSyncError && !showPending) {
    return null;
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b px-4 py-2 text-center text-sm lg:px-8",
        showOffline && "border-outline-variant bg-surface-container-high text-on-surface",
        showSyncing && "border-primary/20 bg-primary-container/30 text-on-surface",
        showSyncError && "border-error/30 bg-error-container/40 text-on-error-container",
        showPending &&
          !showSyncError &&
          "border-outline-variant bg-surface-container-low text-on-surface-variant",
      )}
      role="status"
    >
      {showOffline ? (
        <span className="inline-flex items-center justify-center gap-2">
          <WifiOff className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          You&apos;re offline — new entries save on this device and sync when
          you&apos;re back online.
          {pendingCount > 0 ? (
            <span className="font-medium">
              ({pendingCount} waiting to sync)
            </span>
          ) : null}
        </span>
      ) : null}

      {showSyncing ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Syncing entries to your account…
        </span>
      ) : null}

      {showSyncError ? (
        <span className="inline-flex flex-wrap items-center justify-center gap-2">
          <span>
            Couldn&apos;t sync: {syncError ?? "Something went wrong."}
          </span>
          <Button type="button" variant="secondary" size="sm" onClick={retrySync}>
            Retry
          </Button>
        </span>
      ) : null}

      {showPending && !showSyncing ? (
        <span>
          {pendingCount === 1
            ? "1 entry waiting to sync."
            : `${pendingCount} entries waiting to sync.`}
        </span>
      ) : null}
    </div>
  );
}
