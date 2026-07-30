"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { getClientAppServices } from "@/services/client";
import type {
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
} from "@/services/schemas";
import type { ExpenseCategory } from "@/types/database";
import { isSupabaseConfigured } from "@/utils/env";

export function useExpenseCategoriesQuery(
  businessId: string,
  options?: Omit<
    UseQueryOptions<ExpenseCategory[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.expenseCategory.list(businessId),
    queryFn: () =>
      getClientAppServices().expenseCategory.listByBusinessId(businessId),
    enabled: isSupabaseConfigured() && Boolean(businessId),
    ...options,
  });
}

export function useCreateExpenseCategoryMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseCategoryInput) =>
      getClientAppServices().expenseCategory.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.expenseCategory.list(businessId),
      });
    },
  });
}

export function useUpdateExpenseCategoryMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      input,
    }: {
      categoryId: string;
      input: UpdateExpenseCategoryInput;
    }) => getClientAppServices().expenseCategory.update(categoryId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.expenseCategory.list(businessId),
      });
    },
  });
}

export function useDeleteExpenseCategoryMutation(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      getClientAppServices().expenseCategory.delete(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.expenseCategory.list(businessId),
      });
    },
  });
}
