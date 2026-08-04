"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ConfirmDrawer,
  type ConfirmDrawerTone,
} from "@/components/confirm-drawer/confirm-drawer";

export type ConfirmDrawerRequest = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDrawerTone;
};

type ConfirmDrawerContextValue = {
  confirm: (request: ConfirmDrawerRequest) => Promise<boolean>;
};

const ConfirmDrawerContext = createContext<ConfirmDrawerContextValue | null>(null);

type ActiveConfirmState = ConfirmDrawerRequest & {
  isConfirming: boolean;
};

export function ConfirmDrawerProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveConfirmState | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const close = useCallback((confirmed: boolean) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    setActive(null);
  }, []);

  const confirm = useCallback((request: ConfirmDrawerRequest) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setActive({ ...request, isConfirming: false });
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (active?.isConfirming) return;
    close(false);
  }, [active?.isConfirming, close]);

  const handleConfirm = useCallback(() => {
    close(true);
  }, [close]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmDrawerContext.Provider value={value}>
      {children}
      {active ? (
        <ConfirmDrawer
          open
          title={active.title}
          description={active.description}
          confirmLabel={active.confirmLabel}
          cancelLabel={active.cancelLabel}
          tone={active.tone}
          isConfirming={active.isConfirming}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      ) : null}
    </ConfirmDrawerContext.Provider>
  );
}

export function useConfirmDrawer() {
  const context = useContext(ConfirmDrawerContext);
  if (!context) {
    throw new Error("useConfirmDrawer must be used within ConfirmDrawerProvider");
  }
  return context;
}

/** Run `action` only after the user confirms in the drawer. */
export async function runConfirmedAction(
  confirm: ConfirmDrawerContextValue["confirm"],
  request: ConfirmDrawerRequest,
  action: () => void | Promise<void>,
): Promise<void> {
  const confirmed = await confirm(request);
  if (!confirmed) return;
  await action();
}
