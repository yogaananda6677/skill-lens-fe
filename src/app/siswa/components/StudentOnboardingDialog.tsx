"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "../../../components/ui/icons";

type StudentOnboardingDialogProps = {
  open: boolean;
  onClose: () => void;
};

const STEPS = [
  {
    title: "Lengkapi profil siswa",
    description:
      "Mulai dari minat, hobi, bakat, pengalaman, tujuan karier, dan prestasi. Data ini membantu SkillLens memahami arah yang paling cocok untukmu.",
    icon: "profile",
    href: "/siswa/profil",
    cta: "Isi profil",
  },
  {
    title: "Lihat hasil rekomendasi",
    description:
      "Setelah profil siap, sistem akan mengolah nilai akademik dan profilmu untuk menghasilkan rekomendasi jurusan, karier, atau jalur belajar yang relevan.",
    icon: "sparkles",
    href: "/siswa/rekomendasi",
    cta: "Lihat rekomendasi",
  },
  {
    title: "Ikuti roadmap belajar",
    description:
      "Pilih roadmap yang sesuai dengan rekomendasi, lalu pantau progress langkah demi langkah sampai tujuanmu lebih jelas.",
    icon: "roadmap",
    href: "/siswa/roadmap",
    cta: "Buka roadmap",
  },
];

export function StudentOnboardingDialog({ open, onClose }: StudentOnboardingDialogProps) {
  const [step, setStep] = useState(0);

  if (!open) return null;

  const active = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function finish() {
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 px-4 py-8 backdrop-blur-md">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl shadow-slate-950/30">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

        <button
          type="button"
          onClick={finish}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          aria-label="Tutup onboarding"
        >
          <Icon name="x" className="h-5 w-5" />
        </button>

        <div className="relative grid gap-0 md:grid-cols-[0.85fr_1.15fr]">
          <aside className="bg-gradient-to-br from-[#07142f] via-[#0b2a60] to-[#0f7ea8] p-8 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              Panduan awal siswa
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight">
              Kenali alur SkillLens dalam 3 langkah.
            </h2>

            <p className="mt-4 text-sm font-semibold leading-7 text-sky-100/80">
              Onboarding ini hanya muncul di awal. Kamu bisa menutupnya kapan saja dan membukanya kembali lewat dashboard jika dibutuhkan.
            </p>

            <div className="mt-8 space-y-3">
              {STEPS.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    index === step
                      ? "border-cyan-200 bg-white/15 text-white"
                      : "border-white/10 bg-white/5 text-sky-100/70 hover:bg-white/10"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold">{item.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="p-8">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 ring-1 ring-blue-100">
              <Icon name={active.icon as any} className="h-7 w-7" />
            </div>

            <p className="mt-7 text-sm font-bold text-blue-700">
              Langkah {step + 1} dari {STEPS.length}
            </p>

            <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              {active.title}
            </h3>

            <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
              {active.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={active.href}
                onClick={finish}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {active.cta}
                <Icon name="chevronRight" className="h-4 w-4" />
              </Link>

              {!isLast ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => current + 1)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Selesai
                </button>
              )}
            </div>

            <div className="mt-8 flex gap-2">
              {STEPS.map((item, index) => (
                <span
                  key={item.title}
                  className={`h-2 rounded-full transition-all ${
                    index === step ? "w-10 bg-blue-600" : "w-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
