export const OUTBOX_CHANGED_EVENT = "pasal:outbox-changed";

export function notifyOutboxChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OUTBOX_CHANGED_EVENT));
}
