"use client";

import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";
import { Icon } from "../../../components/ui/icons";
import { STUDENT_ONBORDA_DONE_EVENT } from "./StartStudentOnbordaButton";

export function StudentOnbordaCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) {
  const { closeOnborda } = useOnborda();
  const isFirst = currentStep === 0;
  const isLast = currentStep + 1 === totalSteps;

  function finishOnborda() {
    closeOnborda();

    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.dispatchEvent(new CustomEvent(STUDENT_ONBORDA_DONE_EVENT));
    }, 80);
  }

  return (
    <div className="relative w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-white/20 bg-white shadow-2xl shadow-slate-950/25">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/15 blur-2xl" />
      <div className="absolute -bottom-16 left-4 h-36 w-36 rounded-full bg-cyan-400/15 blur-2xl" />

      <div className="relative p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              {step.icon || <Icon name="sparkles" className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">
                Panduan siswa
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-400">
                Langkah {currentStep + 1} dari {totalSteps}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={finishOnborda}
            className="rounded-full bg-slate-100 p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Tutup panduan"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
          {step.title}
        </h3>

        <div className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          {step.content}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={prevStep}
            disabled={isFirst}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? "w-6 bg-blue-600" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (isLast) {
                finishOnborda();
                return;
              }

              nextStep();
            }}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            {isLast ? "Selesai" : "Lanjut"}
          </button>
        </div>
      </div>

      <span className="text-white">{arrow}</span>
    </div>
  );
}
