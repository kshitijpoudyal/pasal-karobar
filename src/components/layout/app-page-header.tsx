import { Calendar } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

const HEADER_AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB75DVXW6wWLy5S1-imbVf8lIndXN87Q9yO-3kze4DY28uxHoXotVr_9eRfZdUS-r-McmHmfQNQaIDPskNTaWv9eXwfn-Rar9v58MC3TjL5Pu-0jB0N_W6TRo57WNfVLM0rZ6Mw2eiKQOr1fj3yFOdHhZ424yfKlFFlTeHsKHCYsNMeT3EhHc2i73xE5fnZLEOFqZlsfdO0JblWKSpVTAje26j2l1-PD5MzZw1dj0Q5UH1wi8iTyRvgpw";

type AppPageHeaderProps = {
  title: string;
};

/** Sticky top bar — same layout and typography on every screen. */
export function AppPageHeader({ title }: AppPageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-24 w-full shrink-0 items-center justify-between border-b border-surface-container-high bg-surface/90 px-12 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-4">
        <h1 className="font-headline-lg text-headline-lg truncate text-on-surface">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="squircle size-12 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface active:scale-95"
          aria-label="Open calendar"
        >
          <Calendar className="size-6 text-on-surface-variant" strokeWidth={1.75} />
        </Button>
        <div className="squircle size-12 overflow-hidden border-2 border-surface-container-high bg-surface-container-highest">
          <Image
            src={HEADER_AVATAR_SRC}
            alt=""
            width={48}
            height={48}
            className="size-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
