"use client";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { BusinessProvider } from "@/providers/business-provider";
import { BusinessGate } from "@/components/layout/business-gate";
import { SupabaseGate } from "@/components/layout/supabase-gate";
import { AppNavProvider } from "@/providers/app-nav-provider";
import { RecordTransactionModalProvider } from "@/features/transactions";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <BusinessProvider>
            <SupabaseGate>
              <BusinessGate>
                <AppNavProvider>
                  <RecordTransactionModalProvider>
                    {children}
                  </RecordTransactionModalProvider>
                </AppNavProvider>
              </BusinessGate>
            </SupabaseGate>
          </BusinessProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
