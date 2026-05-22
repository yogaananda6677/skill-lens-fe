"use client";

import Link from "next/link";
import { StudentTopNav } from "../../components/layout/StudentTopNav";
import { Icon } from "../../components/ui/icons";
import { useStudentData } from "./hooks/useStudentData";

export default function SiswaHomePage() {
  const { profile, prestasiRows, loadingProfile, error } = useStudentData();

  const completedProfile =
    profile.interests.length +
    profile.hobbies.length +
    profile.talents.length +
    profile.experiences.length;

  return (
    <StudentTopNav>
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_48%,#f8fafc_100%)]">
        <section className="mx-auto max-w-7xl px-5 py-8">
          <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-950/5">
            <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_360px] lg:items-center">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-600">
                  Ruang Siswa SkillLens
                </p>

                <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                  Mulai perjalanan belajarmu dengan langkah yang jelas.
                </h1>

                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                  Lengkapi profil, cek ringkasan akademik, proses rekomendasi
                  SPK, lalu pilih roadmap yang paling sesuai dengan tujuanmu.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/siswa/profil"
                    className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-700"
                  >
                    Mulai isi profil
                    <Icon name="chevronRight" className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/siswa/rekomendasi"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                  >
                    Lihat rekomendasi
                  </Link>
                </div>
              </div>

              <div className="relative rounded-[1.7rem] border border-sky-100 bg-sky-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                  Profil aktif
                </p>

                <h2 className="mt-3 text-xl font-bold text-slate-950">
                  {profile.name || "Siswa"}
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {profile.className || "-"} • {profile.major || "-"}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {profile.school || "Sekolah belum terbaca"}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-sky-100">
                    <p className="text-xs font-semibold text-slate-400">
                      Profil terisi
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      {completedProfile}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-sky-100">
                    <p className="text-xs font-semibold text-slate-400">
                      Prestasi
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      {prestasiRows.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {loadingProfile && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500 shadow-sm">
              Memuat data siswa...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
              {error}
            </div>
          )}

          <section className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "1. Lengkapi Profil",
                desc: "Pilih minat, hobi, bakat, pengalaman, dan cek prestasi dari database.",
                icon: "profile",
                href: "/siswa/profil",
              },
              {
                title: "2. Proses Rekomendasi",
                desc: "Sistem akan menghitung rekomendasi berdasarkan data akademik dan profilmu.",
                icon: "sparkles",
                href: "/siswa/rekomendasi",
              },
              {
                title: "3. Ikuti Roadmap",
                desc: "Setelah memilih hasil rekomendasi, kamu bisa mengikuti roadmap belajar.",
                icon: "map",
                href: "/siswa/roadmap",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[1.7rem] border border-sky-100 bg-white p-5 shadow-lg shadow-sky-950/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-950/10"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-700">
                  <Icon name={item.icon as any} className="h-5 w-5" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  {item.desc}
                </p>
              </Link>
            ))}
          </section>
        </section>
      </main>
    </StudentTopNav>
  );
}