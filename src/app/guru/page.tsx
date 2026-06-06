"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "../../components/layout/DashboardShell";
import { Icon } from "../../components/ui/icons";
import {
  CardGridSkeleton,
  ListSkeleton,
  TableSkeleton,
} from "../../components/ui/LoadingSkeleton";
import { guruNav } from "../../config/navigation";
import {
  getGuidanceCases,
  type GuidanceCase,
} from "../../features/guru/api";
import { notifyAppAlert } from "../../lib/app-alert-events";
import { GuruOnbordaProvider } from "./components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "./components/StartGuruOnbordaButton";

function statusLabel(item: GuidanceCase) {
  if (!item.recommendations?.length) return "Belum isi/generate";
  if (!item.hasActiveRoadmap) return "Belum pilih roadmap";
  return `Progress ${item.progress}%`;
}

function statusTone(item: GuidanceCase) {
  if (!item.recommendations?.length) {
    return "bg-slate-100 text-slate-600 ring-slate-200";
  }

  if (!item.hasActiveRoadmap) {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "bg-sky-50 text-sky-700 ring-sky-100";
}

function statusDotTone(item: GuidanceCase) {
  if (!item.recommendations?.length) return "bg-slate-400";
  if (!item.hasActiveRoadmap) return "bg-amber-500";
  return "bg-sky-600";
}

function toTimestamp(value: unknown) {
  if (!value) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) ? time : 0;
}

function activityTime(item: GuidanceCase) {
  const row = item as GuidanceCase & Record<string, unknown>;

  return Math.max(
    toTimestamp(row.latestProgressAt),
    toTimestamp(row.progressUpdatedAt),
    toTimestamp(row.latestGeneratedAt),
    toTimestamp(row.generatedAt),
    toTimestamp(row.lastLoginAt),
    toTimestamp(row.latestLoginAt),
    toTimestamp(row.updatedAt),
    toTimestamp(item.latestNoteAt),
    toTimestamp(item.requestedAt),
  );
}

function activityLabel(item: GuidanceCase) {
  const row = item as GuidanceCase & Record<string, unknown>;
  const pairs: Array<[unknown, string]> = [
    [row.latestProgressAt, "Progress terbaru"],
    [row.progressUpdatedAt, "Progress terbaru"],
    [row.latestGeneratedAt, "Generate terbaru"],
    [row.generatedAt, "Generate terbaru"],
    [row.lastLoginAt, "Login terbaru"],
    [row.latestLoginAt, "Login terbaru"],
    [item.latestNoteAt, "Catatan terbaru"],
    [item.requestedAt, "Data terbaru"],
  ];

  let best = { time: 0, label: "Aktivitas terbaru" };

  for (const [value, label] of pairs) {
    const time = toTimestamp(value);
    if (time > best.time) best = { time, label };
  }

  return best.label;
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "SW"
  );
}

