"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

let activeLockCount = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";

function getScrollbarWidth() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

export function AdminSchoolModalPortal({
  children,
  lockScroll = true,
}: {
  children: ReactNode;
  lockScroll?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !lockScroll) return;

    activeLockCount += 1;

    if (activeLockCount === 1) {
      previousBodyOverflow = document.body.style.overflow;
      previousBodyPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth = getScrollbarWidth();
      document.body.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);

      if (activeLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.paddingRight = previousBodyPaddingRight;
      }
    };
  }, [lockScroll, mounted]);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
