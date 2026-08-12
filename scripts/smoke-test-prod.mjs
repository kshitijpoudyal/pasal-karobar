#!/usr/bin/env node
/**
 * Lightweight smoke checks for production (no auth required).
 * Usage: node scripts/smoke-test-prod.mjs [baseUrl]
 */

const baseUrl = process.argv[2] ?? "https://pasal-karobar.vercel.app";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** @param {string} name @param {boolean} ok @param {string} detail */
function line(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${detail}`);
  return ok;
}

let failed = false;

try {
  const home = await fetch(baseUrl, { redirect: "follow" });
  failed = !line("App home", home.ok, `${home.status} ${home.url}`) || failed;
  const html = await home.text();
  const hasLoginUi =
    html.includes("login-screen") ||
    html.includes("Sign in") ||
    html.includes("Email") ||
    html.includes("Pasal");
  failed =
    !line("Login shell", hasLoginUi, hasLoginUi ? "app shell present" : "missing app shell") ||
    failed;
} catch (error) {
  failed = !line("App home", false, error instanceof Error ? error.message : "fetch failed") || failed;
}

if (supabaseUrl && anonKey) {
  try {
    const health = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: anonKey },
    });
    failed = !line("Supabase auth health", health.ok, `${health.status}`) || failed;
  } catch (error) {
    failed =
      !line("Supabase auth health", false, error instanceof Error ? error.message : "fetch failed") ||
      failed;
  }
} else {
}

if (failed) {
  console.error("\nSmoke test failed.");
  process.exit(1);
}

console.log("\nSmoke test passed.");
