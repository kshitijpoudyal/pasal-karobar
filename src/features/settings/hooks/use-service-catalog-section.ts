"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DEFAULT_SERVICE_ICON_ID, normalizeServiceIconId } from "@/constants/service-icons";
import { toast } from "@/components/toast";
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useServiceCatalogQuery,
  useUpdateServiceMutation,
} from "@/hooks/queries/use-service-catalog-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { createServiceSchema, serviceIconIdSchema, updateServiceSchema } from "@/services/schemas";
import type { ServiceRecord } from "@/types/database";

const serviceFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  default_price: z.coerce.number().nonnegative(),
  icon: serviceIconIdSchema,
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
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
    defaultValues: { name: "", default_price: 0, icon: DEFAULT_SERVICE_ICON_ID },
  });

  async function submitRegister(values: RegisterServiceFormValues) {
    const existing = catalogQuery.data ?? [];
    const maxOrder = existing.reduce(
      (max, service) => Math.max(max, service.display_order),
      0,
    );
    const input = createServiceSchema.parse({
      ...values,
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
      setEditingService(service);
      editForm.reset({
        name: service.name,
        default_price: Number(service.default_price),
        icon: normalizeServiceIconId(service.icon),
      });
    },
    [editForm],
  );

  const closeEdit = useCallback(() => {
    setEditingService(null);
    editForm.reset({
      name: "",
      default_price: 0,
      icon: DEFAULT_SERVICE_ICON_ID,
    });
  }, [editForm]);

  async function submitEdit(values: RegisterServiceFormValues) {
    if (!editingService) return;
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

  const orderedActiveServices = (catalogQuery.data ?? [])
    .filter((service) => service.is_active)
    .sort(
      (a, b) =>
        a.display_order - b.display_order ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

  const moveService = useCallback(
    async (serviceId: string, direction: "up" | "down") => {
      const list = (catalogQuery.data ?? [])
        .filter((service) => service.is_active)
        .sort(
          (a, b) =>
            a.display_order - b.display_order ||
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        );

      const index = list.findIndex((service) => service.id === serviceId);
      if (index < 0) return;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return;

      const reordered = [...list];
      const [item] = reordered.splice(index, 1);
      if (!item) return;
      reordered.splice(targetIndex, 0, item);

      await Promise.all(
        reordered.map((service, orderIndex) =>
          updateMutation.mutateAsync({
            serviceId: service.id,
            input: { display_order: orderIndex + 1 },
          }),
        ),
      );

      toast({
        title: "Order updated",
        description: "New entry form will show services in this order.",
      });
    },
    [catalogQuery.data, updateMutation],
  );

  return {
    services: orderedActiveServices,
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
    isReordering: updateMutation.isPending,
  };
}
