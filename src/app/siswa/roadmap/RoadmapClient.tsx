"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StudentTopNav } from "../../../components/layout/StudentTopNav";
import { Icon } from "../../../components/ui/icons";
import { getActiveStudentRoadmap, updateStudentRoadmapProgress } from "../../../features/siswa/api";
import type { CareerRoadmap, RoadmapDetail } from "../../../features/siswa/types";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-gradient-to-r from-[#0f2a5f] to-cyan-300" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6 ${className}`}>{children}</section>;
}

function DetailStatusBadge({ status }: { status: string }) {
  const done = status === "selesai";
  const process = status === "proses";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${done ? "bg-emerald-50 text-emerald-700" : process ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{done ? "Selesai" : process ? "Proses" : "Belum"}</span>;
}

function EmptyRoadmapState() {
  return (
    <Panel>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f2a5f]">Belum ada roadmap aktif</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Generate roadmap dari hasil SPK</h2>
      <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">Roadmap tidak dipilih bebas dari daftar umum. Pilih rekomendasi SPK terlebih dahulu, lalu tekan Generate Roadmap agar roadmap yang dibuat sesuai dengan alternatif terbaikmu.</p>
      <Link href="/siswa/rekomendasi" className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700">Ke halaman rekomendasi</Link>
    </Panel>
  );
}

export default function RoadmapClient() {
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [activeDetailId, setActiveDetailId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const active = await getActiveStudentRoadmap().catch(() => null);
      setRoadmap(active);
      const firstDetail = active?.steps.flatMap((step) => step.details)[0];
      setActiveDetailId(firstDetail?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat roadmap.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const details = useMemo(() => roadmap?.steps.flatMap((step) => step.details) ?? [], [roadmap]);
  const completed = details.filter((detail) => detail.status === "selesai").length;
  const progress = details.length ? Math.round((completed / details.length) * 100) : roadmap?.progress ?? 0;
  const activeDetail = details.find((detail) => detail.id === activeDetailId) ?? details[0];

  async function handleUpdateStatus(detail: RoadmapDetail, status: "belum" | "proses" | "selesai") {
    const targetId = detail.progressId ?? detail.id;
    if (!targetId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateStudentRoadmapProgress(targetId, status);
      setMessage("Progress roadmap berhasil diperbarui.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui progress.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudentTopNav>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-950/15 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Roadmap Pengembangan Diri</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Progress belajar pribadi</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-300">Roadmap diambil dari master backend. Progress siswa disimpan pribadi sehingga tidak mengubah data publik.</p>
          </div>
          <Link href="/siswa#hasil" className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-slate-950">Kembali ke hasil</Link>
        </div>
      {(message || error) && <div className={`mb-5 rounded-2xl p-4 text-sm font-medium ${error ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>{error || message}</div>}
      {loading && <div className="rounded-2xl bg-white p-4 text-sm font-medium text-slate-500 shadow-sm">Memuat roadmap...</div>}

      {!loading && !roadmap && <EmptyRoadmapState />}

      {!loading && roadmap && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Progress", `${progress}%`, "Detail yang sudah selesai.", "check"],
              ["Tahap", `${roadmap.steps.length}`, "Jumlah step utama roadmap.", "roadmap"],
              ["Detail", `${details.length}`, "Materi/checklist dari backend.", "clipboard"],
              ["Selesai", `${completed}`, "Detail yang sudah ditandai.", "clock"],
            ].map(([label, value, detail, icon]) => (
              <article key={label} className="rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><Icon name={icon as never} className="h-5 w-5" /></div>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-6">
              <Panel className="bg-slate-950 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Roadmap aktif</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">{roadmap.headline}</h2>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">Target: {roadmap.targetRole}</p>
                <div className="mt-6"><ProgressBar value={progress} /></div>
                <p className="mt-2 text-xs font-semibold text-slate-300">{completed} dari {details.length} detail selesai</p>
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f2a5f]">Timeline roadmap</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Step dan detail belajar</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">Progress {progress}%</span>
                </div>
                <div className="mt-6 space-y-5">
                  {roadmap.steps.map((step, index) => (
                    <div key={step.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tahap {index + 1}</p>
                      <h3 className="mt-1 font-semibold text-slate-950">{step.title}</h3>
                      {step.description && <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{step.description}</p>}
                      <div className="mt-4 space-y-2">
                        {step.details.map((detail) => (
                          <button key={detail.id} type="button" onClick={() => setActiveDetailId(detail.id)} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${activeDetail?.id === detail.id ? "border-blue-200 bg-white shadow-sm" : "border-transparent bg-white/60 hover:bg-white"}`}>
                            <span className="text-sm font-semibold text-slate-700">{detail.title}</span>
                            <DetailStatusBadge status={detail.status} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {activeDetail && (
                <Panel>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0f2a5f]">Detail aktif</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{activeDetail.title}</h2>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{activeDetail.description || "Tidak ada deskripsi tambahan."}</p>
                  {activeDetail.referenceLink && <a href={activeDetail.referenceLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">Buka referensi</a>}

                  {!!activeDetail.notes?.length && (
                    <div className="mt-5 rounded-2xl bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">Catatan guru</p>
                      <div className="mt-3 space-y-2">
                        {activeDetail.notes.map((note) => <p key={note.id} className="text-sm font-medium leading-6 text-amber-800">• {note.note}</p>)}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <button type="button" disabled={saving} onClick={() => handleUpdateStatus(activeDetail, "belum")} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Belum</button>
                    <button type="button" disabled={saving} onClick={() => handleUpdateStatus(activeDetail, "proses")} className="rounded-full bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50">Proses</button>
                    <button type="button" disabled={saving} onClick={() => handleUpdateStatus(activeDetail, "selesai")} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f2a5f] disabled:opacity-50">Selesai</button>
                  </div>
                </Panel>
              )}
            </div>
          </div>
        </>
      )}
      </section>
    </StudentTopNav>
  );
}
