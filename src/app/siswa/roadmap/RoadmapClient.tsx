"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StudentTopNav } from "../../../components/layout/StudentTopNav";
import { Icon } from "../../../components/ui/icons";
import { useAppAlert } from "../../../components/ui/AppAlertProvider";
import { getActiveStudentRoadmap, updateStudentRoadmapProgress } from "../../../features/siswa/api";
import type { CareerRoadmap, RoadmapDetail } from "../../../features/siswa/types";

type RoadmapStatus = "belum" | "proses" | "selesai";

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function ProgressBar({ value, compact = false }: { value: number; compact?: boolean }) {
  const safeValue = clampProgress(value);
  return (
    <div className={`${compact ? "h-2" : "h-3"} overflow-hidden rounded-full bg-sky-100 ring-1 ring-sky-100`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#0a54c7] to-[#38bdf8] transition-[width] duration-300 ease-out"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[1.7rem] p-5 sm:p-6 skilllens-smooth-card ${className}`}>
      {children}
    </section>
  );
}

function statusMeta(status: string) {
  if (status === "selesai") {
    return {
      label: "Selesai",
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      iconBox: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      icon: "check",
    };
  }

  if (status === "proses") {
    return {
      label: "Proses",
      dot: "bg-sky-500",
      badge: "bg-sky-50 text-sky-700 ring-sky-100",
      iconBox: "bg-sky-50 text-sky-700 ring-sky-100",
      icon: "progress",
    };
  }

  return {
    label: "Belum",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    iconBox: "bg-slate-100 text-slate-500 ring-slate-200",
    icon: "clipboard",
  };
}

function DetailStatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function StatusButton({
  label,
  active,
  saving,
  onClick,
}: {
  label: string;
  active: boolean;
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={saving}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-55 ${
        active
          ? "bg-[#0a54c7] text-white shadow-sm shadow-sky-700/20"
          : "border border-sky-100 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
      }`}
    >
      {label}
    </button>
  );
}

function LoadingRoadmapState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
      <Panel>
        <div className="h-5 w-36 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-5 h-9 w-4/5 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-8 h-3 w-full animate-pulse rounded-full bg-slate-100" />
      </Panel>
      <Panel>
        <div className="h-5 w-44 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-5 grid gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function EmptyRoadmapState() {
  return (
    <Panel className="text-center">
      <div className="relative mx-auto max-w-xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[#07142f] text-white shadow-sm">
          <Icon name="roadmap" className="h-8 w-8" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Belum ada roadmap aktif</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
          Buat roadmap dari hasil rekomendasi SPK
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Pilih hasil rekomendasi terbaik terlebih dahulu, lalu sistem akan membuat alur belajar yang sesuai dengan profilmu.
        </p>
        <Link
          href="/siswa/rekomendasi"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white skilllens-button-primary"
        >
          Ke halaman rekomendasi
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      </div>
    </Panel>
  );
}

function getNextDetail(details: RoadmapDetail[]) {
  return details.find((detail) => detail.status !== "selesai") ?? details[0] ?? null;
}

function patchRoadmapDetailStatus(
  roadmap: CareerRoadmap | null,
  detailId: number,
  status: RoadmapStatus,
): CareerRoadmap | null {
  if (!roadmap) return roadmap;

  return {
    ...roadmap,
    steps: roadmap.steps.map((step) => ({
      ...step,
      details: step.details.map((detail) =>
        detail.id === detailId
          ? {
              ...detail,
              status,
              completedAt: status === "selesai" ? new Date().toISOString() : null,
            }
          : detail,
      ),
    })),
  };
}

export default function RoadmapClient() {
  const { showSuccess, showError, showProcessing, dismissAlert } = useAppAlert();
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [activeDetailId, setActiveDetailId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDetailId, setSavingDetailId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const active = await getActiveStudentRoadmap().catch(() => null);
      setRoadmap(active);
      const allDetails = active?.steps.flatMap((step) => step.details) ?? [];
      const recommendedDetail = getNextDetail(allDetails);
      setActiveDetailId(recommendedDetail?.id ?? null);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Gagal memuat roadmap.";
      setError(errMessage);
      showError("Gagal memuat roadmap", errMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const details = useMemo(() => roadmap?.steps.flatMap((step) => step.details) ?? [], [roadmap]);
  const completed = details.filter((detail) => detail.status === "selesai").length;
  const inProgress = details.filter((detail) => detail.status === "proses").length;
  const progress = details.length ? Math.round((completed / details.length) * 100) : roadmap?.progress ?? 0;
  const activeDetail = details.find((detail) => detail.id === activeDetailId) ?? getNextDetail(details);
  const nextDetail = getNextDetail(details);

  async function handleUpdateStatus(detail: RoadmapDetail, status: RoadmapStatus) {
    const targetId = detail.progressId ?? detail.id;
    if (!targetId) return;
    if (detail.status === status) return;

    const previousRoadmap = roadmap;
    setActiveDetailId(detail.id);
    setSavingDetailId(detail.id);
    setError("");
    showProcessing("Menyimpan progress", `${detail.title} sedang diperbarui menjadi ${status}.`);
    setRoadmap((current) => patchRoadmapDetailStatus(current, detail.id, status));

    try {
      await updateStudentRoadmapProgress(targetId, status);
      dismissAlert();
      showSuccess(
        status === "selesai" ? "Detail ditandai selesai" : "Progress berhasil diperbarui",
        status === "selesai" ? "Langkah ini sudah masuk ke progress roadmap kamu." : "Perubahan status roadmap sudah tersimpan.",
      );
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Gagal memperbarui progress.";
      setRoadmap(previousRoadmap);
      setError(errMessage);
      dismissAlert();
      showError("Gagal menyimpan progress", errMessage);
    } finally {
      setSavingDetailId(null);
    }
  }

  return (
    <StudentTopNav>
      <main className="min-h-screen skilllens-blue-page">
        <section className="mx-auto max-w-7xl px-5 py-8 skilllens-page-enter">
          <div className="relative mb-6 overflow-hidden rounded-[1.8rem] border border-white/10 skilllens-hero-grid p-6 text-white shadow-lg shadow-blue-950/10 md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.055)_1px,transparent_1px)] bg-[size:52px_52px]" />

            <div className="relative grid gap-6 lg:grid-cols-[1fr_330px] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-cyan-100 ring-1 ring-white/[0.15]">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                  Roadmap aktif siswa
                </span>
                <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
                  Ikuti roadmap belajar dengan alur yang jelas
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-100/80">
                  Fokus ke satu langkah terdekat, tandai statusnya, lalu lanjut ke tahap berikutnya tanpa halaman terasa refresh.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Progress keseluruhan</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-5xl font-bold">{progress}%</p>
                  <Icon name="target" className="h-10 w-10 text-cyan-200" />
                </div>
                <div className="mt-5"><ProgressBar value={progress} /></div>
                <p className="mt-3 text-xs text-sky-100/75">
                  {completed} dari {details.length} detail selesai
                </p>
              </div>
            </div>
          </div>

          {error && !loading && !roadmap && (
            <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
              {error}
            </div>
          )}

          {loading && <LoadingRoadmapState />}
          {!loading && !roadmap && <EmptyRoadmapState />}

          {!loading && roadmap && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Progress", `${progress}%`, "Capaian roadmap saat ini.", "progress"],
                  ["Tahap", `${roadmap.steps.length}`, "Alur utama yang diikuti.", "roadmap"],
                  ["Proses", `${inProgress}`, "Detail yang sedang dikerjakan.", "clock"],
                  ["Selesai", `${completed}`, "Detail yang sudah ditandai.", "check"],
                ].map(([label, value, detail, icon]) => (
                  <article key={label} className="rounded-[1.4rem] border border-sky-100/80 bg-white/90 p-5 shadow-sm shadow-sky-950/5 transition hover:border-sky-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
                      </div>
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                        <Icon name={icon as never} className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
                  </article>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
                  <Panel className="bg-[#07142f] text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Jalur kamu</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight">{roadmap.headline}</h2>
                    <p className="mt-3 text-sm leading-7 text-sky-100/80">Target: {roadmap.targetRole}</p>
                    <div className="mt-6"><ProgressBar value={progress} /></div>
                    <p className="mt-3 text-xs text-sky-100/75">Fokus ke tugas berikutnya agar progress naik lebih cepat.</p>
                  </Panel>

                  {nextDetail && (
                    <Panel>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Lanjutkan sekarang</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{nextDetail.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {nextDetail.description || "Kerjakan detail ini, lalu tandai proses atau selesai."}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <button type="button" disabled={savingDetailId === nextDetail.id} onClick={() => handleUpdateStatus(nextDetail, "proses")} className="rounded-full bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100 disabled:opacity-50">
                          Mulai proses
                        </button>
                        <button type="button" disabled={savingDetailId === nextDetail.id} onClick={() => handleUpdateStatus(nextDetail, "selesai")} className="rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-50 skilllens-button-primary">
                          Tandai selesai
                        </button>
                      </div>
                    </Panel>
                  )}

                  {activeDetail && (
                    <Panel>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Detail terpilih</p>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">{activeDetail.title}</h2>
                        <DetailStatusBadge status={activeDetail.status} />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{activeDetail.description || "Tidak ada deskripsi tambahan."}</p>

                      {activeDetail.referenceLink && (
                        <a href={activeDetail.referenceLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100">
                          <Icon name="book" className="h-4 w-4" />
                          Buka referensi
                        </a>
                      )}

                      {!!activeDetail.notes?.length && (
                        <div className="mt-5 rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100">
                          <p className="text-sm font-bold text-sky-900">Catatan guru</p>
                          <div className="mt-3 space-y-2">
                            {activeDetail.notes.map((note) => (
                              <p key={note.id} className="text-sm leading-6 text-sky-800">• {note.note}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <StatusButton label="Belum" active={activeDetail.status === "belum"} saving={savingDetailId === activeDetail.id} onClick={() => handleUpdateStatus(activeDetail, "belum")} />
                        <StatusButton label="Proses" active={activeDetail.status === "proses"} saving={savingDetailId === activeDetail.id} onClick={() => handleUpdateStatus(activeDetail, "proses")} />
                        <StatusButton label="Selesai" active={activeDetail.status === "selesai"} saving={savingDetailId === activeDetail.id} onClick={() => handleUpdateStatus(activeDetail, "selesai")} />
                      </div>
                    </Panel>
                  )}
                </div>

                <Panel className="overflow-hidden">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Timeline roadmap</p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Checklist belajar bertahap</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Detail yang sedang dipilih diberi warna agar posisinya jelas. Status bisa diubah tanpa reload tampilan.
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">Progress {progress}%</span>
                  </div>

                  <div className="mt-7 space-y-6">
                    {roadmap.steps.map((step, index) => {
                      const stepDone = step.details.filter((detail) => detail.status === "selesai").length;
                      const stepProgress = step.details.length ? Math.round((stepDone / step.details.length) * 100) : 0;
                      const stepHasActive = step.details.some((detail) => detail.id === activeDetail?.id);

                      return (
                        <div key={step.id} className="relative pl-5">
                          <div className="absolute bottom-0 left-[15px] top-10 w-px bg-sky-100" />
                          <div className={`absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white shadow-sm ${stepHasActive ? "bg-[#0a54c7]" : "bg-[#07142f]"}`}>
                            {index + 1}
                          </div>

                          <div className={`rounded-[1.45rem] border p-4 md:p-5 ${stepHasActive ? "border-sky-200 bg-sky-50/50" : "border-sky-100/80 bg-white/80"}`}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Tahap {index + 1}</p>
                                <h3 className="mt-1 text-lg font-bold text-slate-950">{step.title}</h3>
                                {step.description && <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>}
                              </div>
                              <div className="min-w-28 rounded-2xl bg-white p-3 text-right ring-1 ring-sky-100">
                                <p className="text-lg font-bold text-slate-950">{stepProgress}%</p>
                                <p className="text-[11px] font-bold text-slate-400">tahap selesai</p>
                              </div>
                            </div>

                            <div className="mt-4"><ProgressBar value={stepProgress} compact /></div>

                            <div className="mt-4 grid gap-3">
                              {step.details.map((detail) => {
                                const active = activeDetail?.id === detail.id;
                                const meta = statusMeta(detail.status);
                                const itemSaving = savingDetailId === detail.id;

                                return (
                                  <article key={detail.id} className={`relative rounded-2xl border p-4 transition ${active ? "skilllens-selected-roadmap" : "border-slate-100 bg-white/[0.92] hover:border-sky-200 hover:bg-white"}`}>
                                    <button type="button" onClick={() => setActiveDetailId(detail.id)} className="flex w-full items-start justify-between gap-3 text-left">
                                      <div className="flex min-w-0 gap-3">
                                        <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ring-1 ${meta.iconBox}`}>
                                          <Icon name={meta.icon} className="h-4 w-4" />
                                        </span>
                                        <div>
                                          <h4 className="text-sm font-bold text-slate-800">{detail.title}</h4>
                                          {detail.description ? <p className="mt-1 text-xs leading-5 text-slate-500">{detail.description}</p> : null}
                                          {itemSaving ? <p className="mt-2 text-xs font-semibold text-sky-700">Menyimpan perubahan...</p> : null}
                                        </div>
                                      </div>
                                      <DetailStatusBadge status={detail.status} />
                                    </button>

                                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                                      <StatusButton label="Belum" active={detail.status === "belum"} saving={itemSaving} onClick={() => handleUpdateStatus(detail, "belum")} />
                                      <StatusButton label="Proses" active={detail.status === "proses"} saving={itemSaving} onClick={() => handleUpdateStatus(detail, "proses")} />
                                      <StatusButton label="Selesai" active={detail.status === "selesai"} saving={itemSaving} onClick={() => handleUpdateStatus(detail, "selesai")} />
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>
            </>
          )}
        </section>
      </main>
    </StudentTopNav>
  );
}
