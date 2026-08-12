#!/usr/bin/env node
/**
 * Insert mock income/expense rows for today (Asia/Kathmandu by default).
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional:
 *   SEED_BUSINESS_ID (default demo salon UUID)
 *   SEED_TIMEZONE (default Asia/Kathmandu)
 *   SEED_INCOME_COUNT (default 42)
 *   SEED_EXPENSE_COUNT (default 3)
 *
 * Usage:
 *   npm run seed:daily
 *   npm run seed:daily -- --income 60 --expense 5
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const DEFAULT_BUSINESS_ID = "11111111-1111-1111-1111-111111111111";
const PAYMENT_METHODS = ["CASH", "CASH", "ESEWA", "KHALTI", "FONEPAY", "BANK_TRANSFER"];
const NEPAL_OFFSET = "+05:45";

function loadEnvFile(relativePath) {
  try {
    const raw = readFileSync(resolve(ROOT, relativePath), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    /* .env.local optional if --env-file is used */
  }
}

function parseArgs(argv) {
  let income = Number(process.env.SEED_INCOME_COUNT) || 42;
  let expense = Number(process.env.SEED_EXPENSE_COUNT) || 3;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--income" && argv[i + 1]) {
      income = Number(argv[++i]);
    } else if (argv[i] === "--expense" && argv[i + 1]) {
      expense = Number(argv[++i]);
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      console.log(`Usage: npm run seed:daily -- [--income N] [--expense N]`);
      process.exit(0);
    }
  }
  return { income, expense };
}

function todayDateKey(timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function randomTimeTodayIso(timeZone) {
  const dateKey = todayDateKey(timeZone);
  const hour = 8 + Math.floor(Math.random() * 10);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  const pad = (n) => String(n).padStart(2, "0");
  const offset = timeZone === "Asia/Kathmandu" ? NEPAL_OFFSET : "Z";
  return `${dateKey}T${pad(hour)}:${pad(minute)}:${pad(second)}${offset}`;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTip() {
  if (Math.random() >= 0.35) return 0;
  return Math.floor(Math.random() * 150) + 25;
}

function randomExpenseAmount() {
  return Math.floor(Math.random() * 2200) + 300;
}

async function main() {
  loadEnvFile(".env.local");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || serviceKey === "your-service-role-key") {
    console.error(
      "Missing Supabase admin credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (service role from Supabase → Project Settings → API).",
    );
    process.exit(1);
  }

  const businessId = process.env.SEED_BUSINESS_ID || DEFAULT_BUSINESS_ID;
  const timeZone = process.env.SEED_TIMEZONE || "Asia/Kathmandu";
  const { income: incomeCount, expense: expenseCount } = parseArgs(
    process.argv.slice(2),
  );

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [
    { data: services, error: servicesError },
    { data: categories, error: catError },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("id, default_price")
      .eq("business_id", businessId)
      .eq("is_active", true),
    supabase
      .from("expense_categories")
      .select("id")
      .eq("business_id", businessId)
      .eq("is_active", true),
  ]);

  if (servicesError) {
    console.error("Failed to load services:", servicesError.message);
    process.exit(1);
  }
  if (catError) {
    console.error("Failed to load expense categories:", catError.message);
    process.exit(1);
  }
  if (!services?.length) {
    console.error(`No active services for business ${businessId}. Run seed.sql first.`);
    process.exit(1);
  }
  if (!categories?.length) {
    console.error(
      `No expense categories for business ${businessId}. Run seed.sql first.`,
    );
    process.exit(1);
  }

  const incomeRows = Array.from({ length: incomeCount }, () => {
    const service = pick(services);
    const subtotal = Number(service.default_price);
    const tip = randomTip();
    return {
      business_id: businessId,
      type: "INCOME",
      service_id: service.id,
      expense_category_id: null,
      subtotal,
      tip,
      total: subtotal + tip,
      payment_method: pick(PAYMENT_METHODS),
      note: null,
      transaction_date: randomTimeTodayIso(timeZone),
    };
  });

  const expenseRows = Array.from({ length: expenseCount }, () => {
    const amount = randomExpenseAmount();
    return {
      business_id: businessId,
      type: "EXPENSE",
      service_id: null,
      expense_category_id: pick(categories).id,
      subtotal: amount,
      tip: 0,
      total: amount,
      payment_method: pick(["CASH", "BANK_TRANSFER", "ESEWA"]),
      note: "Daily mock expense",
      transaction_date: randomTimeTodayIso(timeZone),
    };
  });

  const rows = [...incomeRows, ...expenseRows];
  const { error: insertError } = await supabase.from("transactions").insert(rows);

  if (insertError) {
    console.error("Insert failed:", insertError.message);
    process.exit(1);
  }

  const day = todayDateKey(timeZone);
  console.log(
    `Added ${incomeCount} income + ${expenseCount} expense transactions for ${day} (${timeZone}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
