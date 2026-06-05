"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useAppAlert } from "../../../components/ui/AppAlertProvider";
import { Icon } from "../../../components/ui/icons";
import {
  getActiveStudentRoadmap,
  getStudentRoadmapHistory,
  updateStudentRoadmapProgress,
} from "../../../features/siswa/api";
import type {
  CareerRoadmap,
  RoadmapDetail,
  RoadmapNote,
  StudentRoadmapHistoryItem,
} from "../../../features/siswa/types";

type RoadmapStatus = "belum" | "proses" | "selesai";

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function ProgressBar({
  value,
  compact = false,
}: {
  value: number;
  compact?: boolean;
}) {
  const safeValue = clampProgress(value);

  return (
    <div
      className={`${
        compact ? "h-2" : "h-3"
      } overflow-hidden rounded-full bg-sky-100 ring-1 ring-sky-100`}
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#0a54c7_0%,#1d9bf0_55%,#39d9ff_100%)] transition-[width] duration-300 ease-out"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}


function BlueProgressBar({ value }: { value: number }) {
  const safeValue = clampProgress(value);

  return (
    <div className="h-3 overflow-hidden rounded-full bg-white/18 ring-1 ring-white/20">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#ffffff_0%,#7dd3fc_48%,#39d9ff_100%)] shadow-[0_0_18px_rgba(57,217,255,0.45)] transition-[width] duration-300 ease-out"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function BluePanel({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[1.7rem] border border-cyan-300/35 bg-[linear-gradient(135deg,#07142f_0%,#0a2f73_48%,#0a54c7_100%)] p-5 text-white shadow-xl shadow-sky-900/25 ring-1 ring-cyan-200/20 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.10)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-blue-500/35 blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[1.7rem] border border-sky-200/80 bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_100%)] p-5 shadow-lg shadow-sky-950/7 ring-1 ring-sky-50 sm:p-6 ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-sky-200/20 blur-3xl" />

      <div className="relative">{children}</div>
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
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.badge}`}
    >
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
        <div className="h-5 w-36 animate-pulse rounded-full bg-sky-100" />
        <div className="mt-5 h-9 w-4/5 animate-pulse rounded-2xl bg-sky-100" />
        <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-sky-100" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-sky-100" />
        <div className="mt-8 h-3 w-full animate-pulse rounded-full bg-sky-100" />
      </Panel>

      <Panel>
        <div className="h-5 w-44 animate-pulse rounded-full bg-sky-100" />
        <div className="mt-5 grid gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-3xl bg-sky-100"
            />
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
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] text-white shadow-lg shadow-sky-700/20">
          <Icon name="roadmap" className="h-8 w-8" />
        </div>

        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.22em] text-sky-600">
          Belum ada roadmap aktif
        </p>

        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
          Buat roadmap dari hasil rekomendasi SPK
        </h2>

        <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">
          Pilih hasil rekomendasi terbaik terlebih dahulu, lalu sistem akan
          membuat alur belajar yang sesuai dengan profilmu.
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
  return (
    details.find((detail) => detail.status !== "selesai") ??
    details[0] ??
    null
  );
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
              completedAt:
                status === "selesai" ? new Date().toISOString() : null,
            }
          : detail,
      ),
    })),
  };
}

function formatNoteDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatHistoryDate(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function roadmapHistoryStatusMeta(status: string) {
  if (status === "aktif") {
    return {
      label: "Aktif",
      badge: "bg-cyan-100 text-cyan-800 ring-cyan-200",
      dot: "bg-cyan-500",
    };
  }

  if (status === "selesai") {
    return {
      label: "Selesai",
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      dot: "bg-emerald-500",
    };
  }

  return {
    label: "Riwayat",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  };
}

function getHelpfulReferenceUrl(roadmap: CareerRoadmap | null, detail: RoadmapDetail | null) {
  const rawUrl = detail?.referenceLink?.trim();

  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  const query = [
    detail?.title,
    roadmap?.targetRole || roadmap?.headline,
    "panduan belajar",
    "contoh langkah",
  ]
    .filter(Boolean)
    .join(" ");

  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function RoadmapHistoryPanel({
  items,
  loading,
}: {
  items: StudentRoadmapHistoryItem[];
  loading: boolean;
}) {
  return (
    <Panel className="border-sky-200 bg-[linear-gradient(180deg,#ffffff_0%,#f1f9ff_100%)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
            History generate
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
            Riwayat roadmap siswa
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Ini adalah catatan roadmap yang pernah dibuat siswa.
          </p>
        </div>

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
          <Icon name="clock" className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-3xl bg-sky-100/80" />
          ))}
        </div>
      ) : items.length ? (
        <div className="mt-5 space-y-3">
          {items.map((item, index) => {
            const meta = roadmapHistoryStatusMeta(item.status);
            const dateLabel = formatHistoryDate(item.startedAt ?? item.createdAt);

            return (
              <article
                key={item.id}
                aria-label={`History roadmap ${item.title}`}
                className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white/85 p-4 shadow-sm shadow-sky-950/5 ring-1 ring-white/70"
              >
                <div className="pointer-events-none absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#0a54c7] to-[#39d9ff]" />

                <div className="flex items-start gap-3 pl-2">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe_0%,#bae6fd_100%)] text-[#0a54c7] ring-1 ring-sky-100">
                    <span className="text-sm font-extrabold">{index + 1}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 ${meta.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>

                    </div>

                    <h3 className="mt-2 truncate text-base font-extrabold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.targetRole || item.category || "Target belum tersedia"} • {dateLabel}
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <ProgressBar value={item.progress} compact />
                      </div>

                      <span className="text-xs font-extrabold text-sky-700">
                        {item.progress}% selesai
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      {item.completedDetail}/{item.totalDetail} detail selesai
                      {item.inProgressDetail ? ` • ${item.inProgressDetail} proses` : ""}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-dashed border-sky-200 bg-sky-50/70 p-5 text-sm font-semibold leading-6 text-sky-700">
          Belum ada history generate roadmap. Setelah siswa membuat roadmap dari
          halaman rekomendasi, riwayatnya akan muncul di sini.
        </div>
      )}
    </Panel>
  );
}

function GuidanceNotesCard({ notes }: { notes: RoadmapNote[] }) {
  return (
    <div className="mt-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 p-4 ring-1 ring-sky-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-sky-950">
            Catatan Guru BK
          </p>

          <p className="mt-1 text-xs font-semibold text-sky-700/75">
            Arahan bimbingan yang bisa kamu ikuti pada tahap ini.
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100">
          {notes.length} catatan
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {notes.map((note, index) => {
          const noteDate = formatNoteDate(note.createdAt);

          return (
            <article
              key={note.id || index}
              className="rounded-2xl bg-white/85 p-4 text-sm shadow-sm ring-1 ring-sky-100/80"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-extrabold text-slate-900">
                  {note.title || "Catatan bimbingan"}
                </p>

                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-500">
                  {note.guruName || "Guru BK"}
                  {noteDate ? ` • ${noteDate}` : ""}
                </p>
              </div>

              <p className="mt-2 leading-6 text-slate-600">{note.note}</p>

              {note.followUp ? (
                <div className="mt-3 rounded-xl bg-sky-50 p-3 text-xs font-semibold leading-5 text-sky-800 ring-1 ring-sky-100">
                  <span className="font-extrabold">Tindak lanjut:</span>{" "}
                  {note.followUp}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function RoadmapClient() {
  const { showSuccess, showError, showProcessing, dismissAlert } =
    useAppAlert();

  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [history, setHistory] = useState<StudentRoadmapHistoryItem[]>([]);
  const [activeDetailId, setActiveDetailId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [savingDetailId, setSavingDetailId] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setLoadingHistory(true);
    setError("");

    try {
      const [activeResult, historyResult] = await Promise.allSettled([
        getActiveStudentRoadmap(),
        getStudentRoadmapHistory(),
      ]);

      if (activeResult.status === "fulfilled") {
        const active = activeResult.value;
        setRoadmap(active);

        const allDetails = active?.steps.flatMap((step) => step.details) ?? [];
        const recommendedDetail = getNextDetail(allDetails);

        setActiveDetailId(recommendedDetail?.id ?? null);
      } else {
        setRoadmap(null);
      }

      if (historyResult.status === "fulfilled") {
        setHistory(historyResult.value);
      } else {
        setHistory([]);
      }
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : "Gagal memuat roadmap.";

      setError(errMessage);
      showError("Gagal memuat roadmap", errMessage);
    } finally {
      setLoading(false);
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const details = useMemo(
    () => roadmap?.steps.flatMap((step) => step.details) ?? [],
    [roadmap],
  );

  const completed = details.filter((detail) => detail.status === "selesai")
    .length;
  const inProgress = details.filter((detail) => detail.status === "proses")
    .length;
  const progress = details.length
    ? Math.round((completed / details.length) * 100)
    : roadmap?.progress ?? 0;

  const activeDetail =
    details.find((detail) => detail.id === activeDetailId) ??
    getNextDetail(details);

  const activeStep =
    roadmap?.steps.find((step) =>
      step.details.some((detail) => detail.id === activeDetail?.id),
    ) ?? null;

  const activeGuidanceNotes = [
    ...(activeStep?.notes ?? []),
    ...(activeDetail?.notes ?? []),
  ].filter((note) => note.note?.trim());

  const nextDetail = getNextDetail(details);

  async function handleUpdateStatus(
    detail: RoadmapDetail,
    status: RoadmapStatus,
  ) {
    const targetId = detail.progressId ?? detail.id;

    if (!targetId) return;
    if (detail.status === status) return;

    const previousRoadmap = roadmap;

    setActiveDetailId(detail.id);
    setSavingDetailId(detail.id);
    setError("");

    showProcessing(
      "Menyimpan progress",
      `${detail.title} sedang diperbarui menjadi ${status}.`,
    );

    setRoadmap((current) => patchRoadmapDetailStatus(current, detail.id, status));

    try {
      await updateStudentRoadmapProgress(targetId, status);

      dismissAlert();
      showSuccess(
        status === "selesai"
          ? "Detail ditandai selesai"
          : "Progress berhasil diperbarui",
        status === "selesai"
          ? "Langkah ini sudah masuk ke progress roadmap kamu."
          : "Perubahan status roadmap sudah tersimpan.",
      );
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : "Gagal memperbarui progress.";

      setRoadmap(previousRoadmap);
      setError(errMessage);
      dismissAlert();
      showError("Gagal menyimpan progress", errMessage);
    } finally {
      setSavingDetailId(null);
    }
  }

  return (
    <main className="min-h-screen skilllens-blue-page">
      <section className="mx-auto max-w-7xl px-5 py-8 skilllens-page-enter">
        <section className="scroll-mt-32 overflow-hidden rounded-[2rem] border border-white/10 skilllens-hero-grid text-white shadow-2xl shadow-blue-950/20">
          <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/[0.35] blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute -bottom-24 left-16 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute right-1/3 top-10 h-24 w-24 rounded-full bg-cyan-200/30 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-cyan-100 ring-1 ring-white/15">
                  <Icon name="roadmap" className="h-4 w-4" />
                </div>

                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100">
                  Roadmap Aktif Siswa
                </p>
              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Ikuti roadmap belajar dengan alur yang jelas
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-sky-100/80">
                Fokus ke satu langkah terdekat, tandai statusnya, lalu lanjut
                ke tahap berikutnya tanpa halaman terasa refresh.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/siswa/rekomendasi"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white skilllens-button-primary"
                >
                  Ke rekomendasi
                  <Icon name="chevronRight" className="h-4 w-4" />
                </Link>

                <Link
                  href="/siswa"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md skilllens-smooth hover:-translate-y-0.5 hover:bg-white hover:text-[#07142f]"
                >
                  <Icon name="home" className="h-4 w-4" />
                  Beranda
                </Link>
              </div>
            </div>
          </div>
        </section>

        {error && !loading && !roadmap && (
          <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
            {error}
          </div>
        )}

        <div className="mt-6">
          {loading && <LoadingRoadmapState />}
          {!loading && !roadmap && (
            <div className="space-y-6">
              <EmptyRoadmapState />
              <RoadmapHistoryPanel items={history} loading={loadingHistory} />
            </div>
          )}

          {!loading && roadmap && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  [
                    "Progress",
                    `${progress}%`,
                    "Capaian roadmap saat ini.",
                    "progress",
                  ],
                  [
                    "Tahap",
                    `${roadmap.steps.length}`,
                    "Alur utama yang diikuti.",
                    "roadmap",
                  ],
                  [
                    "Proses",
                    `${inProgress}`,
                    "Detail yang sedang dikerjakan.",
                    "clock",
                  ],
                  [
                    "Selesai",
                    `${completed}`,
                    "Detail yang sudah ditandai.",
                    "check",
                  ],
                ].map(([label, value, detail, icon]) => (
                  <article
                    key={label}
                    className="group relative overflow-hidden rounded-[1.4rem] border border-sky-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#eff9ff_100%)] p-5 shadow-md shadow-sky-950/5 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg hover:shadow-sky-950/10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)]" />
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-200/35 blur-2xl transition group-hover:bg-cyan-300/40" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          {label}
                        </p>

                        <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
                          {value}
                        </p>
                      </div>

                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe_0%,#bae6fd_100%)] text-[#0a54c7] ring-1 ring-sky-200 shadow-sm">
                        <Icon name={icon as never} className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                      {detail}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-6 xl:sticky xl:top-28 xl:self-start">
                  <BluePanel>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-100">
                      Jalur kamu
                    </p>

                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
                      {roadmap.headline}
                    </h2>

                    <p className="mt-3 text-sm font-semibold leading-7 text-sky-100/80">
                      Target: {roadmap.targetRole}
                    </p>

                    <div className="mt-6">
                      <BlueProgressBar value={progress} />
                    </div>

                    <p className="mt-3 text-xs font-semibold text-sky-100/75">
                      Fokus ke tugas berikutnya agar progress naik lebih cepat.
                    </p>
                  </BluePanel>

                  <RoadmapHistoryPanel items={history} loading={loadingHistory} />

                  {nextDetail && (
                    <Panel className="border-sky-200 bg-[linear-gradient(180deg,#eff9ff_0%,#ffffff_100%)]">
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
                        Lanjutkan sekarang
                      </p>

                      <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950">
                        {nextDetail.title}
                      </h3>

                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                        {nextDetail.description ||
                          "Kerjakan detail ini, lalu tandai proses atau selesai."}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingDetailId === nextDetail.id}
                          onClick={() =>
                            handleUpdateStatus(nextDetail, "proses")
                          }
                          className="rounded-full bg-white px-4 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50 disabled:opacity-50"
                        >
                          Mulai proses
                        </button>

                        <button
                          type="button"
                          disabled={savingDetailId === nextDetail.id}
                          onClick={() =>
                            handleUpdateStatus(nextDetail, "selesai")
                          }
                          className="rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-50 skilllens-button-primary"
                        >
                          Tandai selesai
                        </button>
                      </div>
                    </Panel>
                  )}

                  {activeDetail && (
                    <Panel>
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
                        Detail terpilih
                      </p>

                      <div className="mt-2 flex items-start justify-between gap-3">
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
                          {activeDetail.title}
                        </h2>

                        <DetailStatusBadge status={activeDetail.status} />
                      </div>

                      <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
                        {activeDetail.description ||
                          "Tidak ada deskripsi tambahan."}
                      </p>

                      <a
                        href={getHelpfulReferenceUrl(roadmap, activeDetail)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
                      >
                        <Icon name="book" className="h-4 w-4" />
                        Cari referensi belajar
                      </a>

                      {activeGuidanceNotes.length ? (
                        <GuidanceNotesCard notes={activeGuidanceNotes} />
                      ) : (
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">
                          Belum ada catatan dari Guru BK untuk tahap ini.
                        </div>
                      )}

                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <StatusButton
                          label="Belum"
                          active={activeDetail.status === "belum"}
                          saving={savingDetailId === activeDetail.id}
                          onClick={() => handleUpdateStatus(activeDetail, "belum")}
                        />

                        <StatusButton
                          label="Proses"
                          active={activeDetail.status === "proses"}
                          saving={savingDetailId === activeDetail.id}
                          onClick={() =>
                            handleUpdateStatus(activeDetail, "proses")
                          }
                        />

                        <StatusButton
                          label="Selesai"
                          active={activeDetail.status === "selesai"}
                          saving={savingDetailId === activeDetail.id}
                          onClick={() =>
                            handleUpdateStatus(activeDetail, "selesai")
                          }
                        />
                      </div>
                    </Panel>
                  )}
                </div>

                <Panel className="overflow-hidden">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
                        Timeline roadmap
                      </p>

                      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                        Checklist belajar bertahap
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                        Detail yang sedang dipilih diberi warna agar posisinya
                        jelas. Status bisa diubah tanpa reload tampilan.
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
                      Progress {progress}%
                    </span>
                  </div>

                  <div className="mt-7 space-y-6">
                    {roadmap.steps.map((step, index) => {
                      const stepDone = step.details.filter(
                        (detail) => detail.status === "selesai",
                      ).length;
                      const stepProgress = step.details.length
                        ? Math.round((stepDone / step.details.length) * 100)
                        : 0;
                      const stepHasActive = step.details.some(
                        (detail) => detail.id === activeDetail?.id,
                      );

                      return (
                        <div key={step.id} className="relative pl-5">
                          <div className="absolute bottom-0 left-[15px] top-10 w-px bg-sky-100" />

                          <div
                            className={`absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white shadow-sm ${
                              stepHasActive ? "bg-[#0a54c7]" : "bg-[#07142f]"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div
                            className={`rounded-[1.45rem] border p-4 md:p-5 ${
                              stepHasActive
                                ? "border-sky-200 bg-sky-50/50"
                                : "border-sky-100/80 bg-white/80"
                            }`}
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
                                  Tahap {index + 1}
                                </p>

                                <h3 className="mt-1 text-lg font-extrabold text-slate-950">
                                  {step.title}
                                </h3>

                                {step.description ? (
                                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                                    {step.description}
                                  </p>
                                ) : null}
                              </div>

                              <div className="min-w-28 rounded-2xl bg-white p-3 text-right ring-1 ring-sky-100">
                                <p className="text-lg font-extrabold text-slate-950">
                                  {stepProgress}%
                                </p>

                                <p className="text-[11px] font-bold text-slate-400">
                                  tahap selesai
                                </p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <ProgressBar value={stepProgress} compact />
                            </div>

                            {!!step.notes?.length && (
                              <div className="mt-4 rounded-2xl bg-cyan-50/70 p-3 text-xs font-semibold leading-5 text-sky-800 ring-1 ring-cyan-100">
                                <span className="font-extrabold">
                                  Catatan Guru BK:
                                </span>{" "}
                                {step.notes[0]?.note}
                                {step.notes.length > 1
                                  ? ` +${step.notes.length - 1} catatan lain`
                                  : ""}
                              </div>
                            )}

                            <div className="mt-4 grid gap-3">
                              {step.details.map((detail) => {
                                const active = activeDetail?.id === detail.id;
                                const meta = statusMeta(detail.status);
                                const itemSaving = savingDetailId === detail.id;

                                return (
                                  <article
                                    key={detail.id}
                                    className={`relative rounded-2xl border p-4 transition ${
                                      active
                                        ? "skilllens-selected-roadmap"
                                        : "border-slate-100 bg-white/[0.92] hover:border-sky-200 hover:bg-white"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveDetailId(detail.id)
                                      }
                                      className="flex w-full items-start justify-between gap-3 text-left"
                                    >
                                      <div className="flex min-w-0 gap-3">
                                        <span
                                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ring-1 ${meta.iconBox}`}
                                        >
                                          <Icon
                                            name={meta.icon}
                                            className="h-4 w-4"
                                          />
                                        </span>

                                        <div>
                                          <h4 className="text-sm font-extrabold text-slate-800">
                                            {detail.title}
                                          </h4>

                                          {detail.description ? (
                                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                              {detail.description}
                                            </p>
                                          ) : null}

                                          {itemSaving ? (
                                            <p className="mt-2 text-xs font-semibold text-sky-700">
                                              Menyimpan perubahan...
                                            </p>
                                          ) : null}
                                        </div>
                                      </div>

                                      <DetailStatusBadge status={detail.status} />
                                    </button>

                                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                                      <StatusButton
                                        label="Belum"
                                        active={detail.status === "belum"}
                                        saving={itemSaving}
                                        onClick={() =>
                                          handleUpdateStatus(detail, "belum")
                                        }
                                      />

                                      <StatusButton
                                        label="Proses"
                                        active={detail.status === "proses"}
                                        saving={itemSaving}
                                        onClick={() =>
                                          handleUpdateStatus(detail, "proses")
                                        }
                                      />

                                      <StatusButton
                                        label="Selesai"
                                        active={detail.status === "selesai"}
                                        saving={itemSaving}
                                        onClick={() =>
                                          handleUpdateStatus(detail, "selesai")
                                        }
                                      />
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
        </div>
      </section>
    </main>
  );
}
