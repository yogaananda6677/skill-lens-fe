"use client";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { UserProfilePanel } from "../../../components/profile/UserProfilePanel";
import { adminNav } from "../../../config/navigation";
import { Icon } from "../../../components/ui/icons";

function ProfileInfoCard({
  title,
  value,
  desc,
  icon,
}: {
  title: string;
  value: string;
  desc: string;
  icon: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)]">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">
            {title}
          </p>
          <p className="mt-2 text-xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            {desc}
          </p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <DashboardShell
      requiredRole={["admin", "superadmin"]}
      activeKey="profil"
      navItems={adminNav}
      title="Profil Admin Platform"
      subtitle="Kelola data diri, informasi akun, dan keamanan password admin."
      userName="Admin Pusat"
      userLabel="Administrator"
      schoolName="Platform SkillLens"
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                Pengaturan Akun
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                Data Profil Admin
              </h2>

              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Perbarui informasi akun, kelola data diri, dan ubah password
                menggunakan kode OTP.
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
              <Icon name="profile" className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-white via-sky-50/30 to-white p-5">
            <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/50">
              <UserProfilePanel
                title="Profil Admin Platform"
                subtitle="Kelola informasi akun admin dan ubah password menggunakan kode OTP."
              />
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}