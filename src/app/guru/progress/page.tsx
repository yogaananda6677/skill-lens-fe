"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Icon } from "../../../components/ui/icons";
import { guruNav } from "../../../config/navigation";
import { getGuidanceCases, type GuidanceCase } from "../../../features/guru/api";
import { notifyAppAlert } from "../../../lib/app-alert-events";
import { GuruOnbordaProvider } from "../components/GuruOnbordaProvider";
import { StartGuruOnbordaButton } from "../components/StartGuruOnbordaButton";

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function statusLabel(item: GuidanceCase) {
  if (!item.recommendations?.length) return "-";
  if (!item.hasActiveRoadmap) return "Sudah isi data, belum memilih roadmap";
  return `Progress ${item.progress}%`;
}

function statusTone(item: GuidanceCase) {
  if (!item.recommendations?.length) return "bg-slate-100 text-slate-500 ring-slate-200";
  if (!item.hasActiveRoadmap) return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-sky-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export default function GuruProgressPage() {
  const [cases, setCases] = useState<GuidanceCase[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
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

  const filtered = useMemo(() => {
    const keyword = normalizeText(search);

    return cases.filter((item) => {
      const matchSearch =
        !keyword ||
        normalizeText(item.studentName).includes(keyword) ||
        normalizeText(item.nisn).includes(keyword) ||
        normalizeText(item.className).includes(keyword) ||
        normalizeText(item.jurusan).includes(keyword) ||
        normalizeText(item.phone).includes(keyword);

      const status = !item.recommendations?.length ? "kosong" : !item.hasActiveRoadmap ? "belum-pilih" : "aktif";
      const matchStatus = filterStatus === "semua" || filterStatus === status;

      return matchSearch && matchStatus;
    });
  }, [cases, filterStatus, search]);

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

        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Progress Siswa</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Daftar siswa bimbingan</h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Tampilkan nama, kelas, jurusan, kontak, status rekomendasi, dan progress. Tekan Detail untuk masuk ke halaman khusus progress siswa.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, NISN, kelas, jurusan, no HP..."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              />
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="semua">Semua status</option>
                <option value="kosong">Belum isi/generate</option>
                <option value="belum-pilih">Belum pilih roadmap</option>
                <option value="aktif">Roadmap aktif</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {filtered.length ? filtered.map((item) => (
              <article key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_180px] xl:items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-950">{item.studentName}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-100">NISN: {item.nisn || "-"}</span>
                      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-100">Kelas: {item.className || "-"}</span>
                      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-100">Jurusan: {item.jurusan || "-"}</span>
                      <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-100">No HP: {item.phone || "-"}</span>
                    </div>
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
                  </div>

                  <Link href={`/guru/siswa/${item.studentId}/progress`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700">
                    Lihat Detail
                    <Icon name="chevronRight" className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            )) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm font-semibold text-slate-400">
                {loading ? "Memuat progress siswa..." : "Tidak ada siswa sesuai filter."}
              </div>
            )}
          </div>
        </section>
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
