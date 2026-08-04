"use client";

import { useCallback, useRef, useState } from "react";

const EXPAND_AT_Y = 16;
const COLLAPSE_AT_Y = 64;
const MIN_SCROLL_DELTA = 2;

export function useActivityHeaderCollapse() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollTop = useRef(0);
  const frame = useRef<number | null>(null);

  const onScroll = useCallback(() => {
    if (frame.current !== null) return;

    frame.current = window.requestAnimationFrame(() => {
      frame.current = null;
      const el = scrollRef.current;
      if (!el) return;

      const top = el.scrollTop;
      const delta = top - lastScrollTop.current;
      const scrollingDown = delta > MIN_SCROLL_DELTA;
      const scrollingUp = delta < -MIN_SCROLL_DELTA;
      lastScrollTop.current = top;

      setCollapsed((prev) => {
        if (top <= EXPAND_AT_Y) return false;
        if (top >= COLLAPSE_AT_Y) return true;
        if (scrollingDown) return true;
        if (scrollingUp) return false;
        return prev;
      });
    });
  }, []);

  return { scrollRef, collapsed, onScroll };
}
