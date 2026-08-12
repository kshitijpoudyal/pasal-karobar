"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  SERVICE_ICON_DEFINITIONS,
  type ServiceIconId,
} from "@/constants/service-icons";
import { cn } from "@/lib/utils";

type ServiceIconPickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
};

export function ServiceIconPicker<T extends FieldValues>({
  control,
  name,
}: ServiceIconPickerProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected = field.value as ServiceIconId;
        return (
          <div className="space-y-2">
            <span className="block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
              Icon
            </span>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
              {SERVICE_ICON_DEFINITIONS.map(({ id, label, icon: Icon }) => {
                const isSelected = selected === id;
                return (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={isSelected}
                    onClick={() => field.onChange(id)}
                    className={cn(
                      "squircle flex flex-col items-center gap-1.5 bg-surface-container-low px-2 py-3 transition-all",
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest"
                        : "hover:bg-surface-container",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-6",
                        isSelected ? "text-primary" : "text-on-surface-variant",
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="w-full truncate text-center text-[10px] font-medium text-on-surface-variant">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }}
    />
  );
}
