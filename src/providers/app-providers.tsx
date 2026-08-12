"use client";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { BusinessProvider } from "@/providers/business-provider";
import { BusinessGate } from "@/components/layout/business-gate";
import { SupabaseGate } from "@/components/layout/supabase-gate";
import { AppNavProvider } from "@/providers/app-nav-provider";
import { ConfirmDrawerProvider } from "@/components/confirm-drawer";
import { ToastViewport } from "@/components/toast";
import { RecordTransactionModalProvider } from "@/features/transactions";
import { ConnectivityProvider } from "@/providers/connectivity-provider";
import { PwaInstallProvider } from "@/providers/pwa-install-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <PwaInstallProvider>
          <AuthProvider>
            <BusinessProvider>
              <SupabaseGate>
                <BusinessGate>
                  <ConnectivityProvider>
                    <AppNavProvider>
                      <ConfirmDrawerProvider>
                        <RecordTransactionModalProvider>
                          {children}
                          <ToastViewport />
                        </RecordTransactionModalProvider>
                      </ConfirmDrawerProvider>
                    </AppNavProvider>
                  </ConnectivityProvider>
                </BusinessGate>
              </SupabaseGate>
            </BusinessProvider>
          </AuthProvider>
        </PwaInstallProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
