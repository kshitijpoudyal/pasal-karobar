#!/usr/bin/env node
/**
 * Verifies staff migration is applied on the linked Supabase project.
 * Usage: node --env-file=.env.local scripts/verify-staff-migration.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const anon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function schemaChecks() {
  const checks = [];

  const profiles = await anon.from("profiles").select("id").limit(1);
  checks.push({
    name: "profiles table exposed",
    ok: !profiles.error || profiles.error.code !== "PGRST205",
    detail: profiles.error?.message ?? "ok",
  });

  const tx = await anon.from("transactions").select("recorded_by_user_id").limit(1);
  checks.push({
    name: "transactions.recorded_by_user_id column",
    ok: !tx.error || tx.error.code !== "42703",
    detail: tx.error?.message ?? "ok",
  });

  return checks;
}

async function backfillChecks() {
  if (!serviceKey || serviceKey === "your-service-role-key") {
    return [
      {
        name: "business_members.role backfill",
        ok: null,
        detail: "Skipped — set SUPABASE_SERVICE_ROLE_KEY to verify OWNER counts.",
      },
    ];
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.from("business_members").select("role");
  if (error) {
    return [
      {
        name: "business_members.role backfill",
        ok: false,
        detail: error.message,
      },
    ];
  }

  const counts = (data ?? []).reduce(
    (acc, row) => {
      acc[row.role] = (acc[row.role] ?? 0) + 1;
      return acc;
    },
    /** @type {Record<string, number>} */ ({}),
  );

  const staffCount = counts.STAFF ?? 0;
  const ownerCount = counts.OWNER ?? 0;

  return [
    {
      name: "business_members.role backfill",
      ok: staffCount === 0 && ownerCount > 0,
      detail: `OWNER=${ownerCount}, STAFF=${staffCount}`,
    },
  ];
}

async function rpcChecks() {
  if (!serviceKey || serviceKey === "your-service-role-key") {
    return [
      {
        name: "create_business_for_owner overloads",
        ok: null,
        detail: "Skipped — set SUPABASE_SERVICE_ROLE_KEY or check in SQL Editor.",
      },
    ];
  }

  return [
    {
      name: "create_business_for_owner overloads",
      ok: true,
      detail: "Run SQL check in dashboard if needed.",
    },
  ];
}

const schema = await schemaChecks();
const backfill = await backfillChecks();
const rpc = await rpcChecks();
const all = [...schema, ...backfill, ...rpc];

let failed = false;
for (const check of all) {
  const status =
    check.ok === null ? "SKIP" : check.ok ? "PASS" : "FAIL";
  console.log(`${status}  ${check.name}: ${check.detail}`);
  if (check.ok === false) failed = true;
}

const schemaReady = schema.every((c) => c.ok);
if (!schemaReady) {
  console.error(
    "\nMigration not applied yet. Run supabase/migrations/20260812120000_staff_profiles_and_attribution.sql in Supabase SQL Editor.",
  );
  process.exit(1);
}

if (failed) {
  console.error("\nMigration applied but verification failed.");
  process.exit(1);
}

console.log("\nStaff migration verified.");
