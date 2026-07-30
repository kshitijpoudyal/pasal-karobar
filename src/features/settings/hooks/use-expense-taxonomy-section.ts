"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
  useCreateExpenseCategoryMutation,
  useExpenseCategoriesQuery,
} from "@/hooks/queries/use-expense-category-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { createExpenseCategorySchema } from "@/services/schemas";

const newCategoryFormSchema = createExpenseCategorySchema.pick({
  name: true,
});

export type NewCategoryFormValues = z.infer<typeof newCategoryFormSchema>;

export function useExpenseTaxonomySection() {
  const { businessId } = useActiveBusiness();
  const categoriesQuery = useExpenseCategoriesQuery(businessId);
  const createMutation = useCreateExpenseCategoryMutation(businessId);

  const newCategoryForm = useForm<NewCategoryFormValues>({
    resolver: zodResolver(newCategoryFormSchema),
    defaultValues: { name: "" },
  });

  async function submitNewCategory(values: NewCategoryFormValues) {
    const input = createExpenseCategorySchema.parse({
      ...values,
      business_id: businessId,
      is_active: true,
    });
    await createMutation.mutateAsync(input);
    newCategoryForm.reset({ name: "" });
  }

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error ?? createMutation.error,
    refetch: () => categoriesQuery.refetch(),
    newCategoryForm,
    submitNewCategory: newCategoryForm.handleSubmit(submitNewCategory),
    isCreating: createMutation.isPending,
  };
}
