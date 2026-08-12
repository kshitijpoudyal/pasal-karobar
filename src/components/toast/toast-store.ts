export type ToastVariant = "success" | "error";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  durationMs: number;
};

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function emit() {
  const snapshot = [...toasts];
  listeners.forEach((listener) => listener(snapshot));
}

function genId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(input: ToastInput | string) {
  const normalized: ToastInput = typeof input === "string" ? { title: input } : input;

  const item: ToastItem = {
    id: genId(),
    title: normalized.title,
    description: normalized.description,
    variant: normalized.variant ?? "success",
    durationMs: normalized.durationMs ?? 4000,
  };

  toasts = [...toasts, item];
  emit();

  window.setTimeout(() => {
    dismissToast(item.id);
  }, item.durationMs);

  return item.id;
}
