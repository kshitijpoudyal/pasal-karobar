"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { Camera, ImagePlus, Images, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/** Gallery picker — specific types help desktop file dialogs. */
export const CUSTOMER_PHOTO_GALLERY_ACCEPT = "image/jpeg,image/png,image/webp,image/*";

/** Camera capture — image/* is required for reliable mobile camera on iOS/Android. */
export const CUSTOMER_PHOTO_CAMERA_ACCEPT = "image/*";

const MENU_WIDTH_PX = 224;
const MENU_HEIGHT_PX = 112;
const MENU_GAP_PX = 8;

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

type CustomerPhotoAddControlsProps = {
  disabled?: boolean;
  busy?: boolean;
  onFile: (file: File) => void | Promise<void>;
  tileClassName?: string;
  label?: string;
};

function computeMenuPosition(anchor: DOMRect): MenuPosition {
  const width = Math.min(window.innerWidth - 32, MENU_WIDTH_PX);
  const spaceBelow = window.innerHeight - anchor.bottom;
  const spaceAbove = anchor.top;
  const openAbove =
    spaceBelow < MENU_HEIGHT_PX + MENU_GAP_PX && spaceAbove >= spaceBelow;

  const top = openAbove
    ? anchor.top - MENU_HEIGHT_PX - MENU_GAP_PX
    : anchor.bottom + MENU_GAP_PX;

  const left = Math.max(
    16,
    Math.min(anchor.right - width, window.innerWidth - width - 16),
  );

  return { top, left, width };
}

export function CustomerPhotoAddControls({
  disabled = false,
  busy = false,
  onFile,
  tileClassName,
  label = "Add photo",
}: CustomerPhotoAddControlsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const galleryInputId = useId();
  const cameraInputId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  useLayoutEffect(() => {
    if (!menuOpen || !rootRef.current) {
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      if (!rootRef.current) return;
      setMenuPosition(computeMenuPosition(rootRef.current.getBoundingClientRect()));
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  async function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setMenuOpen(false);
    if (!file || disabled || busy) return;
    await onFile(file);
  }

  const inactive = disabled || busy;

  const menu =
    menuOpen && !inactive && menuPosition && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              zIndex: 110,
            }}
            className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
          >
            <label
              htmlFor={cameraInputId}
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <Camera
                className="size-5 shrink-0 text-on-surface-variant"
                strokeWidth={1.75}
              />
              Take photo
            </label>
            <label
              htmlFor={galleryInputId}
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <Images
                className="size-5 shrink-0 text-on-surface-variant"
                strokeWidth={1.75}
              />
              Choose from library
            </label>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative aspect-square w-full">
      <button
        type="button"
        disabled={inactive}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-controls={menuOpen ? menuId : undefined}
        onClick={() => setMenuOpen((open) => !open)}
        className={cn(
          "flex size-full flex-col items-center justify-center gap-2 rounded-[24px]",
          "border-2 border-dashed border-outline-variant bg-surface-container-low",
          "text-on-surface-variant transition-all hover:border-primary-container hover:bg-surface-container",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2",
          inactive && "opacity-60",
          tileClassName,
        )}
      >
        {busy ? (
          <Loader2 className="size-8 animate-spin" aria-hidden />
        ) : (
          <ImagePlus className="size-8" strokeWidth={1.75} aria-hidden />
        )}
        <span className="font-label-sm text-label-sm text-outline">{label}</span>
      </button>

      {menu}

      <input
        id={galleryInputId}
        type="file"
        accept={CUSTOMER_PHOTO_GALLERY_ACCEPT}
        className="pointer-events-none fixed -left-[9999px] top-auto h-px w-px opacity-0"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void handleInputChange(event)}
      />
      <input
        id={cameraInputId}
        type="file"
        accept={CUSTOMER_PHOTO_CAMERA_ACCEPT}
        capture="environment"
        className="pointer-events-none fixed -left-[9999px] top-auto h-px w-px opacity-0"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void handleInputChange(event)}
      />
    </div>
  );
}
