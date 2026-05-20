"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav as navItems } from "@/config/navigation";
import { Icon } from "@/components/ui/icons";
import { getAdminDashboard, type AdminDashboardResponse } from "@/features/admin/api";

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: "school" | "verify" | "users";
  tone: "blue" | "emerald" | "amber" | "cyan";
};

function MetricCard({ item }: { item: Metric }) {
  // Warna latar ikon disesuaikan dengan tone, namun kartu tetap menggunakan gradasi biru
  const iconBgColor = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    cyan: "bg-cyan-100 text-cyan-600",
  }[item.tone];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/40 to-blue-100/20 p-5 shadow-md border border-blue-100/60 transition hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{item.value}</p>
          <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
        </div>
        <div className={`rounded-full ${iconBgColor} p-2 shadow-sm`}>
          <Icon name={item.icon} className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-60 rounded-b-xl" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal mengambil dashboard"));
  }, []);

  const metrics = useMemo<Metric[]>(
    () => [
      { label: "Sekolah aktif", value: String(data?.stats.schools ?? 0), detail: "Satuan pendidikan dari database", icon: "school", tone: "blue" },
      { label: "Menunggu verifikasi", value: String(data?.stats.pendingSchools ?? 0), detail: "Sekolah perlu ditinjau admin", icon: "verify", tone: "amber" },
      { label: "Pembimbing", value: String(data?.stats.teachers ?? 0), detail: "Akun guru dari database", icon: "users", tone: "emerald" },
      { label: "Siswa", value: String(data?.stats.students ?? 0), detail: "Akun siswa tersinkron", icon: "users", tone: "cyan" },
    ],
    [data]
  );

  return (
    <DashboardShell
      requiredRole={["admin", "superadmin"]}
      activeKey="dashboard"
      navItems={navItems}
      title="Dashboard Administrasi"
      subtitle="Pantau sekolah, akun pembimbing, data siswa, dan aktivitas sistem pendukung keputusan secara terpusat."
      userName="Admin Pusat"
      userLabel="Administrator"
      schoolName="Platform SkillLens"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Kartu statistik */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <MetricCard key={item.label} item={item} />
        ))}
      </div>

      {/* Dua kolom: Kinerja Sistem & Aktivitas Terbaru */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Kiri: Kinerja Sistem */}
        <div className="rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-blue-100/20 p-6 shadow-md border border-blue-100/60 hover:shadow-lg transition">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Kinerja Sistem</p>
              <h2 className="mt-1 text-xl font-bold text-slate-800">Data langsung dari backend</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Ringkasan ini membaca tabel sekolah, user guru, dan siswa melalui NestJS sehingga tidak lagi memakai data dummy.
              </p>
            </div>
            <Link
              href="/admin/verifikasi"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition"
            >
              Buka verifikasi
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 rounded-xl bg-blue-50/50 p-3 text-xs text-slate-600 border border-blue-100">
            Pastikan backend aktif di alamat <code className="bg-white px-1 rounded text-blue-600">NEXT_PUBLIC_API_URL</code> agar kartu metrik terisi dari database MySQL.
          </div>
        </div>

        {/* Kanan: Aktivitas Terbaru */}
        <div className="rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-blue-100/20 p-6 shadow-md border border-blue-100/60 hover:shadow-lg transition">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Aktivitas Terbaru</p>
          <h2 className="mt-1 text-xl font-bold text-slate-800">Timeline sistem</h2>
          <div className="mt-4 space-y-3">
            {(data?.activities ?? []).length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Belum ada aktivitas terbaru.</p>
            ) : (
              data?.activities?.map((item, index) => (
                <div key={`${item.title}-${index}`} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm border border-slate-100">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}