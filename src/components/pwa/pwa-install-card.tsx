"use client";

import { Download, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/providers/pwa-install-provider";

type PwaInstallCardProps = {
  variant?: "section" | "compact";
};

export function PwaInstallCard({ variant = "section" }: PwaInstallCardProps) {
  const { isInstalled, canNativeInstall, showIosGuide, isInstalling, install } =
    usePwaInstall();

  if (isInstalled) return null;
  if (!canNativeInstall && !showIosGuide) return null;

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3">
        {canNativeInstall ? (
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start gap-3 px-0 py-1 text-left"
            disabled={isInstalling}
            onClick={() => void install()}
          >
            <Download className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
            <span className="text-sm font-medium text-on-surface">
              {isInstalling ? "Installing…" : "Install app"}
            </span>
          </Button>
        ) : (
          <p className="text-sm leading-relaxed text-on-surface-variant">
            <Smartphone
              className="mr-2 inline size-4 align-text-bottom text-primary"
              strokeWidth={1.75}
              aria-hidden
            />
            Install: tap <strong className="text-on-surface">Share</strong>, then{" "}
            <strong className="text-on-surface">Add to Home Screen</strong>.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="squircle bg-surface-container-low p-5 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="squircle bg-primary-container p-3 text-on-primary-container">
          <Download className="size-6" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h3 className="font-headline text-lg font-medium text-on-surface">
            Install app
          </h3>
          <p className="text-sm text-on-surface-variant">
            Use Pasal Karobar like a native app on your device.
          </p>
        </div>
      </div>

      {canNativeInstall ? (
        <Button
          type="button"
          variant="primary"
          className="squircle h-12 w-full max-w-xs gap-2"
          disabled={isInstalling}
          onClick={() => void install()}
        >
          <Download className="size-5" strokeWidth={1.75} />
          {isInstalling ? "Installing…" : "Download app"}
        </Button>
      ) : (
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-on-surface-variant">
          <li>Open this site in Safari.</li>
          <li>
            Tap the <strong className="text-on-surface">Share</strong> button.
          </li>
          <li>
            Choose <strong className="text-on-surface">Add to Home Screen</strong>.
          </li>
        </ol>
      )}
    </section>
  );
}
