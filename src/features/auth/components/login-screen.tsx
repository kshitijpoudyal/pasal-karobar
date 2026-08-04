"use client";

import { ArrowRight, Eye, EyeOff, Scissors } from "lucide-react";
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
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-center px-5 py-8 md:px-16">
        <div className="flex items-center gap-4">
          <AppLogoMark />
          <h1 className="font-headline text-[20px] font-medium tracking-widest text-primary uppercase">
            {APP_NAME}
          </h1>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-grow items-center justify-center px-5 py-12 md:px-16">
        <div className="natural-ink-shadow squircle relative w-full max-w-md overflow-hidden bg-surface-container-low p-10">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary-container" />
          <form className="space-y-8" onSubmit={onSubmit} noValidate>
            <div className="space-y-3">
              <label
                className="text-label-sm ml-1 block uppercase tracking-widest text-on-surface-variant"
                htmlFor="email"
              >
                Email
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
              <label
                className="text-label-sm ml-1 block uppercase tracking-widest text-on-surface-variant"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  className={cn(inputClassName, "login-input-delay-1 pr-14")}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-6 -translate-y-1/2 text-outline transition-colors hover:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                      ? "Create account"
                      : "Sign in"}
                </span>
                <ArrowRight className="size-5" strokeWidth={2} />
              </button>
            </div>

            <div className="pt-4 text-center">
              <p className="font-body-md text-on-surface-variant">
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="border-b border-primary/20 font-medium text-primary transition-all hover:border-primary"
                      onClick={() => setMode("signIn")}
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    New here?{" "}
                    <button
                      type="button"
                      className="border-b border-primary/20 font-medium text-primary transition-all hover:border-primary"
                      onClick={() => setMode("signUp")}
                    >
                      Create account
                    </button>
                  </>
                )}
              </p>
            </div>
          </form>
        </div>
      </main>

      <footer className="mx-auto mt-auto flex w-full max-w-[1440px] flex-col items-center gap-2 border-t border-surface-container px-5 py-8 text-center md:px-16">
        <p className="text-sm text-on-surface-variant">
          © {new Date().getFullYear()} Pasal Karobar
        </p>
        <p className="text-sm text-on-surface-variant">
          Powered by{" "}
          <a
            href="https://www.kshitijstudio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary transition-opacity hover:opacity-80"
          >
            KshitijStudio
          </a>
        </p>
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
