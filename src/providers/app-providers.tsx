"use client";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { RecordTransactionModalProvider } from "@/features/transactions";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RecordTransactionModalProvider>{children}</RecordTransactionModalProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