function StatCard({
  title,
  value,
  desc,
  icon,
}: {
  title: string;
  value: string | number;
  desc: string;
  icon: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.6rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60 transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/25 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700">
            {title}
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {desc}
          </p>
        </div>

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="grid min-h-[180px] place-items-center rounded-3xl border border-dashed border-sky-200 bg-sky-50/50 p-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-sky-700 shadow-sm ring-1 ring-sky-100">
          <Icon name="users" className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
          {desc}
        </p>
      </div>
    </div>
  );
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
        const message =
          err instanceof Error ? err.message : "Gagal memuat dashboard guru.";

        if (active) setError(message);

        notifyAppAlert({
          type: "error",
          title: "Gagal memuat dashboard",
          description: message,
          autoCloseMs: false,
        });
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
    const belumPilih = cases.filter(
      (item) => item.recommendations?.length && !item.hasActiveRoadmap,
    ).length;
    const aktif = cases.filter((item) => item.hasActiveRoadmap).length;
    const avgProgress = total
      ? Math.round(
          cases.reduce((sum, item) => sum + Number(item.progress || 0), 0) /
            total,
        )
      : 0;
    const prioritas = cases.filter((item) =>
      String(item.priority).toLowerCase().includes("tinggi"),
    ).length;

    return { total, belumIsi, belumPilih, aktif, avgProgress, prioritas };
  }, [cases]);

  const recentCases = useMemo(
    () => [...cases].sort((a, b) => activityTime(b) - activityTime(a)).slice(0, 5),
    [cases],
  );

  const notificationCases = recentCases.slice(0, 3);

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
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <section className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 shadow-sm shadow-sky-100/60">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-sky-200/20 blur-3xl" />

          <div className="relative border-b border-sky-100 px-6 py-7">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                  <Icon name="users" className="h-3.5 w-3.5" />
                  Ringkasan Guru BK
                </p>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                  Pantau aktivitas siswa secara cepat
                </h2>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Gunakan panel ini untuk melihat status rekomendasi, roadmap,
                  dan siswa yang perlu dipantau lebih lanjut.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/guru/progress"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Icon name="progress" className="h-4 w-4" />
                  Lihat Progress
                </Link>

                <Link
                  href="/guru/nilai"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-5 py-3 text-sm font-extrabold text-sky-700 shadow-sm shadow-sky-100/60 transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
                >
                  <Icon name="chart" className="h-4 w-4" />
                  Lihat Nilai
                </Link>
              </div>
            </div>
          </div>

          <div className="relative p-6">
            {loading ? (
              <CardGridSkeleton count={5} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Total Siswa", stats.total, "Akun siswa bimbingan", "users"],
                  ["Belum Isi Data", stats.belumIsi, "Belum generate rekomendasi", "profile"],
                  ["Belum Pilih Roadmap", stats.belumPilih, "Sudah ada rekomendasi", "map"],
                  ["Roadmap Aktif", stats.aktif, "Siswa sudah memilih", "check"],
                  ["Rata-rata Progress", `${stats.avgProgress}%`, "Progress roadmap", "chart"],
                ].map(([label, value, desc, icon]) => (
                  <StatCard
                    key={String(label)}
                    title={String(label)}
                    value={value as string | number}
                    desc={String(desc)}
                    icon={String(icon)}
                  />
                ))}
              </div>
            )}

            {!loading && stats.prioritas > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                Ada {stats.prioritas} siswa prioritas tinggi yang perlu dipantau.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-5">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />

            <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                  Notifikasi Siswa
                </p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  Catatan dan progress terbaru
                </h3>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  Tiga aktivitas terbaru dari siswa bimbingan.
                </p>
              </div>

              <Link
                href="/guru/bimbingan"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-extrabold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50"
              >
                Lihat riwayat chat
                <Icon name="progress" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <ListSkeleton count={3} />
            ) : notificationCases.length ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {notificationCases.map((item) => (
                  <Link
                    key={`notif-${item.id}`}
                    href={`/guru/siswa/${item.studentId}/progress`}
                    className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/30 to-sky-50/60 p-5 shadow-sm shadow-sky-100/50 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300 opacity-80" />

                    <div className="flex items-start gap-3 pt-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-sm font-black text-sky-700 shadow-sm ring-1 ring-sky-100">
                        {getInitials(item.studentName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-950">
                          {item.studentName}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">
                          {item.className || "-"} • {item.jurusan || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(item)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusDotTone(item)}`}
                        />
                        {statusLabel(item)}
                      </span>
                    </div>

                    <p className="mt-3 text-[11px] font-black uppercase tracking-wide text-sky-700">
                      {activityLabel(item)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-500">
                      {item.lastNote || "Belum ada catatan terbaru."}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum ada notifikasi siswa"
                desc="Aktivitas siswa akan muncul ketika siswa mulai mengisi profil, membuat rekomendasi, atau menjalankan roadmap."
              />
            )}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-5">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />

            <div className="relative flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
                  Aktivitas Terbaru
                </p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  Siswa yang perlu dipantau
                </h3>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  Daftar siswa berdasarkan aktivitas paling baru.
                </p>
              </div>

              <Link
                href="/guru/progress"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-extrabold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50"
              >
                Lihat semua siswa
                <Icon name="progress" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 text-xs font-black uppercase tracking-[0.14em] text-sky-800">
                <tr>
                  <th className="px-5 py-4">Siswa</th>
                  <th className="px-5 py-4">Kelas</th>
                  <th className="px-5 py-4">Jurusan</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-5">
                      <TableSkeleton rows={5} columns={5} />
                    </td>
                  </tr>
                ) : recentCases.length ? (
                  recentCases.map((item) => (
                    <tr key={item.id} className="bg-white transition hover:bg-cyan-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sm font-black text-sky-700 ring-1 ring-sky-100">
                            {getInitials(item.studentName)}
                          </div>
                          <div>
                            <p className="font-black text-slate-950">
                              {item.studentName}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              {activityLabel(item)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">
                        {item.className || "-"}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">
                        {item.jurusan || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(item)}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusDotTone(item)}`}
                          />
                          {statusLabel(item)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/guru/siswa/${item.studentId}/progress`}
                          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-3 py-2 text-xs font-extrabold text-white shadow-md shadow-sky-600/20 transition hover:-translate-y-0.5"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-14">
                      <EmptyState
                        title="Belum ada data siswa"
                        desc="Data siswa akan muncul setelah siswa mulai menggunakan fitur rekomendasi dan roadmap."
                      />
                    </td>
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
