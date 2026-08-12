"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  DEFAULT_SERVICE_ICON_ID,
  normalizeServiceIconId,
} from "@/constants/service-icons";
import { queryKeys } from "@/constants/query-keys";
import { toast } from "@/components/toast";
import {
  entryPositionForService,
  reorderActiveList,
  sortActiveServices,
  withSequentialDisplayOrders,
} from "@/features/settings/utils/service-catalog-order";
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useServiceCatalogQuery,
  useUpdateServiceMutation,
} from "@/hooks/queries/use-service-catalog-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { getClientAppServices } from "@/services/client";
import {
  createServiceSchema,
  serviceIconIdSchema,
  updateServiceSchema,
} from "@/services/schemas";
import type { ServiceRecord } from "@/types/database";

const serviceFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  default_price: z.coerce.number().nonnegative(),
  icon: serviceIconIdSchema,
  entry_position: z.coerce.number().int().positive().optional(),
});

export type RegisterServiceFormValues = z.infer<typeof serviceFormSchema>;

type UseServiceCatalogSectionOptions = {
  onServiceCreated?: () => void;
  onServiceUpdated?: () => void;
};

export function useServiceCatalogSection(
  options: UseServiceCatalogSectionOptions = {},
) {
  const { businessId } = useActiveBusiness();
  const queryClient = useQueryClient();
  const listKey = queryKeys.serviceCatalog.list(businessId);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const catalogQuery = useServiceCatalogQuery(businessId);
  const createMutation = useCreateServiceMutation(businessId);
  const updateMutation = useUpdateServiceMutation(businessId);
  const deleteMutation = useDeleteServiceMutation(businessId);

  const registerForm = useForm<RegisterServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: { name: "", default_price: 0, icon: DEFAULT_SERVICE_ICON_ID },
  });

  const editForm = useForm<RegisterServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      default_price: 0,
      icon: DEFAULT_SERVICE_ICON_ID,
      entry_position: 1,
    },
  });

  const persistCatalogOrder = useCallback(
    async (nextCatalog: ServiceRecord[]) => {
      const previous = catalogQuery.data ?? [];
      const updates = nextCatalog.filter((service) => {
        const before = previous.find((row) => row.id === service.id);
        return before && before.display_order !== service.display_order;
      });

      if (updates.length === 0) return;

      queryClient.setQueryData<ServiceRecord[]>(listKey, nextCatalog);

      try {
        await Promise.all(
          updates.map((service) =>
            getClientAppServices().serviceCatalog.update(service.id, {
              display_order: service.display_order,
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
    [catalogQuery.data, listKey, queryClient],
  );

  async function submitRegister(values: RegisterServiceFormValues) {
    const existing = catalogQuery.data ?? [];
    const maxOrder = existing.reduce(
      (max, service) => Math.max(max, service.display_order),
      0,
    );
    const input = createServiceSchema.parse({
      name: values.name,
      default_price: values.default_price,
      icon: values.icon,
      business_id: businessId,
      is_active: true,
      display_order: maxOrder + 1,
    });
    await createMutation.mutateAsync(input);
    registerForm.reset({
      name: "",
      default_price: 0,
      icon: DEFAULT_SERVICE_ICON_ID,
    });
    toast({
      title: "Service added",
      description: `"${values.name.trim()}" is now in your catalog.`,
    });
    options.onServiceCreated?.();
  }

  const openEdit = useCallback(
    (service: ServiceRecord) => {
      const all = catalogQuery.data ?? [];
      setEditingService(service);
      editForm.reset({
        name: service.name,
        default_price: Number(service.default_price),
        icon: normalizeServiceIconId(service.icon),
        entry_position: entryPositionForService(all, service.id),
      });
    },
    [catalogQuery.data, editForm],
  );

  const closeEdit = useCallback(() => {
    setEditingService(null);
    editForm.reset({
      name: "",
      default_price: 0,
      icon: DEFAULT_SERVICE_ICON_ID,
      entry_position: 1,
    });
  }, [editForm]);

  async function submitEdit(values: RegisterServiceFormValues) {
    if (!editingService) return;

    const all = catalogQuery.data ?? [];
    const activeList = sortActiveServices(all);
    const activeCount = activeList.length;
    const targetPosition = Math.min(
      Math.max(
        values.entry_position ?? entryPositionForService(all, editingService.id),
        1,
      ),
      activeCount,
    );
    const currentPosition = entryPositionForService(all, editingService.id);

    if (targetPosition !== currentPosition) {
      const reorderedActive = reorderActiveList(
        activeList,
        editingService.id,
        targetPosition,
      );
      const nextCatalog = withSequentialDisplayOrders(
        all,
        reorderedActive.map((service) => service.id),
      );
      await persistCatalogOrder(nextCatalog);
    }

    const input = updateServiceSchema.parse({
      name: values.name,
      default_price: values.default_price,
      icon: values.icon,
    });
    await updateMutation.mutateAsync({
      serviceId: editingService.id,
      input,
    });
    toast({
      title: "Service updated",
      description: `"${values.name.trim()}" was saved.`,
    });
    closeEdit();
    options.onServiceUpdated?.();
  }

  const removeService = useCallback(
    (serviceId: string, serviceName?: string) => {
      setDeleteError(null);
      const name =
        serviceName ??
        catalogQuery.data?.find((service) => service.id === serviceId)?.name ??
        "Service";
      deleteMutation.mutate(serviceId, {
        onSuccess: () => {
          toast({
            title: "Service deleted",
            description: `"${name}" was removed from your catalog.`,
          });
        },
        onError: (error) => {
          setDeleteError(error.message);
        },
      });
    },
    [deleteMutation, catalogQuery.data],
  );

  const removingServiceId =
    deleteMutation.isPending && deleteMutation.variables
      ? deleteMutation.variables
      : null;

  const orderedActiveServices = sortActiveServices(catalogQuery.data ?? []);

  const moveService = useCallback(
    async (serviceId: string, direction: "up" | "down") => {
      const list = sortActiveServices(catalogQuery.data ?? []);
      const index = list.findIndex((service) => service.id === serviceId);
      if (index < 0) return;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return;

      const a = list[index]!;
      const b = list[targetIndex]!;

      setIsReordering(true);
      const previous = catalogQuery.data ?? [];
      const optimistic = previous.map((row) => {
        if (row.id === a.id) return { ...row, display_order: b.display_order };
        if (row.id === b.id) return { ...row, display_order: a.display_order };
        return row;
      });
      queryClient.setQueryData<ServiceRecord[]>(listKey, optimistic);

      try {
        await Promise.all([
          getClientAppServices().serviceCatalog.update(a.id, {
            display_order: b.display_order,
          }),
          getClientAppServices().serviceCatalog.update(b.id, {
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
    [catalogQuery.data, listKey, queryClient],
  );

  return {
    services: orderedActiveServices,
    serviceCount: orderedActiveServices.length,
    isLoading: catalogQuery.isLoading,
    error: catalogQuery.error ?? createMutation.error ?? updateMutation.error,
    deleteError,
    clearDeleteError: () => setDeleteError(null),
    refetch: () => catalogQuery.refetch(),
    registerForm,
    submitRegister: registerForm.handleSubmit(submitRegister),
    isRegistering: createMutation.isPending,
    editingService,
    editForm,
    openEdit,
    closeEdit,
    submitEdit: editForm.handleSubmit(submitEdit),
    isUpdating: updateMutation.isPending,
    removeService,
    removingServiceId,
    moveService,
    isReordering,
  };
}
