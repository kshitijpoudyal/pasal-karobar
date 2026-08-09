"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

import {
  QUERY_PERSIST_KEY,
  QUERY_PERSIST_MAX_AGE_MS,
  shouldPersistQuery,
} from "@/lib/query-persist";
import { getQueryClient } from "@/lib/query-client";

type QueryProviderProps = {
  children: React.ReactNode;
};

function useQueryPersister() {
  const [persister] = useState(() => {
    if (typeof window === "undefined") return null;
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: QUERY_PERSIST_KEY,
    });
  });
  return persister;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());
  const persister = useQueryPersister();

  const devtools =
    process.env.NODE_ENV === "development" ? (
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    ) : null;

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        {devtools}
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: QUERY_PERSIST_MAX_AGE_MS,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => shouldPersistQuery(query),
        },
      }}
    >
      {children}
      {devtools}
    </PersistQueryClientProvider>
  );
}
