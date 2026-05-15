"use client";

import { useEffect, useState } from "react";
import { DashboardShell, type DashboardNavItem } from "../../../components/layout/DashboardShell";
import { getAdminSchools, type AdminSchoolRow } from "../../../features/admin/api";

const navItems = [
  { key: "dashboard", label: "Dashboard", description: "Monitoring sistem", href: "/admin/dashboard", icon: "dashboard" },
  { key: "verifikasi", label: "Verifikasi", description: "Sekolah", href: "/admin/verifikasi", icon: "verify" },
  { key: "sekolah", label: "Data Sekolah", description: "Daftar sekolah", href: "/admin/sekolah", icon: "school" },
] as const satisfies readonly DashboardNavItem[];

function StatusBadge({ status }: { status: string }) {
  const approved = status === "approved";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{approved ? "Terverifikasi" : "Menunggu"}</span>;
}

export default function AdminSchoolPage() {
  const [schools, setSchools] = useState<AdminSchoolRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminSchools().then(setSchools).catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data sekolah."));
  }, []);

  return (
    <DashboardShell requiredRole={["admin", "superadmin"]} activeKey="sekolah" navItems={navItems} title="Data Sekolah" subtitle="Daftar sekolah yang terdaftar di sistem. Pengelolaan jurusan dilakukan oleh guru pada ruang kerja sekolahnya." schoolName="Platform SkillLens">
      {error && <div className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-100">{error}</div>}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sekolah</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Daftar sekolah</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Admin hanya memantau dan memverifikasi sekolah.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{schools.length} sekolah</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr><th className="px-6 py-4">Sekolah</th><th className="px-6 py-4">Jenjang</th><th className="px-6 py-4">Kontak</th><th className="px-6 py-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4"><p className="font-semibold text-slate-950">{school.name}</p><p className="mt-1 text-xs font-semibold text-slate-500">{school.address}</p></td>
                  <td className="px-6 py-4 font-medium text-slate-700">{school.level}</td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{school.phone || "-"}</td>
                  <td className="px-6 py-4"><StatusBadge status={school.status} /></td>
                </tr>
              ))}
              {!schools.length && <tr><td colSpan={4} className="px-6 py-12 text-center font-semibold text-slate-500">Belum ada sekolah.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
