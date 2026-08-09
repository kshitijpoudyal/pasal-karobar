import type { Business } from "@/types/database";

const LAST_BUSINESS_ID_KEY = "pasal:lastBusinessId";
const LAST_BUSINESS_JSON_KEY = "pasal:lastBusiness";

export function readCachedBusinessId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_BUSINESS_ID_KEY);
}

export function writeCachedBusiness(business: Business): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_BUSINESS_ID_KEY, business.id);
  window.localStorage.setItem(LAST_BUSINESS_JSON_KEY, JSON.stringify(business));
}

export function readCachedBusiness(): Business | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LAST_BUSINESS_JSON_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Business;
  } catch {
    return null;
  }
}
