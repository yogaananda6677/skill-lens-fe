"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Icon } from "../../../components/ui/icons";
import { ListSkeleton } from "../../../components/ui/LoadingSkeleton";
import { guruNav } from "../../../config/navigation";
import { getGuidanceCases, type GuidanceCase } from "../../../features/guru/api";
import { notifyAppAlert } from "../../../lib/app-alert-events";
import { GuruOnbordaProvider } from "../components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "../components/StartGuruOnbordaButton";

const PAGE_SIZE = 10;

type StatusFilter = "semua" | "aktif" | "belum-pilih" | "kosong";

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
    toTimestamp(item.latestNoteAt),
    toTimestamp(item.requestedAt),
    toTimestamp(row.latestProgressAt),
    toTimestamp(row.progressUpdatedAt),
    toTimestamp(row.latestGeneratedAt),
    toTimestamp(row.generatedAt),
    toTimestamp(row.updatedAt),
  );
}

function formatActivityTime(item: GuidanceCase) {
  const time = getActivityTime(item);

  if (!time) return "Belum ada aktivitas";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
}

function getStatusKey(item: GuidanceCase): Exclude<StatusFilter, "semua"> {
  if (item.hasActiveRoadmap) return "aktif";
  if (item.recommendations?.length) return "belum-pilih";
  return "kosong";
}

function activityLabel(item: GuidanceCase) {
  if (item.hasActiveRoadmap) return `Progress roadmap ${item.progress || 0}%`;
  if (item.recommendations?.length) {
    return "Sudah mendapat rekomendasi, belum memilih roadmap";
  }
  return "Belum mengisi data rekomendasi";
}

function tone(item: GuidanceCase) {
  const status = getStatusKey(item);

  if (status === "aktif") {
    return "border-sky-100 bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (status === "belum-pilih") {
    return "border-amber-100 bg-amber-50 text-amber-700 ring-amber-100";
  }

  return "border-slate-200 bg-slate-50 text-slate-600 ring-slate-200";
}

function StatusBadge({ item }: { item: GuidanceCase }) {
  const status = getStatusKey(item);

  const dotClass =
    status === "aktif"
      ? "bg-sky-500"
      : status === "belum-pilih"
        ? "bg-amber-500"
        : "bg-slate-400";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black ring-1 ${tone(item)}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {activityLabel(item)}
    </span>
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
    <div className="group relative overflow-hidden rounded-[1.55rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-5 shadow-sm shadow-sky-100/60 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0b2450] via-sky-500 to-cyan-300" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-200/20 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4 pt-1">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.17em] text-sky-700">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {desc}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm shadow-sky-100/70">
          <Icon name={icon as any} className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-sky-200 bg-sky-50/45 px-5 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm">
        <Icon name="message" className="h-5 w-5" />
      </div>

      <p className="mt-4 text-sm font-black text-slate-800">
        {search ? "Riwayat tidak ditemukan" : "Belum ada riwayat chat"}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm font-medium leading-6 text-slate-500">
        {search
          ? "Coba gunakan kata kunci lain atau ubah filter status."
          : "Riwayat bimbingan akan muncul setelah guru memberi catatan pada progress siswa."}
      </p>
    </div>
  );
}

