"use client";

import { DashboardShell } from "../../../components/layout/DashboardShell";
import { guruNav } from "../../../config/navigation";
import { GuruOnbordaProvider } from "../components/GuruOnbordaProvider";
import { GuruDataNilai } from "../components/GuruDataNilai";
import { StartGuruOnbordaButton } from "../components/StartGuruOnbordaButton";

export default function GuruNilaiPage() {
  return (
    <GuruOnbordaProvider>
      <DashboardShell
        requiredRole="guru"
        activeKey="nilai"
        navItems={guruNav}
        title="Lihat Nilai Siswa"
        subtitle="Guru BK dapat melihat nilai siswa dengan format seperti admin sekolah. Data nilai bersifat read-only."
        rightSlot={<StartGuruOnbordaButton />}
      >
        <GuruDataNilai />
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
