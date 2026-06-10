"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAppAlert } from "../../../components/ui/AppAlertProvider";
import { Icon } from "../../../components/ui/icons";
import { CardGridSkeleton } from "../../../components/ui/LoadingSkeleton";
import {
  getActiveStudentRoadmap,
  getLatestSiswaSpk,
  getStudentSpkHistory,
  processSiswaSpk,
  selectStudentRoadmap,
} from "../../../features/siswa/api";
import type { Recommendation, StudentSpkHistoryItem } from "../../../features/siswa/types";
import { useStudentData } from "../hooks/useStudentData";
import { buildStudentPayload } from "../utils/buildStudentPayload";

const MIN_RECOMMENDATION_LOADING_MS = 1800;

const StudentRecommendationPanel = dynamic(
  () => import("../components/StudentRecommendationPanel").then((mod) => mod.StudentRecommendationPanel),
  {
    ssr: false,
    loading: () => <CardGridSkeleton count={3} />,
  },
);

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getRecommendationRoadmapId(item: Recommendation | null) {
  if (!item) return null;

  const parsed = Number(item.roadmapId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function RecommendationLoadingOverlay({
  open,
  autoMode,
  progress,
  stageLabel,
}: {
  open: boolean;
  autoMode?: boolean;
  progress: number;
  stageLabel: string;
}) {
  if (!open) return null;

  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const steps = [
    {
      label: "Menyiapkan profil",
      icon: "profile",
      threshold: 10,
    },
    {
      label: "Membaca nilai akademik",
      icon: "academic",
      threshold: 34,
    },
    {
      label: "Menghitung SPK",
      icon: "sparkles",
      threshold: 62,
    },
    {
      label: "Merapikan hasil",
      icon: "chart",
      threshold: 88,
    },
  ];

  return (
    <div className="fixed inset-0 z-[260] grid place-items-center bg-slate-950/58 px-4 backdrop-blur-[4px]">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.2rem] bg-white/[0.96] p-6 shadow-2xl skilllens-page-enter md:p-7">
        <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-blue-300/50 blur-3xl" />
        <div className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2 rounded-full bg-cyan-200/50 blur-2xl" />

        <div className="relative">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-[linear-gradient(135deg,#08224f,#0a54c7,#39d9ff)] text-white shadow-2xl shadow-sky-700/30 skilllens-soft-pulse">
            <div className="relative grid h-14 w-14 place-items-center">
              <span className="absolute h-14 w-14 animate-ping rounded-full bg-white/25" />
              <Icon name="rocket" className="relative h-8 w-8" />
            </div>
          </div>

          <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
            Sedang menghitung rekomendasi terbaik
          </h2>

          <p className="mx-auto mt-2 max-w-md text-center text-sm font-semibold leading-6 text-slate-500">
            {autoMode
              ? "Profil sudah tersimpan. Sistem langsung menghitung rekomendasi dan menyiapkan hasil terbaik untukmu."
              : "Tunggu sebentar ya. Sistem sedang membaca data profil, prestasi, nilai, dan alternatif terbaik."}
          </p>

          <div className="mt-6 rounded-3xl border border-sky-100 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-extrabold text-slate-500">
              <span>{stageLabel}</span>
              <span className="text-sky-700">{safeProgress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-sky-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#08224f] via-[#0a54c7] to-[#39d9ff] transition-all duration-500 ease-out"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {steps.map((step) => {
              const completed = safeProgress >= step.threshold;
              const active = !completed && safeProgress >= step.threshold - 22;

              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-3xl border p-3 text-sm font-bold shadow-sm backdrop-blur skilllens-smooth ${
                    completed
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : active
                        ? "border-sky-100 bg-white text-sky-700"
                        : "border-slate-100 bg-white/[0.72] text-slate-500"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-2xl shadow-lg shadow-slate-950/10 ${
                      completed
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-gradient-to-br from-[#08224f] to-[#39d9ff] text-white"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon name={(completed ? "check" : step.icon) as any} className="h-5 w-5" />
                  </span>

                  <span>{step.label}</span>

                  {active ? (
                    <span className="ml-auto flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:240ms]" />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineRoadmapProcessing() {
  return (
    <section className="mt-6 rounded-[2rem] border border-sky-200 bg-sky-50 p-5 text-sm font-semibold text-sky-700 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-sky-700 ring-1 ring-sky-100">
            <Icon name="roadmap" className="h-5 w-5" />
          </div>

          <div>
            <p className="font-extrabold text-slate-950">
              Roadmap sedang dibuat
            </p>
            <p className="mt-0.5 text-xs text-sky-700/80">
              Sistem sedang menyiapkan roadmap dari rekomendasi yang kamu pilih.
            </p>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-sky-100 sm:w-56">
          <div className="h-full w-4/5 rounded-full bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] animate-pulse" />
        </div>
      </div>
    </section>
  );
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

function selectedBadgeClass(status?: string | null) {
  if (status === "aktif") return "bg-cyan-100 text-cyan-800 ring-cyan-200";
  if (status === "selesai") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "dibatalkan") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-sky-50 text-sky-700 ring-sky-100";
}

function SpkGenerateHistory({
  items,
  loading,
}: {
  items: StudentSpkHistoryItem[];
  loading: boolean;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-sky-200/80 bg-white/95 p-5 shadow-lg shadow-sky-950/5 ring-1 ring-white/70 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
            History generate SPK
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
            Riwayat alternatif yang pernah digenerate
          </h2>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Bagian ini menampilkan catatan hasil SPK dan pilihan roadmap yang pernah dibuat.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-extrabold text-sky-700 ring-1 ring-sky-100">
          <Icon name="clock" className="h-4 w-4" />
          Read-only
        </span>
      </div>

      {loading ? (
        <div className="mt-5">
          <CardGridSkeleton count={2} />
        </div>
      ) : items.length ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {items.slice(0, 6).map((item) => {
            const selectedRoadmapId = Number(item.selected?.roadmapId ?? 0);

            return (
              <article
                key={item.id}
                aria-label="Riwayat generate SPK, hanya tampilan"
                className="relative overflow-hidden rounded-3xl border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-4 shadow-sm"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)]" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#07142f] px-3 py-1 text-[11px] font-extrabold text-white">
                        Generate #{item.id}
                      </span>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-sky-700 ring-1 ring-sky-100">
                        {item.tujuanKarir || "rekomendasi"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-bold text-slate-500">
                      {formatHistoryDate(item.createdAt)}
                    </p>
                  </div>

                  {item.selected ? (
                    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold ring-1 ${selectedBadgeClass(item.selected.status)}`}>
                      <Icon name="check" className="h-3.5 w-3.5" />
                      Dipilih: {item.selected.title}
                    </span>
                  ) : (
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-extrabold text-slate-500 ring-1 ring-slate-100">
                      Belum ada pilihan roadmap
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {item.recommendations.slice(0, 3).map((recommendation) => {
                    const isSelected = Boolean(
                      selectedRoadmapId && Number(recommendation.roadmapId) === selectedRoadmapId,
                    );

                    return (
                      <div
                        key={`${item.id}-${recommendation.id}`}
                        className={`rounded-2xl border p-3 ${
                          isSelected
                            ? "border-cyan-200 bg-cyan-50 text-[#07142f]"
                            : "border-slate-100 bg-white text-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-slate-950">
                              {recommendation.topsisRank}. {recommendation.title}
                            </p>
                            <p className="mt-1 text-xs font-semibold capitalize text-slate-500">
                              {recommendation.category}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {isSelected ? (
                              <span className="rounded-full bg-[#07142f] px-2.5 py-1 text-[10px] font-extrabold text-white">
                                Dipilih
                              </span>
                            ) : null}
                            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sky-50 text-xs font-extrabold text-sky-700 ring-1 ring-sky-100">
                              {Math.round(recommendation.score || 0)}
                            </span>
                          </div>
                        </div>

                        <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                          {recommendation.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-dashed border-sky-200 bg-sky-50 p-5 text-sm font-semibold text-sky-700">
          Belum ada history generate SPK.
        </div>
      )}
    </section>
  );
}

export default function SiswaRekomendasiPage() {
  const { profile, prestasiRows, loadingProfile, error, setError } =
    useStudentData();

  const router = useRouter();
  const autoStartedRef = useRef(false);
  const { showSuccess, showError } = useAppAlert();

  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);
  const [activeRoadmapId, setActiveRoadmapId] = useState<number | null>(null);
  const [generatedRoadmapId, setGeneratedRoadmapId] = useState<number | null>(
    null,
  );
  const [spkHistory, setSpkHistory] = useState<StudentSpkHistoryItem[]>([]);

  const [processing, setProcessing] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [loadingSpkHistory, setLoadingSpkHistory] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [message, setMessage] = useState("");
  const [autoMode, setAutoMode] = useState(false);
  const [recommendationProgress, setRecommendationProgress] = useState(0);
  const [recommendationStage, setRecommendationStage] = useState("Menyiapkan data profil");
  const progressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setAutoMode(new URLSearchParams(window.location.search).get("auto") === "1");
  }, []);

  function stopRecommendationProgressTimer() {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }

  function updateRecommendationProgress(value: number, label: string) {
    setRecommendationProgress((current) => Math.max(current, value));
    setRecommendationStage(label);
  }

  useEffect(() => {
    return () => stopRecommendationProgressTimer();
  }, []);

  useEffect(() => {
    let active = true;
    let historyTimer: number | null = null;

    async function loadSpkHistoryLater() {
      setLoadingSpkHistory(true);

      try {
        const history = await getStudentSpkHistory();
        if (active) setSpkHistory(history);
      } catch {
        if (active) setSpkHistory([]);
      } finally {
        if (active) setLoadingSpkHistory(false);
      }
    }

    async function loadLatestRecommendation() {
      setLoadingLatest(true);

      try {
        const shouldAutoProcess =
          new URLSearchParams(window.location.search).get("auto") === "1";

        const [latestResult, activeRoadmapResult] = await Promise.allSettled([
          getLatestSiswaSpk(),
          getActiveStudentRoadmap(),
        ]);

        if (!active) return;

        if (!shouldAutoProcess && latestResult.status === "fulfilled") {
          const rows = Array.isArray(latestResult.value.recommendations)
            ? latestResult.value.recommendations
            : [];

          setRecommendations(rows);

          if (rows.length) {
            setSelectedRecommendation(
              rows.find((item: Recommendation) =>
                getRecommendationRoadmapId(item),
              ) ?? rows[0],
            );
          }
        }

        if (
          activeRoadmapResult.status === "fulfilled" &&
          activeRoadmapResult.value?.id
        ) {
          setActiveRoadmapId(activeRoadmapResult.value.id);
          setGeneratedRoadmapId(activeRoadmapResult.value.id);
        }
      } catch {
        /**
         * Tidak perlu tampil error di awal.
         * Bisa saja siswa memang belum pernah memproses rekomendasi.
         */
      } finally {
        if (active) {
          setLoadingLatest(false);
          historyTimer = window.setTimeout(() => {
            void loadSpkHistoryLater();
          }, 180);
        }
      }
    }

    loadLatestRecommendation();

    return () => {
      active = false;
      if (historyTimer !== null) window.clearTimeout(historyTimer);
    };
  }, []);

  const isProcessDisabled = mounted
    ? processing || loadingProfile || loadingLatest || generatingRoadmap
    : false;

  const completedProfile =
    profile.interests.length +
    profile.hobbies.length +
    profile.talents.length +
    profile.experiences.length;

  const hasRecommendations = recommendations.length > 0;

  async function generateRoadmapFromRecommendation(
    recommendation: Recommendation | null,
  ) {
    if (!recommendation) {
      showError(
        "Pilih rekomendasi dulu",
        "Klik salah satu kartu rekomendasi sebelum membuat roadmap.",
      );
      setError("Pilih salah satu rekomendasi terlebih dahulu.");
      return false;
    }

    const parsedRoadmapId = getRecommendationRoadmapId(recommendation);

    if (!parsedRoadmapId) {
      const errMessage =
        "Rekomendasi ini belum memiliki data roadmap. Hubungi admin untuk melengkapi roadmap pada alternatif tersebut.";

      showError("Roadmap belum tersedia", errMessage);
      setError(errMessage);
      return false;
    }

    if (
      parsedRoadmapId === activeRoadmapId ||
      parsedRoadmapId === generatedRoadmapId
    ) {
      router.push("/siswa/roadmap");
      return true;
    }

    setError("");
    setMessage("");
    setGeneratingRoadmap(true);

    try {
      await selectStudentRoadmap(parsedRoadmapId);

      void getStudentSpkHistory()
        .then(setSpkHistory)
        .catch(() => undefined);

      setGeneratedRoadmapId(parsedRoadmapId);
      setActiveRoadmapId(parsedRoadmapId);
      setMessage("Roadmap berhasil dibuat. Kamu akan diarahkan ke halaman roadmap.");

      showSuccess(
        "Roadmap berhasil dibuat",
        "Kamu akan diarahkan ke halaman roadmap.",
      );

      window.setTimeout(() => {
        router.push("/siswa/roadmap");
      }, 800);

      return true;
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : "Gagal membuat roadmap.";

      showError("Gagal membuat roadmap", errMessage);
      setError(errMessage);
      setGeneratingRoadmap(false);
      return false;
    }
  }

  async function handleProcessSpk(options?: { autoSelectTop?: boolean }) {
    setError("");
    setMessage("");
    stopRecommendationProgressTimer();
    setRecommendationProgress(0);
    setRecommendationStage("Menyiapkan data profil");
    setProcessing(true);
    setSelectedRecommendation(null);

    const startedAt = Date.now();
    let completedSuccessfully = false;
    let liveProgress = 12;

    updateRecommendationProgress(8, "Menyiapkan data profil");
    progressTimerRef.current = window.setInterval(() => {
      liveProgress = Math.min(
        88,
        liveProgress + (liveProgress < 42 ? 5 : liveProgress < 70 ? 3 : 1),
      );

      const label =
        liveProgress < 30
          ? "Mengirim data ke mesin SPK"
          : liveProgress < 58
            ? "Membaca nilai dan profil siswa"
            : liveProgress < 82
              ? "Menghitung ranking TOPSIS"
              : "Merapikan hasil rekomendasi";

      updateRecommendationProgress(liveProgress, label);
    }, 220);

    try {
      updateRecommendationProgress(18, "Mengirim data ke mesin SPK");
      const result = await processSiswaSpk(
        buildStudentPayload(profile, prestasiRows),
      );
      updateRecommendationProgress(72, "Response API diterima");

      const rows = Array.isArray(result.recommendations)
        ? result.recommendations
        : [];

      setRecommendations(rows);
      updateRecommendationProgress(84, "Menyusun hasil rekomendasi");

      if (!rows.length) {
        const errMessage =
          "Rekomendasi berhasil diproses, tetapi hasilnya belum terbaca di frontend. Cek response API proses SPK.";

        showError("Hasil rekomendasi belum terbaca", errMessage);
        setError(errMessage);
        return [];
      }

      const topRecommendation =
        rows.find((item: Recommendation) => getRecommendationRoadmapId(item)) ??
        rows[0];

      setSelectedRecommendation(topRecommendation);

      void getStudentSpkHistory()
        .then(setSpkHistory)
        .catch(() => undefined);

      const successMessage =
        result.message ||
        "Rekomendasi berhasil diproses. Pilih salah satu hasil untuk membuat roadmap.";

      setMessage(successMessage);

      if (!options?.autoSelectTop) {
        showSuccess("Rekomendasi berhasil diproses", successMessage);
      }

      if (autoMode) {
        window.history.replaceState(null, "", "/siswa/rekomendasi");
        setAutoMode(false);
      }

      completedSuccessfully = true;
      updateRecommendationProgress(100, "Rekomendasi siap ditampilkan");
      return rows;
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : "Gagal memproses rekomendasi.";

      showError("Gagal memproses rekomendasi", errMessage);
      setError(errMessage);

      if (autoMode) {
        window.history.replaceState(null, "", "/siswa/rekomendasi");
        setAutoMode(false);
      }

      updateRecommendationProgress(100, "Proses dihentikan");
      return [];
    } finally {
      stopRecommendationProgressTimer();
      if (!completedSuccessfully) {
        setRecommendationProgress(100);
      }
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_RECOMMENDATION_LOADING_MS - elapsed);

      if (remaining > 0) {
        await wait(remaining);
      }

      setProcessing(false);
      window.setTimeout(() => {
        setRecommendationProgress(0);
        setRecommendationStage("Menyiapkan data profil");
      }, 250);
    }
  }

  async function handleGenerateRoadmap() {
    await generateRoadmapFromRecommendation(selectedRecommendation);
  }

  useEffect(() => {
    if (!autoMode || autoStartedRef.current) return;
    if (loadingProfile || processing || generatingRoadmap) return;

    autoStartedRef.current = true;
    void handleProcessSpk({ autoSelectTop: true });
  }, [autoMode, loadingProfile, processing, generatingRoadmap]);

  return (
    <>
      <main className="min-h-screen skilllens-blue-page">
        <section className="mx-auto max-w-7xl px-5 py-8 skilllens-page-enter">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 skilllens-hero-grid text-white shadow-2xl shadow-blue-950/20">
            <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/[0.35] blur-3xl skilllens-orbit-glow" />
              <div className="pointer-events-none absolute -bottom-24 left-16 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl skilllens-orbit-glow" />
              <div className="pointer-events-none absolute right-1/3 top-10 h-24 w-24 rounded-full bg-cyan-200/30 blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-cyan-100 ring-1 ring-white/15">
                    <Icon name="rocket" className="h-4 w-4" />
                  </div>

                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100">
                    Rekomendasi SPK
                  </p>
                </div>

                <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                  Proses rekomendasi arah belajar
                </h1>

                <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-sky-100/80">
                  Sistem akan menghitung rekomendasi berdasarkan nilai akademik,
                  profil, tujuan, dan prestasi dari data siswa.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleProcessSpk()}
                    disabled={isProcessDisabled}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 skilllens-button-primary ${
                      processing ? "animate-pulse" : ""
                    }`}
                  >
                    <Icon name="rocket" className="h-4 w-4" />
                    {processing
                      ? "Memproses..."
                      : loadingLatest
                        ? "Memuat data..."
                        : "Proses Rekomendasi"}
                  </button>

                  <Link
                    href="/siswa/profil"
                    prefetch={false}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md skilllens-smooth hover:-translate-y-0.5 hover:bg-white hover:text-[#07142f]"
                  >
                    <Icon name="profile" className="h-4 w-4" />
                    Edit Profil
                  </Link>
                </div>

                {autoMode ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-sky-50 ring-1 ring-white/[0.15]">
                    <Icon name="sparkles" className="h-4 w-4 text-cyan-300" />
                    Mode otomatis aktif setelah simpan profil
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {generatingRoadmap ? <InlineRoadmapProcessing /> : null}

          {(message || error) && (
            <div
              className={`mt-6 rounded-2xl p-4 text-sm font-semibold ${
                error
                  ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                  : "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
              }`}
            >
              {error || message}
            </div>
          )}

          <section className="mt-6">
            <StudentRecommendationPanel
              recommendations={recommendations}
              selectedRecommendation={selectedRecommendation}
              activeRoadmapId={activeRoadmapId}
              generatedRoadmapId={generatedRoadmapId}
              generatingRoadmap={generatingRoadmap}
              onSelectRecommendation={setSelectedRecommendation}
              onGenerateRoadmap={handleGenerateRoadmap}
            />
          </section>

          <SpkGenerateHistory
            items={spkHistory}
            loading={loadingSpkHistory}
          />
        </section>
      </main>

      <RecommendationLoadingOverlay
        open={processing}
        autoMode={autoMode}
        progress={recommendationProgress}
        stageLabel={recommendationStage}
      />
    </>
  );
}
