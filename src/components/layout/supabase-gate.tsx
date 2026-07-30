"use client";

import {
  LoginLoadingScreen,
  LoginScreen,
} from "@/features/auth/components/login-screen";
import { isSupabaseConfigured } from "@/utils/env";
import { useAuth } from "@/providers/auth-provider";

export function SupabaseGate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="login-screen flex min-h-screen items-center justify-center bg-[#faf9fc] p-8">
        <div className="natural-ink-shadow squircle max-w-lg bg-surface-container-low p-10 text-center">
          <h1 className="font-headline text-xl font-semibold text-on-surface">
            Supabase not configured
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            Add <code className="text-primary">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-primary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code>.env.local</code>, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return <AuthGate>{children}</AuthGate>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <LoginLoadingScreen />;
  }

  if (session) {
    return children;
  }

  return <LoginScreen />;
}
