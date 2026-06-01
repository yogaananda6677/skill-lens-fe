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
        title="Kelola Nilai Siswa"
        subtitle="Format data nilai dibuat seperti admin sekolah: filter jurusan, kelas, semester, dan mapel sebagai kolom."
        rightSlot={<StartGuruOnbordaButton />}
      >
        <GuruDataNilai />
      </DashboardShell>
    </GuruOnbordaProvider>
  );
}
