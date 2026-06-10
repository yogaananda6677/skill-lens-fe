"use client";

import { useEffect, type ReactNode } from "react";
import { Onborda, OnbordaProvider, useOnborda } from "onborda";
import { Icon } from "../../../components/ui/icons";
import { StudentOnbordaCard } from "../../siswa/components/StudentOnbordaCard";
import { STUDENT_ONBORDA_DONE_EVENT } from "../../siswa/components/StartStudentOnbordaButton";
import { GURU_ONBORDA_START_EVENT } from "./StartGuruOnbordaButton";

export const GURU_ONBORDA_TOUR = "guru-bk-dashboard-tour";


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

const guruSteps = [
  {
    tour: GURU_ONBORDA_TOUR,
    steps: [
      {
        icon: <Icon name="sparkles" className="h-5 w-5" />,
        title: "Selamat datang di ruang Guru BK",
        content: <p>Dashboard ini membantu Guru BK melihat progress siswa, membuka data nilai, dan memberi catatan bimbingan dalam satu tempat.</p>,
        selector: "#guru-tour-start",
        side: "bottom" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },
      {
        icon: <Icon name="progress" className="h-5 w-5" />,
        title: "Pantau progress siswa",
        content: <p>Gunakan daftar siswa untuk melihat siapa yang belum isi data, belum generate roadmap, atau sudah punya progress roadmap.</p>,
        selector: "#dashboard-nav-progress",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },
      {
        icon: <Icon name="chart" className="h-5 w-5" />,
        title: "Akses dan kelola nilai murid",
        content: <p>Bagian Lihat Nilai memungkinkan Guru BK memilih siswa, melihat kategori nilai akademik, serta melihat nilai akademik siswa. Import dan perubahan nilai dilakukan oleh Admin Sekolah.</p>,
        selector: "#dashboard-nav-nilai",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },
      {
        icon: <Icon name="guidance" className="h-5 w-5" />,
        title: "Tambahkan catatan bimbingan",
        content: <p>Di detail roadmap, Guru BK bisa menulis catatan pada setiap step agar siswa punya arahan tindak lanjut yang jelas.</p>,
        selector: "#dashboard-nav-bimbingan",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },
      {
        icon: <Icon name="profile" className="h-5 w-5" />,
        title: "Kelola profil dan password",
        content: <p>Menu Profil berisi data diri Guru BK serta fitur ubah password.</p>,
        selector: "#dashboard-nav-profil",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
    ],
  },
];

function GuruOnbordaAutoStart() {
  const { startOnborda } = useOnborda();

  useEffect(() => {
    let restoreScroll: null | (() => void) = null;

    function handleStart() {
      restoreScroll?.();
      restoreScroll = lockWindowScroll();

      window.setTimeout(() => {
        startOnborda(GURU_ONBORDA_TOUR);
      }, 30);
    }

    function handleDone() {
      restoreScroll?.();
      restoreScroll = null;
    }

    window.addEventListener(GURU_ONBORDA_START_EVENT, handleStart);
    window.addEventListener(STUDENT_ONBORDA_DONE_EVENT, handleDone);

    return () => {
      restoreScroll?.();
      window.removeEventListener(GURU_ONBORDA_START_EVENT, handleStart);
      window.removeEventListener(STUDENT_ONBORDA_DONE_EVENT, handleDone);
    };
  }, [startOnborda]);

  return null;
}

export function GuruOnbordaProvider({ children }: { children: ReactNode }) {
  return (
    <OnbordaProvider>
      <Onborda
        steps={guruSteps}
        showOnborda
        shadowRgb="15,23,42"
        shadowOpacity="0.72"
        cardComponent={StudentOnbordaCard}
        cardTransition={{ duration: 0.22, type: "tween" }}
      >
        {children}
        <GuruOnbordaAutoStart />
      </Onborda>
    </OnbordaProvider>
  );
}
