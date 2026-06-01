"use client";

import { Icon } from "./icons";

type PreparingOverlayProps = {
  show: boolean;
  title?: string;
  description?: string;
};

export function PreparingOverlay({
  show,
  title = "Menyiapkan dashboard...",
  description = "Mohon tunggu sebentar, SkillLens sedang memuat ruang kerja yang sesuai dengan akun kamu.",
}: PreparingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/70 px-5 text-white backdrop-blur-md">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.10] p-7 text-center shadow-2xl shadow-black/30">
        <div className="pointer-events-none absolute inset-0 skilllens-white-sheen opacity-70" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-blue-500/25 blur-3xl" />

        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-cyan-300 text-slate-950 shadow-xl shadow-cyan-300/20">
          <div className="absolute inset-0 animate-ping rounded-3xl bg-cyan-300/30" />
          <Icon name="sparkles" className="relative h-7 w-7" />
        </div>

        <div className="relative mt-6 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-cyan-200" />
        </div>

        <h2 className="relative mt-5 text-2xl font-extrabold tracking-tight">
          {title}
        </h2>
        <p className="relative mt-2 text-sm font-medium leading-6 text-slate-200">
          {description}
        </p>
      </div>
    </div>
  );
}
