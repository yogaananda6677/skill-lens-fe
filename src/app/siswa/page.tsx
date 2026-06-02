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

    return (
      window.localStorage.getItem(onboardingKey(studentData.nisn)) !== "true"
    );
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
      window.removeEventListener(
        STUDENT_ONBORDA_START_EVENT,
        handleOnbordaStart,
      );
      window.removeEventListener(
        STUDENT_ONBORDA_DONE_EVENT,
        handleOnbordaDone,
      );
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

  function closePasswordReminder() {
    setPasswordReminderClosed(true);
    setShowPasswordReminder(false);
  }

  if (loadingProfile) {
    return <StudentPreparingScreen />;
  }

  const completedProfile =
    profile.interests.length +
    profile.hobbies.length +
    profile.talents.length +
    profile.experiences.length;

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

  const stepCards = [
    {
      title: "1. Lengkapi Profil",
      desc: "Pilih minat, hobi, bakat, pengalaman, dan cek prestasi dari database.",
      icon: "profile",
      href: "/siswa/profil",
      id: "student-tour-profile-card",
      action: "Isi profil",
    },
    {
      title: "2. Proses Rekomendasi",
      desc: "Sistem menghitung rekomendasi berdasarkan nilai akademik dan profil potensi.",
      icon: "sparkles",
      href: "/siswa/rekomendasi",
      id: "student-tour-recommendation-card",
      action: "Lihat rekomendasi",
    },
    {
      title: "3. Ikuti Roadmap",
      desc: "Setelah memilih hasil rekomendasi, kamu bisa mengikuti roadmap belajar.",
      icon: "roadmap",
      href: "/siswa/roadmap",
      id: "student-tour-roadmap-action",
      action: "Buka roadmap",
    },
  ];

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
            <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
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
            </div>
          </section>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <section id="student-tour-academic" className="mt-6 scroll-mt-32">
            <StudentAcademicPanel
              averageScore={academicAverage}
              academicRows={academicRows}
            />
          </section>

          <section className="mt-6">
          <div className="overflow-hidden rounded-[2rem] skilllens-hero-grid text-white shadow-xl shadow-sky-950/10">            
            <div className="relative overflow-hidden px-6 py-5 md:px-7">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(57,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(57,217,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />

              <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/[0.30] blur-3xl" />
              <div className="absolute left-10 bottom-0 h-44 w-44 rounded-full bg-blue-500/25 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-cyan-100 ring-1 ring-white/15">
                    <Icon name="sparkles" className="h-4 w-4" />
                  </div>

                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100">
                    Alur Siswa
                  </p>
                </div>

                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                      Langkah penggunaan SkillLens
                    </h2>

                    <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-sky-100/80">
                      Lengkapi profil, proses rekomendasi, lalu ikuti roadmap belajar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,#e9f7ff_0%,#f6fbff_100%)] p-5">
              <div className="grid gap-4 md:grid-cols-3">
                {stepCards.map((item, index) => (
                  <Link
                    id={item.id}
                    key={item.title}
                    href={item.href}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-md shadow-sky-900/5 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-sky-900/10"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)]" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#e0efff_0%,#c7ebff_100%)] text-[#0a54c7] ring-1 ring-sky-200 transition group-hover:bg-[linear-gradient(135deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] group-hover:text-white group-hover:ring-0">
                        <Icon name={item.icon as any} className="h-5 w-5" />
                      </div>

                      <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-700 ring-1 ring-sky-100">
                        Step {index + 1}
                      </div>
                    </div>

                    <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                      {item.desc}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-[#0a54c7]">
                      {item.action}
                      <Icon name="chevronRight" className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>

                    <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[linear-gradient(90deg,#08224f_0%,#0a54c7_58%,#39d9ff_100%)] transition-all duration-300 group-hover:w-full" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          </section>
        </section>
      </main>
    </StudentOnbordaProvider>
  );
}