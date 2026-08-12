"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "@/components/toast";
import { OUTBOX_CHANGED_EVENT } from "@/offline/outbox-events";
import { countPendingOutboxEntries } from "@/offline/outbox-store";
import { isBrowserOnline } from "@/offline/pending-transaction";
import {
  mergeOutboxIntoTransactionCaches,
  syncOutboxForBusiness,
} from "@/offline/sync-outbox";
import { useActiveBusiness } from "@/providers/business-provider";

export type SyncStatus = "idle" | "syncing" | "error";

type ConnectivityContextValue = {
  isOnline: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
  pendingCount: number;
  refreshPendingCount: () => Promise<void>;
  retrySync: () => void;
};

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { businessId, isLoading: businessLoading } = useActiveBusiness();
  const [isOnline, setIsOnline] = useState(() => isBrowserOnline());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const syncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    if (!businessId) {
      setPendingCount(0);
      return;
    }
    const count = await countPendingOutboxEntries(businessId);
    setPendingCount(count);
  }, [businessId]);

  const runSync = useCallback(async () => {
    if (!businessId || !isBrowserOnline() || syncingRef.current) return;

    syncingRef.current = true;
    setSyncStatus("syncing");
    setSyncError(null);

    try {
      const result = await syncOutboxForBusiness(queryClient, businessId);
      await refreshPendingCount();

      if (result.failed > 0 && result.lastError) {
        setSyncStatus("error");
        setSyncError(result.lastError);
      } else {
        setSyncStatus("idle");
        setSyncError(null);
      }

      if (result.synced > 0) {
        toast({
          title: "Synced",
          description:
            result.synced === 1
              ? "1 entry uploaded to your account."
              : `${result.synced} entries uploaded to your account.`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed.";
      setSyncStatus("error");
      setSyncError(message);
    } finally {
      syncingRef.current = false;
    }
  }, [businessId, queryClient, refreshPendingCount]);

  const retrySync = useCallback(() => {
    void runSync();
  }, [runSync]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    function handleOutboxChanged() {
      void refreshPendingCount();
    }
    window.addEventListener(OUTBOX_CHANGED_EVENT, handleOutboxChanged);
    return () => window.removeEventListener(OUTBOX_CHANGED_EVENT, handleOutboxChanged);
  }, [refreshPendingCount]);

  useEffect(() => {
    if (businessLoading || !businessId) return;
    void mergeOutboxIntoTransactionCaches(queryClient, businessId);
    void refreshPendingCount();
  }, [businessId, businessLoading, queryClient, refreshPendingCount]);

  useEffect(() => {
    if (!isOnline || businessLoading || !businessId) return;
    void runSync();
  }, [isOnline, businessId, businessLoading, runSync]);

  useEffect(() => {
    if (!businessId) return;
    function handleFocus() {
      if (isBrowserOnline()) {
        void runSync();
      }
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [businessId, runSync]);

  const value = useMemo<ConnectivityContextValue>(
    () => ({
      isOnline,
      syncStatus,
      syncError,
      pendingCount,
      refreshPendingCount,
      retrySync,
    }),
    [isOnline, syncStatus, syncError, pendingCount, refreshPendingCount, retrySync],
  );

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) {
    throw new Error("useConnectivity must be used within ConnectivityProvider");
  }
  return ctx;
}

/** Optional hook for components outside authenticated shell (should not happen). */
export function useConnectivityOptional() {
  return useContext(ConnectivityContext);
}
