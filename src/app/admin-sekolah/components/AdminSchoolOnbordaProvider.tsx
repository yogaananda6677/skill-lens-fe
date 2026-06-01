"use client";

import { useEffect, type ReactNode } from "react";
import { Onborda, OnbordaProvider, useOnborda } from "onborda";
import { Icon } from "../../../components/ui/icons";
import { StudentOnbordaCard } from "../../siswa/components/StudentOnbordaCard";
import { ADMIN_SCHOOL_ONBORDA_START_EVENT } from "./StartAdminSchoolOnbordaButton";

export const ADMIN_SCHOOL_ONBORDA_TOUR = "admin-school-dashboard-tour";

const adminSchoolSteps = [
  {
    tour: ADMIN_SCHOOL_ONBORDA_TOUR,
    steps: [
      {
        icon: <Icon name="school" className="h-5 w-5" />,
        title: "Mulai dari data sekolah",
        content: <p>Lengkapi data sekolah terlebih dahulu. Setelah dikirim, tunggu verifikasi dari admin platform sebelum fitur lain terbuka.</p>,
        selector: "#dashboard-nav-sekolah",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
      {
        icon: <Icon name="graduation" className="h-5 w-5" />,
        title: "Kelola jurusan",
        content: <p>Setelah sekolah disetujui, buat jurusan yang ada di sekolah. Jurusan dipakai untuk mapel, siswa, nilai, dan filter data.</p>,
        selector: "#dashboard-nav-jurusan",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
      {
        icon: <Icon name="upload" className="h-5 w-5" />,
        title: "Download template dan import siswa",
        content: <p>Masuk ke Import Siswa, download template Excel, lalu import data siswa dan nilai 5 semester dari sheet yang sudah disediakan.</p>,
        selector: "#dashboard-nav-import-siswa",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
      {
        icon: <Icon name="profile" className="h-5 w-5" />,
        title: "Cek data siswa",
        content: <p>Menu Data Siswa dipakai untuk melihat hasil import, melakukan filter jurusan/kelas, dan export akun siswa berisi NISN, username, serta password awal.</p>,
        selector: "#dashboard-nav-siswa",
        side: "right" as const,
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 18,
      },
      {
        icon: <Icon name="chart" className="h-5 w-5" />,
        title: "Kelola data nilai",
        content: <p>Menu Data Nilai menampilkan nilai mentah siswa per mapel. Gunakan filter jurusan, kelas, dan semester agar data tetap mudah dibaca.</p>,
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
    function handleStart() {
      startOnborda(ADMIN_SCHOOL_ONBORDA_TOUR);
    }

    window.addEventListener(ADMIN_SCHOOL_ONBORDA_START_EVENT, handleStart);

    return () => {
      window.removeEventListener(ADMIN_SCHOOL_ONBORDA_START_EVENT, handleStart);
    };
  }, [startOnborda]);

  return null;
}

export function AdminSchoolOnbordaProvider({ children }: { children: ReactNode }) {
  return (
    <OnbordaProvider>
      <Onborda
        steps={adminSchoolSteps}
        showOnborda
        shadowRgb="15,23,42"
        shadowOpacity="0.72"
        cardComponent={StudentOnbordaCard}
        cardTransition={{ duration: 0.22, type: "tween" }}
      >
        {children}
        <AdminSchoolOnbordaAutoStart />
      </Onborda>
    </OnbordaProvider>
  );
}
