"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon } from "../../../components/ui/icons";
import { FormSkeleton } from "../../../components/ui/LoadingSkeleton";
import {
  createStudentAchievement,
  deleteStudentAchievement,
  getMasterProfileOptions,
  saveSiswaProfile,
} from "../../../features/siswa/api";
import { type ArrayField } from "../components/StudentShared";
import { useStudentData } from "../hooks/useStudentData";
import { buildStudentPayload } from "../utils/buildStudentPayload";

const PROFILE_CHOICE_MIN = 1;
const PROFILE_CHOICE_MAX = 4;
const MIN_SAVE_LOADING_MS = 250;

const StudentProfilePanel = dynamic(
  () => import("../components/StudentProfilePanel").then((mod) => mod.StudentProfilePanel),
  {
    ssr: false,
    loading: () => <FormSkeleton />,
  },
);

const PROFILE_CHOICE_LABELS: Record<ArrayField, string> = {
  interests: "Minat",
  hobbies: "Hobi",
  talents: "Bakat",
  experiences: "Pengalaman",
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function SiswaProfilPage() {
  const router = useRouter();

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
  const [loadingOptions, setLoadingOptions] = useState(false);
  const profileDraftRef = useRef(profile);

  useEffect(() => {
    profileDraftRef.current = profile;
  }, [profile]);

  const [profileOptions, setProfileOptions] = useState<{
    interestOptions: string[];
    hobbyOptions: string[];
    talentOptions: string[];
    experienceOptions: string[];
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setLoadingOptions(true);

      try {
        const options = await getMasterProfileOptions();

        if (active) {
          setProfileOptions(options);
        }
      } catch (err) {
        console.warn(
          "Gagal memuat master tag dari database, fallback ke opsi lokal.",
          err,
        );
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  function toggleArrayValue(field: ArrayField, value: string) {
    setProfile((current) => {
      const exists = current[field].includes(value);

      if (!exists && current[field].length >= PROFILE_CHOICE_MAX) {
        return current;
      }

      return {
        ...current,
        [field]: exists
          ? current[field].filter((item) => item !== value)
          : [...current[field], value],
      };
    });
  }

  function getProfileChoiceError() {
    const fields: ArrayField[] = [
      "interests",
      "hobbies",
      "talents",
      "experiences",
    ];

    for (const field of fields) {
      const total = profile[field].length;

      if (total < PROFILE_CHOICE_MIN) {
        return `${PROFILE_CHOICE_LABELS[field]} wajib diisi minimal ${PROFILE_CHOICE_MIN}.`;
      }

      if (total > PROFILE_CHOICE_MAX) {
        return `${PROFILE_CHOICE_LABELS[field]} maksimal ${PROFILE_CHOICE_MAX} pilihan.`;
      }
    }

    if (!profile.goal) {
      return "Tujuan karir wajib dipilih.";
    }

    return "";
  }

  async function handleCreateAchievement(
    payload: Parameters<typeof createStudentAchievement>[0],
  ) {
    setError("");
    setMessage("");

    try {
      await createStudentAchievement(payload);
      await reloadStudent({ preserveProfile: true, profileSnapshot: profileDraftRef.current });

      setMessage("Prestasi berhasil ditambahkan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menambahkan prestasi.",
      );
    }
  }

  async function handleDeleteAchievement(id: number) {
    setError("");
    setMessage("");

    try {
      await deleteStudentAchievement(id);
      await reloadStudent({ preserveProfile: true, profileSnapshot: profileDraftRef.current });

      setMessage("Prestasi berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus prestasi.");
    }
  }

  async function handleSaveOnly() {
    if (saving) return;

    setError("");
    setMessage("");

    const validationMessage = getProfileChoiceError();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);

    const startedAt = Date.now();

    try {
      await saveSiswaProfile(buildStudentPayload(profile, prestasiRows));

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_SAVE_LOADING_MS - elapsed);

      if (remaining > 0) {
        await wait(remaining);
      }

      router.push("/siswa/rekomendasi?auto=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
      setSaving(false);
    }
  }

  const profileReady = !getProfileChoiceError();

  const completedProfile =
    profile.interests.length +
    profile.hobbies.length +
    profile.talents.length +
    profile.experiences.length;

  return (
    <main className="min-h-screen skilllens-blue-page">
      <section className="mx-auto max-w-7xl px-3 py-5 skilllens-page-enter sm:px-5 sm:py-8">
        <section
          id="student-profile-hero"
          className="scroll-mt-28 overflow-hidden rounded-[1.45rem] border border-white/10 skilllens-hero-grid text-white shadow-2xl shadow-blue-950/20 sm:scroll-mt-32 sm:rounded-[2rem]"
        >
          <div className="relative grid gap-6 p-4 sm:p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/[0.35] blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute -bottom-24 left-16 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute right-1/3 top-10 h-24 w-24 rounded-full bg-cyan-200/30 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-cyan-100 ring-1 ring-white/15">
                  <Icon name="profile" className="h-4 w-4" />
                </div>

                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-cyan-100 sm:text-xs sm:tracking-[0.22em]">
                  Profil Potensi
                </p>
              </div>

              <h1 className="mt-4 max-w-3xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-5xl">
                Kelola profil potensi siswa
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-sky-100/80 sm:mt-4 sm:leading-7">
                Lengkapi data minat, hobi, bakat, pengalaman, prestasi, dan
                tujuan karir agar sistem dapat memproses rekomendasi yang
                sesuai.
              </p>

              <div className="mt-5 grid gap-3 sm:mt-6 sm:flex sm:flex-wrap">
                <Link
                  id="student-tour-recommendation-action"
                  href="/siswa"
                  prefetch={false}
                  className="inline-flex w-full scroll-mt-32 items-center justify-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md skilllens-smooth hover:-translate-y-0.5 hover:bg-white hover:text-[#07142f] sm:w-auto"
                >
                  <Icon name="home" className="h-4 w-4" />
                  Lihat beranda
                </Link>

                <Link
                  id="student-tour-profile-action"
                  href="/siswa/rekomendasi"
                  prefetch={false}
                  className="inline-flex w-full scroll-mt-32 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white skilllens-button-primary sm:w-auto"
                >
                  Lanjut rekomendasi
                  <Icon name="chevronRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>



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

        <div className="mt-5 sm:mt-6">
          {loadingProfile ? (
            <FormSkeleton />
          ) : (
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
            profileOptions={profileOptions ?? undefined}
            loadingOptions={loadingOptions}
            processLabel="Simpan Profil"
          />
          )}
        </div>
      </section>
    </main>
  );
}