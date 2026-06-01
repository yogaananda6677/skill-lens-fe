"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "../../components/layout/DashboardShell";
import { Icon } from "../../components/ui/icons";
import { guruNav } from "../../config/navigation";
import { getGuidanceCases, type GuidanceCase } from "../../features/guru/api";
import { notifyAppAlert } from "../../lib/app-alert-events";
import { GuruOnbordaProvider } from "./components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "./components/StartGuruOnbordaButton";

function statusLabel(item: GuidanceCase) {
  if (!item.recommendations?.length) return "Belum isi/generate";
  if (!item.hasActiveRoadmap) return "Belum pilih roadmap";
  return `Progress ${item.progress}%`;
}

function statusTone(item: GuidanceCase) {
  if (!item.recommendations?.length) return "bg-slate-100 text-slate-600 ring-slate-200";
  if (!item.hasActiveRoadmap) return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
}

export default function GuruDashboardPage() {
  const [cases, setCases] = useState<GuidanceCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const rows = await getGuidanceCases();
        if (active) setCases(rows);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal memuat dashboard guru.";
        if (active) setError(message);
        notifyAppAlert({ type: "error", title: "Gagal memuat dashboard", description: message, autoCloseMs: false });
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = cases.length;
    const belumIsi = cases.filter((item) => !item.recommendations?.length).length;
    const belumPilih = cases.filter((item) => item.recommendations?.length && !item.hasActiveRoadmap).length;
    const aktif = cases.filter((item) => item.hasActiveRoadmap).length;
    const avgProgress = total ? Math.round(cases.reduce((sum, item) => sum + Number(item.progress || 0), 0) / total) : 0;
    const prioritas = cases.filter((item) => String(item.priority).toLowerCase().includes("tinggi")).length;

    return { total, belumIsi, belumPilih, aktif, avgProgress, prioritas };
  }, [cases]);

  const recentCases = cases.slice(0, 5);

  return (
    <GuruOnbordaProvider>
      <DashboardShell
        requiredRole="guru"
        activeKey="dashboard"
        navItems={guruNav}
        title="Dashboard Guru BK"
        subtitle="Ringkasan aktivitas bimbingan, status rekomendasi siswa, dan progress roadmap dalam satu halaman."
        rightSlot={<StartGuruOnbordaButton />}
      >
        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Ringkasan Guru BK</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Pantau aktivitas siswa secara cepat</h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Gunakan menu terpisah di sidebar untuk masuk ke Progress Siswa, Kelola Nilai, Catatan Bimbingan, dan Profil.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/guru/progress" className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700">
                <Icon name="progress" className="h-4 w-4" />
                Lihat Progress
              </Link>
              <Link href="/guru/nilai" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800">
                <Icon name="chart" className="h-4 w-4" />
                Kelola Nilai
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Total Siswa", stats.total, "users"],
              ["Belum Isi Data", stats.belumIsi, "profile"],
              ["Belum Pilih Roadmap", stats.belumPilih, "map"],
              ["Roadmap Aktif", stats.aktif, "check"],
              ["Rata-rata Progress", `${stats.avgProgress}%`, "chart"],
            ].map(([label, value, icon]) => (
              <div key={String(label)} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sky-700 shadow-sm ring-1 ring-slate-100">
                  <Icon name={icon as any} className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-950">{loading ? "..." : value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Aktivitas Terbaru</p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-950">Siswa yang perlu dipantau</h3>
            </div>
            <Link href="/guru/progress" className="text-sm font-extrabold text-sky-700 hover:text-sky-900">
              Lihat semua siswa →
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-sky-50 text-left text-xs font-extrabold uppercase tracking-wide text-sky-700">
                <tr>
                  <th className="px-4 py-3">Siswa</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Jurusan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCases.length ? recentCases.map((item) => (
                  <tr key={item.id} className="bg-white">
                    <td className="px-4 py-3 font-extrabold text-slate-900">{item.studentName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.className || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{item.jurusan || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${statusTone(item)}`}>{statusLabel(item)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/guru/siswa/${item.studentId}/progress`} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-sky-700">
                        Detail
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center font-semibold text-slate-400">{loading ? "Memuat data..." : "Belum ada data siswa."}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
