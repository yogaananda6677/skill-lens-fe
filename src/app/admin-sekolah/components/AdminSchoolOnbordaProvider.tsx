"use client";

import { useEffect, type ReactNode } from "react";
import { Onborda, OnbordaProvider, useOnborda } from "onborda";
import { Icon } from "../../../components/ui/icons";
import { StudentOnbordaCard } from "../../siswa/components/StudentOnbordaCard";
import { STUDENT_ONBORDA_DONE_EVENT } from "../../siswa/components/StartStudentOnbordaButton";
import { ADMIN_SCHOOL_ONBORDA_START_EVENT } from "./StartAdminSchoolOnbordaButton";

export const ADMIN_SCHOOL_ONBORDA_TOUR = "admin-school-dashboard-tour";


function lockWindowScroll() {
  const scrollY = window.scrollY;
  const previousBodyPosition = document.body.style.position;
  const previousBodyTop = document.body.style.top;
  const previousBodyWidth = document.body.style.width;
  const previousBodyOverflow = document.body.style.overflow;
  const previousHtmlScrollBehavior = document.documentElement.style.scrollBehavior;

  document.documentElement.style.scrollBehavior = "auto";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.position = previousBodyPosition;
    document.body.style.top = previousBodyTop;
    document.body.style.width = previousBodyWidth;
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.scrollBehavior = previousHtmlScrollBehavior;
    window.scrollTo(0, scrollY);
  };
}

function StepContent({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-cyan-50/45 to-sky-50/70 p-4 text-sm font-medium leading-6 text-slate-600 shadow-sm shadow-sky-100/50">
      {children}
    </div>
  );
}

const adminSchoolSteps = [
  {
    tour: ADMIN_SCHOOL_ONBORDA_TOUR,
    steps: [
      {
        icon: (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
            <Icon name="school" className="h-5 w-5" />
          </div>
        ),
        title: "Mulai dari data sekolah",
        content: (
          <StepContent>
            Lengkapi data sekolah terlebih dahulu. Setelah pengajuan dikirim,
            tunggu verifikasi dari admin platform agar fitur lain bisa dibuka.
          </StepContent>
        ),
        selector: "#dashboard-nav-sekolah",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
      {
        icon: (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
            <Icon name="graduation" className="h-5 w-5" />
          </div>
        ),
        title: "Kelola jurusan",
        content: (
          <StepContent>
            Setelah sekolah disetujui, buat jurusan yang tersedia di sekolah.
            Jurusan akan digunakan untuk mapel, siswa, nilai, dan filter data.
          </StepContent>
        ),
        selector: "#dashboard-nav-jurusan",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
      {
        icon: (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
            <Icon name="upload" className="h-5 w-5" />
          </div>
        ),
        title: "Download template dan import siswa",
        content: (
          <StepContent>
            Masuk ke menu Import Siswa, download template Excel, lalu import
            data siswa dan nilai dari sheet yang sudah disediakan.
          </StepContent>
        ),
        selector: "#dashboard-nav-import-siswa",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
      {
        icon: (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
            <Icon name="profile" className="h-5 w-5" />
          </div>
        ),
        title: "Cek data siswa",
        content: (
          <StepContent>
            Menu Data Siswa digunakan untuk melihat hasil import, filter
            jurusan atau kelas, serta export akun siswa berisi NISN, username,
            dan password awal.
          </StepContent>
        ),
        selector: "#dashboard-nav-siswa",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
      {
        icon: (
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/70">
            <Icon name="chart" className="h-5 w-5" />
          </div>
        ),
        title: "Kelola data nilai",
        content: (
          <StepContent>
            Menu Data Nilai menampilkan nilai mentah siswa per mata pelajaran.
            Gunakan filter jurusan, kelas, dan semester agar data lebih mudah
            dibaca.
          </StepContent>
        ),
        selector: "#dashboard-nav-nilai",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
    ],
  },
];

function AdminSchoolOnbordaAutoStart() {
  const { startOnborda } = useOnborda();

  useEffect(() => {
    let restoreScroll: null | (() => void) = null;

    function handleStart() {
      restoreScroll?.();
      restoreScroll = lockWindowScroll();

      window.setTimeout(() => {
        startOnborda(ADMIN_SCHOOL_ONBORDA_TOUR);
      }, 30);
    }

    function handleDone() {
      restoreScroll?.();
      restoreScroll = null;
    }

    window.addEventListener(ADMIN_SCHOOL_ONBORDA_START_EVENT, handleStart);
    window.addEventListener(STUDENT_ONBORDA_DONE_EVENT, handleDone);

    return () => {
      restoreScroll?.();
      window.removeEventListener(ADMIN_SCHOOL_ONBORDA_START_EVENT, handleStart);
      window.removeEventListener(STUDENT_ONBORDA_DONE_EVENT, handleDone);
    };
  }, [startOnborda]);

  return null;
}

export function AdminSchoolOnbordaProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OnbordaProvider>
      <Onborda
        steps={adminSchoolSteps}
        showOnborda
        shadowRgb="15,23,42"
        shadowOpacity="0.46"
        cardComponent={StudentOnbordaCard}
        cardTransition={{
          duration: 0.28,
          type: "tween",
          ease: "easeOut",
        }}
      >
        {children}
        <AdminSchoolOnbordaAutoStart />
      </Onborda>
    </OnbordaProvider>
  );
}