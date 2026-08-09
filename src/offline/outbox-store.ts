import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import type { CreateTransactionInput } from "@/services/schemas";

const DB_NAME = "pasal-karobar-offline";
const DB_VERSION = 1;
const STORE = "outbox";

export type OutboxEntry = {
  clientId: string;
  businessId: string;
  payload: CreateTransactionInput;
  createdAt: string;
  status: "pending" | "failed";
  lastError?: string;
};

interface OutboxDbSchema extends DBSchema {
  [STORE]: {
    key: string;
    value: OutboxEntry;
    indexes: { byCreated: string };
  };
}

let dbPromise: Promise<IDBPDatabase<OutboxDbSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<OutboxDbSchema>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }
  if (!dbPromise) {
    dbPromise = openDB<OutboxDbSchema>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        const store = database.createObjectStore(STORE, { keyPath: "clientId" });
        store.createIndex("byCreated", "createdAt");
      },
    });
  }
  return dbPromise;
}

export async function enqueueOutboxEntry(entry: OutboxEntry): Promise<void> {
  const db = await getDb();
  await db.put(STORE, entry);
}

export async function listOutboxEntries(): Promise<OutboxEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex(STORE, "byCreated");
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listPendingOutboxEntries(
  businessId?: string,
): Promise<OutboxEntry[]> {
  const entries = await listOutboxEntries();
  return entries.filter(
    (entry) =>
      entry.status === "pending" &&
      (businessId ? entry.businessId === businessId : true),
  );
}

export async function countPendingOutboxEntries(
  businessId?: string,
): Promise<number> {
  const pending = await listPendingOutboxEntries(businessId);
  return pending.length;
}

export async function removeOutboxEntry(clientId: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, clientId);
}

export async function markOutboxEntryFailed(
  clientId: string,
  lastError: string,
): Promise<void> {
  const db = await getDb();
  const existing = await db.get(STORE, clientId);
  if (!existing) return;
  await db.put(STORE, {
    ...existing,
    status: "failed",
    lastError,
  });
}

export async function resetOutboxEntryToPending(clientId: string): Promise<void> {
  const db = await getDb();
  const existing = await db.get(STORE, clientId);
  if (!existing) return;
  await db.put(STORE, {
    ...existing,
    status: "pending",
    lastError: undefined,
  });
}

/** Test helper — clears all queued entries. */
export async function clearOutboxForTests(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE);
}
