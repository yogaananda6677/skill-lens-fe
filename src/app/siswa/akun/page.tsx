"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { Icon } from "../../../components/ui/icons";
import { FormSkeleton } from "../../../components/ui/LoadingSkeleton";


const UserProfilePanel = dynamic(
  () => import("../../../components/profile/UserProfilePanel").then((mod) => mod.UserProfilePanel),
  {
    ssr: false,
    loading: () => <FormSkeleton />,
  },
);

export default function SiswaAkunPage() {
  return (
    <main className="min-h-screen skilllens-blue-page">
      <section className="mx-auto max-w-7xl px-3 py-5 skilllens-page-enter sm:px-5 sm:py-8">
        <section className="overflow-hidden rounded-[1.45rem] sm:rounded-[2rem] border border-white/10 skilllens-hero-grid text-white shadow-2xl shadow-blue-950/20">
          <div className="relative grid gap-6 p-4 sm:p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/[0.35] blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute -bottom-24 left-16 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute right-1/3 top-10 h-24 w-24 rounded-full bg-cyan-200/30 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-cyan-100 ring-1 ring-white/15">
                  <Icon name="profile" className="h-4 w-4" />
                </div>

                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100">
                  Akun & Password
                </p>
              </div>

              <h1 className="mt-3 max-w-3xl text-2xl sm:mt-4 sm:text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Pengaturan akun siswa
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-sky-100/80">
                Kelola data diri, email, username, nomor HP, dan keamanan
                password akun siswa menggunakan kode OTP.
              </p>

              <div className="mt-5 grid gap-3 sm:mt-6 sm:flex sm:flex-wrap">
                <Link
                  href="/siswa"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md skilllens-smooth hover:-translate-y-0.5 hover:bg-white hover:text-[#07142f] sm:w-auto"
                >
                  <Icon name="home" className="h-4 w-4" />
                  Beranda
                </Link>

                <Link
                  href="/siswa/profil"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white skilllens-button-primary sm:w-auto"
                >
                  Profil Potensi
                  <Icon name="chevronRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-sky-200/80 p-3 sm:rounded-[2rem] sm:p-5 shadow-xl shadow-sky-950/5">

            <div className="relative">
              <div className="mb-5 rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-md shadow-sky-950/5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0a54c7_0%,#1d9bf0_58%,#39d9ff_100%)] text-white shadow-lg shadow-sky-700/20">
                    <Icon name="profile" className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-slate-950">
                      Data akun dan keamanan
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                      Perbarui data akun seperlunya. Untuk mengganti password,
                      isi password lama, kirim OTP, lalu masukkan password baru.
                    </p>
                  </div>
                </div>
              </div>

              <UserProfilePanel
                title="Profil Akun Siswa"
                subtitle="Kelola data akun siswa dan ubah password menggunakan kode OTP."
                showHeader={false}
              />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}