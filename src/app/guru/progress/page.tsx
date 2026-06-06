"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Icon } from "../../../components/ui/icons";
import { CardGridSkeleton, ListSkeleton } from "../../../components/ui/LoadingSkeleton";
import { guruNav } from "../../../config/navigation";
import { getGuidanceCases, type GuidanceCase } from "../../../features/guru/api";
import { notifyAppAlert } from "../../../lib/app-alert-events";
import { GuruOnbordaProvider } from "../components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "../components/StartGuruOnbordaButton";

const PAGE_SIZE = 8;

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
  if (!item.hasActiveRoadmap) return "Sudah isi data, belum memilih roadmap";
  return `Progress ${item.progress}%`;
}

function statusTone(item: GuidanceCase) {
  if (!item.recommendations?.length) return "bg-slate-100 text-slate-500 ring-slate-200";
  if (!item.hasActiveRoadmap) return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-sky-50 text-sky-700 ring-sky-100";
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-sky-600 transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
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

    return () => {
      active = false;
    };
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filterJurusan, filterStatus, search]);

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

  return (
    <GuruOnbordaProvider>
      <DashboardShell
        requiredRole="guru"
        activeKey="progress"
        navItems={guruNav}
        title="Progress Siswa"
        subtitle="Pantau status data siswa, 3 hasil keputusan, roadmap pilihan, dan progress total."
        rightSlot={<StartGuruOnbordaButton />}
      >
        {error && <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</div>}

        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 transition-all duration-500">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Progress Siswa</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Daftar siswa bimbingan</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[760px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, NISN, kelas, jurusan, no HP..."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              />
              <select
                value={filterJurusan}
                onChange={(event) => setFilterJurusan(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="semua">Semua jurusan</option>
                {jurusanOptions.map((jurusan) => (
                  <option key={jurusan} value={jurusan}>{jurusan}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="semua">Semua status</option>
                <option value="kosong">Belum isi/generate</option>
                <option value="belum-pilih">Belum pilih roadmap</option>
                <option value="aktif">Roadmap aktif</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-6">
              <CardGridSkeleton count={4} />
            </div>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {[
                ["Total hasil", filtered.length, "users"],
                ["Roadmap aktif", stats.aktif, "check"],
                ["Belum pilih", stats.belumPilih, "roadmap"],
                ["Rata-rata progress", `${stats.avgProgress}%`, "chart"],
              ].map(([label, value, icon]) => (
                <div key={String(label)} className="rounded-3xl border border-sky-100 bg-sky-50/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-sky-700">{label}</p>
                      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-sky-700 ring-1 ring-sky-100">
                      <Icon name={icon as any} className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-col justify-between gap-2 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center">
            <span>
              Menampilkan {shownStart}-{shownEnd} dari {filtered.length} siswa
              {filterJurusan !== "semua" ? ` • Jurusan ${filterJurusan}` : ""}
            </span>
            <span>Halaman {safePage} dari {totalPages}</span>
          </div>

          <div className="mt-5 grid gap-4">
            {loading ? (
              <ListSkeleton count={5} />
            ) : pageRows.length ? pageRows.map((item) => {
              const activityAt = getActivityTime(item);

              return (
                <article key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-100 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5">
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_180px] xl:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-950">{item.studentName}</h3>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-sky-700 ring-1 ring-sky-100">
                          {getActivityLabel(item)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-100">NISN: {item.nisn || "-"}</span>
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-100">Kelas: {item.className || "-"}</span>
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-100">Jurusan: {item.jurusan || "-"}</span>
                        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-100">No HP: {item.phone || "-"}</span>
                      </div>
                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        Aktivitas: {formatDateTime(activityAt)}
                      </p>
                    </div>

                    <div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${statusTone(item)}`}>{statusLabel(item)}</span>
                      {item.hasActiveRoadmap && (
                        <div className="mt-3">
                          <div className="mb-1 flex justify-between text-xs font-bold text-slate-500"><span>Progress total</span><span>{item.progress}%</span></div>
                          <ProgressBar value={item.progress} />
                        </div>
                      )}
                      {item.selectedRoadmapTitle && <p className="mt-2 text-xs font-bold text-sky-700">Pilihan: {item.selectedRoadmapTitle}</p>}
                      {item.recommendations?.length ? (
                        <p className="mt-1 text-xs font-semibold text-slate-400">Rekomendasi tersedia: {item.recommendations.length}</p>
                      ) : null}
                    </div>

                    <Link href={`/guru/siswa/${item.studentId}/progress`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700">
                      Lihat Detail
                      <Icon name="chevronRight" className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            }) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm font-semibold text-slate-400">
                Tidak ada siswa sesuai filter.
              </div>
            )}
          </div>

          {filtered.length > PAGE_SIZE ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage <= 1}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-black text-sky-700 ring-1 ring-sky-100">
                  {safePage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safePage >= totalPages}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
