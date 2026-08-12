"use client";

import { useConnectivity } from "@/providers/connectivity-provider";

export function DashboardPendingSyncNote() {
  const { pendingCount, isOnline } = useConnectivity();

  if (pendingCount === 0) return null;

  return (
    <p
      className="squircle border border-outline-variant/80 bg-surface-container-low px-4 py-3 text-center text-sm text-on-surface-variant"
      role="status"
    >
      {pendingCount === 1
        ? "1 entry is saved on this device and "
        : `${pendingCount} entries are saved on this device and `}
      {isOnline ? "waiting to sync." : "will sync when you're back online."} Dashboard
      totals below reflect your synced account only.
    </p>
  );
}
