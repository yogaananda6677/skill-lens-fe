"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/ui/icons";
import { StudentAcademicPanel } from "./components/StudentAcademicPanel";
import { StudentOnbordaProvider } from "./components/StudentOnbordaProvider";
import {
  STUDENT_ONBORDA_DONE_EVENT,
  STUDENT_ONBORDA_START_EVENT,
  StartStudentOnbordaButton,
} from "./components/StartStudentOnbordaButton";
import { StudentPasswordReminderDialog } from "./components/StudentPasswordReminderDialog";
import { StudentPreparingScreen } from "./components/StudentPreparingScreen";
import { average } from "./components/StudentShared";
import { useStudentData } from "./hooks/useStudentData";

function onboardingKey(nisn?: string) {
  return `skilllens_student_onborda_seen_${nisn || "unknown"}`;
}

export default function SiswaHomePage() {
  const {
    profile,
    studentData,
    mustChangePassword,
    prestasiRows,
    loadingProfile,
    error,
    markPasswordChanged,
  } = useStudentData();

  const [showPasswordReminder, setShowPasswordReminder] = useState(false);
  const [passwordReminderClosed, setPasswordReminderClosed] = useState(false);
  const [onbordaRunning, setOnbordaRunning] = useState(false);

  const shouldAutoStartOnborda = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (loadingProfile || !studentData?.nisn) return false;

    return window.localStorage.getItem(onboardingKey(studentData.nisn)) !== "true";
  }, [loadingProfile, studentData?.nisn]);

  useEffect(() => {
    function handleOnbordaStart() {
      setOnbordaRunning(true);
      setShowPasswordReminder(false);
    }

    function handleOnbordaDone() {
      setOnbordaRunning(false);

      if (studentData?.nisn) {
        window.localStorage.setItem(onboardingKey(studentData.nisn), "true");
      }

      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (mustChangePassword && !passwordReminderClosed) {
          window.setTimeout(() => setShowPasswordReminder(true), 450);
        }
      }, 160);
    }

    window.addEventListener(STUDENT_ONBORDA_START_EVENT, handleOnbordaStart);
    window.addEventListener(STUDENT_ONBORDA_DONE_EVENT, handleOnbordaDone);

    return () => {
      window.removeEventListener(STUDENT_ONBORDA_START_EVENT, handleOnbordaStart);
      window.removeEventListener(STUDENT_ONBORDA_DONE_EVENT, handleOnbordaDone);
    };
  }, [mustChangePassword, passwordReminderClosed, studentData?.nisn]);

  useEffect(() => {
    if (loadingProfile || !studentData) return;
    if (!mustChangePassword || passwordReminderClosed || onbordaRunning) return;

    const alreadySeenOnborda =
      window.localStorage.getItem(onboardingKey(studentData.nisn)) === "true";

    const timer = window.setTimeout(
      () => {
        setShowPasswordReminder(true);
      },
      alreadySeenOnborda ? 650 : 4200,
    );

    return () => window.clearTimeout(timer);
  }, [
    loadingProfile,
    mustChangePassword,
    onbordaRunning,
    passwordReminderClosed,
    studentData,
  ]);

  const completedProfile =
    profile.interests.length +
    profile.hobbies.length +
    profile.talents.length +
    profile.experiences.length;

  function closePasswordReminder() {
    setPasswordReminderClosed(true);
    setShowPasswordReminder(false);
  }

  if (loadingProfile) {
    return <StudentPreparingScreen />;
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
    <StudentOnbordaProvider
      autoStart={shouldAutoStartOnborda}
      studentKey={studentData?.nisn || studentData?.id_siswa || null}
    >
      <main className="min-h-screen skilllens-blue-page">
          <StudentPasswordReminderDialog
            open={showPasswordReminder}
            onClose={closePasswordReminder}
            onPasswordChanged={() => {
              markPasswordChanged();
              setPasswordReminderClosed(true);
              setShowPasswordReminder(false);
            }}
          />

          <section className="mx-auto max-w-7xl px-5 py-8 skilllens-page-enter">
            {mustChangePassword && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-6 text-amber-800 shadow-sm">
                Password akunmu masih default. Kamu bisa tetap memakai dashboard,
                tetapi sebaiknya ganti password agar akun lebih aman.
                <button
                  type="button"
                  onClick={() => {
                    setPasswordReminderClosed(false);
                    setShowPasswordReminder(true);
                  }}
                  className="ml-2 font-extrabold text-amber-900 underline underline-offset-4"
                >
                  Ganti sekarang
                </button>
              </div>
            )}

            <section
              id="student-tour-hero"
              className="scroll-mt-32 overflow-hidden rounded-[2rem] border border-white/10 skilllens-hero-grid text-white shadow-2xl shadow-blue-950/20"
            >
              <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_360px] lg:items-center">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/[0.35] blur-3xl skilllens-orbit-glow" />
                <div className="absolute -bottom-24 left-16 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl skilllens-orbit-glow" />
                <div className="absolute right-1/3 top-10 h-24 w-24 rounded-full bg-cyan-200/30 blur-2xl" />

                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
                    Ruang Siswa SkillLens
                  </p>

                  <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                    Mulai perjalanan belajarmu dengan langkah yang jelas.
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-sky-100/80">
                    Lengkapi profil, cek ringkasan akademik, proses rekomendasi
                    SPK, lalu pilih roadmap yang paling sesuai dengan tujuanmu.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      id="student-tour-profile-action"
                      href="/siswa/profil"
                      className="inline-flex scroll-mt-32 items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white skilllens-button-primary"
                    >
                      Mulai isi profil
                      <Icon name="chevronRight" className="h-4 w-4" />
                    </Link>

                    <Link
                      id="student-tour-recommendation-action"
                      href="/siswa/rekomendasi"
                      className="inline-flex scroll-mt-32 items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-5 py-3 text-sm font-bold text-white skilllens-smooth hover:-translate-y-0.5 hover:bg-white hover:text-[#07142f]"
                    >
                      Lihat rekomendasi
                    </Link>

                    <StartStudentOnbordaButton />
                  </div>
                </div>

                <div className="relative rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                    Profil aktif
                  </p>

                  <h2 className="mt-3 text-xl font-bold text-white">
                    {profile.name || "Siswa"}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-sky-100/75">
                    {profile.className || "-"} • {profile.major || "-"}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-sky-100/75">
                    {profile.school || "Sekolah belum terbaca"}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <p className="text-xs font-semibold text-sky-100/60">
                        Profil terisi
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {completedProfile}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <p className="text-xs font-semibold text-sky-100/60">
                        Prestasi
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {prestasiRows.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
                {error}
              </div>
            )}

            <section id="student-tour-academic" className="mt-6 scroll-mt-32">
              <StudentAcademicPanel
                averageScore={academicAverage}
                academicRows={academicRows}
              />
            </section>

            <section className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "1. Lengkapi Profil",
                  desc: "Pilih minat, hobi, bakat, pengalaman, dan cek prestasi dari database.",
                  icon: "profile",
                  href: "/siswa/profil",
                  id: "student-tour-profile-card",
                },
                {
                  title: "2. Proses Rekomendasi",
                  desc: "Sistem akan menghitung rekomendasi berdasarkan data akademik dan profilmu.",
                  icon: "sparkles",
                  href: "/siswa/rekomendasi",
                  id: "student-tour-recommendation-card",
                },
                {
                  title: "3. Ikuti Roadmap",
                  desc: "Setelah memilih hasil rekomendasi, kamu bisa mengikuti roadmap belajar.",
                  icon: "roadmap",
                  href: "/siswa/roadmap",
                  id: "student-tour-roadmap-action",
                },
              ].map((item) => (
                <Link
                  id={item.id}
                  key={item.title}
                  href={item.href}
                  className="scroll-mt-32 rounded-[1.75rem] border border-sky-100/80 bg-white/[0.88] p-5 shadow-lg shadow-sky-950/5 backdrop-blur skilllens-smooth hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-sky-950/10"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-700">
                    <Icon name={item.icon as any} className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    {item.desc}
                  </p>
                </Link>
              ))}
            </section>
          </section>
        </main>
    </StudentOnbordaProvider>
  );
}
