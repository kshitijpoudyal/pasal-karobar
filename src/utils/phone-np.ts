const NEPAL_MOBILE_PREFIXES = ["97", "98"] as const;

export type ParsedNepalPhone =
  | { ok: true; normalized: string; display: string }
  | { ok: false; reason: string };

/** Strip formatting; empty input is not an error (optional field). */
export function parseOptionalNepalPhone(
  raw: string | null | undefined,
): ParsedNepalPhone | { ok: true; empty: true } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return { ok: true, empty: true };
  }
  return parseNepalPhone(trimmed);
}

export function parseNepalPhone(raw: string): ParsedNepalPhone {
  const digits = raw.replace(/\D/g, "");
  let local = digits;

  if (local.startsWith("977") && local.length >= 12) {
    local = local.slice(3);
  }

  if (local.length !== 10) {
    return {
      ok: false,
      reason: "Enter a 10-digit mobile number (e.g. 9841234567).",
    };
  }

  const prefix = local.slice(0, 2);
  if (!NEPAL_MOBILE_PREFIXES.includes(prefix as (typeof NEPAL_MOBILE_PREFIXES)[number])) {
    return {
      ok: false,
      reason: "Nepal mobile numbers start with 97 or 98.",
    };
  }

  return {
    ok: true,
    normalized: local,
    display: local,
  };
}

export function formatNepalPhoneDisplay(normalized: string): string {
  if (normalized.length !== 10) return normalized;
  return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}
