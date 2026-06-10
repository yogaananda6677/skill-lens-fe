"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Icon } from "../../../components/ui/icons";
import { CardGridSkeleton, ListSkeleton } from "../../../components/ui/LoadingSkeleton";
import { guruNav } from "../../../config/navigation";
import { getGuidanceCases, type GuidanceCase } from "../../../features/guru/api";
import { notifyAppAlert } from "../../../lib/app-alert-events";
import { GuruOnbordaProvider } from "../components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "../components/StartGuruOnbordaButton";

const PAGE_SIZE = 10;

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function toTimestamp(value: unknown) {
  if (!value) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getActivityTime(item: GuidanceCase) {
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

function getActivityLabel(item: GuidanceCase) {
  const row = item as GuidanceCase & Record<string, unknown>;
  const pairs: Array<[unknown, string]> = [
    [row.latestProgressAt, "Progress terbaru"],
    [row.progressUpdatedAt, "Progress terbaru"],
    [row.latestGeneratedAt, "Generate rekomendasi"],
    [row.generatedAt, "Generate rekomendasi"],
    [row.lastLoginAt, "Login siswa"],
    [row.latestLoginAt, "Login siswa"],
    [item.latestNoteAt, "Catatan BK"],
    [item.requestedAt, "Data profil"],
  ];

  let best = { time: 0, label: "Aktivitas terbaru" };
  for (const [value, label] of pairs) {
    const time = toTimestamp(value);
    if (time > best.time) best = { time, label };
  }
  return best.label;
}

function formatDateTime(value: unknown) {
  const time = toTimestamp(value);
  if (!time) return "Belum ada waktu";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
}

function statusLabel(item: GuidanceCase) {
  if (!item.recommendations?.length) return "Belum isi/generate";
  if (!item.hasActiveRoadmap) return "Belum pilih roadmap";
  return `Progress ${item.progress}%`;
}

function statusTone(item: GuidanceCase) {
  if (!item.recommendations?.length) return "border-slate-200 bg-slate-50 text-slate-600";
  if (!item.hasActiveRoadmap) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function statusDotTone(item: GuidanceCase) {
  if (!item.recommendations?.length) return "bg-slate-400";
  if (!item.hasActiveRoadmap) return "bg-amber-500";
  return "bg-sky-500";
}

function ProgressBar({ value }: { value: number }) {
  const progress = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-4 shadow-sm shadow-sky-100/60 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-200/25 blur-2xl" />
      <div className="relative flex items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-700">{title}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{value}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function GuruProgressPage() {
  const [cases, setCases] = useState<GuidanceCase[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterJurusan, setFilterJurusan] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restoreScrollYRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const rows = await getGuidanceCases();
        if (active) setCases(rows);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal memuat progress siswa.";
        if (active) setError(message);
        notifyAppAlert({ type: "error", title: "Gagal memuat progress", description: message, autoCloseMs: false });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const jurusanOptions = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of cases) {
      const jurusan = String(item.jurusan ?? "").trim();
      if (!jurusan) continue;
      const key = jurusan.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(jurusan);
    }
    return result.sort((a, b) => a.localeCompare(b, "id"));
  }, [cases]);

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);
    return [...cases]
      .filter((item) => {
        const matchSearch =
          !keyword ||
          normalizeText(item.studentName).includes(keyword) ||
          normalizeText(item.nisn).includes(keyword) ||
          normalizeText(item.className).includes(keyword) ||
          normalizeText(item.jurusan).includes(keyword) ||
          normalizeText(item.phone).includes(keyword);
        const status = !item.recommendations?.length ? "kosong" : !item.hasActiveRoadmap ? "belum-pilih" : "aktif";
        const matchStatus = filterStatus === "semua" || filterStatus === status;
        const matchJurusan = filterJurusan === "semua" || normalizeText(item.jurusan) === normalizeText(filterJurusan);
        return matchSearch && matchStatus && matchJurusan;
      })
      .sort((a, b) => getActivityTime(b) - getActivityTime(a));
  }, [cases, filterJurusan, filterStatus, search]);

  useEffect(() => { setCurrentPage(1); }, [filterJurusan, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const shownStart = filtered.length ? startIndex + 1 : 0;
  const shownEnd = Math.min(startIndex + PAGE_SIZE, filtered.length);

  const stats = useMemo(() => {
    const aktif = filtered.filter((item) => item.hasActiveRoadmap).length;
    const belumPilih = filtered.filter((item) => item.recommendations?.length && !item.hasActiveRoadmap).length;
    const belumGenerate = filtered.filter((item) => !item.recommendations?.length).length;
    const avgProgress = filtered.length ? Math.round(filtered.reduce((sum, item) => sum + Number(item.progress || 0), 0) / filtered.length) : 0;
    return { aktif, belumPilih, belumGenerate, avgProgress };
  }, [filtered]);

  useEffect(() => {
    if (restoreScrollYRef.current === null) return;

    const y = restoreScrollYRef.current;
    restoreScrollYRef.current = null;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "auto" });
    });
  }, [safePage, pageRows.length]);

  function changePage(nextPage: number) {
    const targetPage = Math.min(Math.max(nextPage, 1), totalPages);
    if (targetPage === safePage) return;

    restoreScrollYRef.current = window.scrollY;
    setCurrentPage(targetPage);
  }

  return (
    <GuruOnbordaProvider>
      <DashboardShell
        requiredRole="guru"
        activeKey="progress"
        navItems={guruNav}
        title="Progress Siswa"
        subtitle="Pantau status data siswa, hasil keputusan, roadmap pilihan, dan progress total."
        rightSlot={<StartGuruOnbordaButton />}
      >
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <section className="relative overflow-hidden rounded-[1.8rem] border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                  <Icon name="progress" className="h-3.5 w-3.5" />
                  Progress Siswa
                </p>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Daftar siswa bimbingan</h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">Gunakan filter untuk mencari siswa berdasarkan nama, NISN, kelas, jurusan, status roadmap, atau nomor HP.</p>
              </div>
              <div className="grid w-full gap-3 xl:w-auto xl:min-w-[780px] xl:grid-cols-[1.3fr_0.8fr_0.9fr]">
                <div className="relative">
                  <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, NISN, kelas, jurusan, no HP..." className="w-full rounded-2xl border border-sky-100 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100" />
                </div>
                <select value={filterJurusan} onChange={(event) => setFilterJurusan(event.target.value)} className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100">
                  <option value="semua">Semua jurusan</option>
                  {jurusanOptions.map((jurusan) => <option key={jurusan} value={jurusan}>{jurusan}</option>)}
                </select>
                <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100">
                  <option value="semua">Semua status</option>
                  <option value="kosong">Belum isi/generate</option>
                  <option value="aktif">Roadmap aktif</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">
            {loading ? <CardGridSkeleton count={4} /> : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total Hasil" value={filtered.length} icon="users" />
                <StatCard title="Roadmap Aktif" value={stats.aktif} icon="check" />
                <StatCard title="Belum Pilih" value={stats.belumPilih} icon="roadmap" />
                <StatCard title="Rata-rata Progress" value={`${stats.avgProgress}%`} icon="chart" />
              </div>
            )}

            <div className="mt-5 flex flex-col justify-between gap-2 rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/35 to-sky-50/60 px-4 py-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center">
              <span>Menampilkan {shownStart} - {shownEnd} dari {filtered.length} siswa{filterJurusan !== "semua" ? ` • Jurusan ${filterJurusan}` : ""}</span>
              <span className="rounded-full bg-white px-3 py-1 text-sky-700 ring-1 ring-sky-100">Halaman {safePage} dari {totalPages}</span>
            </div>

            <div className="mt-5 grid gap-4">
              {loading ? <ListSkeleton count={5} /> : pageRows.length ? pageRows.map((item) => {
                const activityAt = getActivityTime(item);
                return (
                  <article key={item.id} className="group rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr_170px] xl:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-50 text-sm font-black text-sky-700 ring-1 ring-sky-100">{String(item.studentName || "S").slice(0, 2).toUpperCase()}</div>
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-black text-slate-950">{item.studentName}</h3>
                            <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-slate-400">{getActivityLabel(item)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                          <span className="rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">NISN: {item.nisn || "-"}</span>
                          <span className="rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">Kelas: {item.className || "-"}</span>
                          <span className="rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">Jurusan: {item.jurusan || "-"}</span>
                          <span className="rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-100">No HP: {item.phone || "-"}</span>
                        </div>
                        <p className="mt-3 text-xs font-semibold text-slate-400">Aktivitas: {formatDateTime(activityAt)}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${statusTone(item)}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDotTone(item)}`} />
                          {statusLabel(item)}
                        </span>
                        {item.hasActiveRoadmap && (
                          <div className="mt-4">
                            <div className="mb-1 flex justify-between text-xs font-bold text-slate-500"><span>Progress total</span><span>{item.progress}%</span></div>
                            <ProgressBar value={item.progress} />
                          </div>
                        )}
                        {item.selectedRoadmapTitle && <p className="mt-3 text-xs font-bold leading-5 text-sky-700">Pilihan: {item.selectedRoadmapTitle}</p>}
                        {item.recommendations?.length ? <p className="mt-1 text-xs font-semibold text-slate-400">Rekomendasi tersedia: {item.recommendations.length}</p> : null}
                      </div>

                      <Link href={`/guru/siswa/progress-detail?id=${item.studentId}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl">
                        Lihat Detail
                        <Icon name="chevronRight" className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              }) : (
                <div className="rounded-[1.5rem] border border-dashed border-sky-200 bg-sky-50/40 p-10 text-center text-sm font-semibold text-slate-500">Tidak ada siswa sesuai filter.</div>
              )}
            </div>

            {filtered.length > PAGE_SIZE ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-500">Maksimal {PAGE_SIZE} data per halaman</p>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => changePage(safePage - 1)} disabled={safePage <= 1} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Sebelumnya</button>
                  <span className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-black text-sky-700">{safePage}/{totalPages}</span>
                  <button type="button" onClick={() => changePage(safePage + 1)} disabled={safePage >= totalPages} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Berikutnya</button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
