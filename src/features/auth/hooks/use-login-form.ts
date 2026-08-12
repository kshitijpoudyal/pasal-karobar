"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/providers/auth-provider";

const loginFormSchema = z.object({
  email: z.string().trim().email("Enter a valid business email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().trim().optional(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export function useLoginForm() {
  const { signIn, signUp, authError } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (mode === "signIn") {
      await signIn(values.email, values.password);
    } else {
      const displayName = values.displayName?.trim() ?? "";
      if (!displayName) {
        form.setError("displayName", { message: "Your name is required" });
        return;
      }
      await signUp(values.email, values.password, displayName);
    }
  });

  return {
    register: form.register,
    onSubmit,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    authError,
    mode,
    setMode,
  };
}
