"use client";

import type { ReactNode } from "react";
import { Bolt, Home, LayoutGrid, Package, Plus } from "lucide-react";
import { useState } from "react";

import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import { useExpenseTaxonomySection } from "@/features/settings/hooks/use-expense-taxonomy-section";

type ExpenseCategoryTileProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
};

function ExpenseCategoryTile({ title, subtitle, icon }: ExpenseCategoryTileProps) {
  return (
    <div className="squircle group flex cursor-pointer items-center gap-4 bg-surface-container-low p-5 transition-all hover:bg-surface-container-high">
      <div className="squircle flex size-12 items-center justify-center transition-transform group-hover:scale-105">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-on-surface">{title}</p>
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase opacity-60">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

const CATEGORY_ICONS = [Home, Bolt, Package] as const;

export function ExpenseTaxonomySection() {
  const [showForm, setShowForm] = useState(false);
  const {
    categories,
    isLoading,
    error,
    refetch,
    newCategoryForm,
    submitNewCategory,
    isCreating,
  } = useExpenseTaxonomySection();

  const {
    register,
    formState: { errors },
  } = newCategoryForm;

  return (
    <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="squircle bg-error-container p-3 text-error">
              <LayoutGrid className="size-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-headline text-xl font-semibold">Taxonomy</h3>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-primary underline underline-offset-8 transition-opacity hover:opacity-70"
            onClick={() => setShowForm(true)}
          >
            New Category
          </button>
        </div>

        {showForm ? (
          <form
            className="squircle flex flex-wrap items-end gap-4 bg-surface-container-low p-6"
            onSubmit={submitNewCategory}
          >
            <div className="min-w-[200px] flex-1 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                Category name
              </label>
              <input
                className="squircle h-12 w-full bg-surface-container-high px-4"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-xs text-error">{errors.name.message}</p>
              ) : null}
            </div>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Saving…" : "Add"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </form>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length] ?? Home;
            const colors = [
              "text-orange-600",
              "text-blue-600",
              "text-purple-600",
            ] as const;
            return (
              <ExpenseCategoryTile
                key={category.id}
                title={category.name}
                subtitle={category.is_active ? "Active" : "Inactive"}
                icon={
                  <Icon
                    className={`size-6 ${colors[index % colors.length]}`}
                    strokeWidth={1.75}
                  />
                }
              />
            );
          })}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowForm(true)}
            className="squircle group flex h-auto items-center justify-start gap-4 border-2 border-dashed border-outline-variant bg-surface-container-high p-5 hover:border-primary hover:bg-primary-container/20"
          >
            <div className="squircle flex size-12 items-center justify-center bg-surface-container-highest text-on-surface-variant transition-all group-hover:bg-primary group-hover:text-on-primary">
              <Plus className="size-6" strokeWidth={2} />
            </div>
            <p className="font-semibold text-on-surface-variant transition-colors group-hover:text-primary">
              New Category
            </p>
          </Button>
        </div>
      </section>
    </QueryState>
  );
}
