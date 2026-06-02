"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAppAlert } from "../../../components/ui/AppAlertProvider";
import { Icon } from "../../../components/ui/icons";
import {
  getActiveStudentRoadmap,
  getLatestSiswaSpk,
  processSiswaSpk,
  selectStudentRoadmap,
} from "../../../features/siswa/api";
import type { Recommendation } from "../../../features/siswa/types";
import { StudentRecommendationPanel } from "../components/StudentRecommendationPanel";
import { useStudentData } from "../hooks/useStudentData";
import { buildStudentPayload } from "../utils/buildStudentPayload";

type RecommendationPanelProps = {
  recommendations: Recommendation[];
  selectedRecommendation: Recommendation | null;
  activeRoadmapId: number | null;
  generatedRoadmapId: number | null;
  generatingRoadmap: boolean;
  onSelectRecommendation: (recommendation: Recommendation) => void;
  onGenerateRoadmap: () => void;
};



function getRecommendationRoadmapId(item: Recommendation | null) {
  if (!item) return null;

  const parsed = Number(item.roadmapId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function InlineRecommendationProcessing({ autoMode }: { autoMode?: boolean }) {
  const steps = [
    { label: "Membaca nilai akademik", icon: "academic" },
    { label: "Mencocokkan minat dan bakat", icon: "sparkles" },
    { label: "Menimbang pengalaman dan prestasi", icon: "clipboard" },
    { label: "Mengurutkan alternatif terbaik", icon: "chart" },
  ];

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-sky-200 bg-white shadow-xl shadow-sky-950/5">
      <div className="relative bg-[linear-gradient(180deg,#e9f7ff_0%,#f6fbff_100%)] p-5 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] text-white shadow-lg shadow-sky-700/20">
                <Icon name="rocket" className="h-5 w-5" />
              </div>

              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
                Proses Rekomendasi
              </p>
            </div>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
              Sedang menghitung rekomendasi terbaik
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              {autoMode
                ? "Profil sudah tersimpan. Sistem menghitung rekomendasi dan hasilnya akan langsung tampil di bawah."
                : "Tunggu sebentar ya. Sistem sedang membaca profil, nilai, pengalaman, prestasi, dan alternatif terbaik."}
            </p>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-sky-100 lg:w-80">
            <div className="h-full w-3/4 rounded-full bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] animate-pulse" />
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.label}
              className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white p-3 text-sm font-bold text-slate-600 shadow-sm"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0a54c7_0%,#1d9bf0_58%,#39d9ff_100%)] text-white shadow-md shadow-sky-700/15">
                <Icon name={step.icon as any} className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1 leading-5">{step.label}</span>

              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:240ms]" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InlineRoadmapProcessing({ autoMode }: { autoMode?: boolean }) {
  return (
    <section className="mt-6 rounded-[2rem] border border-sky-200 bg-sky-50 p-5 text-sm font-semibold text-sky-700 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-sky-700 ring-1 ring-sky-100">
            <Icon name="roadmap" className="h-5 w-5" />
          </div>

          <div>
            <p className="font-extrabold text-slate-950">Roadmap sedang dibuat</p>
            <p className="mt-0.5 text-xs text-sky-700/80">
              {autoMode
                ? "Rekomendasi terbaik sedang disiapkan menjadi roadmap."
                : "Sistem sedang menyiapkan roadmap dari rekomendasi yang kamu pilih."}
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

  const [processing, setProcessing] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [message, setMessage] = useState("");
  const [autoMode, setAutoMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAutoMode(new URLSearchParams(window.location.search).get("auto") === "1");
  }, []);

  useEffect(() => {
    let active = true;

    async function loadLatestRecommendation() {
      setLoadingLatest(true);

      try {
        const [latestResult, activeRoadmapResult] = await Promise.allSettled([
          getLatestSiswaSpk(),
          getActiveStudentRoadmap(),
        ]);

        if (!active) return;

        if (latestResult.status === "fulfilled") {
          const rows = Array.isArray(latestResult.value.recommendations)
            ? latestResult.value.recommendations
            : [];

          setRecommendations(rows);

          if (rows.length) {
            setSelectedRecommendation(
              rows.find((item: Recommendation) => getRecommendationRoadmapId(item)) ??
                rows[0],
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
  
      } finally {
        if (active) {
          setLoadingLatest(false);
        }
      }
    }

    loadLatestRecommendation();

    return () => {
      active = false;
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
    options?: { auto?: boolean },
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

      setGeneratedRoadmapId(parsedRoadmapId);
      setActiveRoadmapId(parsedRoadmapId);
      setMessage("Roadmap berhasil dibuat. Kamu akan diarahkan ke halaman roadmap.");

      if (!options?.auto) {
        showSuccess(
          "Roadmap berhasil dibuat",
          "Kamu akan diarahkan ke halaman roadmap.",
        );
      }

      window.setTimeout(() => {
        router.push("/siswa/roadmap");
      }, options?.auto ? 450 : 800);

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
    setProcessing(true);
    setSelectedRecommendation(null);

    try {
      const result = await processSiswaSpk(
        buildStudentPayload(profile, prestasiRows),
      );

      const rows = Array.isArray(result.recommendations)
        ? result.recommendations
        : [];

      setRecommendations(rows);

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

      return rows;
    } catch (err) {
      const errMessage =
        err instanceof Error ? err.message : "Gagal memproses rekomendasi.";

      showError("Gagal memproses rekomendasi", errMessage);
      setError(errMessage);

      return [];
    } finally {
      setProcessing(false);
    }
  }

  async function handleGenerateRoadmap() {
    await generateRoadmapFromRecommendation(selectedRecommendation);
  }

  useEffect(() => {
    if (!autoMode || autoStartedRef.current) return;
    if (loadingProfile || loadingLatest || processing || generatingRoadmap) return;

    autoStartedRef.current = true;
    handleProcessSpk({ autoSelectTop: true });
  }, [autoMode, loadingProfile, loadingLatest, processing, generatingRoadmap]);

  return (
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

        {processing ? <InlineRecommendationProcessing autoMode={autoMode} /> : null}
        {generatingRoadmap ? <InlineRoadmapProcessing autoMode={autoMode} /> : null}

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
      </section>
    </main>
  );
}
