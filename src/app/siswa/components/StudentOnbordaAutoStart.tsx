"use client";

import { useEffect, useRef } from "react";
import { useOnborda } from "onborda";
import { STUDENT_ONBORDA_TOUR } from "./StudentOnbordaProvider";
import { STUDENT_ONBORDA_START_EVENT } from "./StartStudentOnbordaButton";

type StudentOnbordaAutoStartProps = {
  autoStart?: boolean;
  studentKey?: string | number | null;
};

export function StudentOnbordaAutoStart({
  autoStart = false,
  studentKey,
}: StudentOnbordaAutoStartProps) {
  const { startOnborda } = useOnborda();
  const startedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!autoStart || !studentKey) return;

    const key = String(studentKey);
    if (startedKeyRef.current === key) return;

    let cancelled = false;
    let timer: number | undefined;
    let frameOne = 0;
    let frameTwo = 0;

    function startTour() {
      if (cancelled) return;

      const hero = document.querySelector("#student-tour-hero");
      if (!hero) {
        timer = window.setTimeout(startTour, 120);
        return;
      }

      startedKeyRef.current = key;
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      window.dispatchEvent(new CustomEvent(STUDENT_ONBORDA_START_EVENT));
      startOnborda(STUDENT_ONBORDA_TOUR);
    }

    timer = window.setTimeout(() => {
      frameOne = window.requestAnimationFrame(() => {
        frameTwo = window.requestAnimationFrame(startTour);
      });
    }, 360);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (frameOne) window.cancelAnimationFrame(frameOne);
      if (frameTwo) window.cancelAnimationFrame(frameTwo);
    };
  }, [autoStart, startOnborda, studentKey]);

  return null;
}
