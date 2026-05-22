"use client";

import { useEffect, useState } from "react";
import { StudentTopNav } from "../../../components/layout/StudentTopNav";
import { FeedbackModal } from "../../../components/ui/FeedbackModal";
import { Icon } from "../../../components/ui/icons";
import {
  getLatestSiswaSpk,
  processSiswaSpk,
  selectStudentRoadmap,
} from "../../../features/siswa/api";
import type { Recommendation } from "../../../features/siswa/types";
import { StudentRecommendationPanel } from "../components/StudentRecommendationPanel";
import { useStudentData } from "../hooks/useStudentData";
import { buildStudentPayload } from "../utils/buildStudentPayload";

export default function SiswaRekomendasiPage() {
  const { profile, prestasiRows, loadingProfile, error, setError } =
    useStudentData();

  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);

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
        const result = await getLatestSiswaSpk();

        if (!active) return;

        const rows = Array.isArray(result.recommendations)
          ? result.recommendations
          : [];

        setRecommendations(rows);

        if (rows.length) {
          setMessage("Rekomendasi terakhir berhasil dimuat.");
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
        setError(
          "Rekomendasi berhasil diproses, tetapi hasilnya belum terbaca di frontend. Cek response API proses SPK.",
        );
        return;
      }

      setMessage(result.message || "Rekomendasi berhasil diproses.");
      setModalOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memproses rekomendasi.",
      );
    } finally {
      setProcessing(false);
    }
  }

 async function handleGenerateRoadmap() {
  if (!selectedRecommendation) {
    setError("Pilih salah satu rekomendasi terlebih dahulu.");
    return;
  }

  const roadmapId =
    selectedRecommendation.roadmapId ??
    selectedRecommendation.alternativeId ??
    selectedRecommendation.id;

  const parsedRoadmapId = Number(roadmapId);

  if (!Number.isFinite(parsedRoadmapId) || parsedRoadmapId <= 0) {
    setError(
      "Rekomendasi ini belum memiliki data roadmap. Hubungi admin untuk melengkapi roadmap.",
    );
    return;
  }

  setError("");
  setMessage("");
  setGeneratingRoadmap(true);

  try {
    await selectStudentRoadmap(parsedRoadmapId);

    setMessage(
      "Roadmap berhasil dibuat. Kamu akan diarahkan ke halaman roadmap.",
    );

    window.setTimeout(() => {
      window.location.href = "/siswa/roadmap";
    }, 500);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Gagal membuat roadmap.");
  } finally {
    setGeneratingRoadmap(false);
  }
}
  

  return (
    <StudentTopNav>
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_48%,#f8fafc_100%)]">
        <section className="mx-auto max-w-7xl px-5 py-8">
          <section className="mb-6 rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-lg shadow-sky-950/5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                  Rekomendasi SPK
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-950">
                  Proses rekomendasi arah belajar
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Sistem akan menghitung rekomendasi berdasarkan nilai akademik,
                  profil, tujuan, dan prestasi dari tabel prestasi siswa.
                </p>
              </div>

              <button
                type="button"
                onClick={handleProcessSpk}
                disabled={isProcessDisabled}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
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

          {(message || error) && (
            <div
              className={`mb-6 rounded-2xl p-4 text-sm font-semibold ${
                error
                  ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
              }`}
            >
              {error || message}
            </div>
          )}

          <StudentRecommendationPanel
            recommendations={recommendations}
            selectedRecommendation={selectedRecommendation}
            generatingRoadmap={generatingRoadmap}
            onSelectRecommendation={setSelectedRecommendation}
            onGenerateRoadmap={handleGenerateRoadmap}
          />
        </section>
      </main>

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