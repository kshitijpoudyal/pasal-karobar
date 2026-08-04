"use client";

import {
  ArrowRight,
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Scissors,
} from "lucide-react";
import { useState } from "react";

import { APP_NAME } from "@/constants/app";
import { useLoginForm } from "@/features/auth/hooks/use-login-form";
import { cn } from "@/lib/utils";

function AppLogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "squircle flex size-10 shrink-0 items-center justify-center bg-primary text-on-primary",
        className,
      )}
      aria-hidden
    >
      <Scissors className="size-6" strokeWidth={1.75} />
    </div>
  );
}

const FEATURES = [
  {
    icon: Lock,
    title: "AES-256 Secure",
    description:
      "Enterprise-grade encryption for architectural assets.",
  },
  {
    icon: BarChart3,
    title: "Live Auditing",
    description: "Continuous transparency in every financial layer.",
  },
  {
    icon: Building2,
    title: "Global Compliance",
    description: "Aligned with international financial standards.",
  },
] as const;

const inputClassName =
  "login-input w-full rounded-xl border-none bg-surface-container-highest px-6 py-4 font-body-md text-on-surface outline-none transition-all duration-300 placeholder:text-outline-variant focus:ring-1 focus:ring-primary login-input-ink-focus";

export function LoginScreen() {
  const {
    register,
    onSubmit,
    errors,
    isSubmitting,
    authError,
    mode,
    setMode,
  } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === "signUp";

  return (
    <div className="login-screen font-body-md text-on-surface flex min-h-screen flex-col bg-[#faf9fc]">
      <header className="sticky top-0 z-50 mx-auto flex w-full max-w-[1440px] items-center justify-between bg-surface px-5 py-8 md:px-16">
        <div className="flex items-center gap-4">
          <AppLogoMark />
          <h1 className="font-headline text-[20px] font-medium tracking-widest text-primary uppercase">
            {APP_NAME}
          </h1>
        </div>
        <div className="hidden md:block">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">
            Architectural Precision
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-grow items-center justify-center px-5 py-12 md:px-16">
        <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="space-y-12 lg:pr-12">
            <div className="space-y-6">
              <h2 className="font-headline text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] text-primary md:text-[56px]">
                Curating Your Success.
              </h2>
              <p className="font-body-md max-w-md text-[18px] leading-relaxed tracking-[0.01em] text-on-surface-variant">
                Access your architectural financial ledger with secure,
                precision-driven authentication.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 pt-8 sm:grid-cols-3 lg:grid-cols-1">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <Icon
                    className="size-8 shrink-0 text-primary"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <div>
                    <h4 className="text-label-sm mb-1 uppercase tracking-widest">
                      {title}
                    </h4>
                    <p className="font-body-md text-[12px] leading-relaxed text-on-surface-variant opacity-80">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="natural-ink-shadow squircle relative w-full max-w-lg overflow-hidden bg-surface-container-low p-10">
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary-container" />
              <form className="space-y-8" onSubmit={onSubmit} noValidate>
                <div className="space-y-3">
                  <label
                    className="text-label-sm ml-1 block uppercase tracking-widest text-on-surface-variant"
                    htmlFor="email"
                  >
                    Business Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@firm.com"
                    className={cn(inputClassName, "login-input-delay-0")}
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p className="text-xs text-error" role="alert">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <div className="ml-1 flex items-center justify-between">
                    <label
                      className="text-label-sm block uppercase tracking-widest text-on-surface-variant"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-label-sm uppercase tracking-widest text-primary transition-opacity hover:opacity-70"
                      onClick={() => {
                        /* Password reset — wire when Supabase flow is added */
                      }}
                    >
                      Forgot Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        isSignUp ? "new-password" : "current-password"
                      }
                      placeholder="••••••••"
                      className={cn(inputClassName, "login-input-delay-1 pr-14")}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-6 -translate-y-1/2 text-outline transition-colors hover:text-primary"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" strokeWidth={1.75} />
                      ) : (
                        <Eye className="size-5" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-error" role="alert">
                      {errors.password.message}
                    </p>
                  ) : null}
                </div>

                {authError ? (
                  <p className="text-center text-sm text-error" role="alert">
                    {authError}
                  </p>
                ) : null}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-headline flex w-full items-center justify-center gap-3 rounded-full bg-primary py-5 text-[20px] font-medium text-on-primary shadow-lg transition-all duration-500 hover:bg-primary-container hover:text-on-primary-container hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
                  >
                    <span>
                      {isSubmitting
                        ? "Please wait…"
                        : isSignUp
                          ? "Request Access"
                          : "Sign In"}
                    </span>
                    <ArrowRight className="size-5" strokeWidth={2} />
                  </button>
                </div>

                <div className="pt-4 text-center">
                  <p className="font-body-md text-on-surface-variant">
                    {isSignUp ? (
                      <>
                        Already a partner?{" "}
                        <button
                          type="button"
                          className="border-b border-primary/20 font-medium text-primary transition-all hover:border-primary"
                          onClick={() => setMode("signIn")}
                        >
                          Sign in.
                        </button>
                      </>
                    ) : (
                      <>
                        New partner?{" "}
                        <button
                          type="button"
                          className="border-b border-primary/20 font-medium text-primary transition-all hover:border-primary"
                          onClick={() => setMode("signUp")}
                        >
                          Request access.
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-6 border-t border-surface-container px-5 py-12 md:flex-row md:px-16 mx-auto">
        <div className="text-label-sm text-center text-on-surface-variant uppercase tracking-widest md:text-left">
          © {new Date().getFullYear()} {APP_NAME}. Architectural Precision
          in Finance.
        </div>
        <div className="flex gap-8">
          {["Privacy Policy", "Terms", "Support"].map((label) => (
            <span
              key={label}
              className="text-label-sm cursor-default text-on-surface-variant uppercase tracking-widest"
            >
              {label}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

export function LoginLoadingScreen() {
  return (
    <div className="login-screen font-body-md flex min-h-screen flex-col items-center justify-center bg-[#faf9fc] text-on-surface-variant">
      <div className="flex flex-col items-center gap-4">
        <AppLogoMark className="opacity-60" />
        <p className="text-label-sm uppercase tracking-widest">
          Checking session…
        </p>
      </div>
    </div>
  );
}
