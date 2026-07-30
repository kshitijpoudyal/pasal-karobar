"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  useBusinessListQuery,
  useCreateBusinessMutation,
} from "@/hooks/queries/use-business-queries";
import { DEFAULT_BOOTSTRAP_BUSINESS } from "@/services/onboarding-defaults";
import { useAuth } from "@/providers/auth-provider";
import type { Business } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

type BusinessContextValue = {
  business: Business | null;
  businessId: string;
  isLoading: boolean;
  error: Error | null;
};

const BusinessContext = createContext<BusinessContextValue | null>(null);

const DEMO_BUSINESS_ID = "11111111-1111-1111-1111-111111111111";

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const bootstrapped = useRef(false);

  const enabled = isSupabaseConfigured() && Boolean(session);
  const listQuery = useBusinessListQuery({ enabled });
  const createMutation = useCreateBusinessMutation();

  useEffect(() => {
    if (!enabled || listQuery.isLoading) return;
    if (listQuery.data && listQuery.data.length > 0) return;
    if (bootstrapped.current || createMutation.isPending) return;

    bootstrapped.current = true;
    createMutation.mutate(DEFAULT_BOOTSTRAP_BUSINESS, {
      onError: () => {
        bootstrapped.current = false;
      },
    });
  }, [enabled, listQuery.isLoading, listQuery.data, createMutation]);

  const business = useMemo(() => {
    const list = listQuery.data ?? [];
    if (list.length === 0) return null;
    return list.find((b) => b.id === DEMO_BUSINESS_ID) ?? list[0] ?? null;
  }, [listQuery.data]);

  const bootstrapPending =
    enabled &&
    !listQuery.isLoading &&
    (listQuery.data?.length ?? 0) === 0 &&
    (createMutation.isPending ||
      (!bootstrapped.current && !createMutation.isError));

  const value = useMemo<BusinessContextValue>(
    () => ({
      business,
      businessId: business?.id ?? "",
      isLoading:
        !isSupabaseConfigured() ||
        !session ||
        listQuery.isLoading ||
        createMutation.isPending ||
        bootstrapPending,
      error: (listQuery.error ?? createMutation.error) as Error | null,
    }),
    [
      business,
      session,
      listQuery.isLoading,
      listQuery.error,
      createMutation.isPending,
      createMutation.error,
      bootstrapPending,
    ],
  );

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useActiveBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useActiveBusiness must be used within BusinessProvider");
  }
  return ctx;
}
