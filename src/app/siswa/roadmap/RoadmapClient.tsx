"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { useAppAlert } from "../../../components/ui/AppAlertProvider";
import { Icon } from "../../../components/ui/icons";
import { CardGridSkeleton, ListSkeleton } from "../../../components/ui/LoadingSkeleton";
import {
  getActiveStudentRoadmap,
  getStudentRoadmapHistory,
  updateStudentRoadmapProgress,
} from "../../../features/siswa/api";
import type {
  CareerRoadmap,
  RoadmapDetail,
  RoadmapNote,
  RoadmapStep,
  StudentRoadmapHistoryItem,
} from "../../../features/siswa/types";

type RoadmapStatus = "belum" | "proses" | "selesai";

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function ProgressBar({
  value,
  compact = false,
  light = false,
}: {
  value: number;
  compact?: boolean;
  light?: boolean;
}) {
  const safeValue = clampProgress(value);

  return (
    <div
      className={`${compact ? "h-2" : "h-3"} overflow-hidden rounded-full ${
        light ? "bg-white/18 ring-white/20" : "bg-sky-100 ring-sky-100"
      } ring-1`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ease-out ${
          light
            ? "bg-[linear-gradient(90deg,#ffffff_0%,#7dd3fc_48%,#39d9ff_100%)] shadow-[0_0_18px_rgba(57,217,255,0.45)]"
            : "bg-[linear-gradient(90deg,#0a54c7_0%,#1d9bf0_55%,#39d9ff_100%)]"
        }`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
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
      className={`relative overflow-hidden rounded-[1.5rem] border border-sky-200/80 bg-[linear-gradient(180deg,#f8fcff_0%,#ffffff_100%)] p-4 shadow-lg shadow-sky-950/7 ring-1 ring-white/70 sm:p-5 ${className}`}
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
      rail: "from-emerald-400 to-emerald-600",
    };
  }

  if (status === "proses") {
    return {
      label: "Proses",
      dot: "bg-sky-500",
      badge: "bg-sky-50 text-sky-700 ring-sky-100",
      iconBox: "bg-sky-50 text-sky-700 ring-sky-100",
      icon: "progress",
      rail: "from-sky-400 to-cyan-500",
    };
  }

  return {
    label: "Belum",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    iconBox: "bg-slate-100 text-slate-500 ring-slate-200",
    icon: "clipboard",
    rail: "from-slate-300 to-slate-400",
  };
}

function DetailStatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 ${meta.badge}`}
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
      className={`rounded-full px-3.5 py-2 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-55 ${
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
    <Panel>
      <ListSkeleton count={4} />
    </Panel>
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

function getDetailReferenceUrl(detail: RoadmapDetail | null) {
  const rawUrl = detail?.referenceLink?.trim();

  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  return null;
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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
            History generate
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
            Riwayat roadmap siswa
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Catatan roadmap yang pernah dibuat siswa.
          </p>
        </div>

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
          <Icon name="clock" className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <div className="mt-5">
          <CardGridSkeleton count={4} />
        </div>
      ) : items.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 ${meta.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>

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

const LINK_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function normalizeLinkUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function splitTrailingPunctuation(value: string) {
  const match = value.match(/^(.+?)([.,!?)]*)$/);
  return {
    linkText: match?.[1] ?? value,
    trailing: match?.[2] ?? "",
  };
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(LINK_PATTERN);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        if (/^(https?:\/\/|www\.)/i.test(part)) {
          const { linkText, trailing } = splitTrailingPunctuation(part);

          return (
            <span key={`${part}-${index}`}>
              <a
                href={normalizeLinkUrl(linkText)}
                target="_blank"
                rel="noreferrer"
                className="font-extrabold text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-900"
              >
                {linkText}
              </a>
              {trailing}
            </span>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function NotesPreview({
  notes,
  label = "Catatan Guru BK",
}: {
  notes?: RoadmapNote[];
  label?: string;
}) {
  const visibleNotes = (notes ?? []).filter((note) => note.note?.trim());

  if (!visibleNotes.length) return null;

  return (
    <div className="mt-3 space-y-2 rounded-2xl bg-cyan-50/70 p-3 text-xs font-semibold leading-5 text-sky-800 ring-1 ring-cyan-100">
      <p className="font-extrabold">{label}</p>
      {visibleNotes.slice(0, 2).map((note, index) => {
        const noteDate = formatNoteDate(note.createdAt);

        return (
          <article key={note.id || index} className="rounded-xl bg-white/70 p-3 ring-1 ring-white/80">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-extrabold text-slate-800">
                {note.title || "Catatan bimbingan"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-500">
                {note.guruName || "Guru BK"}{noteDate ? ` • ${noteDate}` : ""}
              </p>
            </div>
            <p className="mt-1 text-slate-600"><LinkifiedText text={note.note} /></p>
            {note.followUp ? (
              <p className="mt-2 text-sky-700">
                <span className="font-extrabold">Tindak lanjut:</span> <LinkifiedText text={note.followUp} />
              </p>
            ) : null}
          </article>
        );
      })}
      {visibleNotes.length > 2 ? (
        <p className="text-[11px] font-bold text-sky-600">
          +{visibleNotes.length - 2} catatan lain
        </p>
      ) : null}
    </div>
  );
}

function StepProgressSummary({ step }: { step: RoadmapStep }) {
  const total = step.details.length;
  const done = step.details.filter((detail) => detail.status === "selesai").length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-sky-100">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-extrabold text-slate-950">{progress}%</p>
        <p className="text-xs font-bold text-slate-400">{done}/{total} detail</p>
      </div>
      <div className="mt-3">
        <ProgressBar value={progress} compact />
      </div>
    </div>
  );
}

function LearningReferenceButton({ detail }: { detail: RoadmapDetail }) {
  const referenceUrl = getDetailReferenceUrl(detail);

  if (!referenceUrl) return null;

  return (
    <a
      href={referenceUrl}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => event.stopPropagation()}
      className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-sky-50 px-3.5 py-2 text-xs font-extrabold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
    >
      <Icon name="book" className="h-4 w-4" />
      Referensi belajar
    </a>
  );
}

function DetailRow({
  detail,
  active,
  saving,
  index,
  onSelect,
  onUpdateStatus,
}: {
  detail: RoadmapDetail;
  active: boolean;
  saving: boolean;
  index: number;
  onSelect: () => void;
  onUpdateStatus: (detail: RoadmapDetail, status: RoadmapStatus) => void;
}) {
  const meta = statusMeta(detail.status);

  return (
    <article
      className={`relative overflow-hidden rounded-[1.25rem] border bg-white transition ${
        active
          ? "border-cyan-300 shadow-md shadow-cyan-950/10 ring-1 ring-cyan-100"
          : "border-slate-100 shadow-sm shadow-sky-950/4 hover:border-sky-200 hover:shadow-md hover:shadow-sky-950/8"
      }`}
    >
      <div className={`pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${meta.rail}`} />

      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start lg:p-5">
        <div
          role="button"
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect();
            }
          }}
          className="flex min-w-0 cursor-pointer items-start gap-3 text-left"
        >
          <span
            className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl ring-1 ${meta.iconBox}`}
          >
            <Icon name={meta.icon} className="h-4 w-4" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 ring-1 ring-slate-200">
                Detail {index + 1}
              </span>
              <DetailStatusBadge status={detail.status} />
            </div>

            <h4 className="mt-2 text-base font-extrabold leading-6 text-slate-950">
              {detail.title}
            </h4>

            {detail.description ? (
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                {detail.description}
              </p>
            ) : null}

            <LearningReferenceButton detail={detail} />

            {saving ? (
              <p className="mt-2 text-xs font-semibold text-sky-700">
                Menyimpan perubahan...
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-end gap-3 md:items-end">
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <StatusButton
              label="Belum"
              active={detail.status === "belum"}
              saving={saving}
              onClick={() => onUpdateStatus(detail, "belum")}
            />
            <StatusButton
              label="Proses"
              active={detail.status === "proses"}
              saving={saving}
              onClick={() => onUpdateStatus(detail, "proses")}
            />
            <StatusButton
              label="Selesai"
              active={detail.status === "selesai"}
              saving={saving}
              onClick={() => onUpdateStatus(detail, "selesai")}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 lg:px-5">
        <NotesPreview notes={detail.notes} label="Catatan detail" />
      </div>
    </article>
  );
}

function StepSection({
  step,
  index,
  activeDetailId,
  savingDetailId,
  onSelectDetail,
  onUpdateStatus,
}: {
  step: RoadmapStep;
  index: number;
  activeDetailId: number | null;
  savingDetailId: number | null;
  onSelectDetail: (detailId: number) => void;
  onUpdateStatus: (detail: RoadmapDetail, status: RoadmapStatus) => void;
}) {
  const stepHasActive = step.details.some((detail) => detail.id === activeDetailId);

  return (
    <article className="relative grid gap-4 lg:grid-cols-[86px_minmax(0,1fr)]">
      <div className="relative hidden justify-center lg:flex">
        <div className="absolute bottom-0 top-0 w-px bg-sky-200" />
        <div
          className={`sticky top-28 z-10 grid h-14 w-14 place-items-center rounded-2xl text-lg font-extrabold text-white shadow-lg ${
            stepHasActive
              ? "bg-[linear-gradient(135deg,#0a54c7_0%,#39d9ff_100%)] shadow-sky-700/20"
              : "bg-[#07142f] shadow-slate-950/20"
          }`}
        >
          {index + 1}
        </div>
      </div>

      <section
        className={`relative overflow-hidden rounded-[1.6rem] border bg-white/95 shadow-lg shadow-sky-950/6 ring-1 ring-white/80 ${
          stepHasActive ? "border-cyan-300" : "border-sky-100"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#07142f_0%,#0a54c7_55%,#39d9ff_100%)]" />

        <div className="grid gap-4 border-b border-sky-100/80 bg-[linear-gradient(180deg,#f7fcff_0%,#ffffff_100%)] p-4 sm:p-5 xl:grid-cols-[auto_minmax(0,1fr)_230px] xl:items-center">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl text-base font-extrabold text-white shadow-sm lg:hidden ${
              stepHasActive ? "bg-[#0a54c7]" : "bg-[#07142f]"
            }`}
          >
            {index + 1}
          </div>

          <div className="hidden h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100 xl:grid">
            <Icon name="roadmap" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-600">
              Tahap {index + 1}
            </p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 md:text-2xl">
              {step.title}
            </h3>
            {step.description ? (
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                {step.description}
              </p>
            ) : null}
            <NotesPreview notes={step.notes} />
          </div>

          <StepProgressSummary step={step} />
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          {step.details.length ? (
            step.details.map((detail, detailIndex) => (
              <DetailRow
                key={detail.id}
                detail={detail}
                index={detailIndex}
                active={activeDetailId === detail.id}
                saving={savingDetailId === detail.id}
                onSelect={() => onSelectDetail(detail.id)}
                onUpdateStatus={onUpdateStatus}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 p-4 text-sm font-semibold text-sky-700">
              Belum ada detail aktivitas pada tahap ini.
            </div>
          )}
        </div>
      </section>
    </article>
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
    setError("");

    try {
      const active = await getActiveStudentRoadmap();
      setRoadmap(active);

      const allDetails = active?.steps.flatMap((step) => step.details) ?? [];
      const recommendedDetail = getNextDetail(allDetails);

      setActiveDetailId(recommendedDetail?.id ?? null);
    } catch (err) {
      setRoadmap(null);

      const errMessage =
        err instanceof Error ? err.message : "Gagal memuat roadmap.";

      setError(errMessage);
      showError("Gagal memuat roadmap", errMessage);
    } finally {
      setLoading(false);
    }

    setLoadingHistory(true);

    try {
      const rows = await getStudentRoadmapHistory();
      setHistory(rows);
    } catch {
      setHistory([]);
    } finally {
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

  const completed = details.filter((detail) => detail.status === "selesai").length;
  const inProgress = details.filter((detail) => detail.status === "proses").length;
  const progress = details.length
    ? Math.round((completed / details.length) * 100)
    : roadmap?.progress ?? 0;
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
        <section className="scroll-mt-32 overflow-hidden rounded-[1.8rem] border border-white/10 skilllens-hero-grid text-white shadow-2xl shadow-blue-950/20">
          <div className="relative grid gap-6 p-5 md:p-7 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/[0.35] blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute -bottom-24 left-16 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl skilllens-orbit-glow" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-cyan-100 ring-1 ring-white/15">
                  <Icon name="roadmap" className="h-4 w-4" />
                </div>

                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100">
                  Roadmap Aktif Siswa
                </p>
              </div>

              <h1 className="mt-4 max-w-5xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Ikuti roadmap belajar yang jelas dan bertahap
              </h1>

              <p className="mt-4 max-w-4xl text-sm font-semibold leading-7 text-sky-100/80">
                Roadmap ini menampilkan urutan belajar dari tahap utama,
                detail aktivitas, sampai status progres. Siswa bisa melihat arahan
                yang perlu dikerjakan dan menandai progresnya secara mandiri.
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
                  ["Progress", `${progress}%`, "Capaian roadmap saat ini.", "progress"],
                  ["Tahap", `${roadmap.steps.length}`, "Alur utama yang diikuti.", "roadmap"],
                  ["Proses", `${inProgress}`, "Detail yang sedang dikerjakan.", "clock"],
                  ["Selesai", `${completed}`, "Detail yang sudah ditandai.", "check"],
                ].map(([label, value, detail, icon]) => (
                  <article
                    key={label}
                    className="group relative overflow-hidden rounded-[1.35rem] border border-sky-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#eff9ff_100%)] p-4 shadow-md shadow-sky-950/5 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg hover:shadow-sky-950/10 sm:p-5"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)]" />
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-200/35 blur-2xl transition group-hover:bg-cyan-300/40" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          {label}
                        </p>
                        <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                          {value}
                        </p>
                      </div>
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe_0%,#bae6fd_100%)] text-[#0a54c7] ring-1 ring-sky-200 shadow-sm">
                        <Icon name={icon as never} className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                      {detail}
                    </p>
                  </article>
                ))}
              </div>

              <Panel className="mt-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
                      Roadmap berjalan
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
                      {roadmap.headline}
                    </h2>
                    <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
                      Target: {roadmap.targetRole}
                    </p>
                    {roadmap.description ? (
                      <p className="mt-2 max-w-5xl text-sm font-semibold leading-7 text-slate-600">
                        {roadmap.description}
                      </p>
                    ) : null}
                  </div>

                  {nextDetail ? (
                    <div className="rounded-[1.35rem] border border-cyan-100 bg-[linear-gradient(180deg,#eefbff_0%,#ffffff_100%)] p-4 ring-1 ring-cyan-50">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-600">
                        Lanjutkan sekarang
                      </p>
                      <h3 className="mt-2 text-lg font-extrabold text-slate-950">
                        {nextDetail.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                        {nextDetail.description || "Kerjakan detail ini, lalu tandai proses atau selesai."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingDetailId === nextDetail.id}
                          onClick={() => handleUpdateStatus(nextDetail, "proses")}
                          className="rounded-full bg-white px-4 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50 disabled:opacity-50"
                        >
                          Mulai proses
                        </button>
                        <button
                          type="button"
                          disabled={savingDetailId === nextDetail.id}
                          onClick={() => handleUpdateStatus(nextDetail, "selesai")}
                          className="rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-50 skilllens-button-primary"
                        >
                          Tandai selesai
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Panel>

              <section className="mt-6 overflow-hidden rounded-[1.8rem] border border-sky-100 bg-gradient-to-br from-white via-cyan-50/40 to-sky-50/70 shadow-sm shadow-sky-100/60">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />

                <div className="relative border-b border-sky-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/85 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                        <Icon name="roadmap" className="h-3.5 w-3.5" />
                        Tahap Belajar
                      </p>

                      <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                        Urutan belajar per tahap
                      </h2>

                      <p className="mt-2 max-w-5xl text-sm font-semibold leading-6 text-slate-500">
                        Setiap tahap berisi aktivitas yang lebih rinci agar siswa tahu
                        apa yang harus dikerjakan, diproses, dan diselesaikan. Referensi
                        belajar hanya tampil pada detail yang memiliki link dari database.
                      </p>
                    </div>

                    <span className="w-fit rounded-2xl border border-sky-100 bg-white px-4 py-2 text-xs font-black text-sky-700 shadow-sm shadow-sky-100/60">
                      Progress {progress}%
                    </span>
                  </div>
                </div>

                <div className="relative p-5 sm:p-6">
                  <div className="space-y-5">
                    {roadmap.steps.map((step, index) => (
                      <StepSection
                        key={step.id}
                        step={step}
                        index={index}
                        activeDetailId={activeDetailId}
                        savingDetailId={savingDetailId}
                        onSelectDetail={setActiveDetailId}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ))}
                  </div>
                </div>
              </section>

              <div className="mt-6">
                <RoadmapHistoryPanel items={history} loading={loadingHistory} />
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
