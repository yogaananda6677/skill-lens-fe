"use client";

import { useOnborda } from "onborda";
import { Icon } from "../../../components/ui/icons";
import { ADMIN_SCHOOL_ONBORDA_TOUR } from "./AdminSchoolOnbordaProvider";

export const ADMIN_SCHOOL_ONBORDA_START_EVENT = "skilllens:admin-school-onborda-start";

export function StartAdminSchoolOnbordaButton() {
  const { startOnborda } = useOnborda();

  return (
    <button
      type="button"
      id="admin-school-tour-start"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(ADMIN_SCHOOL_ONBORDA_START_EVENT));
        startOnborda(ADMIN_SCHOOL_ONBORDA_TOUR);
      }}
      className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-slate-950"
    >
      Panduan Admin Sekolah
      <Icon name="sparkles" className="h-4 w-4" />
    </button>
  );
}
