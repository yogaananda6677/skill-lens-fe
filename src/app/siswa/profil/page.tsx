"use client";

import Link from "next/link";
import { StudentTopNav } from "../../../components/layout/StudentTopNav";
import { FeedbackModal } from "../../../components/ui/FeedbackModal";
import { Icon } from "../../../components/ui/icons";
import {
  createStudentAchievement,
  deleteStudentAchievement,
  saveSiswaProfile,
} from "../../../features/siswa/api";
import type { StudentProfileForm } from "../../../features/siswa/types";
import { StudentAcademicPanel } from "../components/StudentAcademicPanel";
import { StudentProfilePanel } from "../components/StudentProfilePanel";
import { average, type ArrayField } from "../components/StudentShared";
import { useStudentData } from "../hooks/useStudentData";
import { buildStudentPayload } from "../utils/buildStudentPayload";
import { useState } from "react";

export default function SiswaProfilPage() {
  const {
    profile,
    setProfile,
    prestasiRows,
    loadingProfile,
    error,
    setError,
    updateProfile,
    reloadStudent,
  } = useStudentData();

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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


  async function handleCreateAchievement(payload: Parameters<typeof createStudentAchievement>[0]) {
    setError("");
    setMessage("");
    await createStudentAchievement(payload);
    await reloadStudent();
    setMessage("Prestasi berhasil ditambahkan.");
    setModalOpen(true);
  }

  async function handleDeleteAchievement(id: number) {
    setError("");
    setMessage("");
    await deleteStudentAchievement(id);
    await reloadStudent();
    setMessage("Prestasi berhasil dihapus.");
    setModalOpen(true);
  }

  async function handleSaveOnly() {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      await saveSiswaProfile(buildStudentPayload(profile, prestasiRows));
      setMessage("Profil berhasil disimpan.");
      setModalOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan profil.",
      );
    } finally {
      setSaving(false);
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
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_48%,#f8fafc_100%)]">
        <section className="mx-auto max-w-7xl px-5 py-8">
          <div className="mb-6 flex flex-col gap-4 rounded-[1.8rem] border border-sky-100 bg-white p-6 shadow-lg shadow-sky-950/5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                Profil Siswa
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Lengkapi data potensi dirimu
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Data ini akan digunakan sebagai bahan perhitungan rekomendasi
                SPK.
              </p>
            </div>

            <Link
              href="/siswa/rekomendasi"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
            >
              Lanjut ke rekomendasi
              <Icon name="chevronRight" className="h-4 w-4" />
            </Link>
          </div>

          {loadingProfile && (
            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold text-slate-500 shadow-sm">
              Memuat data siswa...
            </div>
          )}

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

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <StudentProfilePanel
              profile={profile}
              prestasiRows={prestasiRows}
              processing={saving}
              onChangeProfile={updateProfile}
              onToggleArray={toggleArrayValue}
              onSave={handleSaveOnly}
              onProcess={handleSaveOnly}
              onCreateAchievement={handleCreateAchievement}
              onDeleteAchievement={handleDeleteAchievement}
              processLabel="Simpan Profil"
            />

            <StudentAcademicPanel
              averageScore={academicAverage}
              academicRows={academicRows}
            />
          </div>
        </section>
      </main>

      <FeedbackModal
        open={modalOpen}
        title="Profil berhasil disimpan"
        description="Data profilmu sudah tersimpan. Sekarang kamu bisa lanjut memproses rekomendasi."
        actionLabel="Lanjut Rekomendasi"
        onClose={() => setModalOpen(false)}
        onAction={() => {
          window.location.href = "/siswa/rekomendasi";
        }}
      />
    </StudentTopNav>
  );
}