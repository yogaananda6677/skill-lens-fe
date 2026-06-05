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
  icon: "school" | "verify" | "users" | "graduation";
};

function MetricCard({ item }: { item: Metric }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)]">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {item.value}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
            {item.detail}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
          <Icon name={item.icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getAdminDashboard()
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal mengambil dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo<Metric[]>(
    () => [
      {
        label: "Sekolah aktif",
        value: loading ? "..." : String(data?.stats.schools ?? 0),
        detail: "Satuan pendidikan dari database",
        icon: "school",
      },
      {
        label: "Menunggu verifikasi",
        value: loading ? "..." : String(data?.stats.pendingSchools ?? 0),
        detail: "Sekolah perlu ditinjau admin",
        icon: "verify",
      },
      {
        label: "Pembimbing",
        value: loading ? "..." : String(data?.stats.teachers ?? 0),
        detail: "Akun guru dari database",
        icon: "users",
      },
      {
        label: "Siswa",
        value: loading ? "..." : String(data?.stats.students ?? 0),
        detail: "Akun siswa tersinkron",
        icon: "graduation",
      },
    ],
    [data, loading]
  );

  const activities = data?.activities ?? [];

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
      <div className="space-y-7">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <MetricCard key={item.label} item={item} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
            <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                  Kinerja Sistem
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  Data langsung dari backend
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Ringkasan ini membaca tabel sekolah, user guru, dan siswa melalui NestJS
                  sehingga tidak lagi memakai data dummy.
                </p>
              </div>

              <Link
                href="/admin/verifikasi"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200"
              >
                Buka verifikasi
                <Icon name="chevronRight" className="h-4 w-4" />
              </Link>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/70 p-5 shadow-sm text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                    <Icon name="chart" className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">
                    Integrasi dashboard aktif
                  </h3>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
              <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                    <Icon name="clock" className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Aktivitas Terbaru
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      Timeline sistem
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid min-h-[220px] place-items-center px-5 py-10 text-sm font-semibold text-slate-500">
                  Memuat aktivitas...
                </div>
              ) : activities.length === 0 ? (
                <div className="grid min-h-[220px] place-items-center px-5 py-10 text-center">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                      <Icon name="clock" className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      Belum ada aktivitas terbaru.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-5">
                  {activities.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-sm"
                    >
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-100 text-[11px] font-black text-sky-700">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/90 via-white to-blue-50/70 p-5 shadow-sm shadow-sky-100/60">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
                  <Icon name="info" className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Catatan Dashboard
                </h3>
              </div>
              <p className="mt-3 text-xs font-medium leading-6 text-slate-600">
                Modul ini dipakai untuk memantau verifikasi sekolah dan ringkasan data pengguna.
                Data akan mengikuti endpoint backend yang sudah aktif.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
