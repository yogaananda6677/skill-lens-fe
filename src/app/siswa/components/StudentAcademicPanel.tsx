"use client";

import { Panel, SectionTitle } from "./StudentShared";

function displayScore(value: number) {
  return value && Number.isFinite(value) && value > 0 ? Math.round(value).toString() : "-";
}

function scorePercent(value: number) {
  return Math.min(100, Math.max(0, value || 0));
}

export function StudentAcademicPanel({
  averageScore,
  academicRows,
}: {
  averageScore: number;
  academicRows: readonly (readonly [string, number])[];
}) {
  const hasAverage = averageScore && Number.isFinite(averageScore) && averageScore > 0;

  return (
    <Panel id="akademik" className="overflow-hidden">
      <div className="relative">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-20 h-36 w-36 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative">
          <SectionTitle
            eyebrow="Akademik"
            title="Ringkasan nilai"
            description="Nilai akademik ditampilkan di beranda agar halaman profil tetap fokus untuk pengisian potensi siswa. Tanda - berarti nilai bidang tersebut belum ada atau tidak berkaitan."
          />

          <div className="mt-5 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] p-6 text-white shadow-xl shadow-sky-700/20 skilllens-gradient-move">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/80">
                  Rata-rata akademik
                </p>
                <p className="mt-3 text-5xl font-bold">{hasAverage ? averageScore : "-"}</p>
                <p className="mt-2 text-xs font-semibold text-white/75">
                  Dipakai sebagai salah satu dasar rekomendasi, tetapi profil potensi tetap ikut menentukan hasil SPK.
                </p>
              </div>

              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[0.15] ring-1 ring-white/20 skilllens-float">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {academicRows.map(([label, value]) => {
              const hasValue = value && Number.isFinite(value) && value > 0;

              return (
                <div
                  key={label}
                  className={`rounded-2xl border p-4 skilllens-smooth hover:-translate-y-1 hover:shadow-md ${
                    hasValue
                      ? "border-sky-100 bg-white shadow-sm"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className={hasValue ? "text-slate-700" : "text-slate-400"}>{label}</span>
                    <span className={hasValue ? "text-slate-950" : "text-slate-400"}>{displayScore(value)}</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    {hasValue ? (
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#08224f] via-[#0a54c7] to-[#39d9ff] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                        style={{ width: `${scorePercent(value)}%` }}
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-[repeating-linear-gradient(90deg,#e2e8f0_0,#e2e8f0_8px,#f8fafc_8px,#f8fafc_16px)]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
