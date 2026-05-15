"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell, type DashboardNavItem } from "../../../components/layout/DashboardShell";
import { Icon } from "../../../components/ui/icons";
import { getAdminDashboard, type AdminDashboardResponse } from "../../../features/admin/api";

const navItems = [
  { key: "dashboard", label: "Dashboard", description: "Monitoring sistem", href: "/admin/dashboard", icon: "dashboard" },
  { key: "verifikasi", label: "Verifikasi", description: "Sekolah dan akun", href: "/admin/verifikasi", icon: "verify" },
  { key: "sekolah", label: "Data Sekolah", description: "Daftar sekolah", href: "/admin/sekolah", icon: "school" },
  { key: "laporan", label: "Laporan", description: "Aktivitas SPK", href: "/admin/dashboard", icon: "report" },
] as const satisfies readonly DashboardNavItem[];

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: "school" | "verify" | "users";
  tone: "blue" | "emerald" | "amber" | "cyan";
};

function MetricCard({ item }: { item: Metric }) {
  const tone = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  }[item.tone];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ring-1 ${tone}`}>
          <Icon name={item.icon} className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm font-normal leading-6 text-slate-500">{item.detail}</p>
    </article>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboard().then(setData).catch((err) => setError(err instanceof Error ? err.message : "Gagal mengambil dashboard"));
  }, []);

  const metrics = useMemo<Metric[]>(() => [
    { label: "Sekolah aktif", value: String(data?.stats.schools ?? 0), detail: "Satuan pendidikan dari database", icon: "school", tone: "blue" },
    { label: "Menunggu verifikasi", value: String(data?.stats.pendingSchools ?? 0), detail: "Sekolah perlu ditinjau admin", icon: "verify", tone: "amber" },
    { label: "Pembimbing", value: String(data?.stats.teachers ?? 0), detail: "Akun guru dari database", icon: "users", tone: "emerald" },
    { label: "Siswa", value: String(data?.stats.students ?? 0), detail: "Akun siswa tersinkron", icon: "users", tone: "cyan" },
  ], [data]);

  return (
    <DashboardShell requiredRole={["admin", "superadmin"]} activeKey="dashboard" navItems={navItems} title="Dashboard Administrasi" subtitle="Pantau sekolah, akun pembimbing, data siswa, dan aktivitas sistem pendukung keputusan secara terpusat." userName="Admin Pusat" userLabel="Administrator" schoolName="Platform SkillLens">
      {error && <div className="mb-5 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-100">{error}</div>}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((item) => <MetricCard key={item.label} item={item} />)}</div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-700">Kinerja sistem</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Data langsung dari backend</h2>
              <p className="mt-2 max-w-2xl text-sm font-normal leading-7 text-slate-500">Ringkasan ini membaca tabel sekolah, user guru, dan siswa melalui NestJS sehingga tidak lagi memakai data dummy.</p>
            </div>
            <Link href="/admin/verifikasi" className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
              Buka verifikasi
            </Link>
          </div>
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <p className="text-sm font-normal leading-7 text-slate-600">Pastikan backend aktif di alamat <span className="font-medium text-blue-700">NEXT_PUBLIC_API_URL</span> agar kartu metrik terisi dari database MySQL.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-700">Aktivitas terbaru</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Timeline sistem</h2>
          <div className="mt-6 space-y-3">
            {(data?.activities ?? []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xs font-medium text-blue-700 shadow-sm ring-1 ring-slate-200">{index + 1}</div>
                <div>
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm font-normal leading-6 text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
            {!(data?.activities ?? []).length && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-normal text-slate-500">Belum ada aktivitas terbaru.</p>}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
