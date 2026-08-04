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
    const input = createServiceSchema.parse({
      ...values,
      business_id: businessId,
      is_active: true,
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

  return {
    services: (catalogQuery.data ?? []).filter((service) => service.is_active),
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
  };
}
