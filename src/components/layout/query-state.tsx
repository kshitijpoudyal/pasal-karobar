import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type QueryStateProps = {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: React.ReactNode;
};

export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  onRetry,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-on-surface-variant">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="squircle border border-error/30 bg-error-container/30 p-8 text-center"
        role="alert"
      >
        <p className="font-semibold text-on-surface">Could not load data</p>
        <p className="mt-2 text-sm text-on-surface-variant">{error.message}</p>
        {onRetry ? (
          <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="squircle bg-surface-container-low p-10 text-center">
        <p className="font-headline text-lg font-semibold text-on-surface">
          {emptyTitle}
        </p>
        {emptyDescription ? (
          <p className="mt-2 text-sm text-on-surface-variant">{emptyDescription}</p>
        ) : null}
      </div>
    );
  }

  return children;
}
