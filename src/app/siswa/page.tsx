"use client";

import { useEffect, useState } from "react";
import { StudentTopNav } from "../../components/layout/StudentTopNav";
import { FeedbackModal } from "../../components/ui/FeedbackModal";
import {
  getSiswaMe,
  processSiswaSpk,
  saveSiswaProfile,
  selectStudentRoadmap,
  toStudentProfile,
} from "../../features/siswa/api";
import type {
  Recommendation,
  StudentProfileForm,
} from "../../features/siswa/types";

import { StudentAcademicPanel } from "./components/StudentAcademicPanel";
import { StudentHomeIntro } from "./components/StudentHomeIntro";
import { StudentProfilePanel } from "./components/StudentProfilePanel";
import { StudentRecommendationPanel } from "./components/StudentRecommendationPanel";
import {
  average,
  toList,
  type ArrayField,
} from "./components/StudentShared";

const emptyProfile: StudentProfileForm = {
  name: "",
  nisn: "",
  school: "",
  className: "",
  major: "",
  academicScores: {},
  interests: [],
  hobbies: [],
  talents: [],
  experiences: [],
  achievements: "",
  goal: "kuliah",
  learningPreference: "",
  constraints: "",
};

function scrollToSection(id: string) {
  window.setTimeout(() => {
    document
      .querySelector(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

    function buildPayload(profile: StudentProfileForm) {
    return {
        minat: profile.interests,
        hobi: profile.hobbies,
        bakat: profile.talents,
        pengalaman: profile.experiences,

        // ini berasal dari data prestasi database yang sudah masuk ke profile.achievements
        prestasi: toList(profile.achievements),
        prestasi_text: profile.achievements,

        tujuan_karir: profile.goal || "kuliah",
        top_n: 3,
    };
    }

export default function SiswaPage() {
  const [profile, setProfile] = useState<StudentProfileForm>(emptyProfile);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<Recommendation | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getSiswaMe()
      .then((data) => setProfile(toStudentProfile(data)))
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data siswa.",
        ),
      )
      .finally(() => setLoadingProfile(false));
  }, []);

  function updateProfile(patch: Partial<StudentProfileForm>) {
    setProfile((current) => ({ ...current, ...patch }));
  }

  function toggleArrayValue(field: ArrayField, value: string) {
    setProfile((current) => {
      const exists = current[field].includes(value);

      return {
        ...current,
        [field]: exists
          ? current[field].filter((item) => item !== value)
          : [...current[field], value],
      };
    });
  }

  async function handleSaveOnly() {
    setError("");
    setMessage("");

    try {
      await saveSiswaProfile(buildPayload(profile));
      setMessage("Profil berhasil disimpan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan profil.",
      );
    }
  }

  async function handleProcessSpk() {
    setError("");
    setMessage("");
    setProcessing(true);
    setSelectedRecommendation(null);

    try {
      const result = await processSiswaSpk(buildPayload(profile));
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
      scrollToSection("#hasil");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memproses rekomendasi.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleGenerateRoadmap() {
    if (!selectedRecommendation?.roadmapId) {
      setError(
        "Pilih salah satu rekomendasi yang memiliki roadmap terlebih dahulu.",
      );
      return;
    }

    setError("");
    setMessage("");
    setGeneratingRoadmap(true);

    try {
      await selectStudentRoadmap(selectedRecommendation.roadmapId);
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

  const academicAverage = average(profile.academicScores);

  const academicRows = [
    ["Numerik", profile.academicScores.numerik ?? 0],
    ["Bahasa", profile.academicScores.bahasa ?? 0],
    ["Sains", profile.academicScores.sains ?? 0],
    ["Sosial", profile.academicScores.sosial ?? 0],
    ["Teknologi", profile.academicScores.teknologi ?? 0],
    ["Kreativitas", profile.academicScores.kreativitas ?? 0],
    ["Softskill/P5", profile.academicScores.softskill ?? 0],
    ["Praktik", profile.academicScores.praktik ?? 0],
    ["Agama", profile.academicScores.agama ?? 0],
  ] as const;

  return (
    <StudentTopNav>
      <main className="min-h-screen bg-[radial-gradient(circle_at_90%_8%,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef7ff_45%,#f8fafc_100%)]">
        <section className="mx-auto max-w-7xl px-5 py-7 md:py-9">
          <StudentHomeIntro
            profile={profile}
            processing={processing}
            hasRecommendations={recommendations.length > 0}
            onGoProfile={() => scrollToSection("#profil")}
            onProcess={handleProcessSpk}
            onGoResult={() => scrollToSection("#hasil")}
          />

          {loadingProfile && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500 shadow-sm">
              Memuat data siswa...
            </div>
          )}

          {(message || error) && (
            <div
              className={`mt-6 rounded-2xl p-4 text-sm font-semibold ${
                error
                  ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
              }`}
            >
              {error || message}
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <StudentProfilePanel
              profile={profile}
              processing={processing}
              onChangeProfile={updateProfile}
              onToggleArray={toggleArrayValue}
              onSave={handleSaveOnly}
              onProcess={handleProcessSpk}
            />

            <StudentAcademicPanel
              averageScore={academicAverage}
              academicRows={academicRows}
            />
          </div>

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
        description="Hasil rekomendasi sudah tersedia. Pilih salah satu rekomendasi, lalu tekan Generate Roadmap."
        actionLabel="Lihat Hasil"
        onClose={() => setModalOpen(false)}
        onAction={() => {
          setModalOpen(false);
          scrollToSection("#hasil");
        }}
      />
    </StudentTopNav>
  );
}