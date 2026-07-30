"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useServiceCatalogQuery,
} from "@/hooks/queries/use-service-catalog-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { createServiceSchema } from "@/services/schemas";

const registerServiceFormSchema = createServiceSchema.pick({
  name: true,
  default_price: true,
});

export type RegisterServiceFormValues = z.infer<
  typeof registerServiceFormSchema
>;

export function useServiceCatalogSection() {
  const { businessId } = useActiveBusiness();
  const catalogQuery = useServiceCatalogQuery(businessId);
  const createMutation = useCreateServiceMutation(businessId);
  const deleteMutation = useDeleteServiceMutation(businessId);

  const registerForm = useForm<RegisterServiceFormValues>({
    resolver: zodResolver(registerServiceFormSchema),
    defaultValues: { name: "", default_price: 0 },
  });

  async function submitRegister(values: RegisterServiceFormValues) {
    const input = createServiceSchema.parse({
      ...values,
      business_id: businessId,
      is_active: true,
    });
    await createMutation.mutateAsync(input);
    registerForm.reset({ name: "", default_price: 0 });
  }

  async function removeService(serviceId: string) {
    await deleteMutation.mutateAsync(serviceId);
  }

  return {
    services: catalogQuery.data ?? [],
    isLoading: catalogQuery.isLoading,
    error: catalogQuery.error ?? createMutation.error ?? deleteMutation.error,
    refetch: () => catalogQuery.refetch(),
    registerForm,
    submitRegister: registerForm.handleSubmit(submitRegister),
    isRegistering: createMutation.isPending,
    removeService,
    isRemoving: deleteMutation.isPending,
  };
}
