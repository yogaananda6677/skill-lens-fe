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

function activityLabel(item: GuidanceCase) {
  if (item.hasActiveRoadmap) return `Progress roadmap ${item.progress || 0}%`;
  if (item.recommendations?.length) return "Sudah mendapat rekomendasi, belum memilih roadmap";
  return "Belum mengisi data rekomendasi";
}

function tone(item: GuidanceCase) {
  if (item.hasActiveRoadmap) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (item.recommendations?.length) return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function GuruRiwayatChatPage() {
  const [rows, setRows] = useState<GuidanceCase[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getGuidanceCases()
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Gagal memuat riwayat chat bimbingan.";
        if (active) setError(message);
        notifyAppAlert({ type: "error", title: "Gagal memuat riwayat", description: message, autoCloseMs: false });
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
    const sorted = [...rows].sort((a, b) => {
      const timeA = a.latestNoteAt ? new Date(a.latestNoteAt).getTime() : 0;
      const timeB = b.latestNoteAt ? new Date(b.latestNoteAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return Number(b.progress || 0) - Number(a.progress || 0);
    });
    if (!keyword) return sorted;
    return sorted.filter((item) =>
      normalizeText(item.studentName).includes(keyword) ||
      normalizeText((item as any).nisn).includes(keyword) ||
      normalizeText(item.className).includes(keyword) ||
      normalizeText(item.jurusan).includes(keyword),
    );
  }, [rows, search]);

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
        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">Riwayat Chat</p>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Bimbingan per siswa</h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Pilih siswa untuk membuka detail progress dan menambahkan chat/catatan bimbingan pada tahap roadmap terkait.
              </p>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari siswa, NISN, kelas, jurusan..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50 lg:w-80"
            />
          </div>

          {error && <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</div>}

          <div className="mt-6 grid gap-4">
            {loading ? (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-10 text-center text-sm font-bold text-slate-500">Memuat riwayat chat...</div>
            ) : filtered.length ? (
              filtered.map((item) => (
                <article key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:border-sky-200 hover:bg-sky-50/50">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-950">{item.studentName}</h3>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 ${tone(item)}`}>{activityLabel(item)}</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {(item as any).nisn || "-"} • {item.className || "-"} • {item.jurusan || "-"} • {item.phone || "No HP belum tersedia"}
                      </p>
                      <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-medium leading-6 text-slate-600 ring-1 ring-slate-100">
                        {item.lastNote || "Belum ada chat bimbingan terbaru. Klik Buka Chat untuk mulai memberi arahan."}
                      </p>
                    </div>
                    <Link href={`/guru/siswa/${item.studentId}/progress`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-sky-700">
                      Buka Chat
                      <Icon name="chevronRight" className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm font-semibold text-slate-400">Belum ada riwayat chat bimbingan.</div>
            )}
          </div>
        </section>
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
