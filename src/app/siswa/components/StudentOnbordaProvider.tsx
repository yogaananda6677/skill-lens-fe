"use client";

import type { ReactNode } from "react";
import { Onborda, OnbordaProvider } from "onborda";
import { Icon } from "../../../components/ui/icons";
import { StudentOnbordaAutoStart } from "./StudentOnbordaAutoStart";
import { StudentOnbordaCard } from "./StudentOnbordaCard";

export const STUDENT_ONBORDA_TOUR = "student-dashboard-tour";

const studentSteps = [
  {
    tour: STUDENT_ONBORDA_TOUR,
    steps: [
      {
        icon: <Icon name="home" className="h-5 w-5" />,
        title: "Selamat datang di ruang siswa",
        content: (
          <p>
            Ini adalah pusat aktivitas siswa. Dari sini kamu bisa melengkapi
            profil, melihat nilai akademik, membaca rekomendasi, dan mengikuti roadmap.
          </p>
        ),
        selector: "#student-tour-hero",
        side: "bottom" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 28,
      },
      {
        icon: <Icon name="profile" className="h-5 w-5" />,
        title: "Lengkapi profil dulu",
        content: (
          <p>
            Isi minat, hobi, bakat, pengalaman, tujuan, dan prestasi. Data profil
            ini membantu rekomendasi jadi lebih personal.
          </p>
        ),
        selector: "#student-tour-profile-card",
        side: "top" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },
      {
        icon: <Icon name="chart" className="h-5 w-5" />,
        title: "Cek ringkasan akademik",
        content: (
          <p>
            Nilai mentah dari sekolah disiapkan menjadi kategori akademik, sehingga
            kamu bisa melihat gambaran kekuatan belajarmu.
          </p>
        ),
        selector: "#student-tour-academic",
        side: "top" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },
      {
        icon: <Icon name="sparkles" className="h-5 w-5" />,
        title: "Buka hasil rekomendasi",
        content: (
          <p>
            Setelah profil siap, buka halaman rekomendasi untuk melihat jurusan,
            karier, atau jalur belajar yang paling cocok.
          </p>
        ),
        selector: "#student-tour-recommendation-card",
        side: "top" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },
      {
        icon: <Icon name="roadmap" className="h-5 w-5" />,
        title: "Ikuti roadmap belajar",
        content: (
          <p>
            Roadmap membantu kamu melanjutkan rekomendasi menjadi langkah belajar
            yang lebih jelas dan terarah.
          </p>
        ),
        selector: "#student-tour-roadmap-action",
        side: "top" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },
    ],
  },
];

type StudentOnbordaProviderProps = {
  children: ReactNode;
  autoStart?: boolean;
  studentKey?: string | number | null;
};

export function StudentOnbordaProvider({
  children,
  autoStart = false,
  studentKey,
}: StudentOnbordaProviderProps) {
  return (
    <OnbordaProvider>
      <Onborda
        steps={studentSteps}
        showOnborda
        shadowRgb="15,23,42"
        shadowOpacity="0.72"
        cardComponent={StudentOnbordaCard}
        cardTransition={{ duration: 0.22, type: "tween" }}
      >
        {children}
        <StudentOnbordaAutoStart autoStart={autoStart} studentKey={studentKey} />
      </Onborda>
    </OnbordaProvider>
  );
}
