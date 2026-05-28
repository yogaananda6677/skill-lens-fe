"use client";

import { useOnborda } from "onborda";
import { Icon } from "../../../components/ui/icons";
import { STUDENT_ONBORDA_TOUR } from "./StudentOnbordaProvider";

export const STUDENT_ONBORDA_START_EVENT = "skilllens:student-onborda-start";
export const STUDENT_ONBORDA_DONE_EVENT = "skilllens:student-onborda-done";

export function StartStudentOnbordaButton() {
  const { startOnborda } = useOnborda();

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(STUDENT_ONBORDA_START_EVENT));
        startOnborda(STUDENT_ONBORDA_TOUR);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-5 py-3 text-sm font-bold text-white skilllens-smooth hover:-translate-y-0.5 hover:bg-white hover:text-[#07142f]"
    >
      Panduan awal
      <Icon name="sparkles" className="h-4 w-4" />
    </button>
  );
}
