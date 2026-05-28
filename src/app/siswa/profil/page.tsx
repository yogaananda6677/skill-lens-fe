"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { UserProfilePanel } from "../../../components/profile/UserProfilePanel";
import { Icon } from "../../../components/ui/icons";
import {
  createStudentAchievement,
  deleteStudentAchievement,
  getMasterProfileOptions,
  saveSiswaProfile,
} from "../../../features/siswa/api";
import { StudentProfilePanel } from "../components/StudentProfilePanel";
import { type ArrayField } from "../components/StudentShared";
import { useStudentData } from "../hooks/useStudentData";
import { buildStudentPayload } from "../utils/buildStudentPayload";

type ProfileTab = "potensi" | "akun";

const PROFILE_CHOICE_MIN = 1;
const PROFILE_CHOICE_MAX = 4;
const PROFILE_CHOICE_LABELS: Record<ArrayField, string> = {
  interests: "Minat",
  hobbies: "Hobi",
  talents: "Bakat",
  experiences: "Pengalaman",
};

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

  const [activeTab, setActiveTab] = useState<ProfileTab>("potensi");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
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
    const fields: ArrayField[] = ["interests", "hobbies", "talents", "experiences"];

    for (const field of fields) {
      const total = profile[field].length;
      if (total < PROFILE_CHOICE_MIN) {
        return `${PROFILE_CHOICE_LABELS[field]} wajib diisi minimal ${PROFILE_CHOICE_MIN}.`;
      }
      if (total > PROFILE_CHOICE_MAX) {
        return `${PROFILE_CHOICE_LABELS[field]} maksimal ${PROFILE_CHOICE_MAX} pilihan.`;
      }
    }

    if (!profile.goal) return "Tujuan karir wajib dipilih.";
    return "";
  }

  async function handleCreateAchievement(
    payload: Parameters<typeof createStudentAchievement>[0],
  ) {
    setError("");
    setMessage("");

    try {
      await createStudentAchievement(payload);
      await reloadStudent();

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
      await reloadStudent();

      setMessage("Prestasi berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus prestasi.");
    }
  }

  async function handleSaveOnly() {
    setError("");
    setMessage("");

    const validationMessage = getProfileChoiceError();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);

    try {
      await saveSiswaProfile(buildStudentPayload(profile, prestasiRows));

      setMessage("Profil berhasil disimpan. Kamu akan diarahkan ke rekomendasi.");
      window.setTimeout(() => {
        router.push("/siswa/rekomendasi?auto=1");
      }, 450);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  const profileReady = !getProfileChoiceError();

  return (
    <>
      <main className="min-h-screen skilllens-blue-page">
        <section className="mx-auto max-w-6xl px-5 py-8 skilllens-page-enter">
          <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 skilllens-hero-grid p-6 text-white shadow-2xl shadow-blue-950/20 md:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/[0.35] blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl skilllens-orbit-glow" />
            <div className="pointer-events-none absolute right-1/3 top-6 h-20 w-20 rounded-full bg-cyan-200/40 blur-2xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
                  Profil Siswa
                </p>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Kelola profil dan keamanan akun
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-sky-100/80">
                  Lengkapi data potensi untuk rekomendasi karir, lalu kelola
                  data akun dan password dengan OTP pada tab Akun & Password.
                </p>

                {activeTab === "potensi" ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-sky-50 ring-1 ring-white/[0.15]">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full ${
                        profileReady
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {profileReady ? "✓" : "!"}
                    </span>
                    {profileReady
                      ? "Data utama sudah lengkap dan siap diproses"
                      : "Lengkapi minimal minat dan tujuan karir"}
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-sky-50 ring-1 ring-white/[0.15]">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-500 text-white">
                      OTP
                    </span>
                    Ubah password menggunakan kode OTP email
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                <Link
                  href="/siswa"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-sm skilllens-smooth hover:-translate-y-0.5 hover:bg-white hover:text-[#07142f]"
                >
                  <Icon name="home" className="h-4 w-4" />
                  Lihat beranda
                </Link>

                <Link
                  href="/siswa/rekomendasi"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white skilllens-button-primary"
                >
                  Lanjut ke rekomendasi
                  <Icon name="chevronRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-[2rem] border border-white/10 bg-[#101820] p-2 shadow-xl shadow-blue-950/10">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("potensi");
                  setMessage("");
                  setError("");
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-[1.5rem] px-5 py-4 text-sm font-extrabold transition ${
                  activeTab === "potensi"
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "bg-white/5 text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon name="sparkles" className="h-4 w-4" />
                Profil Potensi
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("akun");
                  setMessage("");
                  setError("");
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-[1.5rem] px-5 py-4 text-sm font-extrabold transition ${
                  activeTab === "akun"
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "bg-white/5 text-sky-100 hover:bg-white/10"
                }`}
              >
                <Icon name="profile" className="h-4 w-4" />
                Akun & Password
              </button>
            </div>
          </div>

          {activeTab === "potensi" ? (
            <>
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
                      : "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                  }`}
                >
                  {error || message}
                </div>
              )}

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
            </>
          ) : (
            <div className="rounded-[2rem] bg-white p-4 shadow-2xl shadow-blue-950/10 md:p-6">
              <UserProfilePanel
                title="Profil Akun Siswa"
                subtitle="Kelola data akun siswa dan ubah password menggunakan kode OTP."
              />
            </div>
          )}
        </section>
      </main>

    </>
  );
}