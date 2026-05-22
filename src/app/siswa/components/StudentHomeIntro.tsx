"use client";

import { Icon } from "../../../components/ui/icons";
import type { StudentProfileForm } from "../../../features/siswa/types";

export function StudentHomeIntro({
  profile,
  onGoProfile,
  onProcess,
  onGoResult,
  processing,
  hasRecommendations,
}: {
  profile: StudentProfileForm;
  onGoProfile: () => void;
  onProcess: () => void;
  onGoResult: () => void;
  processing: boolean;
  hasRecommendations: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] skilllens-smooth-card">
      <div className="relative p-6 md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-600">
              Ruang Siswa
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Mulai dari profil, cek rekomendasi, lalu buat roadmap.
            </h1>

            <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-500">
              Nilai akademik sudah dibaca dari sekolah. Kamu cukup melengkapi
              minat, hobi, bakat, pengalaman, dan prestasi agar hasil SPK lebih
              sesuai.
            </p>
          </div>

          <div className="rounded-3xl border border-sky-100 bg-white/70 p-5 shadow-inner shadow-sky-100/60 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
              Profil Siswa
            </p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {profile.name || "Siswa"}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {profile.className || "-"} • {profile.major || "-"}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {profile.school || "Sekolah belum terbaca"}
            </p>
          </div>
        </div>

        <div className="relative mt-7 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={onGoProfile}
            className="rounded-3xl border border-sky-100 bg-white/[0.86] p-5 text-left shadow-sm backdrop-blur skilllens-smooth hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-sky-950/10"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-700 ring-1 ring-sky-100">
              <Icon name="profile" className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-950">1. Lengkapi profil</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Isi minat, hobi, bakat, pengalaman, dan prestasi.
            </p>
          </button>

          <button
            type="button"
            onClick={onProcess}
            disabled={processing}
            className="rounded-3xl border border-sky-100 bg-white/[0.86] p-5 text-left shadow-sm backdrop-blur skilllens-smooth hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-sky-950/10 disabled:opacity-60"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-700 ring-1 ring-sky-100">
              <Icon name="rocket" className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-950">2. Proses SPK</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Sistem akan menghitung rekomendasi terbaik.
            </p>
          </button>

          <button
            type="button"
            onClick={onGoResult}
            className="rounded-3xl border border-sky-100 bg-white/[0.86] p-5 text-left shadow-sm backdrop-blur skilllens-smooth hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-sky-950/10"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-700 ring-1 ring-sky-100">
              <Icon name="sparkles" className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-bold text-slate-950">3. Pilih roadmap</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {hasRecommendations
                ? "Hasil rekomendasi sudah tersedia."
                : "Hasil akan muncul setelah proses SPK."}
            </p>
          </button>
        </div>
      </div>
    </section>
  );
}