"use client";

import { useEffect, useId, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FIELD_LABEL =
  "block text-xs font-semibold tracking-wider text-on-surface-variant uppercase";

const FIELD_INPUT =
  "font-body w-full border-none bg-surface-container-low py-3 text-base text-on-surface transition-all placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none rounded-squircle-sm px-4";

type RegisterStaffModalProps = {
  open: boolean;
  onClose: () => void;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string | null;
};

export function RegisterStaffModal({
  open,
  onClose,
  displayName,
  onDisplayNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  isSubmitting,
  error,
}: RegisterStaffModalProps) {
  const titleId = useId();
  const nameFieldId = useId();
  const emailFieldId = useId();
  const passwordFieldId = useId();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-squircle bg-surface-container-lowest shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-surface-container-high px-8 pt-8 pb-6">
          <h2
            id={titleId}
            className="font-headline m-0 text-2xl font-semibold text-on-surface"
          >
            Register staff
          </h2>
          <button
            type="button"
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-6" strokeWidth={2} aria-hidden />
          </button>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <div className="space-y-8 p-8">
            <div className="space-y-2">
              <label className={FIELD_LABEL} htmlFor={nameFieldId}>
                Name
              </label>
              <input
                id={nameFieldId}
                type="text"
                autoComplete="name"
                placeholder="Staff member name"
                className={FIELD_INPUT}
                value={displayName}
                onChange={(event) => onDisplayNameChange(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className={FIELD_LABEL} htmlFor={emailFieldId}>
                Email
              </label>
              <input
                id={emailFieldId}
                type="email"
                autoComplete="off"
                placeholder="staff@shop.com"
                className={FIELD_INPUT}
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className={FIELD_LABEL} htmlFor={passwordFieldId}>
                Temporary password
              </label>
              <div className="relative">
                <input
                  id={passwordFieldId}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className={cn(FIELD_INPUT, "pr-14")}
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">
                Share this password with the staff member so they can sign in.
              </p>
            </div>

            {error ? (
              <p className="text-sm text-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <footer className="flex justify-end gap-3 border-t border-surface-container-high px-8 py-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!canSubmit}>
              {isSubmitting ? "Creating…" : "Register staff"}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
