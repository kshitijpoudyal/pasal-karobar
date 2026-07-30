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

export function mapRepositoryError(error: PostgrestError): never {
  throw new RepositoryError(error);
}
