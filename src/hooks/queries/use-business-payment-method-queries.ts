"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { DEFAULT_BUSINESS_PAYMENT_METHODS } from "@/constants/payment-method-presets";
import { queryKeys } from "@/constants/query-keys";
import { getClientAppServices } from "@/services/client";
import type {
  CreateBusinessPaymentMethodInput,
  UpdateBusinessPaymentMethodInput,
} from "@/services/schemas";
import type { BusinessPaymentMethodRecord } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

function fallbackPaymentMethods(
  businessId: string,
): BusinessPaymentMethodRecord[] {
  const now = new Date(0).toISOString();
  return DEFAULT_BUSINESS_PAYMENT_METHODS.map((row, index) => ({
    id: `fallback-${row.method_code}-${index}`,
    business_id: businessId,
    method_code: row.method_code,
    label: row.label,
    display_order: row.display_order,
    is_active: true,
    created_at: now,
    updated_at: now,
  }));
}

export function useBusinessPaymentMethodsQuery(
  businessId: string,
  options?: Omit<
    UseQueryOptions<BusinessPaymentMethodRecord[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.businessPaymentMethod.list(businessId),
    queryFn: async () => {
      const rows =
        await getClientAppServices().businessPaymentMethod.listByBusinessId(
          businessId,
        );
      if (rows.length === 0) {
        return fallbackPaymentMethods(businessId);
      }
      return rows;
    },
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useActiveBusinessPaymentMethodsQuery(
  businessId: string,
  options?: Omit<
    UseQueryOptions<BusinessPaymentMethodRecord[], Error>,
    "queryKey" | "queryFn" | "select"
  >,
) {
  return useBusinessPaymentMethodsQuery(businessId, {
    ...options,
    select: (rows) =>
      rows
        .filter((row) => row.is_active)
        .sort(
          (a, b) =>
            a.display_order - b.display_order ||
            a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
        ),
  });
}

export function useCreateBusinessPaymentMethodMutation(businessId: string) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.businessPaymentMethod.list(businessId);

  return useMutation({
    mutationFn: (input: CreateBusinessPaymentMethodInput) =>
      getClientAppServices().businessPaymentMethod.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useUpdateBusinessPaymentMethodMutation(businessId: string) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.businessPaymentMethod.list(businessId);

  return useMutation({
    mutationFn: ({
      paymentMethodId,
      input,
    }: {
      paymentMethodId: string;
      input: UpdateBusinessPaymentMethodInput;
    }) =>
      getClientAppServices().businessPaymentMethod.update(
        paymentMethodId,
        input,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useDeactivateBusinessPaymentMethodMutation(businessId: string) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.businessPaymentMethod.list(businessId);

  return useMutation({
    mutationFn: (paymentMethodId: string) => {
      if (!businessId) {
        throw new Error("No business selected.");
      }
      return getClientAppServices().businessPaymentMethod.deactivate(
        paymentMethodId,
        businessId,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}
