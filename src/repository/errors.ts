import type { PostgrestError } from "@supabase/supabase-js";

export class RepositoryError extends Error {
  readonly code: string | undefined;
  readonly details: string | undefined;

  constructor(error: PostgrestError | Error) {
    super(error.message);
    this.name = "RepositoryError";
    if ("code" in error) {
      this.code = error.code;
      this.details = error.details;
    }
  }
}

export function isMissingRpcFunctionError(
  error: PostgrestError | null | undefined,
  functionName: string,
): boolean {
  if (!error) return false;
  const haystack =
    `${error.code ?? ""} ${error.message} ${error.details ?? ""}`.toLowerCase();
  const needle = functionName.toLowerCase();
  return (
    error.code === "PGRST202" ||
    haystack.includes(needle) ||
    haystack.includes("could not find the function")
  );
}

export function mapRepositoryError(error: PostgrestError): never {
  if (isMissingRpcFunctionError(error, "create_business_for_owner")) {
    throw new RepositoryError({
      ...error,
      message:
        "Database function create_business_for_owner is not deployed. In Supabase → SQL Editor, run supabase/migrations/20260730194500_create_business_for_owner.sql (after the initial schema migration).",
    });
  }
  if (isMissingRpcFunctionError(error, "is_business_owner")) {
    throw new RepositoryError({
      ...error,
      message:
        "Staff database migration is not applied. In Supabase → SQL Editor, run supabase/migrations/20260812120000_staff_profiles_and_attribution.sql.",
    });
  }
  throw new RepositoryError(error);
}
