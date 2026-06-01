"use client";

import { useOnborda } from "onborda";
import { Icon } from "../../../components/ui/icons";
import { GURU_ONBORDA_TOUR } from "./GuruOnbordaProvider";

export const GURU_ONBORDA_START_EVENT = "skilllens:guru-onborda-start";
export const GURU_ONBORDA_DONE_EVENT = "skilllens:guru-onborda-done";

export function StartGuruOnbordaButton() {
  const { startOnborda } = useOnborda();

  return (
    <button
      type="button"
      id="guru-tour-start"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(GURU_ONBORDA_START_EVENT));
        startOnborda(GURU_ONBORDA_TOUR);
      }}
      className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-slate-950"
    >
      Panduan Guru BK
      <Icon name="sparkles" className="h-4 w-4" />
    </button>
  );
}
