"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useBusinessQuery,
  useUpdateBusinessMutation,
} from "@/hooks/queries/use-business-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { DEFAULT_CALENDAR_SYSTEM } from "@/constants/calendar-system";
import { DEFAULT_BUSINESS_TIMEZONE } from "@/constants/business-timezones";
import { businessTypeSchema, updateBusinessSchema } from "@/services/schemas";

const businessIdentityFormSchema = updateBusinessSchema.extend({
  name: z.string().trim().min(1, "Business name is required").max(200),
  business_type: businessTypeSchema,
  currency: z.string().trim().length(3, "Use a 3-letter currency code"),
  timezone: z.string().trim().min(1, "Select a timezone"),
});

export type BusinessIdentityFormValues = z.infer<
  typeof businessIdentityFormSchema
>;

export function useBusinessIdentityForm() {
  const { businessId } = useActiveBusiness();
  const businessQuery = useBusinessQuery(businessId);
  const updateMutation = useUpdateBusinessMutation(businessId);

  const form = useForm<BusinessIdentityFormValues>({
    resolver: zodResolver(businessIdentityFormSchema),
    defaultValues: {
      name: "",
      business_type: "BARBER",
      calendar_system: DEFAULT_CALENDAR_SYSTEM,
      currency: "NPR",
      timezone: DEFAULT_BUSINESS_TIMEZONE,
    },
  });

  useEffect(() => {
    const business = businessQuery.data;
    if (!business) return;
    form.reset({
      name: business.name,
      business_type: business.business_type,
      calendar_system: business.calendar_system,
      currency: business.currency,
      timezone: business.timezone?.trim() || DEFAULT_BUSINESS_TIMEZONE,
    });
  }, [businessQuery.data, form]);

  async function onSubmit(values: BusinessIdentityFormValues) {
    const payload = updateBusinessSchema.parse(values);
    await updateMutation.mutateAsync(payload);
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: businessQuery.isLoading,
    error: businessQuery.error ?? updateMutation.error,
    isSaving: updateMutation.isPending,
    isSaveSuccess: updateMutation.isSuccess,
    refetch: () => businessQuery.refetch(),
  };
}