export default function GuruRiwayatChatPage() {
  const [rows, setRows] = useState<GuidanceCase[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restoreScrollYRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getGuidanceCases()
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((err) => {
        const message =
          err instanceof Error
            ? err.message
            : "Gagal memuat riwayat chat bimbingan.";

        if (active) setError(message);

        notifyAppAlert({
          type: "error",
          title: "Gagal memuat riwayat",
          description: message,
          autoCloseMs: false,
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);

    const sorted = [...rows].sort(
      (a, b) => getActivityTime(b) - getActivityTime(a),
    );

    return sorted.filter((item) => {
      const matchKeyword =
        !keyword ||
        normalizeText(item.studentName).includes(keyword) ||
        normalizeText((item as any).nisn).includes(keyword) ||
        normalizeText(item.className).includes(keyword) ||
        normalizeText(item.jurusan).includes(keyword) ||
        normalizeText(item.phone).includes(keyword);

      const matchStatus =
        statusFilter === "semua" || getStatusKey(item) === statusFilter;

      return matchKeyword && matchStatus;
    });
  }, [rows, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedRows = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const shownStart = filtered.length ? startIndex + 1 : 0;
  const shownEnd = Math.min(startIndex + PAGE_SIZE, filtered.length);

  const stats = useMemo(() => {
    const aktif = rows.filter((item) => item.hasActiveRoadmap).length;
    const belumPilih = rows.filter(
      (item) => item.recommendations?.length && !item.hasActiveRoadmap,
    ).length;
    const kosong = rows.filter((item) => !item.recommendations?.length).length;
    const adaCatatan = rows.filter((item) => Boolean(item.lastNote)).length;

    return { aktif, belumPilih, kosong, adaCatatan };
  }, [rows]);

  useEffect(() => {
    if (restoreScrollYRef.current === null) return;

    const y = restoreScrollYRef.current;
    restoreScrollYRef.current = null;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "auto" });
    });
  }, [safePage, paginatedRows.length]);

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
        activeKey="bimbingan"
        navItems={guruNav}
        title="Riwayat Chat Bimbingan"
        subtitle="Lihat riwayat bimbingan per siswa. Chat terbaru dan siswa dengan aktivitas terbaru ditampilkan di bagian atas."
        rightSlot={<StartGuruOnbordaButton />}
      >
        <section className="relative overflow-hidden rounded-[1.8rem] border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <div className="relative overflow-hidden border-b border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 px-6 py-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                  <Icon name="message" className="h-3.5 w-3.5" />
                  Riwayat Chat
                </p>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                  Bimbingan per siswa
                </h2>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Pilih siswa untuk membuka detail progress dan menambahkan
                  catatan bimbingan pada tahap roadmap terkait.
                </p>
              </div>

              <div className="grid w-full gap-3 lg:w-auto lg:min-w-[520px] lg:grid-cols-[1fr_190px]">
                <div className="relative">
                  <Icon
                    name="search"
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari siswa, NISN, kelas, jurusan..."
                    className="w-full rounded-2xl border border-sky-100 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                >
                  <option value="semua">Semua status</option>
                  <option value="aktif">Roadmap aktif</option>
                  <option value="belum-pilih">Belum pilih roadmap</option>
                  <option value="kosong">Belum isi/generate</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 md:p-6">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 shadow-sm">
                {error}
              </div>
            )}

            {loading ? (
              <ListSkeleton count={4} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Siswa"
                  value={rows.length}
                  desc="Siswa dalam pantauan BK"
                  icon="users"
                />
                <StatCard
                  title="Ada Catatan"
                  value={stats.adaCatatan}
                  desc="Memiliki chat/catatan terbaru"
                  icon="message"
                />
                <StatCard
                  title="Roadmap Aktif"
                  value={stats.aktif}
                  desc="Siswa sudah memilih roadmap"
                  icon="check"
                />
                <StatCard
                  title="Belum Memilih"
                  value={stats.belumPilih}
                  desc="Sudah ada rekomendasi SPK"
                  icon="roadmap"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-[1.4rem] border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Menampilkan {shownStart} - {shownEnd} dari {filtered.length} siswa
              </span>
              <span>
                Halaman {safePage} dari {totalPages}
              </span>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <ListSkeleton count={5} />
              ) : paginatedRows.length ? (
                paginatedRows.map((item) => (
                  <article
                    key={item.id}
                    className="group rounded-[1.6rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-100 hover:shadow-md"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black tracking-tight text-slate-950">
                            {item.studentName}
                          </h3>

                          <StatusBadge item={item} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                          <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1">
                            NISN: {(item as any).nisn || "-"}
                          </span>
                          <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1">
                            Kelas: {item.className || "-"}
                          </span>
                          <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1">
                            Jurusan: {item.jurusan || "-"}
                          </span>
                          <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1">
                            No HP: {item.phone || "-"}
                          </span>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-700">
                              Catatan Terbaru
                            </p>
                            <p className="text-[11px] font-bold text-slate-400">
                              {formatActivityTime(item)}
                            </p>
                          </div>
                          <p className="line-clamp-2 text-sm font-medium leading-6 text-slate-600">
                            {item.lastNote ||
                              "Belum ada chat bimbingan terbaru. Klik Buka Chat untuk mulai memberi arahan."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:items-end">
                        <Link
                          href={`/guru/siswa/progress-detail?id=${item.studentId}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2450] via-[#0e3a6b] to-sky-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:shadow-xl lg:w-auto"
                        >
                          Buka Chat
                          <Icon name="chevronRight" className="h-4 w-4" />
                        </Link>

                        <p className="text-xs font-semibold text-slate-400">
                          Arahkan catatan ke tahap roadmap siswa.
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState search={search} />
              )}
            </div>

            {!loading && filtered.length > PAGE_SIZE && (
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Data {shownStart} - {shownEnd} dari {filtered.length} siswa
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>

                  <span className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-black text-sky-700">
                    {safePage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => changePage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
