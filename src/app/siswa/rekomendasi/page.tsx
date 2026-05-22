"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentTopNav } from "../../../components/layout/StudentTopNav";
import { FeedbackModal } from "../../../components/ui/FeedbackModal";
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


function RecommendationLoadingOverlay({ open }: { open: boolean }) {
  if (!open) return null;

  const steps = [
    { label: "Membaca nilai akademik", icon: "academic", color: "from-sky-500 to-cyan-500" },
    { label: "Mencocokkan minat dan bakat", icon: "sparkles", color: "from-blue-500 to-cyan-400" },
    { label: "Menimbang pengalaman dan prestasi", icon: "clipboard", color: "from-sky-500 to-blue-600" },
    { label: "Mengurutkan alternatif terbaik", icon: "chart", color: "from-cyan-400 to-sky-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#07142f]/[0.64] px-4 backdrop-blur-md">
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
            Tunggu sebentar ya. Sistem sedang membaca data profil, prestasi, dan ribuan alternatif agar hasilnya lebih sesuai.
          </p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#08224f] via-[#0a54c7] to-[#39d9ff] animate-pulse" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="flex items-center gap-3 rounded-3xl border border-sky-100 bg-white/[0.82] p-3 text-sm font-bold text-slate-600 shadow-sm backdrop-blur skilllens-smooth"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg shadow-slate-950/10`}>
                  <Icon name={step.icon} className="h-5 w-5" />
                </span>
                <span>{step.label}</span>
                <span className="ml-auto flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:240ms]" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoadmapGenerationOverlay({ open }: { open: boolean }) {
  if (!open) return null;

  const stages = ["Menyusun alur belajar", "Membuat tahapan mingguan", "Menyiapkan progress tracker"];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#07142f]/[0.64] px-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2.2rem] bg-white/[0.96] p-7 text-center shadow-2xl skilllens-page-enter">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-blue-300/60 blur-3xl" />
        <div className="relative">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-[#08224f] via-[#0a54c7] to-[#39d9ff] text-white shadow-2xl shadow-sky-500/25 skilllens-soft-pulse">
            <Icon name="roadmap" className="h-10 w-10" />
          </div>

          <h2 className="mt-6 text-2xl font-extrabold text-slate-950 md:text-3xl">
            Roadmap sedang dibuat
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
            Sistem sedang mengubah hasil rekomendasi menjadi langkah belajar yang rapi dan bisa kamu ikuti.
          </p>

          <div className="mt-6 grid gap-3">
            {stages.map((stage, index) => (
              <div key={stage} className="flex items-center gap-3 rounded-2xl bg-sky-50/70 p-3 text-left text-sm font-bold text-slate-600 ring-1 ring-sky-100 skilllens-smooth">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-sky-700">
                  {index + 1}
                </span>
                {stage}
                <Icon name="check" className="ml-auto h-5 w-5 text-sky-500" />
              </div>
            ))}
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#08224f] via-[#0a54c7] to-[#39d9ff] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SiswaRekomendasiPage() {
  const { profile, prestasiRows, loadingProfile, error, setError } =
    useStudentData();
  const router = useRouter();
  const { showSuccess, showError, showProcessing, dismissAlert } = useAppAlert();

  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);
  const [activeRoadmapId, setActiveRoadmapId] = useState<number | null>(null);
  const [generatedRoadmapId, setGeneratedRoadmapId] = useState<number | null>(null);

  const [processing, setProcessing] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        }

        if (activeRoadmapResult.status === "fulfilled" && activeRoadmapResult.value?.id) {
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
        }
      }
    }

    loadLatestRecommendation();

    return () => {
      active = false;
    };
  }, []);

  const isProcessDisabled = mounted
    ? processing || loadingProfile || loadingLatest
    : false;

  async function handleProcessSpk() {
    setError("");
    setMessage("");
    showProcessing("Menghitung rekomendasi", "Sistem sedang mencocokkan profil, prestasi, nilai, dan alternatif terbaik.");
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
        const errMessage = "Rekomendasi berhasil diproses, tetapi hasilnya belum terbaca di frontend. Cek response API proses SPK.";
        dismissAlert();
        showError("Hasil rekomendasi belum terbaca", errMessage);
        setError(errMessage);
        return;
      }

      dismissAlert();
      showSuccess("Rekomendasi berhasil diproses", "Pilih salah satu kartu hasil, lalu generate roadmap untuk mulai belajar.");
      setMessage(result.message || "Rekomendasi berhasil diproses.");
      setModalOpen(true);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Gagal memproses rekomendasi.";
      dismissAlert();
      showError("Gagal memproses rekomendasi", errMessage);
      setError(errMessage);
    } finally {
      setProcessing(false);
    }
  }

 async function handleGenerateRoadmap() {
  if (!selectedRecommendation) {
    showError("Pilih rekomendasi dulu", "Klik salah satu kartu rekomendasi sebelum membuat roadmap.");
    setError("Pilih salah satu rekomendasi terlebih dahulu.");
    return;
  }

  const roadmapId =
    selectedRecommendation.roadmapId ??
    selectedRecommendation.alternativeId ??
    selectedRecommendation.id;

  const parsedRoadmapId = Number(roadmapId);

  if (!Number.isFinite(parsedRoadmapId) || parsedRoadmapId <= 0) {
    const errMessage = "Rekomendasi ini belum memiliki data roadmap. Hubungi admin untuk melengkapi roadmap.";
    showError("Roadmap belum tersedia", errMessage);
    setError(errMessage);
    return;
  }

  if (parsedRoadmapId === activeRoadmapId || parsedRoadmapId === generatedRoadmapId) {
    router.push("/siswa/roadmap");
    return;
  }

  setError("");
  setMessage("");
  showProcessing("Membuat roadmap", "Hasil rekomendasi sedang diubah menjadi alur belajar yang bisa diikuti.");
  setGeneratingRoadmap(true);

  try {
    await selectStudentRoadmap(parsedRoadmapId);

    setGeneratedRoadmapId(parsedRoadmapId);
    setActiveRoadmapId(parsedRoadmapId);
    dismissAlert();
    showSuccess("Roadmap berhasil dibuat", "Kamu akan diarahkan ke halaman roadmap.");
    setMessage(
      "Roadmap berhasil dibuat. Kamu akan diarahkan ke halaman roadmap.",
    );

    window.setTimeout(() => {
      router.push("/siswa/roadmap");
    }, 900);
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : "Gagal membuat roadmap.";
    dismissAlert();
    showError("Gagal membuat roadmap", errMessage);
    setError(errMessage);
    setGeneratingRoadmap(false);
  }
}
  

  return (
    <StudentTopNav>
      <main className="min-h-screen skilllens-blue-page">
        <section className="mx-auto max-w-7xl px-5 py-8 skilllens-page-enter">
          <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 skilllens-hero-grid p-6 text-white shadow-2xl shadow-blue-950/20">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/[0.35] blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl skilllens-orbit-glow" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Rekomendasi SPK
                </p>

                <h1 className="mt-2 text-3xl font-extrabold text-white">
                  Proses rekomendasi arah belajar
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-sky-100/80">
                  Sistem akan menghitung rekomendasi berdasarkan nilai akademik,
                  profil, tujuan, dan prestasi dari tabel prestasi siswa.
                </p>
              </div>

              <button
                type="button"
                onClick={handleProcessSpk}
                disabled={isProcessDisabled}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 skilllens-button-primary ${processing ? "animate-pulse" : ""}`}
              >
                <Icon name="rocket" className="h-4 w-4" />
                {processing
                  ? "Memproses..."
                  : loadingLatest
                    ? "Memuat data..."
                    : "Proses Rekomendasi"}
              </button>
            </div>
          </section>

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
      </main>

      <RecommendationLoadingOverlay open={processing} />
      <RoadmapGenerationOverlay open={generatingRoadmap} />

      <FeedbackModal
        open={modalOpen}
        title="Rekomendasi berhasil diproses"
        description="Pilih salah satu hasil rekomendasi, lalu tekan Generate Roadmap."
        actionLabel="Mengerti"
        onClose={() => setModalOpen(false)}
        onAction={() => setModalOpen(false)}
      />
    </StudentTopNav>
  );
}