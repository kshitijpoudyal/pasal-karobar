"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { toast } from "@/components/toast";
import { queryKeys } from "@/constants/query-keys";
import {
  PAYMENT_METHOD_DEFAULT_LABELS,
  PAYMENT_METHOD_PRESET_CODES,
  type PaymentMethodPresetCode,
} from "@/constants/payment-method-presets";
import {
  entryPositionForPaymentMethod,
  reorderActivePaymentList,
  sortActivePaymentMethods,
  withSequentialPaymentDisplayOrders,
} from "@/features/settings/utils/payment-method-order";
import {
  useBusinessPaymentMethodsQuery,
  useCreateBusinessPaymentMethodMutation,
  useDeactivateBusinessPaymentMethodMutation,
  useUpdateBusinessPaymentMethodMutation,
} from "@/hooks/queries/use-business-payment-method-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { getClientAppServices } from "@/services/client";
import { BusinessPaymentMethodMinimumError } from "@/services/business-payment-method.service";
import {
  createBusinessPaymentMethodSchema,
  updateBusinessPaymentMethodSchema,
} from "@/services/schemas";
import type { BusinessPaymentMethodRecord, PaymentMethod } from "@/types/database";

export function usePaymentMethodsSection() {
  const { businessId } = useActiveBusiness();
  const queryClient = useQueryClient();
  const listKey = queryKeys.businessPaymentMethod.list(businessId);
  const methodsQuery = useBusinessPaymentMethodsQuery(businessId);
  const createMutation = useCreateBusinessPaymentMethodMutation(businessId);
  const updateMutation = useUpdateBusinessPaymentMethodMutation(businessId);
  const deactivateMutation = useDeactivateBusinessPaymentMethodMutation(businessId);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingMethod, setEditingMethod] =
    useState<BusinessPaymentMethodRecord | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editEntryPosition, setEditEntryPosition] = useState(1);
  const [isReordering, setIsReordering] = useState(false);

  const activeMethods = useMemo(
    () => sortActivePaymentMethods(methodsQuery.data ?? []),
    [methodsQuery.data],
  );

  const inactivePresets = useMemo(() => {
    const all = methodsQuery.data ?? [];
    const activeCodes = new Set(
      all.filter((row) => row.is_active).map((row) => row.method_code),
    );
    return PAYMENT_METHOD_PRESET_CODES.filter((code) => !activeCodes.has(code)).map(
      (code) => ({
        code,
        defaultLabel: PAYMENT_METHOD_DEFAULT_LABELS[code],
      }),
    );
  }, [methodsQuery.data]);

  const persistPaymentMethodOrder = useCallback(
    async (nextRows: BusinessPaymentMethodRecord[]) => {
      const previous = methodsQuery.data ?? [];
      const updates = nextRows.filter((row) => {
        const before = previous.find((item) => item.id === row.id);
        return before && before.display_order !== row.display_order;
      });

      if (updates.length === 0) return;

      queryClient.setQueryData<BusinessPaymentMethodRecord[]>(listKey, nextRows);

      try {
        await Promise.all(
          updates.map((row) =>
            getClientAppServices().businessPaymentMethod.update(row.id, {
              display_order: row.display_order,
            }),
          ),
        );
      } catch (error) {
        queryClient.setQueryData(listKey, previous);
        throw error;
      } finally {
        await queryClient.invalidateQueries({ queryKey: listKey });
      }
    },
    [listKey, methodsQuery.data, queryClient],
  );

  const moveMethod = useCallback(
    async (paymentMethodId: string, direction: "up" | "down") => {
      const list = sortActivePaymentMethods(methodsQuery.data ?? []);
      const index = list.findIndex((row) => row.id === paymentMethodId);
      if (index < 0) return;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return;

      const a = list[index]!;
      const b = list[targetIndex]!;

      setIsReordering(true);
      const previous = methodsQuery.data ?? [];
      const optimistic = previous.map((row) => {
        if (row.id === a.id) return { ...row, display_order: b.display_order };
        if (row.id === b.id) return { ...row, display_order: a.display_order };
        return row;
      });
      queryClient.setQueryData<BusinessPaymentMethodRecord[]>(listKey, optimistic);

      try {
        await Promise.all([
          getClientAppServices().businessPaymentMethod.update(a.id, {
            display_order: b.display_order,
          }),
          getClientAppServices().businessPaymentMethod.update(b.id, {
            display_order: a.display_order,
          }),
        ]);
      } catch (error) {
        queryClient.setQueryData(listKey, previous);
        toast({
          title: "Could not reorder",
          description:
            error instanceof Error ? error.message : "Try again in a moment.",
        });
      } finally {
        setIsReordering(false);
        await queryClient.invalidateQueries({ queryKey: listKey });
      }
    },
    [listKey, methodsQuery.data, queryClient],
  );

  async function addPreset(code: PaymentMethodPresetCode) {
    const existing = (methodsQuery.data ?? []).find((row) => row.method_code === code);
    const maxOrder = activeMethods.reduce(
      (max, row) => Math.max(max, row.display_order),
      0,
    );

    if (existing) {
      await updateMutation.mutateAsync({
        paymentMethodId: existing.id,
        input: {
          is_active: true,
          display_order: maxOrder + 1,
          label: PAYMENT_METHOD_DEFAULT_LABELS[code],
        },
      });
    } else {
      const input = createBusinessPaymentMethodSchema.parse({
        business_id: businessId,
        method_code: code,
        label: PAYMENT_METHOD_DEFAULT_LABELS[code],
        display_order: maxOrder + 1,
        is_active: true,
      });
      await createMutation.mutateAsync(input);
    }

    toast({
      title: "Payment method added",
      description: PAYMENT_METHOD_DEFAULT_LABELS[code],
    });
  }

  async function addCustom(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;

    const maxOrder = activeMethods.reduce(
      (max, row) => Math.max(max, row.display_order),
      0,
    );
    const input = createBusinessPaymentMethodSchema.parse({
      business_id: businessId,
      method_code: "OTHER" satisfies PaymentMethod,
      label: trimmed,
      display_order: maxOrder + 1,
      is_active: true,
    });
    await createMutation.mutateAsync(input);
    toast({
      title: "Payment method added",
      description: trimmed,
    });
  }

  const removeMethod = useCallback(
    (row: BusinessPaymentMethodRecord) => {
      setDeleteError(null);
      deactivateMutation.mutate(row.id, {
        onSuccess: () => {
          toast({
            title: "Payment method removed",
            description: `"${row.label}" will no longer appear when recording entries.`,
          });
        },
        onError: (error) => {
          if (error instanceof BusinessPaymentMethodMinimumError) {
            setDeleteError(error.message);
            return;
          }
          setDeleteError(error.message);
        },
      });
    },
    [deactivateMutation],
  );

  function openEdit(row: BusinessPaymentMethodRecord) {
    const all = methodsQuery.data ?? [];
    setEditingMethod(row);
    setEditLabel(row.label);
    setEditEntryPosition(entryPositionForPaymentMethod(all, row.id));
  }

  function closeEdit() {
    setEditingMethod(null);
    setEditLabel("");
    setEditEntryPosition(1);
  }

  async function saveEdit() {
    if (!editingMethod) return;

    const all = methodsQuery.data ?? [];
    const activeList = sortActivePaymentMethods(all);
    const activeCount = activeList.length;
    const targetPosition = Math.min(Math.max(editEntryPosition, 1), activeCount);
    const currentPosition = entryPositionForPaymentMethod(all, editingMethod.id);

    if (targetPosition !== currentPosition) {
      const reorderedActive = reorderActivePaymentList(
        activeList,
        editingMethod.id,
        targetPosition,
      );
      const nextRows = withSequentialPaymentDisplayOrders(
        all,
        reorderedActive.map((row) => row.id),
      );
      await persistPaymentMethodOrder(nextRows);
    }

    const input = updateBusinessPaymentMethodSchema.parse({
      label: editLabel,
    });
    await updateMutation.mutateAsync({
      paymentMethodId: editingMethod.id,
      input,
    });
    toast({
      title: "Payment method updated",
      description: editLabel.trim(),
    });
    closeEdit();
  }

  return {
    methods: activeMethods,
    methodCount: activeMethods.length,
    inactivePresets,
    isLoading: methodsQuery.isLoading,
    error:
      methodsQuery.error ??
      createMutation.error ??
      updateMutation.error ??
      deactivateMutation.error,
    refetch: () => methodsQuery.refetch(),
    deleteError,
    clearDeleteError: () => setDeleteError(null),
    moveMethod,
    isReordering,
    addPreset,
    addCustom,
    isAdding: createMutation.isPending || updateMutation.isPending,
    removeMethod,
    removingId:
      deactivateMutation.isPending && deactivateMutation.variables
        ? deactivateMutation.variables
        : null,
    editingMethod,
    editLabel,
    setEditLabel,
    editEntryPosition,
    setEditEntryPosition,
    openEdit,
    closeEdit,
    saveEdit,
    isSavingEdit: updateMutation.isPending,
  };
}
