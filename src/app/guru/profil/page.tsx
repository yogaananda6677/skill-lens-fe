"use client";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { UserProfilePanel } from "../../../components/profile/UserProfilePanel";
import { Icon } from "../../../components/ui/icons";
import { guruNav } from "../../../config/navigation";
import { GuruOnbordaProvider } from "../components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "../components/StartGuruOnbordaButton";

export default function GuruProfilePage() {
  return (
    <GuruOnbordaProvider>
      <DashboardShell
        requiredRole="guru"
        activeKey="profil"
        navItems={guruNav}
        title="Profil Guru BK"
        subtitle="Kelola data diri, informasi akun, dan keamanan password guru."
        rightSlot={
          <div className="flex flex-wrap items-center gap-3">
            <StartGuruOnbordaButton />
          </div>
        }
      >
        <section className="relative overflow-hidden rounded-[1.8rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/40 to-sky-50/70 shadow-sm shadow-sky-100/60">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

          <div className="relative border-b border-sky-100 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
                <Icon name="profile" className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
                  Profil Guru
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  Profil Guru BK
                </h2>

                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Kelola informasi akun Guru BK dan ubah password untuk menjaga
                  keamanan akses dashboard.
                </p>
              </div>
            </div>
          </div>

          <div className="relative p-5 md:p-6">
            <UserProfilePanel
              title="Profil Guru BK"
              subtitle="Kelola informasi akun Guru BK dan keamanan password."
            />
          </div>
        </section>
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}